import { Request, Response } from 'express';
import { logger } from '../../../aspects';
import { TokensController } from '../model/controller.model';
import { TokenRefreshConfirmationResponseDTO } from '../model/response.model';
import {
    TokenPort,
    TokenPayload,
    AuthorizationError,
} from '../../../app/ports';
import { AbstractController } from './abstract.controller';
import { JsonWebTokenError } from 'jsonwebtoken';
import { getTokenFromHeader } from '../middleware/token-validator.middleware';
import {
    controller,
    request,
    response,
    httpPost,
} from 'inversify-express-utils';
import { inject } from 'inversify';
import { SERVER_ERROR_CODE, API_VERSION } from '../model/enums';

import { APPLICATION_TYPES } from './../../../app/application.types';
enum TOKENS_ROUTE {
    ROOT = '/tokens',
}
@controller(API_VERSION.V1 + TOKENS_ROUTE.ROOT)
export class DefaultTokensController extends AbstractController
    implements TokensController {
    constructor(
        @inject(APPLICATION_TYPES.TokenService) private tokenService: TokenPort
    ) {
        super();
    }

    @httpPost('/')
    async postTokens(@request() req: Request, @response() res: Response) {
        logger.info(
            `${this.constructor.name}.${this.postTokens.name}, Request received`
        );
        try {
            const oldToken: string | null = getTokenFromHeader(req);
            if (!oldToken) {
                throw new AuthorizationError('Invalid token');
            }
            const payload: TokenPayload = this.tokenService.verifyToken(
                oldToken
            );
            const token = this.tokenService.generateToken(payload.sub);
            const dto: TokenRefreshConfirmationResponseDTO = {
                refresh: true,
                token: token,
            };
            logger.info(
                `${this.constructor.name}.${this.postTokens.name}, Response sent`
            );
            this.ok(res, dto);
        } catch (error) {
            logger.info(
                `${this.constructor.name}.${this.postTokens.name} has thrown an error. ${error}`
            );
            this.handleError(res, error);
        }
    }

    private handleError(res: Response, error: Error) {
        if (
            error instanceof AuthorizationError ||
            error instanceof JsonWebTokenError
        ) {
            const dto = {
                message: error.message,
                code: SERVER_ERROR_CODE.AUTHORIZATION_ERROR,
            };
            this.unauthorized(res, dto);
        } else {
            this.fail(res);
        }
    }
}
