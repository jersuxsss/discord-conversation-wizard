# Examples

This directory contains practical examples demonstrating various features of Discord Conversation Wizard.

## Available Examples

### 1. Registration Bot (`registration-bot.ts`)

**Library:** Discord.js

A comprehensive user registration wizard featuring:
- Multiple step types (text, number, select menu, confirmation)
- Advanced validation with custom error messages
- Data transformation (trim, lowercase)
- Conditional steps based on user age
- Multi-select interests
- Middleware hooks for logging and persistence
- Navigation controls (back, cancel)
- Retry limits
- Profile viewing system

**Usage:**
```bash
Commands:
- !register - Start registration wizard
- !profile - View your profile
```

### 2. Survey Bot (`survey-bot-eris.ts`)

**Library:** Eris

A simple customer satisfaction survey demonstrating:
- Basic wizard setup with Eris
- Select menu for ratings
- Text input for feedback
- Confirmation buttons
- Event handling
- Data storage

**Usage:**
```bash
Commands:
- !survey - Start survey
```

## Running the Examples

### Prerequisites

Install the required dependencies:

```bash
# For Discord.js examples
npm install discord.js

# For Eris examples
npm install eris

# Install the wizard library
npm install discord-conversation-wizard
```

### Configuration

1. Create a Discord bot at https://discord.com/developers/applications
2. Copy your bot token
3. Replace `YOUR_BOT_TOKEN` in the example files with your actual token
4. Enable the necessary intents in the Discord Developer Portal

### Running

With ts-node:
```bash
npx ts-node examples/registration-bot.ts
```

Or compile first:
```bash
tsc examples/registration-bot.ts
node examples/registration-bot.js
```

## Creating Your Own Bot

Use these examples as templates for your own bots. Here's a minimal template:

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
    if (message.content === '!start') {
        const adapter = new DiscordJSAdapter(client);
        
        const wizard = new Wizard(adapter, {
            steps: [
                {
                    id: 'step1',
                    type: StepType.TEXT,
                    prompt: 'Your question here',
                },
            ],
        });
        
        wizard.on('complete', (responses) => {
            message.reply(`Completed! Response: ${responses.step1}`);
        });
        
        await wizard.start({
            userId: message.author.id,
            channelId: message.channel.id,
        });
    }
});

client.login('YOUR_BOT_TOKEN');
```

## Additional Resources

- [Main Documentation](../README.md)
- [API Reference](../README.md#-api-reference)
- [Contributing Guide](../CONTRIBUTING.md)

## Need Help?

- Check the [issues page](https://github.com/jersuxsss/discord-conversation-wizard/issues)
- Read the [documentation](../README.md)
- Look at these examples for reference

Happy coding! 🚀
