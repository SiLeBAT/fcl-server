import { Response } from 'express';
import { SERVER_ERROR_CODE } from '../model/enums';
import { DefaultServerErrorDTO } from '../model/response.model';
import { Controller } from '../model/controller.model';
import { controller } from 'inversify-express-utils';

@controller('')
export abstract class AbstractController implements Controller {
    protected jsonResponse<T>(response: Response, code: number, dto: T) {
        return response.status(code).json(dto);
    }

    protected ok<T>(response: Response, dto?: T) {
        if (dto) {
            return this.jsonResponse<T>(response, 200, dto);
        } else {
            return response.sendStatus(200);
        }
    }

    protected unauthorized<T>(response: Response, dto: T) {
        return this.jsonResponse<T>(response, 401, dto);
    }

    protected clientError(response: Response) {
        const dto: DefaultServerErrorDTO = {
            code: SERVER_ERROR_CODE.INPUT_ERROR,
            message: 'Malformed request',
        };
        return this.jsonResponse(response, 400, dto);
    }

    protected fail(
        response: Response,
        message: string = 'An unknown error occured'
    ) {
        const dto: DefaultServerErrorDTO = {
            code: SERVER_ERROR_CODE.UNKNOWN_ERROR,
            message,
        };
        this.jsonResponse(response, 500, dto);
    }
}
