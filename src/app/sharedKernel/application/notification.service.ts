import { EventEmitter } from 'events';
import { NotificationType } from '..';

// TODO: move this interface elsewhere
export interface IRecoveryData {
    email: string;
    host: string;
    userAgent: string;
}

export interface INotificationPayload {
    // tslint:disable-next-line
    [key: string]: any;
}

export interface INotificationPort {
    addHandler(handler: Function): void;
}

export interface INotificationService extends INotificationPort {
    sendNotification(notification: INotification): void;
}

export interface INotification {
    type: NotificationType;
    title: string;
    payload?: INotificationPayload;
    // tslint:disable-next-line
    meta?: any;
}

class NotificationService implements INotificationService {

    private notificationName = 'mibi-notification';

    private sender: EventEmitter = new EventEmitter();

    sendNotification(notification: INotification): void {
        this.sender.emit(this.notificationName, notification);
    }

    addHandler(handler: (notification: INotification) => void): void {
        this.sender.on(this.notificationName, handler);
    }

}

export function createService(): INotificationService {
    return new NotificationService();
}
