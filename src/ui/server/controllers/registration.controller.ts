import { Request, Response } from 'express';
import * as config from 'config';
import { logger } from '../../../aspects';
import { IController, IRegistrationPort } from '../../../app/ports';

export interface IRegistrationController extends IController {
    register(req: Request, res: Response): void;
    activate(req: Request, res: Response): Promise<void>;
}

const SUPPORT_CONTACT = config.get('supportContact');

class RegistrationController implements IRegistrationController {

    constructor(private registrationService: IRegistrationPort) { }

    async activate(req: Request, res: Response) {
        let dto;
        try {
            await this.registrationService.activateUser(req.params.token);
            dto = {
                title: 'Kontoaktivierung erfolgreich!' // 'Account Activation successful!'
            };
            res.status(200);
        } catch (err) {
            logger.error('Unable to activate user', { error: err });
            dto = {};
            res.status(400);
        }
        logger.info('RegistrationController.activate, Response sent');
        return res.json(dto).end();
    }

    async adminactivate(req: Request, res: Response) {
        let dto;
        try {
            const userName = await this.registrationService.adminActivateUser(req.params.token);
            dto = {
                title: `Admin Kontoaktivierung erfolgreich! Bestätigung gesendet an ${userName}`, // 'Account Activation successful!'
                obj: userName
            };
            res.status(200);
        } catch (err) {
            logger.error('Unable to admin activate user', { error: err });
            dto = {};
            res.status(400);
        }
        logger.info('RegistrationController.adminactivate, Response sent');
        return res.json(dto).end();
    }

    async register(req: Request, res: Response) {

        const credentials = this.fromRequestToCredentials(req);
        logger.info('RegistrationController.register, Request received');
        let dto;
        try {
            await this.registrationService.registerUser(credentials);
            dto = {
                title: `Bitte aktivieren Sie Ihren Account: Eine Email mit weiteren Anweisungen wurde an ${credentials.email} gesendet` // `Please activate your account: An email has been sent to ${credentials.email} with further instructions`
            };
            res.status(200);

        } catch (err) {
            logger.error(`Unable to register user. error=${err}`);
            dto = {
                title: `Fehler beim Registrieren.
						Eine Email mit weiteren Informationen wurde an ${credentials.email} gesendet.
						Wenn Sie keine Email erhalten, wenden Sie sich bitte direkt per Email an uns: ${SUPPORT_CONTACT}.`
            };
            res.status(500);
        }
        logger.info('RegistrationController.register, Response sent');
        return res.json(dto).end();
    }

    private fromRequestToCredentials(req: Request) {
        const body = req.body;
        return {
            firstName: body.firstName,
            lastName: body.lastName,
            email: body.email,
            password: body.password,
            institution: body.institution,
            userAgent: req.headers['user-agent'] as string,
            host: req.headers['host'] as string
        };
    }
}

export function createRegistrationController(service: IRegistrationPort) {
    return new RegistrationController(service);
}
