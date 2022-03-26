import { User } from './user.model';
import { RecoveryData } from './login.model';

export interface RegistrationPort {
    verifyUser(token: string): Promise<string>;
    activateUser(token: string): Promise<string>;
    registerUser(credentials: UserRegistration): Promise<void>;
    confirmNewsletterSubscription(token: string): Promise<string>;
}

export interface RegistrationService extends RegistrationPort {
    prepareUserForVerification(
        user: User,
        recoveryData: RecoveryData
    ): Promise<void>;
    handleNotActivatedUser(user: User): void;
}

export interface UserRegistration {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    dataProtectionAgreed: boolean;
    newsRegAgreed: boolean;
    newsMailAgreed: boolean;
    institution: string;
    userAgent: string;
    host: string;
}

interface BaseNotificationPayload {
    name: string;
    appName: string;
}
export interface RequestActivationNotificationPayload
    extends BaseNotificationPayload {
    action_url: string;
    client_url: string;
    operating_system: string;
    user_agent: string;
    support_contact: string;
}

export interface RequestAdminActivationNotificationPayload
    extends BaseNotificationPayload {
    action_url: string;
    client_url: string;
    email: string;
    institution: string;
    location: string;
}

export interface RequestNewsletterAgreementNotificationPayload
    extends BaseNotificationPayload {
    action_url: string;
    client_url: string;
    operating_system: string;
    user_agent: string;
    support_contact: string;
}

export interface RequestForUnknownInstituteNotificationPayload
    extends BaseNotificationPayload {
    client_url: string;
    email: string;
    institution: string;
}

export interface AdminActivationNotificationPayload
    extends BaseNotificationPayload {}

export interface AdminActivationReminderPayload
    extends BaseNotificationPayload {
    location: string;
    email: string;
    institution: string;
}

export interface AlreadyRegisteredUserNotificationPayload
    extends BaseNotificationPayload {
    action_url: string;
}
