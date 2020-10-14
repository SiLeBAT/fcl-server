import { ContainerModule, interfaces } from 'inversify';
import {
    NRLRepository,
    StateRepository,
    InstituteRepository,
    UserRepository,
    TokenRepository,
    ValidationErrorRepository,
    FileRepository
} from '../../../app/ports';
import { APPLICATION_TYPES } from '../../../app/application.types';
import { getMockNRLRepository } from './nrl.repository';
import { getMockStateRepository } from './state.repository';
import { getMockInstituteRepository } from './institute.repository';
import { getMockTokenRepository } from './token.repository';
import { getMockValidationErrorRepository } from './validation-error.repository';
import { getMockFileRepository } from './file.repository';
import { getMockUserRepository } from './user.repository';
import { getMockSearchAliasRepository } from './search-alias.repository';
import { getMockCatalogRepository } from './catalog.repository';

export const mockPersistenceContainerModule = new ContainerModule(
    (bind: interfaces.Bind, unbind: interfaces.Unbind) => {
        bind<NRLRepository>(APPLICATION_TYPES.NRLRepository).toConstantValue(
            getMockNRLRepository()
        );

        bind<StateRepository>(
            APPLICATION_TYPES.StateRepository
        ).toConstantValue(getMockStateRepository());

        bind<InstituteRepository>(
            APPLICATION_TYPES.InstituteRepository
        ).toConstantValue(getMockInstituteRepository());

        bind<UserRepository>(APPLICATION_TYPES.UserRepository).toConstantValue(
            getMockUserRepository()
        );

        bind<TokenRepository>(
            APPLICATION_TYPES.TokenRepository
        ).toConstantValue(getMockTokenRepository());

        bind<ValidationErrorRepository>(
            APPLICATION_TYPES.ValidationErrorRepository
        ).toConstantValue(getMockValidationErrorRepository());

        bind<FileRepository>(APPLICATION_TYPES.FileRepository).toConstantValue(
            getMockFileRepository()
        );
        bind(APPLICATION_TYPES.SearchAliasRepository).toConstantValue(
            getMockSearchAliasRepository()
        );
        bind(APPLICATION_TYPES.CatalogRepository).toConstantValue(
            getMockCatalogRepository()
        );
    }
);
