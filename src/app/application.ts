import { Container } from 'inversify';
import { NotificationService } from './core/model/notification.model';
import { APPLICATION_TYPES } from './application.types';

export interface FclApplication {
    addNotificationHandler(handler: Function): void;
}

export function createApplication(container: Container) {
    const notificationService: NotificationService = container.get<
        NotificationService
    >(APPLICATION_TYPES.NotificationService);
    return {
        addNotificationHandler: (handler: Function) => {
            notificationService.addHandler(handler);
        }
    };
}
