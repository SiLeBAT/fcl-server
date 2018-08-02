import * as express from 'express';
import { IControllerFactory } from '../../sharedKernel';

function getRouter(controllerFactory: IControllerFactory) {
    const router = express.Router();
    const controller = controllerFactory.getController('REGISTRATION');

    router.route('/:token')
        .post(controller.activate.bind(controller));
    return router;
}

export {
    getRouter
};
