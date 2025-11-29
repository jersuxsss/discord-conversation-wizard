import { EventEmitter } from 'events';
import { AdapterInterface } from './adapters/AdapterInterface';
import {
    WizardOptions,
    WizardStep,
    StepType,
    WizardContext,
    WizardStepContext,
    WizardSession,
    NavigationAction,
} from './types';

export class Wizard extends EventEmitter {
    private adapter: AdapterInterface;
    private steps: WizardStep[];
    private currentStepIndex: number = 0;
    private responses: Record<string, unknown> = {};
    private context: WizardContext | null = null;
    private isRunning: boolean = false;
    private options: WizardOptions;
    private sessionId: string;
    private stepHistory: number[] = [];
    private retryCount: number = 0;
    private sessions: Map<string, WizardSession> = new Map();
    private timeoutWarningTimer: NodeJS.Timeout | null = null;

    constructor(adapter: AdapterInterface, options: WizardOptions) {
        super();
        this.adapter = adapter;
        this.steps = options.steps;
        this.options = options;
        this.sessionId = options.sessionId || this.generateSessionId();
    }

    private generateSessionId(): string {
        return `wizard_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    }

    public async start(context: WizardContext) {
        if (this.isRunning) {
            throw new Error('Wizard is already running.');
        }

        this.context = context;
        this.isRunning = true;
        this.currentStepIndex = 0;
        this.responses = {};
        this.stepHistory = [];

        if (this.options.persistSession) {
            await this.saveSession();
        }

        this.emit('start', context);
        await this.runStep();
    }

    public async resume(sessionId: string): Promise<boolean> {
        let session: WizardSession | null | undefined = this.sessions.get(sessionId);

        if (!session && this.options.sessionStore) {
            session = await this.options.sessionStore.load(sessionId);
        }

        if (!session) {
            return false;
        }

        this.sessionId = sessionId;
        this.currentStepIndex = session.currentStepIndex;
        this.responses = session.responses;
        this.context = {
            userId: session.userId,
            channelId: session.channelId,
            metadata: session.metadata,
        };
        this.isRunning = true;

        this.emit('resume', session);
        await this.runStep();
        return true;
    }

    public async cancel() {
        if (!this.isRunning) {
            return;
        }

        const stepContext = this.getStepContext();
        if (this.options.middleware?.onCancel) {
            await this.options.middleware.onCancel(stepContext);
        }
        this.emit('cancel', stepContext);
        await this.cleanup();
    }

    public async goBack(): Promise<boolean> {
        if (!this.options.allowBack || this.stepHistory.length === 0) {
            return false;
        }

        const previousIndex = this.stepHistory.pop()!;
        this.currentStepIndex = previousIndex;
        delete this.responses[this.steps[this.currentStepIndex].id];

        await this.runStep();
        return true;
    }

    public async skip(): Promise<boolean> {
        if (!this.options.allowSkip) {
            return false;
        }

        const step = this.steps[this.currentStepIndex];
        const stepContext = this.getStepContext();

        if (step.onSkip) {
            await step.onSkip(stepContext);
        }
        this.emit('skip', step, stepContext);

        this.currentStepIndex++;
        await this.runStep();
        return true;
    }

    public async jumpToStep(stepId: string): Promise<boolean> {
        const targetIndex = this.steps.findIndex(s => s.id === stepId);
        if (targetIndex === -1) {
            return false;
        }

        this.currentStepIndex = targetIndex;
        await this.runStep();
        return true;
    }

    private async runStep(): Promise<void> {
        if (this.currentStepIndex >= this.steps.length) {
            await this.complete();
            return;
        }

        const step = this.steps[this.currentStepIndex];
        const stepContext = this.getStepContext();

        // Check conditional step
        if (step.condition) {
            const shouldRun = await step.condition(this.responses, this.context!);
            if (!shouldRun) {
                this.currentStepIndex++;
                return this.runStep();
            }
        }

        this.emit('step', step, this.currentStepIndex);

        try {
            if (!this.context) throw new Error('Context is missing');

            // Call beforeStep middleware
            if (this.options.middleware?.beforeStep) {
                await this.options.middleware.beforeStep(step, stepContext);
            }

            // Send prompt
            await this.sendStepPrompt(step);

            // Wait for response
            const rawResponse = await this.awaitResponse(step);

            // Transform response if transformer exists
            let response = rawResponse;
            if (step.transform) {
                response = await step.transform(rawResponse, stepContext);
            }

            // Validate response
            if (step.validate) {
                const isValid = await step.validate(response, stepContext);
                if (isValid !== true) {
                    const errorMsg = typeof isValid === 'string' ? isValid : 'Invalid response. Please try again.';
                    await this.adapter.sendMessage(this.context.channelId, errorMsg);

                    // Check retry limit
                    const maxRetries = step.retry ?? 3;
                    this.retryCount++;

                    if (this.retryCount >= maxRetries) {
                        this.emit('maxRetriesReached', step, stepContext);
                        await this.adapter.sendMessage(
                            this.context.channelId,
                            `Maximum retry attempts (${maxRetries}) reached. Please start over or contact support.`
                        );
                        await this.cancel();
                        return;
                    }

                    // Retry same step
                    return this.runStep();
                }
            }

            this.retryCount = 0; // Reset retry count on successful validation
            this.responses[step.id] = response;

            // Call afterStep middleware
            if (this.options.middleware?.afterStep) {
                await this.options.middleware.afterStep(step, response, stepContext);
            }

            // Save to history for back navigation
            this.stepHistory.push(this.currentStepIndex);

            // Save session if persistence is enabled
            if (this.options.persistSession) {
                await this.saveSession();
            }

            this.currentStepIndex++;
            await this.runStep();

        } catch (error) {
            const err = error as Error;
            if (this.options.middleware?.onError) {
                await this.options.middleware.onError(err, step, stepContext);
            }
            this.emit('error', err, step, stepContext);
            await this.cleanup();
        }
    }

    private async sendStepPrompt(step: WizardStep) {
        if (!this.context) throw new Error('Context is missing');

        let promptMessage = step.prompt;

        // Add progress indicator if enabled
        if (this.options.showProgress) {
            const progressText = this.getProgressText();
            promptMessage = `${progressText}\n\n${promptMessage}`;
        }

        // Add navigation hints
        const hints: string[] = [];
        if (this.options.allowBack && this.stepHistory.length > 0) {
            hints.push('Type `back` to go to the previous step');
        }
        if (this.options.allowSkip) {
            hints.push('Type `skip` to skip this step');
        }
        if (this.options.allowCancel) {
            hints.push('Type `cancel` to abort');
        }

        if (hints.length > 0) {
            promptMessage += `\n\n*${hints.join(' | ')}*`;
        }

        if (step.type === StepType.SELECT_MENU && step.options) {
            const minValues = step.allowMultiple ? 1 : 1;
            const maxValues = step.allowMultiple ? step.options.length : 1;

            const selectMenu = this.adapter.createSelectMenu(
                `wizard_select_${step.id}`,
                step.options,
                step.prompt,
                minValues,
                maxValues
            );

            await this.adapter.sendMessage(this.context.channelId, {
                content: promptMessage,
                components: [{ type: 1, components: [selectMenu] }],
            });
        } else if (step.type === StepType.CONFIRMATION) {
            const buttons = [
                this.adapter.createButton(`wizard_confirm_${step.id}`, 'Confirm', 'SUCCESS'),
                this.adapter.createButton(`wizard_cancel_${step.id}`, 'Cancel', 'DANGER'),
            ];

            await this.adapter.sendMessage(this.context.channelId, {
                content: promptMessage,
                components: [{ type: 1, components: buttons }],
            });
        } else {
            await this.adapter.sendMessage(this.context.channelId, promptMessage);
        }
    }

    private async awaitResponse(step: WizardStep): Promise<any> {
        if (!this.context) throw new Error('Context is missing');

        const timeout = (step.timeout || this.options.timeout || 60) * 1000;

        // Setup timeout warning
        this.setupTimeoutWarning(timeout);

        if (step.type === StepType.SELECT_MENU || step.type === StepType.CONFIRMATION) {
            const filter = (interaction: any) => this.adapter.getAuthorId(interaction) === this.context?.userId;

            try {
                const interaction = await this.adapter.awaitComponent(this.context.channelId, {
                    filter,
                    max: 1,
                    time: timeout,
                    componentType: step.type === StepType.SELECT_MENU ? 3 : 2,
                });

                const value = this.adapter.getComponentValue(interaction);

                this.clearTimeoutWarning(); // Clear warning after response

                // Handle multi-select
                if (step.allowMultiple && Array.isArray(value)) {
                    return value;
                }

                return value;
            } catch (e) {
                throw new Error('Response timeout');
            }
        }

        // Text-based responses
        const filter = (msg: any) => {
            const authorId = this.adapter.getAuthorId(msg);
            if (authorId !== this.context?.userId) return false;

            const content = this.adapter.getContent(msg).toLowerCase().trim();

            // Handle navigation commands
            if (this.options.allowCancel && content === 'cancel') {
                this.cancel();
                return false;
            }

            if (this.options.allowBack && content === 'back' && this.stepHistory.length > 0) {
                this.goBack();
                return false;
            }

            if (this.options.allowSkip && content === 'skip') {
                this.skip();
                return false;
            }

            return true;
        };

        const collected = await this.adapter.awaitMessages(this.context.channelId, {
            filter,
            max: 1,
            time: timeout,
            errors: ['time'],
        });

        const msg = collected[0];

        if (step.type === StepType.ATTACHMENT) {
            const attachments = this.adapter.getAttachments(msg);
            if (attachments.length === 0) {
                await this.adapter.sendMessage(this.context.channelId, 'Please upload a file.');
                return this.awaitResponse(step);
            }
            return attachments[0];
        }

        const content = this.adapter.getContent(msg);

        if (step.type === StepType.NUMBER) {
            const num = parseFloat(content);
            if (isNaN(num)) {
                await this.adapter.sendMessage(this.context.channelId, 'Please enter a valid number.');
                return this.awaitResponse(step);
            }

            if (step.minValue !== undefined && num < step.minValue) {
                await this.adapter.sendMessage(
                    this.context.channelId,
                    `Number must be at least ${step.minValue}.`
                );
                return this.awaitResponse(step);
            }

            if (step.maxValue !== undefined && num > step.maxValue) {
                await this.adapter.sendMessage(
                    this.context.channelId,
                    `Number must be at most ${step.maxValue}.`
                );
                return this.awaitResponse(step);
            }

            return num;
        }

        this.clearTimeoutWarning(); // Clear warning after response
        return content;
    }

    private getStepContext(): WizardStepContext {
        return {
            stepIndex: this.currentStepIndex,
            stepId: this.steps[this.currentStepIndex]?.id || '',
            responses: { ...this.responses },
            wizardContext: this.context!,
            retryCount: this.retryCount,
        };
    }

    private async saveSession() {
        if (!this.context) return;

        const session: WizardSession = {
            sessionId: this.sessionId,
            userId: this.context.userId,
            channelId: this.context.channelId,
            currentStepIndex: this.currentStepIndex,
            responses: { ...this.responses },
            startedAt: Date.now(),
            lastActivityAt: Date.now(),
            metadata: this.context.metadata,
        };

        this.sessions.set(this.sessionId, session);
        if (this.options.sessionStore) {
            await this.options.sessionStore.save(session);
        }
        this.emit('sessionSaved', session);
    }

    private async complete() {
        if (!this.context) return;

        if (this.options.middleware?.onComplete) {
            await this.options.middleware.onComplete(this.responses, this.context);
        }
        this.emit('complete', this.responses);
        await this.cleanup();
    }

    private async cleanup() {
        this.isRunning = false;
        if (this.options.persistSession) {
            this.sessions.delete(this.sessionId);
            if (this.options.sessionStore) {
                await this.options.sessionStore.delete(this.sessionId);
            }
        }
        this.clearTimeoutWarning();
    }

    private getProgressText(): string {
        const current = this.currentStepIndex + 1;
        const total = this.steps.length;
        const percent = Math.round((current / total) * 100);

        const format = this.options.progressFormat || '📊 Step {current}/{total}';

        return format
            .replace('{current}', current.toString())
            .replace('{total}', total.toString())
            .replace('{percent}', percent.toString());
    }

    private setupTimeoutWarning(timeout: number) {
        // Clear any existing warning timer
        this.clearTimeoutWarning();

        if (!this.options.timeoutWarning || !this.context) {
            return;
        }

        // Calculate warning time
        let warningTime: number;
        if (typeof this.options.timeoutWarning === 'number') {
            warningTime = timeout - (this.options.timeoutWarning * 1000);
        } else {
            // Default to 15 seconds before timeout
            warningTime = timeout - 15000;
        }

        // Only set warning if it's positive
        if (warningTime > 0) {
            this.timeoutWarningTimer = setTimeout(async () => {
                if (this.context) {
                    const message = this.options.timeoutWarningMessage ||
                        '⚠️ Warning: Your response time is running out. Please respond soon!';
                    await this.adapter.sendMessage(this.context.channelId, message);
                }
            }, warningTime);
        }
    }

    private clearTimeoutWarning() {
        if (this.timeoutWarningTimer) {
            clearTimeout(this.timeoutWarningTimer);
            this.timeoutWarningTimer = null;
        }
    }

    // Public getters
    public getResponses(): Record<string, unknown> {
        return { ...this.responses };
    }

    public getCurrentStepIndex(): number {
        return this.currentStepIndex;
    }

    public isActive(): boolean {
        return this.isRunning;
    }

    public getSessionId(): string {
        return this.sessionId;
    }
}
