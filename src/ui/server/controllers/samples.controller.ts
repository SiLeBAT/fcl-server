import * as moment from 'moment';
import * as _ from 'lodash';
import { Request, Response } from 'express';
import { logger } from '../../../aspects';
import {
    FormValidatorPort,
    FormAutoCorrectionPort,
    Sample,
    createSample,
    ValidationOptions,
    SamplePort,
    SenderInfo,
    ExcelFileInfo,
    Attachment,
    AnnotatedSampleDataEntry,
    SampleData,
    SampleSet,
    SampleSetMetaData,
    TokenPayload,
    TokenPort,
    UserPort,
    Urgency,
    User
} from '../../../app/ports';
import { SamplesController } from '../model/controller.model';
import { SampleSubmissionDTO } from '../model/request.model';
import { SERVER_ERROR_CODE, ROUTE } from '../model/enums';
import {
    MalformedRequestError,
    TokenNotFoundError
} from '../model/domain.error';
import { getTokenFromHeader } from '../middleware/token-validator.middleware';
import { AbstractController } from './abstract.controller';
import {
    SampleDataDTO,
    SampleSetDTO,
    SampleDataEntryDTO,
    OrderDTO,
    SampleSetMetaDTO
} from '../model/shared-dto.model';
import {
    InvalidInputErrorDTO,
    AutoCorrectedInputErrorDTO
} from '../model/response.model';
import {
    controller,
    httpPut,
    httpPost,
    request,
    response
} from 'inversify-express-utils';
import { inject } from 'inversify';

import { APPLICATION_TYPES } from './../../../app/application.types';
import SERVER_TYPES from '../server.types';
moment.locale('de');

enum RESOURCE_VIEW_TYPE {
    JSON,
    XLSX
}

