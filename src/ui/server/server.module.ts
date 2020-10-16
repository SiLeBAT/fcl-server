import { ContainerModule, interfaces } from 'inversify';
import {
    SystemInfoController,
    InstitutesController,
    UsersController,
    VersionRootController,
    TokensController
} from './model/controller.model';
import SERVER_TYPES from './server.types';
import { DefaultSystemInfoController } from './controllers/info.controller';
import { DefaultInstituteController } from './controllers/institutes.controller';
import { DefaultUsersController } from './controllers/users.controller';
import { DefaultVersionRootController } from './controllers/versionRoot.controller';
import { AppServerConfiguration } from './model/server.model';
import { DefaultTokensController } from './controllers/tokens.controller';

export function getServerContainerModule(
    serverCongfiguration: AppServerConfiguration
): ContainerModule {
    return new ContainerModule(
        (bind: interfaces.Bind, unbind: interfaces.Unbind) => {
            bind(SERVER_TYPES.AppServerConfiguration).toConstantValue(
                serverCongfiguration
            );

            bind<SystemInfoController>(SERVER_TYPES.InfoController).to(
                DefaultSystemInfoController
            );
            bind<InstitutesController>(SERVER_TYPES.InstitutesController).to(
                DefaultInstituteController
            );
            bind<UsersController>(SERVER_TYPES.UsersController).to(
                DefaultUsersController
            );
            bind<VersionRootController>(SERVER_TYPES.VersionRootController).to(
                DefaultVersionRootController
            );
            bind<TokensController>(SERVER_TYPES.TokensController).to(
                DefaultTokensController
            );
        }
    );
}
