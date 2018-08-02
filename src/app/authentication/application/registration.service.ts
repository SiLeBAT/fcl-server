import * as config from 'config';
import { IUserRepository, ITokenRepository } from '../../ports';
import { logger } from '../../../aspects';
import { IUser, createUser, TokenType, generateToken, generateAdminToken, verifyToken, IUserToken } from './../domain';
import { IRecoveryData, INotificationService, NotificationType } from '../../sharedKernel/';
import { ApplicationDomainError } from '../../sharedKernel/errors';

// TODO: Should these be here?  Should they not be added later?
const APP_NAME = config.get('appName');
const API_URL = config.get('server.apiUrl');
const SUPPORT_CONTACT = config.get('supportContact');
const JOB_RECIPIENT = config.get('jobRecipient');

export interface IRegistrationPort {
    activateUser(token: string): Promise<void>;
    adminActivateUser(token: string): Promise<string>;
    registerUser(credentials: IUserRegistration): Promise<void>;
}

export interface IRegistrationService extends IRegistrationPort {
    prepareUserForActivation(user: IUser, recoveryData: IRecoveryData): Promise<void>;
    prepareUserForAdminActivation(user: IUser): Promise<void>;
    handleUserIfNotAdminActivated(user: IUser): Promise<void>;
}

// TODO: Fix or remove this interface
export interface IUserRegistration {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    institution: string;
    userAgent: string;
    host: string;
}

class RegistrationService implements IRegistrationService {

    constructor(
        private userRepository: IUserRepository,
        private tokenRepository: ITokenRepository,
        private notificationService: INotificationService) { }

    async activateUser(token: string): Promise<void> {
        const userToken = await this.tokenRepository.getUserTokenByJWT(token);
        if (!userToken) throw new ApplicationDomainError(`No UserToken for JWT Token. token=${token}`);
        const userId = userToken.userId;
        verifyToken(token, String(userId));
        const user = await this.userRepository.findById(userId);
        if (!user) throw new ApplicationDomainError(`Unknown user. id=${userId}`);
        user.isActivated(true);
        await this.userRepository.updateUser(user);
        await this.tokenRepository.deleteTokenForUser(user);
        logger.verbose('RegistrationService.activateUser, User activation successful');
        return;
    }

    async adminActivateUser(adminToken: string): Promise<string> {
        const userAdminToken = await this.tokenRepository.getUserTokenByJWT(adminToken);
        if (!userAdminToken) throw new ApplicationDomainError(`No UserAdminToken for JWT Token. token=${adminToken}`);
        const userId = userAdminToken.userId;
        verifyToken(adminToken, String(userId));
        const user = await this.userRepository.findById(userId);
        if (!user) throw new ApplicationDomainError(`Unknown user. id=${userId}`);
        user.isAdminActivated(true);
        await this.userRepository.updateUser(user);
        await this.tokenRepository.deleteAdminTokenForUser(user);
        logger.verbose('RegistrationService.adminActivateUser, User admin activation successful');

        const adminActivationNotification = this.createAdminActivationNotification(user);
        this.notificationService.sendNotification(adminActivationNotification);

        const userName = user.firstName + ' ' + user.lastName;
        return userName;
    }

    async registerUser(credentials: IUserRegistration): Promise<void> {
        const result = await this.userRepository.hasUser(credentials.email);
        if (result) {
            await this.handleAlreadyRegisteredUser(credentials);
            throw new ApplicationDomainError('Registration failed. User already exists');
        }

        const newUser = createUser('0000', credentials.email, credentials.firstName,
            credentials.lastName, '');

        await newUser.updatePassword(credentials.password);
        const user = await this.userRepository.createUser(newUser);
        const recoveryData: IRecoveryData = {
            userAgent: credentials.userAgent,
            email: user.email,
            host: credentials.host
        };

        await this.prepareUserForActivation(user, recoveryData);
        const adminActivationResult = await this.prepareUserForAdminActivation(user);

        return adminActivationResult;
    }

    async prepareUserForActivation(user: IUser, recoveryData: IRecoveryData): Promise<void> {
        const hasOldToken = await this.tokenRepository.hasTokenForUser(user);
        if (hasOldToken) {
            await this.tokenRepository.deleteTokenForUser(user);
        }

        const token = generateToken(user.uniqueId);

        const activationToken = await this.tokenRepository.saveToken({
            token: token,
            type: TokenType.ACTIVATE,
            userId: user.uniqueId
        });

        const requestActivationNotification = this.createRequestActivationNotification(user, recoveryData, activationToken);

        return this.notificationService.sendNotification(requestActivationNotification);
    }

