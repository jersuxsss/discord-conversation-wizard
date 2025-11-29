export enum StepType {
    TEXT = 'text',
    SELECT_MENU = 'select_menu',
    ATTACHMENT = 'attachment',
    BUTTON = 'button',
    NUMBER = 'number',
    CONFIRMATION = 'confirmation',
}

export enum NavigationAction {
    NEXT = 'next',
    BACK = 'back',
    SKIP = 'skip',
    JUMP = 'jump',
    CANCEL = 'cancel',
}

export interface StepOption {
    label: string;
    value: string;
    description?: string;
    emoji?: string;
}

export interface WizardStep {
    id: string;
    prompt: string;
    type: StepType;
    options?: StepOption[];
    validate?: (response: unknown, context: WizardStepContext) => boolean | string | Promise<boolean | string>;
    transform?: (response: unknown, context: WizardStepContext) => unknown | Promise<unknown>;
    timeout?: number;
    minLength?: number;
    maxLength?: number;
    minValue?: number;
    maxValue?: number;
    required?: boolean;
    allowMultiple?: boolean; // For select menus
    condition?: (responses: Record<string, unknown>, context: WizardContext) => boolean | Promise<boolean>;
    onSkip?: (context: WizardStepContext) => void | Promise<void>;
    retry?: number; // Max retry attempts for validation failures
}

export interface WizardStepContext {
    stepIndex: number;
    stepId: string;
    responses: Record<string, unknown>;
    wizardContext: WizardContext;
    retryCount: number;
}

export interface WizardMiddleware {
    beforeStep?: (step: WizardStep, context: WizardStepContext) => void | Promise<void>;
    afterStep?: (step: WizardStep, response: unknown, context: WizardStepContext) => void | Promise<void>;
    onError?: (error: Error, step: WizardStep, context: WizardStepContext) => void | Promise<void>;
    onComplete?: (responses: Record<string, unknown>, context: WizardContext) => void | Promise<void>;
    onCancel?: (context: WizardStepContext) => void | Promise<void>;
}

export interface SessionStore {
    save(session: WizardSession): Promise<void>;
    load(sessionId: string): Promise<WizardSession | null>;
    delete(sessionId: string): Promise<void>;
}

export interface WizardOptions {
    steps: WizardStep[];
    title?: string;
    timeout?: number;
    middleware?: WizardMiddleware;
    allowBack?: boolean;
    allowSkip?: boolean;
    allowCancel?: boolean;
    sessionId?: string;
    persistSession?: boolean;
    sessionStore?: SessionStore;
    /** Show progress indicator in wizard messages (e.g., "Step 2/5") */
    showProgress?: boolean;
    /** Custom progress format string. Use {current}, {total}, {percent} placeholders */
    progressFormat?: string;
    /** Show warning before timeout. If number, shows warning N seconds before timeout */
    timeoutWarning?: boolean | number;
    /** Custom timeout warning message */
    timeoutWarningMessage?: string;
}

export interface WizardContext {
    userId: string;
    channelId: string;
    guildId?: string;
    metadata?: Record<string, unknown>;
}

export interface WizardSession {
    sessionId: string;
    userId: string;
    channelId: string;
    currentStepIndex: number;
    responses: Record<string, unknown>;
    startedAt: number;
    lastActivityAt: number;
    metadata?: Record<string, unknown>;
}

