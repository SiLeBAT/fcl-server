import { Request, Response } from 'express';
import { logger } from '../../../aspects';
import {
    PasswordPort,
    UserLoginInformation,
    LoginResponse,
    AuthorizationError,
    LoginPort,
    RegistrationPort,
    UserRegistration,
    InvalidInputDataError,
} from '../../../app/ports';
import { UsersController } from '../model/controller.model';
import { AbstractController } from './abstract.controller';
import {
    ResetRequestDTO,
    NewPasswordRequestDTO,
    RegistrationDetailsDTO,
    GDPRConfirmationRequestDTO,
} from '../model/request.model';
import {
    PasswordResetRequestResponseDTO,
    PasswordResetResponseDTO,
    TokenizedUserDTO,
    FailedLoginErrorDTO,
    ActivationResponseDTO,
    RegistrationRequestResponseDTO,
    NewsConfirmationResponseDTO,
    InvalidDataErrorDTO,
    DefaultServerErrorDTO,
} from '../model/response.model';
import { MalformedRequestError } from '../model/domain.error';
import { SERVER_ERROR_CODE, ROUTE } from '../model/enums';
import { JsonWebTokenError } from 'jsonwebtoken';
import {
    controller,
    httpPut,
    httpPatch,
    httpPost,
    requestParam,
    request,
    response,
} from 'inversify-express-utils';
import { inject } from 'inversify';
import { APPLICATION_TYPES } from './../../../app/application.types';
import { UserNotFoundError } from '../../../infrastructure/persistence/model/domain.error';

