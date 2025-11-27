/**
 * Basic tests for Wizard class
 */

import { Wizard } from '../src/Wizard';
import { StepType, WizardOptions } from '../src/types';

// Mock adapter
class MockAdapter {
    sendMessage = jest.fn().mockResolvedValue({});
    awaitMessages = jest.fn().mockResolvedValue([{ content: 'test response', author: { id: 'user123' } }]);
    awaitComponent = jest.fn().mockResolvedValue({ values: ['option1'] });
    createSelectMenu = jest.fn().mockReturnValue({});
    createButton = jest.fn().mockReturnValue({});
    getContent = jest.fn((msg) => msg.content);
    getAttachments = jest.fn().mockReturnValue([]);
    getAuthorId = jest.fn((msg) => msg.author?.id || 'user123');
    getComponentValue = jest.fn((interaction) => interaction.values?.[0] || 'value');
}

describe('Wizard', () => {
    let adapter: MockAdapter;
    let wizardOptions: WizardOptions;

    beforeEach(() => {
        adapter = new MockAdapter();
        wizardOptions = {
            steps: [
                {
                    id: 'step1',
                    type: StepType.TEXT,
                    prompt: 'What is your name?',
                },
            ],
        };
    });

    describe('Constructor', () => {
        it('should create a wizard instance', () => {
            const wizard = new Wizard(adapter as any, wizardOptions);
            expect(wizard).toBeInstanceOf(Wizard);
        });

        it('should generate a session ID', () => {
            const wizard = new Wizard(adapter as any, wizardOptions);
            expect(wizard.getSessionId()).toMatch(/^wizard_\d+_[a-z0-9]+$/);
        });

        it('should use custom session ID if provided', () => {
            const customSessionId = 'custom-session-123';
            const wizard = new Wizard(adapter as any, { ...wizardOptions, sessionId: customSessionId });
            expect(wizard.getSessionId()).toBe(customSessionId);
        });
    });

    describe('State Management', () => {
        it('should start in inactive state', () => {
            const wizard = new Wizard(adapter as any, wizardOptions);
            expect(wizard.isActive()).toBe(false);
        });

        it('should become active when started', async () => {
            const wizard = new Wizard(adapter as any, wizardOptions);

            const startPromise = wizard.start({
                userId: 'user123',
                channelId: 'channel123',
            });

            expect(wizard.isActive()).toBe(true);

            // Complete the wizard
            wizard.cancel();
            await startPromise.catch(() => { }); // Catch any errors
        });

        it('should throw error if started while already running', async () => {
            const wizard = new Wizard(adapter as any, wizardOptions);

            wizard.start({
                userId: 'user123',
                channelId: 'channel123',
            });

            await expect(wizard.start({
                userId: 'user123',
                channelId: 'channel123',
            })).rejects.toThrow('Wizard is already running');

            wizard.cancel();
        });
    });

    describe('Events', () => {
        it('should emit start event', (done) => {
            const wizard = new Wizard(adapter as any, wizardOptions);

            wizard.on('start', (context) => {
                expect(context.userId).toBe('user123');
                wizard.cancel();
                done();
            });

            wizard.start({
                userId: 'user123',
                channelId: 'channel123',
            });
        });

        it('should emit cancel event', (done) => {
            const wizard = new Wizard(adapter as any, wizardOptions);

            wizard.on('cancel', () => {
                done();
            });

            wizard.start({
                userId: 'user123',
                channelId: 'channel123',
            });

            wizard.cancel();
        });

        it('should emit complete event on successful completion', (done) => {
            const wizard = new Wizard(adapter as any, {
                steps: [
                    {
                        id: 'name',
                        type: StepType.TEXT,
                        prompt: 'Name?',
                    },
                ],
            });

            wizard.on('complete', (responses) => {
                expect(responses.name).toBe('test response');
                done();
            });

            wizard.start({
                userId: 'user123',
                channelId: 'channel123',
            });
        });
    });

    describe('Navigation', () => {
        it('should prevent back navigation when not allowed', async () => {
            const wizard = new Wizard(adapter as any, {
                steps: wizardOptions.steps,
                allowBack: false,
            });

            const result = await wizard.goBack();
            expect(result).toBe(false);
        });

        it('should prevent skip when not allowed', async () => {
            const wizard = new Wizard(adapter as any, {
                steps: wizardOptions.steps,
                allowSkip: false,
            });

            const result = await wizard.skip();
            expect(result).toBe(false);
        });

        it('should allow cancellation', () => {
            const wizard = new Wizard(adapter as any, wizardOptions);

            wizard.start({
                userId: 'user123',
                channelId: 'channel123',
            });

            expect(wizard.isActive()).toBe(true);
            wizard.cancel();
            expect(wizard.isActive()).toBe(false);
        });
    });

    describe('Response Collection', () => {
        it('should collect responses from steps', (done) => {
            const wizard = new Wizard(adapter as any, {
                steps: [
                    {
                        id: 'name',
                        type: StepType.TEXT,
                        prompt: 'Name?',
                    },
                ],
            });

            wizard.on('complete', (responses) => {
                expect(responses).toHaveProperty('name');
                expect(responses.name).toBe('test response');
                done();
            });

            wizard.start({
                userId: 'user123',
                channelId: 'channel123',
            });
        });

        it('should provide access to responses via getResponses', () => {
            const wizard = new Wizard(adapter as any, wizardOptions);
            const responses = wizard.getResponses();
            expect(responses).toEqual({});
        });
    });

    describe('Middleware', () => {
        it('should call beforeStep middleware', (done) => {
            const beforeStep = jest.fn();

            const wizard = new Wizard(adapter as any, {
                steps: wizardOptions.steps,
                middleware: {
                    beforeStep,
                },
            });

            wizard.on('step', () => {
                expect(beforeStep).toHaveBeenCalled();
                wizard.cancel();
                done();
            });

            wizard.start({
                userId: 'user123',
                channelId: 'channel123',
            });
        });

        it('should call onComplete middleware', (done) => {
            const onComplete = jest.fn();

            const wizard = new Wizard(adapter as any, {
                steps: [
                    {
                        id: 'test',
                        type: StepType.TEXT,
                        prompt: 'Test?',
                    },
                ],
                middleware: {
                    onComplete,
                },
            });

            wizard.on('complete', () => {
                expect(onComplete).toHaveBeenCalled();
                done();
            });

            wizard.start({
                userId: 'user123',
                channelId: 'channel123',
            });
        });

        it('should call onCancel middleware', (done) => {
            const onCancel = jest.fn();

            const wizard = new Wizard(adapter as any, {
                steps: wizardOptions.steps,
                middleware: {
                    onCancel,
                },
            });

            wizard.on('cancel', () => {
                expect(onCancel).toHaveBeenCalled();
                done();
            });

            wizard.start({
                userId: 'user123',
                channelId: 'channel123',
            });

            wizard.cancel();
        });
    });

    describe('Step Index', () => {
        it('should start at step 0', () => {
            const wizard = new Wizard(adapter as any, wizardOptions);
            expect(wizard.getCurrentStepIndex()).toBe(0);
        });
    });
});
