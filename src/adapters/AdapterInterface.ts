import { StepOption } from '../types';

export interface MessageOptions {
    content?: string;
    components?: any[]; // Library specific component structure, adapter handles conversion if needed
    files?: any[];
}

export interface AwaitMessageOptions {
    filter: (msg: any) => boolean;
    max: number;
    time: number;
    errors?: string[];
}

export interface AwaitComponentOptions {
    filter: (interaction: any) => boolean;
    max: number;
    time: number;
    componentType?: number;
}

export interface AdapterInterface {
    sendMessage(channelId: string, content: string | MessageOptions): Promise<any>;

    awaitMessages(
        channelId: string,
        options: AwaitMessageOptions
    ): Promise<any[]>;

    awaitComponent(
        channelId: string,
        options: AwaitComponentOptions
    ): Promise<any>;

    createSelectMenu(
        customId: string,
        options: StepOption[],
        placeholder?: string,
        minValues?: number,
        maxValues?: number
    ): any;

    createButton(
        customId: string,
        label: string,
        style: 'PRIMARY' | 'SECONDARY' | 'SUCCESS' | 'DANGER'
    ): any;

    // Helper to extract content/attachments from a message object in a library-agnostic way
    getContent(message: any): string;
    getAttachments(message: any): any[];
    getAuthorId(message: any): string;
    getComponentValue(interaction: any): any;
}
