import { ContainerModule, interfaces } from 'inversify';
import {
    InstituteRepository,
    UserRepository,
    TokenRepository
} from '../../../app/ports';
import { APPLICATION_TYPES } from '../../../app/application.types';
import { getMockInstituteRepository } from './institute.repository';
import { getMockTokenRepository } from './token.repository';
import { getMockUserRepository } from './user.repository';

export const mockPersistenceContainerModule = new ContainerModule(
    (bind: interfaces.Bind, unbind: interfaces.Unbind) => {
        bind<InstituteRepository>(
            APPLICATION_TYPES.InstituteRepository
        ).toConstantValue(getMockInstituteRepository());

        bind<UserRepository>(APPLICATION_TYPES.UserRepository).toConstantValue(
            getMockUserRepository()
        );

        bind<TokenRepository>(
            APPLICATION_TYPES.TokenRepository
        ).toConstantValue(getMockTokenRepository());
    }
);
