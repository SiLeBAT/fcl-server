import { NotificationType } from '../domain/enums';

export interface NotificationMeta {}
export interface Notification<T, V extends NotificationMeta> {
    type: NotificationType;
    payload?: T;
    meta?: V;
}

export interface NotificationPort {
    addHandler(handler: Function): void;
}

export interface NotificationService extends NotificationPort {
    sendNotification<T, V>(notification: Notification<T, V>): void;
    createEmailNotificationMetaData(
        to: string,
        subject: string,
        cc?: string[],
        attachments?: Attachment[]
    ): EmailNotificationMeta;
}

export interface Attachment {
    filename: string;
    content: Buffer;
    contentType: string;
}

export interface EmailNotificationMeta extends NotificationMeta {
    to: string;
    cc: string[];
    subject: string;
    attachments: Attachment[];
}
export interface EmailNotification<T, V extends EmailNotificationMeta>
    extends Notification<T, V> {
    meta: V;
}
