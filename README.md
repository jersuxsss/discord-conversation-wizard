# 🧙‍♂️ Discord Conversation Wizard

<div align="center">

A powerful, **library-agnostic** wizard for creating multi-step conversations and forms in Discord bots.

[![npm version](https://img.shields.io/npm/v/discord-conversation-wizard?color=blue&logo=npm)](https://www.npmjs.com/package/discord-conversation-wizard)
[![npm downloads](https://img.shields.io/npm/dm/discord-conversation-wizard?color=blue&logo=npm)](https://www.npmjs.com/package/discord-conversation-wizard)
[![npm bundle size](https://img.shields.io/bundlephobia/min/discord-conversation-wizard?color=blue)](https://bundlephobia.com/package/discord-conversation-wizard)
[![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/jersuxsss/discord-conversation-wizard/ci.yml?branch=main&logo=github)](https://github.com/jersuxsss/discord-conversation-wizard/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg?logo=typescript)](https://www.typescriptlang.org/)
[![GitHub Stars](https://img.shields.io/github/stars/jersuxsss/discord-conversation-wizard?style=social)](https://github.com/jersuxsss/discord-conversation-wizard)

</div>

## ✨ Features

- 🔄 **Library Agnostic** - Works with discord.js v14+ and Eris v0.17+
- ⚡ **Type-Safe** - Full TypeScript support with comprehensive type definitions
- 🎯 **Advanced Validation** - Built-in validators with custom validation support
- 📚 **Built-in Validators** - Email, URL, phone, regex, length, range, and more (v1.1.0+)
- 📊 **Progress Indicators** - Visual progress tracking with customizable format (v1.1.0+)
- ⏱️ **Timeout Warnings** - Configurable warnings before response timeout (v1.1.0+)
- 🪝 **Middleware System** - Hooks for beforeStep, afterStep, onError, and more
- 🧭 **Step Navigation** - Back, skip, jump to step, and cancel functionality
- 🔀 **Conditional Steps** - Show/hide steps based on previous responses
- 💾 **Session Persistence** - Save and resume wizard sessions
- 🎨 **Rich Components** - Select menus, buttons, confirmations, and attachments
- 🔢 **Smart Input Types** - Text, number, attachment, select menu, confirmation
- ♾️ **Multi-Select** - Support for multiple selections in select menus
- 🛡️ **Error Handling** - Comprehensive error handling with retry limits
- 📝 **Data Transformation** - Transform responses before validation
- 🎭 **Event-Driven** - Full event system for monitoring wizard state

## 📦 Installation

```bash
npm install discord-conversation-wizard
```

### Peer Dependencies

For Discord.js:
```bash
npm install discord.js@^14.0.0
```

For Eris:
```bash
npm install eris@^0.17.0
```

## 🚀 Quick Start

### Discord.js Example

```typescript
import { Client, GatewayIntentBits } from 'discord.js';
import { Wizard, DiscordJSAdapter, StepType } from 'discord-conversation-wizard';

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

client.on('messageCreate', async (message) => {
    if (message.content === '!register') {
        const adapter = new DiscordJSAdapter(client);
        
        const wizard = new Wizard(adapter, {
            steps: [
                {
                    id: 'name',
                    type: StepType.TEXT,
                    prompt: '👋 What is your name?',
                    validate: (response) => {
                        if (response.length < 2) return 'Name must be at least 2 characters';
                        if (response.length > 32) return 'Name must be less than 32 characters';
                        return true;
                    },
                },
                {
                    id: 'age',
                    type: StepType.NUMBER,
                    prompt: '🎂 How old are you?',
                    minValue: 13,
                    maxValue: 120,
                },
                {
                    id: 'role',
                    type: StepType.SELECT_MENU,
                    prompt: '🎭 Select your preferred role:',
                    options: [
                        { label: 'Developer', value: 'dev', emoji: '💻' },
                        { label: 'Designer', value: 'design', emoji: '🎨' },
                        { label: 'Manager', value: 'manager', emoji: '📊' },
                    ],
                },
            ],
            allowBack: true,
            allowCancel: true,
        });

        wizard.on('complete', (responses) => {
            message.channel.send(
                `✅ Registration complete!\n` +
                `**Name:** ${responses.name}\n` +
                `**Age:** ${responses.age}\n` +
                `**Role:** ${responses.role}`
            );
        });

        wizard.on('cancel', () => {
            message.channel.send('❌ Registration cancelled.');
        });

        await wizard.start({
            userId: message.author.id,
            channelId: message.channel.id,
            guildId: message.guild?.id,
        });
    }
});

client.login('YOUR_BOT_TOKEN');
```

### Eris Example

```typescript
import Eris from 'eris';
import { Wizard, ErisAdapter, StepType } from 'discord-conversation-wizard';

const bot = new Eris('YOUR_BOT_TOKEN');

bot.on('messageCreate', async (message) => {
    if (message.content === '!survey') {
        const adapter = new ErisAdapter(bot);
        
        const wizard = new Wizard(adapter, {
            steps: [
                {
                    id: 'feedback',
                    type: StepType.TEXT,
                    prompt: '💬 What do you think about our service?',
                    maxLength: 500,
                },
                {
                    id: 'rating',
                    type: StepType.SELECT_MENU,
                    prompt: '⭐ Rate your experience:',
                    options: [
                        { label: '⭐⭐⭐⭐⭐ Excellent', value: '5' },
                        { label: '⭐⭐⭐⭐ Good', value: '4' },
                        { label: '⭐⭐⭐ Average', value: '3' },
                        { label: '⭐⭐ Poor', value: '2' },
                        { label: '⭐ Terrible', value: '1' },
                    ],
                },
            ],
        });

        wizard.on('complete', (responses) => {
            bot.createMessage(message.channel.id, `Thank you for your feedback! Rating: ${responses.rating}/5`);
        });

        await wizard.start({
            userId: message.author.id,
            channelId: message.channel.id,
        });
    }
});

bot.connect();
```

## 📖 Advanced Usage

### Conditional Steps

Show or hide steps based on previous responses:

```typescript
const wizard = new Wizard(adapter, {
    steps: [
        {
            id: 'hasExperience',
            type: StepType.CONFIRMATION,
            prompt: 'Do you have previous experience?',
        },
        {
            id: 'yearsOfExperience',
            type: StepType.NUMBER,
            prompt: 'How many years of experience do you have?',
            minValue: 0,
            maxValue: 50,
            condition: (responses) => responses.hasExperience === 'wizard_confirm_hasExperience',
        },
    ],
});
```

### Middleware Hooks

Add custom logic at different stages:

```typescript
const wizard = new Wizard(adapter, {
    steps: [...],
    middleware: {
        beforeStep: async (step, context) => {
            console.log(`Starting step: ${step.id}`);
        },
        afterStep: async (step, response, context) => {
            console.log(`Completed step ${step.id} with response:`, response);
            // Save to database, log analytics, etc.
        },
        onError: async (error, step, context) => {
            console.error(`Error in step ${step.id}:`, error);
            // Send to error tracking service
        },
        onComplete: async (responses, context) => {
            console.log('Wizard completed!', responses);
            // Save final data to database
        },
        onCancel: async (context) => {
            console.log('Wizard cancelled at step:', context.stepId);
        },
    },
});
```

### Data Transformation

Transform user input before validation:

```typescript
{
    id: 'email',
    type: StepType.TEXT,
    prompt: '📧 Enter your email address:',
    transform: (response) => response.toLowerCase().trim(),
    validate: (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email) || 'Please enter a valid email address';
    },
}
```

### Multi-Select Menus

Allow users to select multiple options:

```typescript
{
    id: 'interests',
    type: StepType.SELECT_MENU,
    prompt: '🎯 Select your interests (you can choose multiple):',
    allowMultiple: true,
    options: [
        { label: 'Gaming', value: 'gaming', emoji: '🎮' },
        { label: 'Music', value: 'music', emoji: '🎵' },
        { label: 'Sports', value: 'sports', emoji: '⚽' },
        { label: 'Art', value: 'art', emoji: '🎨' },
        { label: 'Technology', value: 'tech', emoji: '💻' },
    ],
}
```

### Session Persistence & Resume

Save wizard state and resume later:

```typescript
const wizard = new Wizard(adapter, {
    steps: [...],
    persistSession: true,
    sessionId: 'user_' + userId, // Optional custom session ID
});

wizard.on('sessionSaved', (session) => {
    console.log('Session saved:', session.sessionId);
});

// Resume a previously started wizard
await wizard.resume('session_id_here');
```

### Step Navigation

Enable powerful navigation controls:

```typescript
const wizard = new Wizard(adapter, {
    steps: [...],
    allowBack: true,    // User can type "back" to go to previous step
    allowSkip: true,    // User can type "skip" to skip optional steps
    allowCancel: true,  // User can type "cancel" to abort the wizard
});

// Programmatic navigation
await wizard.goBack();
await wizard.skip();
await wizard.jumpToStep('stepId');
wizard.cancel();
```

### Attachment Validation

Request and validate file uploads:

```typescript
{
    id: 'avatar',
    type: StepType.ATTACHMENT,
    prompt: '📎 Upload your profile picture:',
    validate: (attachment) => {
        const validTypes = ['image/png', 'image/jpeg', 'image/gif'];
        if (!validTypes.includes(attachment.contentType)) {
            return 'Please upload a PNG, JPEG, or GIF image';
        }
        if (attachment.size > 5 * 1024 * 1024) {
            return 'Image must be smaller than 5MB';
        }
        return true;
    },
}
```

### Retry Limits

Configure maximum retry attempts for validation failures:

```typescript
{
    id: 'code',
    type: StepType.TEXT,
    prompt: 'Enter the verification code:',
    retry: 3, // Maximum 3 attempts
    validate: (code) => {
        return code === 'SECRET123' || 'Invalid verification code';
    },
}
```

### Built-in Validators (v1.1.0+)

Use pre-built validators for common validation patterns:

```typescript
import { validators } from 'discord-conversation-wizard';

const wizard = new Wizard(adapter, {
    steps: [
        {
            id: 'email',
            type: StepType.TEXT,
            prompt: '📧 Enter your email:',
            validate: validators.email(),
            transform: (value) => value.toLowerCase().trim(),
        },
        {
            id: 'website',
            type: StepType.TEXT,
            prompt: '🌐 Enter your website:',
            validate: validators.url({ requireProtocol: false }),
        },
        {
            id: 'phone',
            type: StepType.TEXT,
            prompt: '📱 Enter your phone number:',
            validate: validators.phone(),
        },
        {
            id: 'username',
            type: StepType.TEXT,
            prompt: '👤 Enter your username:',
            validate: validators.regex(/^[a-zA-Z0-9_]{3,16}$/, {
                message: 'Username must be 3-16 characters (letters, numbers, underscores only)'
            }),
        },
        {
            id: 'bio',
            type: StepType.TEXT,
            prompt: '📝 Write your bio:',
            validate: validators.length({ min: 10, max: 500 }),
        },
        {
            id: 'age',
            type: StepType.NUMBER,
            prompt: '🎂 Enter your age:',
            validate: validators.range({ min: 13, max: 120 }),
        },
        {
            id: 'password',
            type: StepType.TEXT,
            prompt: '🔒 Create a password:',
            validate: validators.combine([
                validators.length({ min: 8, max: 128 }),
                validators.regex(/[A-Z]/, { message: 'Must contain uppercase' }),
                validators.regex(/[0-9]/, { message: 'Must contain number' }),
            ]),
        },
    ],
});
```

**Available Validators:**
- `validators.email()` - Valid email address
- `validators.url()` - Valid URL with optional protocol requirements
- `validators.phone()` - International phone number format
- `validators.regex(pattern)` - Custom regex pattern matching
- `validators.length({ min, max })` - String length validation
- `validators.range({ min, max })` - Numeric range validation
- `validators.combine([...])` - Combine multiple validators (AND logic)
- `validators.oneOf([...])` - Value must be in allowed list

### Progress Indicators (v1.1.0+)

Show visual progress throughout the wizard:

```typescript
const wizard = new Wizard(adapter, {
    steps: [...],
    showProgress: true,
    progressFormat: '📊 Step {current}/{total}', // or '{percent}%'
});
```

**Format Placeholders:**
- `{current}` - Current step number (1-indexed)
- `{total}` - Total number of steps
- `{percent}` - Progress percentage (0-100)

**Default format:** `📊 Step {current}/{total}`

### Timeout Warnings (v1.1.0+)

Send warnings before response timeout expires:

```typescript
const wizard = new Wizard(adapter, {
    steps: [...],
    timeout: 60, // seconds
    timeoutWarning: true, // warns 15 seconds before by default
    // OR
    timeoutWarning: 20, // warns 20 seconds before timeout
    timeoutWarningMessage: '⏰ Hurry! Time is running out!',
});
```

**Options:**
- `timeoutWarning: true` - Warns 15 seconds before timeout (default)
- `timeoutWarning: <number>` - Warns N seconds before timeout
- `timeoutWarningMessage` - Custom warning message

## 📚 API Reference

### `Wizard`

Main wizard class for managing conversation flow.

#### Constructor

```typescript
new Wizard(adapter: AdapterInterface, options: WizardOptions)
```

#### Methods

- `start(context: WizardContext): Promise<void>` - Start the wizard
- `resume(sessionId: string): Promise<boolean>` - Resume a saved session
- `cancel(): void` - Cancel the wizard
- `goBack(): Promise<boolean>` - Navigate to previous step
- `skip(): Promise<boolean>` - Skip current step
- `jumpToStep(stepId: string): Promise<boolean>` - Jump to a specific step
- `getResponses(): Record<string, any>` - Get all collected responses
- `getCurrentStepIndex(): number` - Get current step index
- `isActive(): boolean` - Check if wizard is running
- `getSessionId(): string` - Get session ID

#### Events

- `start` - Wizard started
- `step` - New step started
- `skip` - Step was skipped
- `complete` - Wizard completed successfully
- `cancel` - Wizard was cancelled
- `error` - Error occurred
- `sessionSaved` - Session was saved
- `resume` - Session was resumed
- `maxRetriesReached` - Maximum retry attempts reached

### `WizardOptions`

Configuration options for the wizard.

```typescript
interface WizardOptions {
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
```

### `WizardStep`

Configuration for a single step.

```typescript
interface WizardStep {
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
    allowMultiple?: boolean;
    condition?: (responses: Record<string, any>, context: WizardContext) => boolean | Promise<boolean>;
    onSkip?: (context: WizardStepContext) => void | Promise<void>;
    retry?: number;
}
```

### `StepType`

Available step types:

- `StepType.TEXT` - Text input
- `StepType.NUMBER` - Numeric input with validation
- `StepType.SELECT_MENU` - Discord select menu (dropdown)
- `StepType.BUTTON` - Button interactions
- `StepType.CONFIRMATION` - Yes/No confirmation buttons
- `StepType.ATTACHMENT` - File upload

## 🤝 Contributing

Contributions are welcome! Please check out the [Contributing Guide](CONTRIBUTING.md) for more information.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

Created with ❤️ by [Jersuxs](https://github.com/jersuxsss)

## 🔗 Links

- [NPM Package](https://www.npmjs.com/package/discord-conversation-wizard)
- [GitHub Repository](https://github.com/jersuxsss/discord-conversation-wizard)
- [Issue Tracker](https://github.com/jersuxsss/discord-conversation-wizard/issues)
- [Discord.js Documentation](https://discord.js.org/)
- [Eris Documentation](https://abal.moe/Eris/)

---

<div align="center">

**⭐ Star us on GitHub if you find this helpful!**

</div>
