import { ContainerModule, interfaces } from 'inversify';
import {
    ConfigurationService,
    ApplicationConfiguration
} from './core/model/configuration.model';
import { DefaultConfigurationService } from './core/application/configuration.service';
import { NotificationService } from './core/model/notification.model';
import { DefaultNotificationService } from './core/application/notification.service';
import {
    ExcelUnmarshalService,
    JSONMarshalService
} from './sampleManagement/model/excel.model';
import { DefaultExcelUnmarshalService } from './sampleManagement/application/excel-unmarshal.service';
import { UserService } from './authentication/model/user.model';
import { DefaultUserService } from './authentication/application/user.service';
import { InstituteService } from './authentication/model/institute.model';
import { DefaultInstituteService } from './authentication/application/institute.service';
import { DefaultJSONMarshalService } from './sampleManagement/application/json-marshal.service';
import { TokenService } from './authentication/model/token.model';
import { DefaultTokenService } from './authentication/application/token.service';
import { SampleService } from './sampleManagement/model/sample.model';
import { DefaultSampleService } from './sampleManagement/application/sample.service';
import { CatalogService } from './sampleManagement/model/catalog.model';
import { DefaultCatalogService } from './sampleManagement/application/catalog.service';
import {
    NRLSelectorProvider,
    AVVFormatProvider,
    ValidationErrorProvider,
    FormValidatorService
} from './sampleManagement/model/validation.model';
import { DefaultNRLSelectorProvider } from './sampleManagement/application/nrl-selector-provider.service';
import { DefaultAVVFormatProvider } from './sampleManagement/application/avv-format-provider.service';
import { DefaultValidationErrorProvider } from './sampleManagement/application/validation-error-provider.service';
import { RegistrationService } from './authentication/model/registration.model';
import { DefaultRegistrationService } from './authentication/application/registration.service';
import {
    PasswordService,
    LoginService
} from './authentication/model/login.model';
import { DefaultPasswordService } from './authentication/application/password.service';
import { DefaultLoginService } from './authentication/application/login.service';
import { FormAutoCorrectionService } from './sampleManagement/model/autocorrection.model';
import { DefaultFormAutoCorrectionService } from './sampleManagement/application/form-auto-correction.service';
import { DefaultFormValidatorService } from './sampleManagement/application/form-validation.service';
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

            bind<ExcelUnmarshalService>(
                APPLICATION_TYPES.ExcelUnmarshalService
            ).to(DefaultExcelUnmarshalService);
            bind<UserService>(APPLICATION_TYPES.UserService).to(
                DefaultUserService
            );

            bind<InstituteService>(APPLICATION_TYPES.InstituteService).to(
                DefaultInstituteService
            );

            bind<JSONMarshalService>(APPLICATION_TYPES.JSONMarshalService).to(
                DefaultJSONMarshalService
            );
            bind<TokenService>(APPLICATION_TYPES.TokenService).to(
                DefaultTokenService
            );
            bind<SampleService>(APPLICATION_TYPES.SampleService).to(
                DefaultSampleService
            );

            bind<CatalogService>(APPLICATION_TYPES.CatalogService).to(
                DefaultCatalogService
            );

            bind<NRLSelectorProvider>(APPLICATION_TYPES.NRLSelectorProvider).to(
                DefaultNRLSelectorProvider
            );

            bind<AVVFormatProvider>(APPLICATION_TYPES.AVVFormatProvider).to(
                DefaultAVVFormatProvider
            );

            bind<ValidationErrorProvider>(
                APPLICATION_TYPES.ValidationErrorProvider
            ).to(DefaultValidationErrorProvider);

            bind<RegistrationService>(APPLICATION_TYPES.RegistrationService).to(
                DefaultRegistrationService
            );

            bind<PasswordService>(APPLICATION_TYPES.PasswordService).to(
                DefaultPasswordService
            );
            bind<LoginService>(APPLICATION_TYPES.LoginService).to(
                DefaultLoginService
            );

            bind<FormAutoCorrectionService>(
                APPLICATION_TYPES.FormAutoCorrectionService
            ).to(DefaultFormAutoCorrectionService);

            bind<FormValidatorService>(
                APPLICATION_TYPES.FormValidatorService
            ).to(DefaultFormValidatorService);
        }
    );
}
