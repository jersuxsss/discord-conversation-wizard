import { Client, GatewayIntentBits, Partials } from 'discord.js';
import { Wizard, StepType, DiscordJSAdapter } from '../src';

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages
    ],
    partials: [Partials.Channel]
});

const adapter = new DiscordJSAdapter(client);

client.on('ready', () => {
    console.log(`Logged in as ${client.user?.tag}!`);
});

client.on('messageCreate', async (message) => {
    if (message.content === '!wizard') {
        const wizard = new Wizard(adapter, {
            steps: [
                {
                    id: 'name',
                    prompt: 'What is your name?',
                    type: StepType.TEXT
                },
                {
                    id: 'role',
                    prompt: 'Choose your role:',
                    type: StepType.SELECT_MENU,
                    options: [
                        { label: 'Developer', value: 'dev', description: 'Writes code' },
                        { label: 'Designer', value: 'design', description: 'Makes art' }
                    ]
                },
                {
                    id: 'age',
                    prompt: 'How old are you?',
                    type: StepType.TEXT,
                    validate: (response) => {
                        const age = parseInt(response);
                        if (isNaN(age) || age < 18) return 'You must be at least 18.';
                        return true;
                    }
                }
            ]
        });

        wizard.on('start', () => console.log('Wizard started'));
        wizard.on('step', (step) => console.log(`Step: ${step.id}`));
        wizard.on('end', (results) => {
            console.log('Wizard completed!', results);
            message.channel.send(`Wizard completed! Results: \`\`\`json\n${JSON.stringify(results, null, 2)}\n\`\`\``);
        });
        wizard.on('error', (err) => {
            console.error('Wizard error:', err);
            message.channel.send('An error occurred.');
        });

        await wizard.start({
            userId: message.author.id,
            channelId: message.channel.id,
            guildId: message.guild?.id
        });
    }
});

// Replace with your token
const TOKEN = process.env.DISCORD_TOKEN || 'YOUR_TOKEN_HERE';
client.login(TOKEN);
