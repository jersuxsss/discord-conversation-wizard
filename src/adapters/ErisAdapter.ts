import {
    AdapterInterface,
    MessageOptions,
    AwaitMessageOptions,
    AwaitComponentOptions,
} from './AdapterInterface';
import { StepOption } from '../types';

/**
 * Eris adapter for Discord Conversation Wizard
 * Provides compatibility with Eris library (v0.17.0+)
 */
export class ErisAdapter implements AdapterInterface {
    private client: any;

    constructor(client: any) {
        this.client = client;
    }

    async sendMessage(channelId: string, content: string | MessageOptions): Promise<any> {
        try {
            if (typeof content === 'string') {
                return await this.client.createMessage(channelId, content);
            }

            const messagePayload: any = {};
            if (content.content) messagePayload.content = content.content;
            if (content.components) messagePayload.components = content.components;
            if (content.files) messagePayload.files = content.files;

            return await this.client.createMessage(channelId, messagePayload);
        } catch (error) {
            throw new Error(`Failed to send message: ${error}`);
        }
    }

    async awaitMessages(channelId: string, options: AwaitMessageOptions): Promise<any[]> {
        return new Promise((resolve, reject) => {
            const collected: any[] = [];
            const timeout = setTimeout(() => {
                this.client.removeListener('messageCreate', messageHandler);
                if (options.errors?.includes('time')) {
                    reject(new Error('Time limit exceeded'));
                } else {
                    resolve(collected);
                }
            }, options.time);

            const messageHandler = (message: any) => {
                if (message.channel.id !== channelId) return;
                if (!options.filter(message)) return;

                collected.push(message);

                if (collected.length >= options.max) {
                    clearTimeout(timeout);
                    this.client.removeListener('messageCreate', messageHandler);
                    resolve(collected);
                }
            };

            this.client.on('messageCreate', messageHandler);
        });
    }

    async awaitComponent(channelId: string, options: AwaitComponentOptions): Promise<any> {
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                this.client.removeListener('interactionCreate', interactionHandler);
                reject(new Error('Time limit exceeded'));
            }, options.time);

            const interactionHandler = (interaction: any) => {
                if (interaction.channel?.id !== channelId) return;
                if (interaction.type !== 3) return; // MESSAGE_COMPONENT
                if (options.componentType && interaction.data.component_type !== options.componentType) return;
                if (!options.filter(interaction)) return;

                clearTimeout(timeout);
                this.client.removeListener('interactionCreate', interactionHandler);

                // Acknowledge the interaction
                interaction.acknowledge().catch(() => { });

                resolve(interaction);
            };

            this.client.on('interactionCreate', interactionHandler);
        });
    }

    createSelectMenu(
        customId: string,
        options: StepOption[],
        placeholder?: string,
        minValues: number = 1,
        maxValues: number = 1
    ): any {
        return {
            type: 3, // STRING_SELECT
            custom_id: customId,
            placeholder: placeholder || 'Select an option',
            min_values: minValues,
            max_values: maxValues,
            options: options.map(opt => ({
                label: opt.label,
                value: opt.value,
                description: opt.description,
                emoji: opt.emoji ? this.parseEmoji(opt.emoji) : undefined,
            })),
        };
    }

    createButton(
        customId: string,
        label: string,
        style: 'PRIMARY' | 'SECONDARY' | 'SUCCESS' | 'DANGER'
    ): any {
        const styleMap = {
            PRIMARY: 1,
            SECONDARY: 2,
            SUCCESS: 3,
            DANGER: 4,
        };

        return {
            type: 2, // BUTTON
            custom_id: customId,
            label: label,
            style: styleMap[style],
        };
    }

    getContent(message: any): string {
        return message.content || '';
    }

    getAttachments(message: any): any[] {
        return message.attachments || [];
    }

    getAuthorId(messageOrInteraction: any): string {
        // For messages
        if (messageOrInteraction.author) {
            return messageOrInteraction.author.id;
        }
        // For interactions
        if (messageOrInteraction.member) {
            return messageOrInteraction.member.id;
        }
        // Fallback
        return messageOrInteraction.user?.id || '';
    }

    getComponentValue(interaction: any): any {
        if (!interaction.data) return null;

        // For select menus
        if (interaction.data.component_type === 3) {
            return interaction.data.values || [];
        }

        // For buttons
        if (interaction.data.component_type === 2) {
            return interaction.data.custom_id;
        }

        return null;
    }

    private parseEmoji(emoji: string): any {
        // Simple emoji (unicode)
        if (!emoji.includes(':')) {
            return { name: emoji };
        }

        // Custom emoji format: <:name:id> or <a:name:id>
        const match = emoji.match(/<a?:(\w+):(\d+)>/);
        if (match) {
            return {
                name: match[1],
                id: match[2],
            };
        }

        return { name: emoji };
    }
}
