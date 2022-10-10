import {
    PasswordService,
    RecoveryData,
    ResetSuccessNotificationPayload,
    ResetRequestNotificationPayload,
} from '../model/login.model';
import { TokenType, UserValidationErrorCode } from './../domain/enums';
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
import { ValidationError, InvalidInputDataError } from '../../ports';

@injectable()
export class DefaultPasswordService implements PasswordService {
    private static readonly MINIMUM_PASSWORD_LENGTH = 10;
    private static readonly CONTAINS_UCASE_UNICODE_LETTERS_REGEXP =
        /^.*\p{Lu}+.*$/u;
    private static readonly CONTAINS_LCASE_UNICODE_LETTERS_REGEXP =
        /^.*\p{Ll}+.*$/u;
    private static readonly CONTAINS_DIGIT_REGEXP = /^.*\d+.*$/;
    private static readonly CONTAINS_SPECIAL_CHAR_REGEXP = /^.*[^\d\p{L}]+.*$/u;

    private appName: string;
    private clientUrl: string;
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
        this.appName =
            this.configurationService.getApplicationConfiguration().appName;
        this.clientUrl =
            this.configurationService.getApplicationConfiguration().clientUrl;
        this.supportContact =
            this.configurationService.getApplicationConfiguration().supportContact;
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

    validatePassword(password: string): ValidationError[] {
        const errors: ValidationError[] = [];
        if ((password || '') === '') {
            errors.push({
                code: UserValidationErrorCode.MISSING_PWD,
                message: 'Required field',
            });
        } else if (
            String(password).length <
                DefaultPasswordService.MINIMUM_PASSWORD_LENGTH ||
            !DefaultPasswordService.CONTAINS_UCASE_UNICODE_LETTERS_REGEXP.test(
                password
            ) ||
            !DefaultPasswordService.CONTAINS_LCASE_UNICODE_LETTERS_REGEXP.test(
                password
            ) ||
            !DefaultPasswordService.CONTAINS_DIGIT_REGEXP.test(password) ||
            !DefaultPasswordService.CONTAINS_SPECIAL_CHAR_REGEXP.test(password)
        ) {
            errors.push({
                code: UserValidationErrorCode.INVALID_PWD,
                message:
                    `Your password must be at least ${DefaultPasswordService.MINIMUM_PASSWORD_LENGTH} ` +
                    `characters long, contain at least one number and one special character and have a mixture of ` +
                    `uppercase and lowercase letters.`,
            });
        }

        return errors;
    }

    async resetPassword(token: string, password: string): Promise<void> {
        const userToken = await this.tokenService.getUserTokenByJWT(token);
        const userId = userToken.userId;
        this.tokenService.verifyTokenWithUser(token, String(userId));
        const user = await this.userService.getUserById(userId);
        const validationErrors = this.validatePassword(password);
        if (validationErrors.length > 0) {
            throw new InvalidInputDataError(
                validationErrors,
                'The password reset failed. The password is not valid.'
            );
        }
        await user.updatePassword(password);
        await this.userService.updateUser(user);
        await this.tokenService.deleteTokenForUser(user, TokenType.RESET);
        const resetSuccessNotification =
            this.createResetSuccessNotification(user);
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
                action_url: this.clientUrl + '/users/reset/' + resetToken.token,
                client_url: this.clientUrl,
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
                client_url: this.clientUrl,
                email: user.email,
                action_url: this.clientUrl + '/users/login',
                appName: this.appName,
            },
            meta: this.notificationService.createEmailNotificationMetaData(
                user.email,
                `Passwort für ${this.appName}-Konto erfolgreich zurückgesetzt.`
            ),
        };
    }
}
