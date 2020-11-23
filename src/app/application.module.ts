import { ContainerModule, interfaces } from 'inversify';
import {
    ConfigurationService,
    ApplicationConfiguration,
} from './core/model/configuration.model';
import { DefaultConfigurationService } from './core/application/configuration.service';
import { NotificationService } from './core/model/notification.model';
import { DefaultNotificationService } from './core/application/notification.service';
import { UserService } from './authentication/model/user.model';
import { DefaultUserService } from './authentication/application/user.service';
import { InstituteService } from './authentication/model/institute.model';
import { DefaultInstituteService } from './authentication/application/institute.service';
import { TokenService } from './authentication/model/token.model';
import { DefaultTokenService } from './authentication/application/token.service';
import { RegistrationService } from './authentication/model/registration.model';
import { DefaultRegistrationService } from './authentication/application/registration.service';
import {
    PasswordService,
    LoginService,
} from './authentication/model/login.model';
import { DefaultPasswordService } from './authentication/application/password.service';
import { DefaultLoginService } from './authentication/application/login.service';
import { APPLICATION_TYPES } from './application.types';

export function getApplicationContainerModule(
    appConfiguration: ApplicationConfiguration
): ContainerModule {
    return new ContainerModule(
        (bind: interfaces.Bind, unbind: interfaces.Unbind) => {
            bind(APPLICATION_TYPES.ApplicationConfiguration).toConstantValue(
                appConfiguration
            );

            bind<ConfigurationService>(
                APPLICATION_TYPES.ConfigurationService
            ).to(DefaultConfigurationService);

            bind<NotificationService>(APPLICATION_TYPES.NotificationService).to(
                DefaultNotificationService
            );

            bind<UserService>(APPLICATION_TYPES.UserService).to(
                DefaultUserService
            );

            bind<InstituteService>(APPLICATION_TYPES.InstituteService).to(
                DefaultInstituteService
            );

            bind<TokenService>(APPLICATION_TYPES.TokenService).to(
                DefaultTokenService
            );

            bind<RegistrationService>(APPLICATION_TYPES.RegistrationService).to(
                DefaultRegistrationService
            );

            bind<PasswordService>(APPLICATION_TYPES.PasswordService).to(
                DefaultPasswordService
            );
            bind<LoginService>(APPLICATION_TYPES.LoginService).to(
                DefaultLoginService
            );
        }
    );
}
