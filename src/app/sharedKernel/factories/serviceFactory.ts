import { ILoginService, createService as createLoginService } from './../../../app/authentication/application/login.service';
import { RepositoryType, IRepositoryFactory } from './repositoryFactory';
import { IRegistrationService, IPasswordService, createRegistrationService, createPasswordService } from '../../authentication/application';
import { ApplicationSystemError } from '../errors';
import { INotificationService, createNotificationService } from '../application';

export interface IServiceFactory {
    // tslint:disable-next-line
    getService(serviceName: string): any;
}

export class ServiceFactory implements IServiceFactory {
    private loginService: ILoginService;
    private registrationService: IRegistrationService;
    private passwordService: IPasswordService;
    private notificationService: INotificationService;

    constructor(private repositoryFactory: IRepositoryFactory) {
        const userRepository = this.repositoryFactory.getRepository(RepositoryType.USER);
        const tokenRepository = this.repositoryFactory.getRepository(RepositoryType.TOKEN);

        this.notificationService = createNotificationService();
        this.registrationService = createRegistrationService(userRepository, tokenRepository, this.notificationService);
        this.passwordService = createPasswordService(userRepository, tokenRepository, this.notificationService);
        this.loginService = createLoginService(userRepository, this.registrationService);

    }

    getService(serviceName: string) {
        switch (serviceName) {
            case 'LOGIN':
                return this.loginService;
            case 'REGISTRATION':
                return this.registrationService;
            case 'PASSWORD':
                return this.passwordService;
            case 'NOTIFICATION':
                return this.notificationService;
            default:
                throw new ApplicationSystemError(`Unknown serviceName, serviceName=${serviceName}`);
        }
    }
}
