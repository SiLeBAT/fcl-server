import * as express from 'express';
import { IControllerFactory } from '../../sharedKernel';

function getRouter(controllerFactory: IControllerFactory) {
    const router = express.Router();
    const controller = controllerFactory.getController('REGISTRATION');

    router.route('/')
        .post(controller.register.bind(controller));
    return router;
}

export {
    getRouter
};
