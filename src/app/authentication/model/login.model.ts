import { UserCredentials, User } from './user.model';
import { GDPRConfirmationRequestDTO } from '../../../ui/server/model/request.model';

export interface UserLoginInformation extends UserCredentials {
    userAgent: string | string[] | undefined;
    host: string | undefined;
    gdprDate: string;
}

export interface LoginResponse {
    user: User;
    token: string;
    gdprAgreementRequested: boolean;
}

export interface LoginPort {
    loginUser(credentials: UserLoginInformation): Promise<LoginResponse>;
    confirmGDPR(
        confirmationRequest: GDPRConfirmationRequestDTO
    ): Promise<LoginResponse>;
}

export interface LoginService extends LoginPort {}

export interface RecoveryData {
    email: string;
    host: string;
    userAgent: string;
}
export interface PasswordPort {
    requestPasswordReset(recoveryData: RecoveryData): Promise<void>;
    resetPassword(token: string, password: string): Promise<void>;
}

export interface PasswordService extends PasswordPort {}

interface BaseResetNotificationPayload {
    name: string;
    api_url: string;
    action_url: string;
    appName: string;
}
export interface ResetSuccessNotificationPayload
    extends BaseResetNotificationPayload {
    email: string;
}

export interface ResetRequestNotificationPayload
    extends BaseResetNotificationPayload {
    operating_system: string;
    user_agent: string;
    support_contact: string;
}