    async prepareUserForAdminActivation(user: IUser): Promise<void> {
        const hasOldAdminToken = await this.tokenRepository.hasAdminTokenForUser(user);
        if (hasOldAdminToken) {
            await this.tokenRepository.deleteAdminTokenForUser(user);
        }

        const adminToken = generateAdminToken(user.uniqueId);

        const adminActivationToken = await this.tokenRepository.saveToken({
            token: adminToken,
            type: TokenType.ADMIN,
            userId: user.uniqueId
        });

        let requestAdminActivationNotification = this.createRequestAdminActivationNotification(user, adminActivationToken);

        return this.notificationService.sendNotification(requestAdminActivationNotification);
    }

    async handleUserIfNotAdminActivated(user: IUser): Promise<void> {
        const requestNotAdminActivatedNotification = this.createNotAdminActivatedNotification(user);
        this.notificationService.sendNotification(requestNotAdminActivatedNotification);

        const requestAdminActivationReminder = this.createAdminActivationReminder(user);

        return this.notificationService.sendNotification(requestAdminActivationReminder);
    }

    async handleAlreadyRegisteredUser(credentials: IUserRegistration): Promise<void> {
        const userAlreadyRegisteredNotification = this.createAlreadyRegisteredUserNotification(credentials);
        return this.notificationService.sendNotification(userAlreadyRegisteredNotification);
    }

    private createRequestActivationNotification(user: IUser, recoveryData: IRecoveryData, activationToken: IUserToken) {
    	return {
      		type: NotificationType.REQUEST_ACTIVATION,
	        title: `Aktivieren Sie Ihr Konto für ${APP_NAME} `,// `Activate your account for ${APP_NAME}`;
	        payload: {
	            'name': user.firstName + ' ' + user.lastName,
	            'action_url': API_URL + '/users/activate/' + activationToken.token,
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

    private createRequestAdminActivationNotification(user: IUser, adminActivationToken: IUserToken) {
        const fullName = user.firstName + ' ' + user.lastName;

        return {
            type: NotificationType.REQUEST_ADMIN_ACTIVATION,
            title: `Aktivieren Sie das ${APP_NAME} Konto für ${fullName}`,// `Activate your account for ${APP_NAME}`;
            payload: {
                'name': fullName,
                'action_url': API_URL + '/users/adminactivate/' + adminActivationToken.token,
                'api_url': API_URL,
                'email': user.email,
                'appName': APP_NAME
            },
            meta: {
                email: JOB_RECIPIENT
            }
        };
    }

    private createAdminActivationNotification(user: IUser) {
	    const fullName = user.firstName + ' ' + user.lastName;

	    return {
	        type: NotificationType.NOTIFICATION_ADMIN_ACTIVATION,
	        title: `Admin Aktivierung Ihres ${APP_NAME} Kontos`,
	        payload: {
	            'name': fullName,
	            'appName': APP_NAME
	        },
	        meta: {
	            email: user.email
	        }
	    };
    }

    private createNotAdminActivatedNotification(user: IUser) {
	    const fullName = user.firstName + ' ' + user.lastName;

	    return {
	        type: NotificationType.NOTIFICATION_NOT_ADMIN_ACTIVATED,
	        title: `Noch keine Admin Aktivierung Ihres ${APP_NAME} Kontos`,
	        payload: {
	            'name': fullName,
	            'appName': APP_NAME
	        },
	        meta: {
	            email: user.email
	        }
	    };
    }

    private createAdminActivationReminder(user: IUser) {
	    const fullName = user.firstName + ' ' + user.lastName;

	    return {
	        type: NotificationType.REMINDER_ADMIN_ACTIVATION,
	        title: `Erinnerung: Bitte aktivieren Sie das ${APP_NAME} Konto für ${fullName}`,
	        payload: {
	            'name': fullName,
	            'email': user.email,
	            'appName': APP_NAME
	        },
	        meta: {
	            email: JOB_RECIPIENT
	        }
	    };
    }

    private createAlreadyRegisteredUserNotification(credentials: IUserRegistration) {
        const fullName = credentials.firstName + ' ' + credentials.lastName;

	    return {
	        type: NotificationType.NOTIFICATION_ALREADY_REGISTERED,
	        title: `Ihre Registrierung für ein ${APP_NAME} Konto`,
	        payload: {
            'name': fullName,
            'action_url': API_URL + '/users/recovery',
	        'appName': APP_NAME
	        },
	        meta: {
	            email: credentials.email
	        }
	    };
    }
}

export function createService(userRepository: IUserRepository, tokenRepository: ITokenRepository, notificationService: INotificationService): IRegistrationService {
    return new RegistrationService(userRepository, tokenRepository, notificationService);
}
