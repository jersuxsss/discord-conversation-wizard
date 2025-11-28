// Example: Progress indicators and timeout warnings
// This example shows how to use the new v1.1.0 features

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
    if (message.content === '!survey') {
        const adapter = new DiscordJSAdapter(client);

        const wizard = new Wizard(adapter, {
            steps: [
                {
                    id: 'name',
                    type: StepType.TEXT,
                    prompt: 'What is your name?',
                    validate: validators.length({ min: 2, max: 50 }),
                },
                {
                    id: 'satisfaction',
                    type: StepType.SELECT_MENU,
                    prompt: 'How satisfied are you with our service?',
                    options: [
                        { label: 'Very Satisfied', value: '5', emoji: '😍' },
                        { label: 'Satisfied', value: '4', emoji: '😊' },
                        { label: 'Neutral', value: '3', emoji: '😐' },
                        { label: 'Dissatisfied', value: '2', emoji: '😕' },
                        { label: 'Very Dissatisfied', value: '1', emoji: '😞' },
                    ],
                },
                {
                    id: 'features',
                    type: StepType.SELECT_MENU,
                    prompt: 'Which features do you use most? (Select multiple)',
                    allowMultiple: true,
                    options: [
                        { label: 'Feature A', value: 'a', emoji: '🅰️' },
                        { label: 'Feature B', value: 'b', emoji: '🅱️' },
                        { label: 'Feature C', value: 'c', emoji: '©️' },
                        { label: 'Feature D', value: 'd', emoji: '🇩' },
                    ],
                },
                {
                    id: 'feedback',
                    type: StepType.TEXT,
                    prompt: 'Any additional feedback? (optional)',
                    required: false,
                    validate: validators.length({ max: 1000 }),
                },
                {
                    id: 'recommend',
                    type: StepType.CONFIRMATION,
                    prompt: 'Would you recommend our service to others?',
                },
            ],

            // Enable progress indicators
            showProgress: true,
            // Custom progress format (use {current}, {total}, or {percent} placeholders)
            progressFormat: '📊 Progress: {current}/{total} ({percent}%)',

            // Enable timeout warnings
            timeoutWarning: true, // Will warn 15 seconds before timeout by default
            // Or specify custom warning time: timeoutWarning: 20, // warns 20 seconds before
            timeoutWarningMessage: '⏰ Hurry up! You have limited time left to respond!',

            // Set timeout to 60 seconds per step
            timeout: 60,

            allowBack: true,
            allowCancel: true,
        });

        wizard.on('step', (step, stepIndex) => {
            console.log(`User is on step ${stepIndex + 1}: ${step.id}`);
        });

        wizard.on('complete', async (responses) => {
            const embed = {
                title: '📋 Survey Complete!',
                description: `Thank you **${responses.name}** for completing our survey!`,
                color: 0x00ff00,
                fields: [
                    {
                        name: 'Satisfaction Rating',
                        value: '⭐'.repeat(parseInt(responses.satisfaction)),
                        inline: true
                    },
                    {
                        name: 'Features Used',
                        value: Array.isArray(responses.features)
                            ? responses.features.join(', ').toUpperCase()
                            : responses.features.toUpperCase(),
                        inline: true
                    },
                    {
                        name: 'Would Recommend',
                        value: responses.recommend.includes('confirm') ? '✅ Yes' : '❌ No',
                        inline: true
                    },
                ],
                timestamp: new Date(),
                footer: { text: 'Thank you for your feedback!' },
            };

            if (responses.feedback) {
                embed.fields.push({
                    name: '💬 Additional Feedback',
                    value: responses.feedback,
                });
            }

            await message.channel.send({ embeds: [embed] });
        });

        wizard.on('cancel', () => {
            message.channel.send('❌ Survey cancelled. Feel free to try again later!');
        });

        wizard.on('maxRetriesReached', (step) => {
            message.channel.send(`⚠️ Too many invalid attempts on step: ${step.id}`);
        });

        await wizard.start({
            userId: message.author.id,
            channelId: message.channel.id,
            guildId: message.guild?.id,
        });
    }
});

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
    console.log('Try the command !survey to see progress indicators and timeout warnings in action!');
});

client.login('YOUR_BOT_TOKEN');
