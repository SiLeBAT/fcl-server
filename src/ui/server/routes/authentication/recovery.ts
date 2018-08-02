import * as express from 'express';
import { IControllerFactory } from '../../sharedKernel';

function getRouter(controllerFactory: IControllerFactory) {
    const router = express.Router();
    const controller = controllerFactory.getController('RECOVERY');

    router.route('/')
        .post(controller.recovery.bind(controller));
    return router;
}

export {
    getRouter
};
