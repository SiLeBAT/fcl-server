import { getRouter as getLoginRouter } from './authentication/login';
import { getRouter as getResetRouter } from './authentication/reset';
import { getRouter as getRegisterRouter } from './authentication/registration';
import { getRouter as getActivateRouter } from './authentication/activation';
import { getRouter as getAdminActivateRouter } from './authentication/adminactivation';
import { getRouter as getRecoveryRouter } from './authentication/recovery';
import { IControllerFactory } from '../sharedKernel';

export enum RouterType {
    LOGIN, VALIDATE, DATASET, REGISTER, RESET, ACTIVATE, INSTITUTIONS, RECOVERY, JOB, ADMINACTIVATE
}

function getRouter(type: RouterType, controllerFactory: IControllerFactory) {
    switch (type) {
        case RouterType.LOGIN:
            return getLoginRouter(controllerFactory);
        case RouterType.RESET:
            return getResetRouter(controllerFactory);
        case RouterType.REGISTER:
            return getRegisterRouter(controllerFactory);
        case RouterType.ACTIVATE:
            return getActivateRouter(controllerFactory);
        case RouterType.ADMINACTIVATE:
            return getAdminActivateRouter(controllerFactory);
        case RouterType.RECOVERY:
            return getRecoveryRouter(controllerFactory);
        default:
            throw new Error(`Unknown RouterType, type=${type}`);
    }
}

export {
    getRouter
};
