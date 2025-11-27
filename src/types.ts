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
    validate?: (response: any, context: WizardStepContext) => boolean | string | Promise<boolean | string>;
    transform?: (response: any, context: WizardStepContext) => any | Promise<any>;
    timeout?: number;
    minLength?: number;
    maxLength?: number;
    minValue?: number;
    maxValue?: number;
    required?: boolean;
    allowMultiple?: boolean; // For select menus
    condition?: (responses: Record<string, any>, context: WizardContext) => boolean | Promise<boolean>;
    onSkip?: (context: WizardStepContext) => void | Promise<void>;
    retry?: number; // Max retry attempts for validation failures
}

export interface WizardStepContext {
    stepIndex: number;
    stepId: string;
    responses: Record<string, any>;
    wizardContext: WizardContext;
    retryCount: number;
}

export interface WizardMiddleware {
    beforeStep?: (step: WizardStep, context: WizardStepContext) => void | Promise<void>;
    afterStep?: (step: WizardStep, response: any, context: WizardStepContext) => void | Promise<void>;
    onError?: (error: Error, step: WizardStep, context: WizardStepContext) => void | Promise<void>;
    onComplete?: (responses: Record<string, any>, context: WizardContext) => void | Promise<void>;
    onCancel?: (context: WizardStepContext) => void | Promise<void>;
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
}

export interface WizardContext {
    userId: string;
    channelId: string;
    guildId?: string;
    metadata?: Record<string, any>;
}

export interface WizardSession {
    sessionId: string;
    userId: string;
    channelId: string;
    currentStepIndex: number;
    responses: Record<string, any>;
    startedAt: number;
    lastActivityAt: number;
    metadata?: Record<string, any>;
}
