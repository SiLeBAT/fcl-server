import * as config from 'config';
import * as moment from 'moment';
import { IUser, IUserCredentials, generateToken } from './../domain';
import { IUserRepository } from '../../ports';
import { logger } from './../../../aspects';
import { IRegistrationService } from '.';
import { ApplicationDomainError } from '../../sharedKernel/errors';
import { IRecoveryData } from '../../sharedKernel';

const THRESHOLD: number = config.has('login.threshold') ? config.get('login.threshold') : 5;
const SECONDS_DELAY: number = config.has('login.secondsDelay') ? config.get('login.secondsDelay') : 300;

export interface IUserLoginInformation extends IUserCredentials {
    userAgent: string | string[] | undefined;
    host: string | undefined;
}

export interface ILoginResponse {
    user: IUser;
    token: string;
    timeToWait?: string;
}

export interface ILoginPort {
    loginUser(credentials: IUserLoginInformation): Promise<ILoginResponse>;
}

export interface ILoginService extends ILoginPort { }

class LoginService implements ILoginService {

    constructor(private userRepository: IUserRepository, private activationService: IRegistrationService) { }

    async loginUser(credentials: IUserLoginInformation): Promise<ILoginResponse> {

        const user = await this.userRepository.findByUsername(credentials.email);

        if (!user) throw new ApplicationDomainError(`User not known. email=${credentials.email}`);

        if (!user.isActivated()) {
            return this.rejectInactiveUser(user, {
                userAgent: credentials.userAgent as string,
                email: user.email,
                host: credentials.host as string
            });
        }

        if (!user.isAdminActivated()) {
            return this.rejectAdminInactiveUser(user);
        }

        const diffToDelay = this.diffTimeSinceLastFailedLogin(user);
        if (this.hasToManyFailedAttempts(user) && diffToDelay >= 0) {
            return {
                user: user,
                token: '',
                timeToWait: this.timeToWait(diffToDelay)
            };
        }

        if (await user.isAuthorized(credentials)) {
            if (user.getNumberOfFailedAttempts() > 0) {
                user.updateNumberOfFailedAttempts(false);
                await this.userRepository.updateUser(user);
            }
            await this.userRepository.updateUser(user);

            return {
                user: user,
                token: generateToken(user.uniqueId)
            };
        }

        user.updateNumberOfFailedAttempts(true);
        user.updateLastLoginAttempt();
        await this.userRepository.updateUser(user);

        throw new ApplicationDomainError(`User not authorized. user=${user.email}`);
    }

    private async rejectInactiveUser(user: IUser, recoveryData: IRecoveryData): Promise<ILoginResponse> {
        logger.verbose('LoginService.rejectInactiveUser, Inactive account failed to log in.');
        return this.activationService.prepareUserForActivation(user, recoveryData).then(
            () => {
                throw new ApplicationDomainError(`User inactive. user=${user.email}`);
            }
        );
    }

    private async rejectAdminInactiveUser(user: IUser): Promise<ILoginResponse> {
        logger.verbose('LoginService.rejectAdminInactiveUser, Admin inactive account failed to log in.');
        return this.activationService.handleUserIfNotAdminActivated(user).then(
            () => {
                throw new ApplicationDomainError(`User admin inactive. user=${user.email}`);
            }
        );
    }

    private hasToManyFailedAttempts(user: IUser): boolean {
        return user.getNumberOfFailedAttempts() >= THRESHOLD ? true : false;
    }

    private diffTimeSinceLastFailedLogin(user: IUser): number {
        moment.locale('de');
        const currentMoment = moment();
        const lastMoment = moment(user.getLastLoginAttempt());
        const diffToLast = moment.duration(currentMoment.diff(lastMoment));
        const diffToDelay = Math.round(SECONDS_DELAY - diffToLast.asSeconds());

        return diffToDelay;
    }

    private timeToWait(diffToDelay: number): string {
        moment.locale('de');

        const diffDuration = moment.duration(diffToDelay, 'seconds');
        const minutes = ('0' + diffDuration.minutes()).slice(-2);
        const seconds = ('0' + diffDuration.seconds()).slice(-2);

        return `${minutes}:${seconds} Min`;
    }

}

export function createService(userRepository: IUserRepository, activationService: IRegistrationService): ILoginService {
    return new LoginService(userRepository, activationService);
}
