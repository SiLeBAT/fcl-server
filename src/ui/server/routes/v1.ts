import * as express from 'express';
import { IControllerFactory } from '../sharedKernel';

function getRouter(controllerFactory: IControllerFactory) {
    const router = express.Router();
    // logger.verbose('Registering Route', { route: '/institutions' });
    // router.use('/institutions', getBaseRouter(RouterType.INSTITUTIONS, controllerFactory));
    // logger.verbose('Registering Route', { route: '/upload' });
    // router.use('/upload', getBaseRouter(RouterType.DATASET, controllerFactory));
    // logger.verbose('Registering Route', { route: '/validation' });
    // router.use('/validation', getBaseRouter(RouterType.VALIDATE, controllerFactory));
    // logger.verbose('Registering Route', { route: '/job' });
    // router.use('/job', getBaseRouter(RouterType.JOB, controllerFactory));
    return router;
}

export {
    getRouter
};
