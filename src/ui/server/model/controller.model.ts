import { Request, Response } from 'express';

export interface Controller {}

export interface ControllerFactory {
    // tslint:disable-next-line: no-any
    getController(controllerName: string): any;
}

export interface VersionRootController extends Controller {
    getAPIDefinition(res: Response): Promise<void>;
}

export interface TokensController extends Controller {
    postTokens(req: Request, res: Response): Promise<void>;
}

export interface InstitutesController extends Controller {
    getInstitutes(req: Request, res: Response): Promise<void>;
}

export interface UsersController extends Controller {
    putResetPasswordRequest(req: Request, res: Response): Promise<void>;
    patchResetPassword(
        token: string,
        req: Request,
        res: Response
    ): Promise<void>;
    postRegistration(req: Request, res: Response): void;
    patchVerification(token: string, res: Response): Promise<void>;
    patchActivation(token: string, res: Response): Promise<void>;
    postLogin(req: Request, res: Response): Promise<void>;
}

export interface SystemInfoController extends Controller {
    getSystemInfo(res: Response): Promise<void>;
}

export interface SamplesController extends Controller {
    putValidated(req: Request, res: Response): Promise<void>;
    postSubmitted(req: Request, res: Response): Promise<void>;
    putSamples(req: Request, res: Response): Promise<void>;
}
