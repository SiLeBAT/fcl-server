import * as config from 'config';
import { IUserRepository, ITokenRepository } from '../../ports';
import { IUser, TokenType, generateToken, verifyToken, IUserToken } from './../domain';
import { IRecoveryData, INotificationService, NotificationType } from './../../sharedKernel';
import { ApplicationDomainError } from '../../sharedKernel/errors';
import { logger } from '../../../aspects';

// TODO: Should these be here?  Should they not be added later?
const APP_NAME = config.get('appName');
const API_URL = config.get('server.apiUrl');
const SUPPORT_CONTACT = config.get('supportContact');

export interface IPasswordPort {
    recoverPassword(recoveryData: IRecoveryData): Promise<void>;
    resetPassword(token: string, password: string): Promise<void>;
}

export interface IPasswordService extends IPasswordPort {
}

class PasswordService implements IPasswordService {

    constructor(
        private userRepository: IUserRepository,
        private tokenRepository: ITokenRepository,
        private notificationService: INotificationService) { }

    async recoverPassword(recoveryData: IRecoveryData): Promise<void> {
        let user;
        try {
            user = await this.userRepository.findByUsername(recoveryData.email);
        } catch (err) {
            logger.error('recoverPassword: no user for provided email found, error=', err);
        }

        if (!user) {
            return;
        }

        const hasOldToken = await this.tokenRepository.hasResetTokenForUser(user);
        if (hasOldToken) {
            await this.tokenRepository.deleteResetTokenForUser(user);
        }
        const token = generateToken(user.uniqueId);
        const resetToken = await this.tokenRepository.saveToken({
            token: token,
            type: TokenType.RESET,
            userId: user.uniqueId
        });

        const requestResetNotification = this.createResetRequestNotification(user, recoveryData, resetToken);
        return this.notificationService.sendNotification(requestResetNotification);
    }

    async resetPassword(token: string, password: string): Promise<void> {

        const userToken = await this.tokenRepository.getUserTokenByJWT(token);
        if (!userToken) throw new ApplicationDomainError('No UserToken for JWT Token.');
        const userId = userToken.userId;
        verifyToken(token, String(userId));
        const user = await this.userRepository.findById(userId);
        if (!user) throw new ApplicationDomainError(`Unknown user. id=${userId}`);
        await user.updatePassword(password);
        await this.userRepository.updateUser(user);
        await this.tokenRepository.deleteResetTokenForUser(user);
        const resetSuccessNotification = this.createResetSuccessNotification(user);
        return this.notificationService.sendNotification(resetSuccessNotification);
    }

    private createResetRequestNotification(user: IUser, recoveryData: IRecoveryData, resetToken: IUserToken) {
        return {
            type: NotificationType.REQUEST_RESET,
            title: `Reset password for your ${APP_NAME} account.`,
            payload: {
                'name': user.firstName + ' ' + user.lastName,
                'action_url': API_URL + '/users/reset/' + resetToken.token,
                'api_url': API_URL,
                'operating_system': recoveryData.host,
                'user_agent': recoveryData.userAgent,
                'support_contact': SUPPORT_CONTACT,
                'appName': APP_NAME
            },
            meta: {
                email: user.email
            }
        };
    }

    private createResetSuccessNotification(user: IUser) {
        return {
            type: NotificationType.RESET_SUCCESS,
            title: `Reset password successful for your ${APP_NAME} account.`,
            payload: {
                'name': user.firstName + ' ' + user.lastName,
                'api_url': API_URL,
                'email': user.email,
                'action_url': API_URL + '/users/login',
                'appName': APP_NAME
            },
            meta: {
                email: user.email
            }
        };
    }
}

export function createService(userRepository: IUserRepository, tokenRepository: ITokenRepository, notifcationService: INotificationService): IPasswordService {
    return new PasswordService(userRepository, tokenRepository, notifcationService);
}
