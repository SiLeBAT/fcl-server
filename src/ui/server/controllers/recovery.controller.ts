
import { Request, Response } from 'express';
import { logger } from '../../../aspects';
import { IController, IPasswordPort } from '../../../app/ports';

export interface IRecoveryController extends IController {
    recovery(req: Request, res: Response): void;
}

class RecoveryController implements IRecoveryController {

    constructor(private passwordService: IPasswordPort) { }

    async recovery(req: Request, res: Response) {

        const body = req.body;
        logger.info('RecoveryController.recovery, Request received');
        let dto;
        try {
            await this.passwordService.recoverPassword({
                email: body.email,
                host: req.headers['host'] as string,
                userAgent: req.headers['user-agent'] as string
            });
            dto = {
                title: `Eine Email mit weiteren Anweisungen wurde an ${body.email} gesendet.
						Wenn Sie keine Email erhalten, könnte das bedeuten, daß Sie sich mit
						einer anderen Email-Adresse angemeldet haben.` // `An email has been sent to ${body.email} with further instructions`
            };
            res.status(200);
        } catch (err) {
            logger.error(`Unable to recover password. error=${err}`);
            dto = {};
            res.status(500);
        }
        logger.info('RecoveryController.recovery, Response sent');
        return res.json(dto).end();
    }
}

export function createController(service: IPasswordPort) {
    return new RecoveryController(service);
}
