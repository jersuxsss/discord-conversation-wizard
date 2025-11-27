/**
 * Simple Survey Bot Example (Eris)
 * 
 * This example demonstrates:
 * - Basic wizard setup with Eris
 * - Simple text and select menu steps
 * - Event handling
 * - Data collection and storage
 */

import Eris from 'eris';
import {
    Wizard,
    ErisAdapter,
    StepType,
} from 'discord-conversation-wizard';

const bot = new Eris('YOUR_BOT_TOKEN');

// Store survey responses
const surveyResponses = new Map();

bot.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    if (message.content.toLowerCase() === '!survey') {
        const adapter = new ErisAdapter(bot);

        const wizard = new Wizard(adapter, {
            steps: [
                {
                    id: 'satisfaction',
                    type: StepType.SELECT_MENU,
                    prompt: '📊 **Customer Satisfaction Survey**\n\nHow satisfied are you with our service?',
                    options: [
                        { label: 'Very Satisfied', value: '5', emoji: '😄' },
                        { label: 'Satisfied', value: '4', emoji: '🙂' },
                        { label: 'Neutral', value: '3', emoji: '😐' },
                        { label: 'Unsatisfied', value: '2', emoji: '🙁' },
                        { label: 'Very Unsatisfied', value: '1', emoji: '😢' },
                    ],
                },
                {
                    id: 'feedback',
                    type: StepType.TEXT,
                    prompt: '💬 Please provide any additional feedback (optional - type "skip" to skip):',
                    required: false,
                },
                {
                    id: 'recommend',
                    type: StepType.CONFIRMATION,
                    prompt: '🌟 Would you recommend us to others?',
                },
            ],
            allowCancel: true,
            timeout: 60,
        });

        wizard.on('complete', async (responses) => {
            // Save survey response
            surveyResponses.set(message.author.id, {
                ...responses,
                timestamp: new Date(),
            });

            const recommendValue = responses.recommend.includes('confirm') ? 'Yes' : 'No';

            await bot.createMessage(message.channel.id, {
                embed: {
                    color: 0x00ff00,
                    title: '✅ Survey Complete',
                    description: 'Thank you for your feedback!',
                    fields: [
                        { name: 'Satisfaction', value: `${responses.satisfaction}/5`, inline: true },
                        { name: 'Would Recommend', value: recommendValue, inline: true },
                        { name: 'Feedback', value: responses.feedback || 'No additional feedback', inline: false },
                    ],
                },
            });
        });

        wizard.on('cancel', async () => {
            await bot.createMessage(message.channel.id, '❌ Survey cancelled.');
        });

        await wizard.start({
            userId: message.author.id,
            channelId: message.channel.id,
        });
    }
});

bot.on('ready', () => {
    console.log('✅ Bot is ready!');
    console.log('📝 Command: !survey');
});

bot.connect();
