import {
    AdapterInterface,
    MessageOptions,
    AwaitMessageOptions,
    AwaitComponentOptions
} from './AdapterInterface';
import { StepOption } from '../types';
import {
    ActionRowBuilder,
    StringSelectMenuBuilder,
    ButtonBuilder,
    ButtonStyle,
    ComponentType,
    TextChannel,
    Message
} from 'discord.js';

export class DiscordJSAdapter implements AdapterInterface {
    private client: any;

    constructor(client: any) {
        this.client = client;
    }

    async sendMessage(channelId: string, content: string | MessageOptions): Promise<any> {
        const channel = await this.client.channels.fetch(channelId);
        if (!channel || !channel.isTextBased()) throw new Error('Invalid channel');

        if (typeof content === 'string') {
            return channel.send(content);
        }

        return channel.send({
            content: content.content,
            components: content.components,
            files: content.files
        });
    }

    async awaitMessages(channelId: string, options: AwaitMessageOptions): Promise<any[]> {
        const channel = await this.client.channels.fetch(channelId) as TextChannel;
        if (!channel) throw new Error('Invalid channel');

        const collected = await channel.awaitMessages({
            filter: options.filter,
            max: options.max,
            time: options.time,
            errors: options.errors
        });

        return Array.from(collected.values());
    }

    async awaitComponent(channelId: string, options: AwaitComponentOptions): Promise<any> {
        const channel = await this.client.channels.fetch(channelId) as TextChannel;
        if (!channel) throw new Error('Invalid channel');

        return channel.awaitMessageComponent({
            filter: options.filter,
            time: options.time,
            componentType: options.componentType
        });
    }

    createSelectMenu(
        customId: string,
        options: StepOption[],
        placeholder?: string,
        minValues: number = 1,
        maxValues: number = 1
    ): any {
        const select = new StringSelectMenuBuilder()
            .setCustomId(customId)
            .setPlaceholder(placeholder || 'Select an option')
            .setMinValues(minValues)
            .setMaxValues(maxValues);

        select.addOptions(
            options.map(opt => ({
                label: opt.label,
                value: opt.value,
                description: opt.description,
                emoji: opt.emoji
            }))
        );

        return select;
    }

    createButton(
        customId: string,
        label: string,
        style: 'PRIMARY' | 'SECONDARY' | 'SUCCESS' | 'DANGER'
    ): any {
        const styleMap = {
            'PRIMARY': ButtonStyle.Primary,
            'SECONDARY': ButtonStyle.Secondary,
            'SUCCESS': ButtonStyle.Success,
            'DANGER': ButtonStyle.Danger
        };

        return new ButtonBuilder()
            .setCustomId(customId)
            .setLabel(label)
            .setStyle(styleMap[style]);
    }

    getContent(message: any): string {
        return message.content;
    }

    getAttachments(message: any): any[] {
        return Array.from(message.attachments.values());
    }

    getAuthorId(message: any): string {
        // Works for both Message and Interaction
        return message.author?.id || message.user?.id;
    }

    getComponentValue(interaction: any): any {
        if (interaction.isStringSelectMenu()) {
            return interaction.values[0]; // For single select, return first value
        }
        return interaction.customId; // For buttons, maybe return customId
    }
}
