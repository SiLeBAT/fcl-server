import * as express from 'express';
import { IControllerFactory } from '../../sharedKernel';

function getRouter(controllerFactory: IControllerFactory) {
    const router = express.Router();
    const controller = controllerFactory.getController('LOGIN');

    router.route('/')
        .post(controller.login.bind(controller));
    return router;
}

export {
    getRouter
};