enum USERS_ROUTE {
    ROOT = '/users',
    RESET_PASSWORD_REQUEST = '/reset-password-request',
    RESET_PASSWORD = '/reset-password',
    LOGIN = '/login',
    VERIFICATION = '/verification',
    ACTIVATION = '/activation',
    REGISTRATION = '/registration',
    GDPR_AGREEMENT = '/gdpr-agreement',
    NEWS_CONFIRMATION = '/news-confirmation',
}
@controller(ROUTE.VERSION + USERS_ROUTE.ROOT)
export class DefaultUsersController
    extends AbstractController
    implements UsersController
{
    constructor(
        @inject(APPLICATION_TYPES.PasswordService)
        private passwordService: PasswordPort,
        @inject(APPLICATION_TYPES.LoginService) private loginService: LoginPort,
        @inject(APPLICATION_TYPES.RegistrationService)
        private registrationService: RegistrationPort
    ) {
        super();
    }
    @httpPut(USERS_ROUTE.RESET_PASSWORD_REQUEST)
    async putResetPasswordRequest(
        @request() req: Request,
        @response() res: Response
    ) {
        logger.info(
            `${this.constructor.name}.${this.putResetPasswordRequest.name}, Request received`
        );

        const resetRequest: ResetRequestDTO = req.body;
        const dto: PasswordResetRequestResponseDTO = {
            passwordResetRequest: true,
            email: resetRequest.email,
        };

        try {
            if (!resetRequest.email) {
                throw new MalformedRequestError(
                    'Email for password reset not supplied'
                );
            }
            await this.passwordService.requestPasswordReset({
                email: resetRequest.email,
                host: req.headers['host'] as string,
                userAgent: req.headers['user-agent'] as string,
            });
            logger.info(
                `${this.constructor.name}.${this.putResetPasswordRequest.name}, Response sent`
            );
            this.ok(res, dto);
        } catch (error) {
            logger.info(
                `${this.constructor.name}.${this.putResetPasswordRequest.name} has thrown an error. ${error}`
            );
            if (error instanceof UserNotFoundError) {
                logger.info(
                    `${this.constructor.name}.${this.putResetPasswordRequest.name}, Response sent`
                );
                this.ok(res, dto);
            }
            this.handleError(res, error);
        }
    }

    @httpPatch(USERS_ROUTE.RESET_PASSWORD + '/:token')
    async patchResetPassword(
        @requestParam('token') token: string,
        @request() req: Request,
        @response() res: Response
    ) {
        logger.info(
            `${this.constructor.name}.${this.patchResetPassword.name}, Request received`
        );
        try {
            const newPasswordRequest: NewPasswordRequestDTO = req.body;
            if (!newPasswordRequest.password) {
                throw new MalformedRequestError(
                    'New password or token not supplied'
                );
            }
            await this.passwordService.resetPassword(
                token,
                newPasswordRequest.password
            );
            const dto: PasswordResetResponseDTO = {
                passwordReset: true,
            };
            logger.info(
                `${this.constructor.name}.${this.patchResetPassword.name}, Response sent`
            );
            this.ok(res, dto);
        } catch (error) {
            logger.info(
                `${this.constructor.name}.${this.patchResetPassword.name} has thrown an error. ${error}`
            );
            this.handleError(res, error);
        }
    }
    @httpPost(USERS_ROUTE.LOGIN)
    async postLogin(@request() req: Request, @response() res: Response) {
        logger.info(
            `${this.constructor.name}.${this.postLogin.name}, Request received`
        );
        try {
            const userLoginInfo: UserLoginInformation =
                this.mapRequestDTOToUserLoginInfo(req);
            const response: LoginResponse = await this.loginService.loginUser(
                userLoginInfo
            );

            const dto: TokenizedUserDTO =
                this.fromLoginResponseToResponseDTO(response);
            logger.info(
                `${this.constructor.name}.${this.postLogin.name}, Response sent`
            );
            this.ok(res, dto);
        } catch (error) {
            logger.info(
                `${this.constructor.name}.${this.postLogin.name} has thrown an error. ${error}`
            );
            this.handleError(res, error);
        }
    }

    @httpPut(USERS_ROUTE.GDPR_AGREEMENT)
    async putGDPRAgreement(@request() req: Request, @response() res: Response) {
        logger.info(
            `${this.constructor.name}.${this.putGDPRAgreement.name}, Request received`
        );
        try {
            const gdprConfirmationRequest: GDPRConfirmationRequestDTO =
                req.body;

            if (!gdprConfirmationRequest.email) {
                throw new MalformedRequestError(
                    'Email for password reset not supplied'
                );
            }

            const response: LoginResponse = await this.loginService.confirmGDPR(
                gdprConfirmationRequest
            );

            const dto: TokenizedUserDTO =
                this.fromLoginResponseToResponseDTO(response);
            logger.info(
                `${this.constructor.name}.${this.putGDPRAgreement.name}, Response sent`
            );
            this.ok(res, dto);
        } catch (error) {
            logger.info(
                `${this.constructor.name}.${this.putGDPRAgreement.name} has thrown an error. ${error}`
            );
            this.handleError(res, error);
        }
    }

    @httpPatch(USERS_ROUTE.VERIFICATION + '/:token')
    async patchVerification(
        @requestParam('token') token: string,
        @response() res: Response
    ) {
        logger.info(
            `${this.constructor.name}.${this.patchVerification.name}, Request received`
        );
        try {
            const username = await this.registrationService.verifyUser(token);
            const dto: ActivationResponseDTO = {
                activation: true,
                username,
            };
            logger.info(
                `${this.constructor.name}.${this.patchVerification.name}, Response sent`
            );
            this.ok(res, dto);
        } catch (error) {
            logger.info(
                `${this.constructor.name}.${this.patchVerification.name} has thrown an error. ${error}`
            );
            this.handleError(res, error);
        }
    }

    @httpPatch(USERS_ROUTE.ACTIVATION + '/:token')
    async patchActivation(
        @requestParam('token') token: string,
        @response() res: Response
    ) {
        logger.info(
            `${this.constructor.name}.${this.patchActivation.name}, Request received`
        );
        try {
            const username = await this.registrationService.activateUser(token);
            const dto: ActivationResponseDTO = {
                activation: true,
                username,
            };
            logger.info(
                `${this.constructor.name}.${this.patchActivation.name}, Response sent`
            );
            this.ok(res, dto);
        } catch (error) {
            logger.info(
                `${this.constructor.name}.${this.patchActivation.name} has thrown an error. ${error}`
            );
            this.handleError(res, error);
        }
    }

    @httpPost(USERS_ROUTE.REGISTRATION)
    async postRegistration(@request() req: Request, @response() res: Response) {
        logger.info(
            `${this.constructor.name}.${this.postRegistration.name}, Request received`
        );

        try {
            const credentials: UserRegistration =
                this.fromRequestToUserRegistration(req);

            await this.registrationService.registerUser(credentials);
            const dto: RegistrationRequestResponseDTO = {
                registerRequest: true,
                email: credentials.email,
            };

            logger.info(
                `${this.constructor.name}.${this.postRegistration.name}, Response sent`
            );
            return this.ok(res, dto);
        } catch (error) {
            logger.info(
                `${this.constructor.name}.${this.postRegistration.name} has thrown an error. ${error}`
            );
            this.handleError(res, error);
        }
    }

    @httpPatch(USERS_ROUTE.NEWS_CONFIRMATION + '/:token')
    async patchNewsConfirmation(
        @requestParam('token') token: string,
        @response() res: Response
    ) {
        logger.info(
            `${this.constructor.name}.${this.patchNewsConfirmation.name}, Request received`
        );
        try {
            const username =
                await this.registrationService.confirmNewsletterSubscription(
                    token
                );

            const dto: NewsConfirmationResponseDTO = {
                newsconfirmation: true,
                username,
            };
            logger.info(
                `${this.constructor.name}.${this.patchNewsConfirmation.name}, Response sent`
            );
            this.ok(res, dto);
        } catch (error) {
            logger.info(
                `${this.constructor.name}.${this.patchNewsConfirmation.name} has thrown an error. ${error}`
            );
            this.handleError(res, error);
        }
    }

    private handleError(res: Response, error: Error) {
        if (error instanceof MalformedRequestError) {
            this.clientError(res);
        } else if (error instanceof InvalidInputDataError) {
            const dto: InvalidDataErrorDTO = {
                code: SERVER_ERROR_CODE.INVALID_INPUT,
                message:
                    error.message ||
                    'Action could not be performed. Client provided invalid input.',
                errors: error.validationErrors,
            };
            this.invalidUserInput(res, dto);
        } else if (error instanceof JsonWebTokenError) {
            const dto = {
                code: SERVER_ERROR_CODE.AUTHORIZATION_ERROR,
                message: 'Unauthorized request',
            };
            this.unauthorized(res, dto);
        } else if (error instanceof AuthorizationError) {
            let dto: DefaultServerErrorDTO = {
                code: SERVER_ERROR_CODE.AUTHENTICATION_ERROR,
                message: 'Authentication failure',
            };
            if (error.timeToWait) {
                (dto as FailedLoginErrorDTO) = {
                    code: SERVER_ERROR_CODE.AUTHENTICATION_ERROR,
                    message: 'Too many failed login attempts',
                    waitTime: error.timeToWait
                };
            }
            this.unauthorized(res, dto);
        } else {
            this.fail(res);
        }
    }

    private fromRequestToUserRegistration(req: Request): UserRegistration {
        const registrationDetail: RegistrationDetailsDTO = req.body;
        try {
            if (
                !(
                    registrationDetail.firstName &&
                    registrationDetail.lastName &&
                    registrationDetail.email &&
                    registrationDetail.password &&
                    registrationDetail.dataProtectionAgreed
                ) &&
                (registrationDetail.newsRegAgreed === true ||
                    registrationDetail.newsRegAgreed === false) &&
                registrationDetail.newsMailAgreed === false
            ) {
                throw new MalformedRequestError(
                    'Registration details missing.'
                );
            }
            const credentials = {
                firstName: registrationDetail.firstName,
                lastName: registrationDetail.lastName,
                email: registrationDetail.email,
                password: registrationDetail.password,
                dataProtectionAgreed: registrationDetail.dataProtectionAgreed,
                newsRegAgreed: registrationDetail.newsRegAgreed,
                newsMailAgreed: registrationDetail.newsMailAgreed,
                institution: '',
                userAgent: req.headers['user-agent'] as string,
                host: req.headers['host'] as string,
            };
            return credentials;
        } catch (error) {
            logger.error(
                `${this.constructor.name}.${this.fromRequestToUserRegistration.name}, unable to verify credentials during registration. error=${error}`
            );
            throw new MalformedRequestError('Registration details invalid');
        }
    }

    private mapRequestDTOToUserLoginInfo(req: Request) {
        return {
            email: req.body.email,
            password: req.body.password,
            userAgent: req.headers['user-agent'],
            host: req.headers['host'],
            gdprDate: req.body.gdprDate,
        };
    }
    private fromLoginResponseToResponseDTO(
        response: LoginResponse
    ): TokenizedUserDTO {
        return {
            firstName: response.user.firstName,
            lastName: response.user.lastName,
            email: response.user.email,
            token: response.token,
            instituteId: response.user.institution.uniqueId,
            gdprAgreementRequested: response.gdprAgreementRequested,
        };
    }
}
