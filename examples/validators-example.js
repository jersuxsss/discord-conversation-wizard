// Example: Using built-in validators with Discord Conversation Wizard
// This example demonstrates all the available validators

const { Client, GatewayIntentBits } = require('discord.js');
const { Wizard, DiscordJSAdapter, StepType, validators } = require('discord-conversation-wizard');

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
                    id: 'username',
                    type: StepType.TEXT,
                    prompt: '👤 Enter your username (3-16 characters, letters, numbers, and underscores only):',
                    validate: validators.regex(/^[a-zA-Z0-9_]{3,16}$/, {
                        message: 'Username must be 3-16 characters and contain only letters, numbers, and underscores'
                    }),
                },
                {
                    id: 'email',
                    type: StepType.TEXT,
                    prompt: '📧 Enter your email address:',
                    validate: validators.email(),
                    transform: (value) => value.toLowerCase().trim(),
                },
                {
                    id: 'age',
                    type: StepType.NUMBER,
                    prompt: '🎂 Enter your age:',
                    validate: validators.range({
                        min: 13,
                        max: 120,
                        message: 'Age must be between 13 and 120'
                    }),
                },
                {
                    id: 'website',
                    type: StepType.TEXT,
                    prompt: '🌐 Enter your website (optional, type "skip" to skip):',
                    required: false,
                    validate: validators.url({
                        requireProtocol: false,
                        message: 'Please enter a valid URL'
                    }),
                },
                {
                    id: 'phone',
                    type: StepType.TEXT,
                    prompt: '📱 Enter your phone number (international format, e.g., +1234567890):',
                    validate: validators.phone({
                        message: 'Please enter a valid phone number in international format (e.g., +1234567890)'
                    }),
                },
                {
                    id: 'bio',
                    type: StepType.TEXT,
                    prompt: '📝 Write a short bio about yourself (10-500 characters):',
                    validate: validators.length({
                        min: 10,
                        max: 500,
                        message: 'Bio must be between 10 and 500 characters'
                    }),
                },
                {
                    id: 'password',
                    type: StepType.TEXT,
                    prompt: '🔒 Create a password:',
                    validate: validators.combine([
                        validators.length({ min: 8, max: 128, message: 'Password must be 8-128 characters' }),
                        validators.regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' }),
                        validators.regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter' }),
                        validators.regex(/[0-9]/, { message: 'Password must contain at least one number' }),
                        validators.regex(/[!@#$%^&*(),.?":{}|<>]/, { message: 'Password must contain at least one special character' }),
                    ]),
                },
                {
                    id: 'favoriteColor',
                    type: StepType.TEXT,
                    prompt: '🎨 What is your favorite color? (red, blue, green, yellow, or purple)',
                    validate: validators.oneOf(['red', 'blue', 'green', 'yellow', 'purple'],
                        'Please choose one of: red, blue, green, yellow, or purple'),
                    transform: (value) => value.toLowerCase(),
                },
                {
                    id: 'confirmation',
                    type: StepType.CONFIRMATION,
                    prompt: '✅ Confirm your registration?',
                },
            ],
            allowBack: true,
            allowSkip: true,
            allowCancel: true,
            showProgress: true,
            timeout: 120,
        });

        wizard.on('complete', (responses) => {
            // Don't log the password!
            const { password, ...safeResponses } = responses;

            message.channel.send({
                embeds: [{
                    title: '✅ Registration Complete!',
                    color: 0x00ff00,
                    fields: [
                        { name: 'Username', value: responses.username, inline: true },
                        { name: 'Email', value: responses.email, inline: true },
                        { name: 'Age', value: responses.age.toString(), inline: true },
                        { name: 'Website', value: responses.website || 'Not provided', inline: true },
                        { name: 'Phone', value: responses.phone, inline: true },
                        { name: 'Favorite Color', value: responses.favoriteColor, inline: true },
                        { name: 'Bio', value: responses.bio },
                    ],
                    timestamp: new Date(),
                }]
            });
        });

        wizard.on('cancel', () => {
            message.channel.send('❌ Registration cancelled.');
        });

        wizard.on('error', (error) => {
            console.error('Wizard error:', error);
            message.channel.send('❌ An error occurred during registration.');
        });

        await wizard.start({
            userId: message.author.id,
            channelId: message.channel.id,
            guildId: message.guild?.id,
        });
    }
});

client.login('YOUR_BOT_TOKEN');
