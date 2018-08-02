import * as express from 'express';
import { IControllerFactory } from '../../sharedKernel';

function getRouter(controllerFactory: IControllerFactory) {
    const router = express.Router();
    const controller = controllerFactory.getController('REGISTRATION');

    router.route('/:token')
        .post(controller.adminactivate.bind(controller));
    return router;
}

export {
    getRouter
};