enum SAMPLES_ROUTE {
    ROOT = '/samples',
    VALIDATED = '/validated',
    SUBMITTED = '/submitted'
}
@controller(ROUTE.VERSION + SAMPLES_ROUTE.ROOT)
export class DefaultSamplesController extends AbstractController
    implements SamplesController {
    constructor(
        @inject(APPLICATION_TYPES.FormValidatorService)
        private formValidationService: FormValidatorPort,
        @inject(APPLICATION_TYPES.FormAutoCorrectionService)
        private formAutoCorrectionService: FormAutoCorrectionPort,
        @inject(APPLICATION_TYPES.SampleService)
        private sampleService: SamplePort,
        @inject(APPLICATION_TYPES.TokenService) private tokenService: TokenPort,
        @inject(APPLICATION_TYPES.UserService) private userService: UserPort
    ) {
        super();
    }

    @httpPut('/', SERVER_TYPES.MulterMW)
    async putSamples(@request() req: Request, @response() res: Response) {
        logger.info(
            `${this.constructor.name}.${this.putSamples.name}, Request received`
        );
        try {
            const sampleSet: SampleSet = await this.transformInput(req, res);

            await this.sendResponse(req, res, sampleSet);
        } catch (error) {
            logger.info(
                `${this.constructor.name}.${this.putSamples.name} has thrown an error. ${error}`
            );
            this.handleError(res, error);
        }
    }
    @httpPut(SAMPLES_ROUTE.VALIDATED)
    async putValidated(@request() req: Request, @response() res: Response) {
        logger.info(
            `${this.constructor.name}.${this.putValidated.name}, Request received`
        );
        try {
            const orderDTO: OrderDTO = req.body;

            const annotatedSampleSet: SampleSet = this.fromDTOToSampleSet(
                orderDTO.order
            );
            const validationOptions = await this.getValidationOptions(
                annotatedSampleSet.meta,
                req
            );
            const validationResult: Sample[] = await this.validateSamples(
                annotatedSampleSet.samples,
                validationOptions
            );
            const validatedOrderDTO: OrderDTO = this.fromSampleCollectionToOrderDTO(
                validationResult,
                annotatedSampleSet.meta
            );
            logger.info(
                `${this.constructor.name}.${this.putValidated.name}, Response sent`
            );
            logger.verbose('Response:', validatedOrderDTO);
            this.ok(res, validatedOrderDTO);
        } catch (error) {
            logger.info(
                `${this.constructor.name}.${this.putValidated.name} has thrown an error. ${error}`
            );
            this.handleError(res, error);
        }
    }
    @httpPost(SAMPLES_ROUTE.SUBMITTED)
    async postSubmitted(@request() req: Request, @response() res: Response) {
        logger.info(
            `${this.constructor.name}.${this.postSubmitted.name}, Request received`
        );
        try {
            const sampleSubmissionDTO: SampleSubmissionDTO = req.body;

            const annotatedSampleSet: SampleSet = this.fromDTOToSampleSet(
                sampleSubmissionDTO.order
            );
            const validationOptions: ValidationOptions = await this.getValidationOptions(
                annotatedSampleSet.meta,
                req
            );
            const validatedSamples: Sample[] = await this.validateSamples(
                annotatedSampleSet.samples,
                validationOptions
            );

            const annotatedSampleDataDTO: SampleDataDTO[] = this.fromSampleCollectionToDTO(
                validatedSamples
            );
            if (this.hasSampleError(validatedSamples)) {
                const errorDTO: InvalidInputErrorDTO = {
                    code: SERVER_ERROR_CODE.INVALID_INPUT,
                    message: 'Contains errors',
                    samples: annotatedSampleDataDTO
                };
                res.status(422).json(errorDTO);
                return;
            }
            if (this.hasSampleAutoCorrection(validatedSamples)) {
                const errorDTO: AutoCorrectedInputErrorDTO = {
                    code: SERVER_ERROR_CODE.AUTOCORRECTED_INPUT,
                    message: 'Has been auto-corrected',
                    samples: annotatedSampleDataDTO
                };
                res.status(422).json(errorDTO);
                return;
            }

            const sampleFile: ExcelFileInfo = await this.sampleService.convertToExcel(
                {
                    samples: annotatedSampleDataDTO.map(sample =>
                        this.fromDTOToSample(sample)
                    ),
                    meta: annotatedSampleSet.meta
                }
            );
            sampleFile.fileName = this.amendXLSXFileName(
                sampleFile.fileName,
                '_validated'
            );
            const attchment: Attachment = this.fromExcelFileInfoToAttachment(
                sampleFile
            );
            const token = getTokenFromHeader(req);
            if (!token) {
                throw new TokenNotFoundError('Invalid user.');
            }
            const user: User = await this.getUserFromToken(token);
            const senderInfo = this.mapRequestDTOToSenderInfo(req.body, user);
            this.sampleService.sendSampleFile(attchment, senderInfo);

            logger.info(
                `${this.constructor.name}.${this.postSubmitted.name}, Response sent`
            );
            logger.verbose('Response:', annotatedSampleDataDTO);
            this.ok(res, annotatedSampleDataDTO);
        } catch (error) {
            logger.info(
                `${this.constructor.name}.${this.postSubmitted.name} has thrown an error. ${error}`
            );
            this.handleError(res, error);
        }
    }

    private async transformInput(
        req: Request,
        res: Response
    ): Promise<SampleSet> {
        let contype = req.headers['content-type'];
        const type = this.getResourceViewType(contype);
        const token: string | null = getTokenFromHeader(req);
        switch (type) {
            case RESOURCE_VIEW_TYPE.XLSX:
                const buffer: Buffer = mapResponseFileToDatasetFile(req.file);
                return this.sampleService
                    .convertToJson(buffer, req.file.originalname, token)
                    .catch((error: Error) => {
                        throw error;
                    });
            case RESOURCE_VIEW_TYPE.JSON:
            default:
                const dto: OrderDTO = req.body;
                return this.fromDTOToSampleSet(dto.order);
        }
    }

    private async sendResponse(
        req: Request,
        res: Response,
        sampleSet: SampleSet
    ) {
        let accept = req.headers['accept'];

        const type = this.getResourceViewType(accept);
        switch (type) {
            case RESOURCE_VIEW_TYPE.XLSX:
                const result = await this.sampleService.convertToExcel(
                    sampleSet
                );
                result.fileName = this.amendXLSXFileName(
                    result.fileName,
                    '.MP_' + moment().unix()
                );
                logger.info(
                    `${this.constructor.name}.${this.putSamples.name}, Response sent`
                );
                this.ok(res, result);
                break;
            case RESOURCE_VIEW_TYPE.JSON:
            default:
                const successResponse: OrderDTO = this.fromAnnotatedSampleSetToOrderDTO(
                    sampleSet
                );
                logger.info(
                    `${this.constructor.name}.${this.putSamples.name}, Response sent`
                );
                this.ok(res, successResponse);
        }
    }

    private amendXLSXFileName(
        originalFileName: string,
        fileNameAddon: string
    ): string {
        const entries: string[] = originalFileName.split('.xlsx');
        let fileName: string = '';
        if (entries.length > 0) {
            fileName += entries[0];
        }

        fileName += fileNameAddon + '.xlsx';
        return fileName;
    }
    private getResourceViewType(
        typeString: string = 'application/json'
    ): RESOURCE_VIEW_TYPE {
        let returnType = RESOURCE_VIEW_TYPE.JSON;

        if (typeString.includes('multipart/form-data')) {
            returnType = RESOURCE_VIEW_TYPE.XLSX;
        }
        if (
            typeString.includes(
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            )
        ) {
            returnType = RESOURCE_VIEW_TYPE.XLSX;
        }
        return returnType;
    }

    private handleError(res: Response, error: Error) {
        if (error instanceof MalformedRequestError) {
            this.clientError(res);
        } else {
            this.fail(res);
        }
    }

    private async validateSamples(
        samples: Sample[],
        options: ValidationOptions
    ): Promise<Sample[]> {
        // Auto-correction needs to happen before validation.
        const autocorrectedSamples = await this.formAutoCorrectionService.applyAutoCorrection(
            samples
        );
        const validationResult = await this.formValidationService.validateSamples(
            autocorrectedSamples,
            options
        );

        return validationResult;
    }

    private async getValidationOptions(
        meta: SampleSetMetaData,
        req: Request
    ): Promise<ValidationOptions> {
        const validationOptions: ValidationOptions = {
            nrl: meta.nrl
        };

        const token = getTokenFromHeader(req);
        let stateShort = '';
        if (token) {
            const user: User = await this.getUserFromToken(token);
            try {
                const instute = user.institution;
                stateShort = instute.stateShort;
            } catch (error) {
                logger.info(
                    `${this.constructor.name}.${this.getValidationOptions.name}, no state found for user. Using default state. error=${error}`
                );
            }
        }

        validationOptions.state = stateShort;
        return validationOptions;
    }

    private getUserFromToken(token: string): Promise<User> {
        const payload: TokenPayload = this.tokenService.verifyToken(token);
        const userId = payload.sub;
        return this.userService.getUserById(userId);
    }

    private fromDTOToSampleSet(dto: SampleSetDTO): SampleSet {
        try {
            const annotatedSampleSet: SampleSet = {
                meta: this.fromDTOToSampleSetMetaData(dto.meta),
                samples: dto.samples.map(container => {
                    return this.fromDTOToSample(container.sample);
                })
            };
            return annotatedSampleSet;
        } catch (error) {
            throw new MalformedRequestError(
                `Error parsing input. error=${error}`
            );
        }
    }

    private fromDTOToSampleSetMetaData(
        dto: SampleSetMetaDTO
    ): SampleSetMetaData {
        return {
            nrl: dto.nrl,
            analysis: dto.analysis,
            sender: dto.sender,
            urgency: this.fromStringToEnum(dto.urgency),
            fileName: dto.fileName ? dto.fileName : ''
        };
    }

    private fromStringToEnum(urgency: string): Urgency {
        switch (urgency.trim().toLowerCase()) {
            case 'eilt':
                return Urgency.URGENT;
            case 'normal':
            default:
                return Urgency.NORMAL;
        }
    }

    private fromSampleSetMetaDataToDTO(
        data: SampleSetMetaData
    ): SampleSetMetaDTO {
        return {
            nrl: data.nrl,
            analysis: data.analysis,
            sender: data.sender,
            urgency: data.urgency.toString(),
            fileName: data.fileName
        };
    }

    private fromDTOToSample(dto: SampleDataDTO): Sample {
        const annotatedSample = this.fromDTOToAnnotatedSampleData(dto);
        return createSample({ ...annotatedSample });
    }

    private fromDTOToAnnotatedSampleData(dto: SampleDataDTO): SampleData {
        const annotatedSampleData: Record<
            string,
            AnnotatedSampleDataEntry
        > = {};
        for (const prop in dto) {
            annotatedSampleData[prop] = this.fromDTOToAnnotatedSampleDataEntry(
                dto[prop]
            );
        }
        return annotatedSampleData as SampleData;
    }

    private fromDTOToAnnotatedSampleDataEntry(
        dto: SampleDataEntryDTO
    ): AnnotatedSampleDataEntry {
        try {
            const annotatedSampleDataEntry: AnnotatedSampleDataEntry = {
                value: dto.value,
                errors: dto.errors ? dto.errors : [],
                correctionOffer: dto.correctionOffer ? dto.correctionOffer : []
            };

            if (dto.oldValue) {
                annotatedSampleDataEntry.oldValue = dto.oldValue;
            }

            return annotatedSampleDataEntry;
        } catch (error) {
            throw new MalformedRequestError(
                `Error parsing input. error=${error}`
            );
        }
    }

    private fromExcelFileInfoToAttachment(
        excelInfo: ExcelFileInfo
    ): Attachment {
        return {
            filename: excelInfo.fileName,
            contentType: excelInfo.type,
            content: Buffer.from(excelInfo.data, 'base64')
        };
    }

    private fromAnnotatedSampleSetToOrderDTO(
        annotatedSampleSet: SampleSet
    ): OrderDTO {
        return {
            order: {
                meta: this.fromSampleSetMetaDataToDTO(annotatedSampleSet.meta),
                samples: annotatedSampleSet.samples.map(sample => ({
                    sample: sample.getDataValues()
                }))
            }
        };
    }

    private fromSampleCollectionToOrderDTO(
        sampleCollection: Sample[],
        meta: SampleSetMetaData
    ): OrderDTO {
        return {
            order: this.fromSampleCollectionToSampleSetDTO(
                sampleCollection,
                meta
            )
        };
    }

    private fromSampleCollectionToSampleSetDTO(
        sampleCollection: Sample[],
        meta: SampleSetMetaData
    ): SampleSetDTO {
        return {
            samples: this.fromSampleCollectionToDTO(
                sampleCollection
            ).map(dto => ({ sample: dto })),
            meta: this.fromSampleSetMetaDataToDTO(meta)
        };
    }
    private fromSampleCollectionToDTO(
        sampleCollection: Sample[]
    ): SampleDataDTO[] {
        return sampleCollection.map((sample: Sample) =>
            sample.getAnnotatedData()
        );
    }

    private mapRequestDTOToSenderInfo(
        senderInfo: SampleSubmissionDTO,
        user: User
    ): SenderInfo {
        return {
            user,
            comment: senderInfo.comment || '',
            recipient: senderInfo.order.meta.nrl || ''
        };
    }

    private hasSampleError(annotatedSamples: Sample[]): boolean {
        return this.hasSampleFault(annotatedSamples, 2);
    }
    private hasSampleAutoCorrection(annotatedSamples: Sample[]): boolean {
        return this.hasSampleFault(annotatedSamples, 4);
    }
    private hasSampleFault(
        annotatedSamples: Sample[],
        errorLevel: number
    ): boolean {
        return !!annotatedSamples.reduce((acc: number, entry: Sample) => {
            let count = entry.getErrorCount(errorLevel);
            return (acc += count);
        }, 0);
    }
}

function mapResponseFileToDatasetFile(file: Express.Multer.File): Buffer {
    return file.buffer;
}
