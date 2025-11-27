/**
 * Advanced User Registration Example
 * 
 * This example demonstrates:
 * - Multiple step types (text, number, select, confirmation)
 * - Custom validation with detailed error messages
 * - Data transformation
 * - Conditional steps
 * - Middleware hooks for logging and data persistence
 * - Navigation controls (back, cancel)
 */

import { Client, GatewayIntentBits } from 'discord.js';
import {
    Wizard,
    DiscordJSAdapter,
    StepType,
    WizardMiddleware,
} from 'discord-conversation-wizard';

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

// Simulated database
const userDatabase = new Map();

// Custom middleware for logging and persistence
const registrationMiddleware: WizardMiddleware = {
    beforeStep: async (step, context) => {
        console.log(`[Wizard] Starting step: ${step.id} for user ${context.wizardContext.userId}`);
    },

    afterStep: async (step, response, context) => {
        console.log(`[Wizard] Completed step: ${step.id}, Response:`, response);
        // Could save partial progress to database here
    },

    onError: async (error, step, context) => {
        console.error(`[Wizard] Error in step ${step.id}:`, error.message);
        // Could send error to monitoring service
    },

    onComplete: async (responses, context) => {
        console.log('[Wizard] Registration completed!', responses);

        // Save to database
        userDatabase.set(context.userId, {
            ...responses,
            registeredAt: new Date(),
            discordId: context.userId,
        });

        console.log(`[Database] Saved user ${context.userId} to database`);
    },

    onCancel: async (context) => {
        console.log(`[Wizard] User ${context.wizardContext.userId} cancelled registration at step ${context.stepId}`);
    },
};

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    if (message.content.toLowerCase() === '!register') {
        // Check if user is already registered
        if (userDatabase.has(message.author.id)) {
            await message.reply('❌ You are already registered!');
            return;
        }

        const adapter = new DiscordJSAdapter(client);

        const wizard = new Wizard(adapter, {
            steps: [
                // Step 1: Username
                {
                    id: 'username',
                    type: StepType.TEXT,
                    prompt: '👋 **Welcome to the Registration Wizard!**\n\nPlease enter your desired username:',
                    minLength: 3,
                    maxLength: 20,
                    transform: (response) => response.trim(),
                    validate: (username, context) => {
                        // Check length
                        if (username.length < 3) {
                            return 'Username must be at least 3 characters long';
                        }
                        if (username.length > 20) {
                            return 'Username must be less than 20 characters';
                        }

                        // Check alphanumeric
                        if (!/^[a-zA-Z0-9_]+$/.test(username)) {
                            return 'Username can only contain letters, numbers, and underscores';
                        }

                        // Check if username is taken (in real app, check database)
                        const existingUsers = Array.from(userDatabase.values());
                        if (existingUsers.some(u => u.username.toLowerCase() === username.toLowerCase())) {
                            return 'This username is already taken. Please choose another one.';
                        }

                        return true;
                    },
                    retry: 3,
                },

                // Step 2: Age
                {
                    id: 'age',
                    type: StepType.NUMBER,
                    prompt: '🎂 How old are you?',
                    minValue: 13,
                    maxValue: 120,
                    validate: (age) => {
                        if (age < 13) {
                            return 'You must be at least 13 years old to register (Discord ToS requirement)';
                        }
                        if (age > 120) {
                            return 'Please enter a valid age';
                        }
                        return true;
                    },
                },

                // Step 3: Country
                {
                    id: 'country',
                    type: StepType.SELECT_MENU,
                    prompt: '🌍 Select your country:',
                    options: [
                        { label: 'United States', value: 'US', emoji: '🇺🇸' },
                        { label: 'United Kingdom', value: 'GB', emoji: '🇬🇧' },
                        { label: 'Canada', value: 'CA', emoji: '🇨🇦' },
                        { label: 'Australia', value: 'AU', emoji: '🇦🇺' },
                        { label: 'Germany', value: 'DE', emoji: '🇩🇪' },
                        { label: 'France', value: 'FR', emoji: '🇫🇷' },
                        { label: 'Spain', value: 'ES', emoji: '🇪🇸' },
                        { label: 'Other', value: 'OTHER', emoji: '🌐' },
                    ],
                },

                // Step 4: Role (conditional on age)
                {
                    id: 'role',
                    type: StepType.SELECT_MENU,
                    prompt: '🎭 Select your primary role in the community:',
                    options: [
                        { label: 'Developer', value: 'developer', emoji: '💻' },
                        { label: 'Designer', value: 'designer', emoji: '🎨' },
                        { label: 'Content Creator', value: 'creator', emoji: '📹' },
                        { label: 'Gamer', value: 'gamer', emoji: '🎮' },
                        { label: 'Student', value: 'student', emoji: '📚' },
                        { label: 'Other', value: 'other', emoji: '💼' },
                    ],
                },

                // Step 5: Interests (multi-select)
                {
                    id: 'interests',
                    type: StepType.SELECT_MENU,
                    prompt: '🎯 Select your interests (you can choose multiple):',
                    allowMultiple: true,
                    options: [
                        { label: 'Gaming', value: 'gaming', emoji: '🎮' },
                        { label: 'Programming', value: 'programming', emoji: '💻' },
                        { label: 'Music', value: 'music', emoji: '🎵' },
                        { label: 'Art', value: 'art', emoji: '🎨' },
                        { label: 'Sports', value: 'sports', emoji: '⚽' },
                        { label: 'Technology', value: 'tech', emoji: '📱' },
                        { label: 'Anime/Manga', value: 'anime', emoji: '📺' },
                        { label: 'Reading', value: 'reading', emoji: '📚' },
                    ],
                    validate: (interests) => {
                        if (interests.length === 0) {
                            return 'Please select at least one interest';
                        }
                        return true;
                    },
                },

                // Step 6: Bio
                {
                    id: 'bio',
                    type: StepType.TEXT,
                    prompt: '✍️ Write a short bio about yourself (50-500 characters):',
                    minLength: 50,
                    maxLength: 500,
                    validate: (bio) => {
                        if (bio.length < 50) {
                            return `Bio is too short (${bio.length}/50 characters minimum)`;
                        }
                        if (bio.length > 500) {
                            return `Bio is too long (${bio.length}/500 characters maximum)`;
                        }
                        return true;
                    },
                },

                // Step 7: Email (optional, only if 18+)
                {
                    id: 'provideEmail',
                    type: StepType.CONFIRMATION,
                    prompt: '📧 Would you like to provide your email for notifications?',
                    condition: (responses) => responses.age >= 18,
                },

                {
                    id: 'email',
                    type: StepType.TEXT,
                    prompt: '📧 Please enter your email address:',
                    condition: (responses) => {
                        return responses.provideEmail === 'wizard_confirm_provideEmail';
                    },
                    transform: (email) => email.toLowerCase().trim(),
                    validate: (email) => {
                        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                        if (!emailRegex.test(email)) {
                            return 'Please enter a valid email address';
                        }
                        return true;
                    },
                },

                // Step 8: Final confirmation
                {
                    id: 'confirm',
                    type: StepType.CONFIRMATION,
                    prompt: '✅ **Review your information:**\n\nAre you ready to complete your registration?',
                },
            ],

            middleware: registrationMiddleware,
            allowBack: true,
            allowCancel: true,
            timeout: 120, // 2 minutes per step
        });

        // Event handlers
        wizard.on('step', (step, index) => {
            console.log(`Progress: ${index + 1}/${wizard['steps'].length} - ${step.id}`);
        });

        wizard.on('complete', async (responses) => {
            // Build confirmation message
            const interestsText = Array.isArray(responses.interests)
                ? responses.interests.join(', ')
                : responses.interests;

            const confirmationEmbed = {
                color: 0x00ff00,
                title: '✅ Registration Complete!',
                description: 'Welcome to the community!',
                fields: [
                    { name: 'Username', value: responses.username, inline: true },
                    { name: 'Age', value: responses.age.toString(), inline: true },
                    { name: 'Country', value: responses.country, inline: true },
                    { name: 'Role', value: responses.role, inline: false },
                    { name: 'Interests', value: interestsText, inline: false },
                    { name: 'Bio', value: responses.bio, inline: false },
                ],
                timestamp: new Date().toISOString(),
                footer: {
                    text: 'Thank you for registering!',
                },
            };

            if (responses.email) {
                confirmationEmbed.fields.push({
                    name: 'Email',
                    value: responses.email,
                    inline: false,
                });
            }

            await message.channel.send({ embeds: [confirmationEmbed] });
        });

        wizard.on('cancel', async () => {
            await message.reply('❌ Registration cancelled. You can start again anytime with `!register`');
        });

        wizard.on('error', async (error) => {
            console.error('[Wizard Error]:', error);
            await message.reply('❌ An error occurred during registration. Please try again later.');
        });

        wizard.on('maxRetriesReached', async (step, context) => {
            await message.reply(
                `❌ You've reached the maximum number of attempts for the "${step.id}" step. ` +
                `Please use \`!register\` to start over.`
            );
        });

        // Start the wizard
        await wizard.start({
            userId: message.author.id,
            channelId: message.channel.id,
            guildId: message.guild?.id,
        });
    }

    // Check registration status
    if (message.content.toLowerCase() === '!profile') {
        const userData = userDatabase.get(message.author.id);

        if (!userData) {
            await message.reply('❌ You are not registered yet! Use `!register` to get started.');
            return;
        }

        const profileEmbed = {
            color: 0x0099ff,
            title: '👤 Your Profile',
            fields: [
                { name: 'Username', value: userData.username, inline: true },
                { name: 'Age', value: userData.age.toString(), inline: true },
                { name: 'Country', value: userData.country, inline: true },
                { name: 'Role', value: userData.role, inline: false },
                { name: 'Interests', value: userData.interests.join(', '), inline: false },
                { name: 'Bio', value: userData.bio, inline: false },
            ],
            timestamp: userData.registeredAt.toISOString(),
        };

        await message.reply({ embeds: [profileEmbed] });
    }
});

client.on('ready', () => {
    console.log(`✅ Bot logged in as ${client.user?.tag}`);
    console.log('📝 Commands: !register, !profile');
});

// Replace with your bot token
client.login('YOUR_BOT_TOKEN');
