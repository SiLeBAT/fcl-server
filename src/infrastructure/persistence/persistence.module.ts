import { PERSISTENCE_TYPES } from './persistence.types';
import { ContainerModule, interfaces } from 'inversify';
import { Model } from 'mongoose';
import {
    MongooseUserModel,
    MongooseTokenModel,
    MongooseInstitutionModel
} from './data-store/mongoose/mongoose.model';
import { UserModel } from './data-store/mongoose/schemas/user.schema';
import { TokenModel } from './data-store/mongoose/schemas/resetToken.schema';
import { InstitutionModel } from './data-store/mongoose/schemas/institution.schema';
import {
    InstituteRepository,
    UserRepository,
    TokenRepository
} from '../../app/ports';
import { MongooseInstituteRepository } from './repositories/institute.repository';
import { DefaultUserRepository } from './repositories/user.repository';
import { DefaultTokenRepository } from './repositories/token.repository';
import { APPLICATION_TYPES } from './../../app/application.types';

export function getPersistenceContainerModule(): ContainerModule {
    return new ContainerModule(
        (bind: interfaces.Bind, unbind: interfaces.Unbind) => {
            bind<Model<UserModel>>(PERSISTENCE_TYPES.UserModel).toConstantValue(
                MongooseUserModel
            );

            bind<Model<TokenModel>>(
                PERSISTENCE_TYPES.TokenModel
            ).toConstantValue(MongooseTokenModel);

            bind<Model<InstitutionModel>>(
                PERSISTENCE_TYPES.InstitutionModel
            ).toConstantValue(MongooseInstitutionModel);

            bind<InstituteRepository>(APPLICATION_TYPES.InstituteRepository).to(
                MongooseInstituteRepository
            );

            bind<UserRepository>(APPLICATION_TYPES.UserRepository).to(
                DefaultUserRepository
            );

            bind<TokenRepository>(APPLICATION_TYPES.TokenRepository).to(
                DefaultTokenRepository
            );
        }
    );
}
