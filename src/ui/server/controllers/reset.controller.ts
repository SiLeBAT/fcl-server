
import { Request, Response } from 'express';
import { logger } from '../../../aspects';
import { IPasswordPort, IController } from '../../../app/ports';

export interface IResetController extends IController {
    reset(req: Request, res: Response): void;
}

class ResetController implements IResetController {

    constructor(private passwordService: IPasswordPort) { }

    async reset(req: Request, res: Response) {
        let dto;
        try {
            await this.passwordService.resetPassword(req.params.token, req.body.newPw);
            dto = {
                title: 'Please login with your new password'
            };
            res.status(200);

        } catch (err) {
            logger.error(`ResetController.reset, Unable to reset password. error=${err}`);
            dto = {
                title: `Error during password reset, the token is not valid.
						Please receive a new 'Password-Reset' link with the option 'Password forgotten?'.`
            };
            res.status(500);
        }
        logger.info('ResetController.reset, Response sent');
        return res.json(dto).end();
    }

}

export function createController(service: IPasswordPort) {
    return new ResetController(service);
}
