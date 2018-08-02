import * as express from 'express';
import { IControllerFactory } from '../../sharedKernel';

function getRouter(controllerFactory: IControllerFactory) {
    const router = express.Router();
    const controller = controllerFactory.getController('RESET');

    router.route('/:token')
        .post(controller.reset.bind(controller));
    return router;
}

export {
    getRouter
};
