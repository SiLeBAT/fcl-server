import {
    PasswordService,
    RecoveryData,
    ResetSuccessNotificationPayload,
    ResetRequestNotificationPayload,
} from '../model/login.model';
import { TokenType } from './../domain/enums';
import { User, UserToken, UserService } from './../model/user.model';
import { NotificationType } from '../../core/domain/enums';
import {
    NotificationService,
    EmailNotificationMeta,
    Notification,
} from '../../core/model/notification.model';
import { TokenService } from '../model/token.model';
import { ConfigurationService } from '../../core/model/configuration.model';
import { injectable, inject } from 'inversify';
import { APPLICATION_TYPES } from './../../application.types';
@injectable()
export class DefaultPasswordService implements PasswordService {
    private appName: string;
    private apiUrl: string;
    private supportContact: string;

    constructor(
        @inject(APPLICATION_TYPES.NotificationService)
        private notificationService: NotificationService,
        @inject(APPLICATION_TYPES.TokenService)
        private tokenService: TokenService,
        @inject(APPLICATION_TYPES.ConfigurationService)
        private configurationService: ConfigurationService,
        @inject(APPLICATION_TYPES.UserService) private userService: UserService
    ) {
        this.appName = this.configurationService.getApplicationConfiguration().appName;
        this.apiUrl = this.configurationService.getApplicationConfiguration().apiUrl;
        this.supportContact = this.configurationService.getApplicationConfiguration().supportContact;
    }
    async requestPasswordReset(recoveryData: RecoveryData): Promise<void> {
        const user = await this.userService.getUserByEmail(recoveryData.email);

        const hasOldToken = await this.tokenService.hasTokenForUser(
            user,
            TokenType.RESET
        );
        if (hasOldToken) {
            await this.tokenService.deleteTokenForUser(user, TokenType.RESET);
        }
        const token = this.tokenService.generateToken(user.uniqueId);
        const resetToken = await this.tokenService.saveToken(
            token,
            TokenType.RESET,
            user.uniqueId
        );

        const requestResetNotification = this.createResetRequestNotification(
            user,
            recoveryData,
            resetToken
        );
        return this.notificationService.sendNotification(
            requestResetNotification
        );
    }

    async resetPassword(token: string, password: string): Promise<void> {
        const userToken = await this.tokenService.getUserTokenByJWT(token);
        const userId = userToken.userId;
        this.tokenService.verifyTokenWithUser(token, String(userId));
        const user = await this.userService.getUserById(userId);
        await user.updatePassword(password);
        await this.userService.updateUser(user);
        await this.tokenService.deleteTokenForUser(user, TokenType.RESET);
        const resetSuccessNotification = this.createResetSuccessNotification(
            user
        );
        return this.notificationService.sendNotification(
            resetSuccessNotification
        );
    }

    private createResetRequestNotification(
        user: User,
        recoveryData: RecoveryData,
        resetToken: UserToken
    ): Notification<ResetRequestNotificationPayload, EmailNotificationMeta> {
        return {
            type: NotificationType.REQUEST_RESET,
            payload: {
                name: user.firstName + ' ' + user.lastName,
                action_url: this.apiUrl + '/users/reset/' + resetToken.token,
                api_url: this.apiUrl,
                operating_system: recoveryData.host,
                user_agent: recoveryData.userAgent,
                support_contact: this.supportContact,
                appName: this.appName,
            },
            meta: this.notificationService.createEmailNotificationMetaData(
                user.email,
                `Setzen Sie Ihr ${this.appName}-Konto Passwort zurück.`
            ),
        };
    }

    private createResetSuccessNotification(
        user: User
    ): Notification<ResetSuccessNotificationPayload, EmailNotificationMeta> {
        return {
            type: NotificationType.RESET_SUCCESS,
            payload: {
                name: user.firstName + ' ' + user.lastName,
                api_url: this.apiUrl,
                email: user.email,
                action_url: this.apiUrl + '/users/login',
                appName: this.appName,
            },
            meta: this.notificationService.createEmailNotificationMetaData(
                user.email,
                `Passwort für ${this.appName}-Konto erfolgreich zurückgesetzt.`
            ),
        };
    }
}
