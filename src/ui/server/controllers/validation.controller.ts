import * as path from 'path';
import * as fs from 'fs';
import * as moment from 'moment';
import * as _ from 'lodash';
import * as rootDir from 'app-root-dir';
import * as unirest from 'unirest';
import * as config from 'config';
import { Request, Response } from 'express';
import { logger } from '../../../aspects';
import { IFormValidatorPort, IFormAutoCorrectionPort, IController, ISampleCollection, ISample, createSample, createSampleCollection } from '../../../app/ports';
import { ApplicationSystemError } from '../../../app/sharedKernel/errors';

moment.locale('de');

interface IValidationRequestMeta {
    state: string;
}

interface IValidationRequest {
    data: ISampleDTO[];
    meta: IValidationRequestMeta;
}

interface ISampleDTO {
    sample_id: string;
    sample_id_avv: string;
    pathogen_adv: string;
    pathogen_text: string;
    sampling_date: string;
    isolation_date: string;
    sampling_location_adv: string;
    sampling_location_zip: string;
    sampling_location_text: string;
    topic_adv: string;
    matrix_adv: string;
    matrix_text: string;
    process_state_adv: string;
    sampling_reason_adv: string;
    sampling_reason_text: string;
    operations_mode_adv: string;
    operations_mode_text: string;
    vvvo: string;
    comment: string;
}

interface IKnimeConfig {
    user: string;
    pass: string;
    urlJobId: string;
    urlResult: string;
}

interface IErrorDTO {
    code: number;
    level: number;
    message: string;
}

interface IErrorResponseDTO {
    [key: string]: IErrorDTO[];
}

const knimeConfig: IKnimeConfig = config.get('knime');
const appRootDir = rootDir.get();

export interface IValidationController extends IController {
    validateSamples(req: Request, res: Response): Promise<void>;
}

class ValidationController implements IValidationController {

    constructor(private formValidationService: IFormValidatorPort, private formAutoCorrectionService: IFormAutoCorrectionPort) { }

    async validateSamples(req: Request, res: Response) {

        if (req.is('application/json')) {
            try {
                const sampleCollection: ISampleCollection = this.fromDTOToSamples(req.body);
                const validationResult = this.formValidationService.validateSamples(sampleCollection, req.body.meta.state);
                const autocorrectedSamples = this.formAutoCorrectionService.applyAutoCorrection(validationResult);
                const validationResultsDTO = this.fromErrorsToDTO(autocorrectedSamples);
                logger.info('ValidationController.validateSamples, Response sent', validationResultsDTO);
                res
                    .status(200)
                    .json(validationResultsDTO);
            } catch (err) {
                res
                    .status(500).end();
                throw err;
            }

        } else {
            const uploadedFilePath = path.join(appRootDir, req.file.path);
            this.getKnimeJobId(req, res, uploadedFilePath);
        }

        return res.end();

    }

    private fromErrorsToDTO(sampleCollection: ISampleCollection) {

        return sampleCollection.samples.map((sample: ISample) => {
            const errors: IErrorResponseDTO = {};

            _.forEach(sample.getErrors(), (e, i) => {
                errors[i] = e.map(f => ({
                    code: f.code,
                    level: f.level,
                    message: f.message
                }));
            });
            return {
                data: sample.getData(),
                errors: errors,
                corrections: sample.autoCorrections
            };

        });
    }

    private fromDTOToSamples(dto: IValidationRequest): ISampleCollection {
        if (!Array.isArray(dto.data)) {
            throw new ApplicationSystemError(`Invalid input: Array expected, dto.data${dto.data}`);
        }
        const samples = dto.data.map(s => createSample({ ...s }));

        return createSampleCollection(samples);
    }

    private getKnimeJobId(req: Request, res: Response, filePath: string) {
        logger.info('ValidationController.getKnimeJobId, Retrieving Knime Job ID.');

        const urlJobId = knimeConfig.urlJobId;
        const user = knimeConfig.user;
        const pass = knimeConfig.pass;

        unirest
            .post(urlJobId)
            .auth({
                user: user,
                pass: pass
            })
            // tslint:disable-next-line
            .end((response: any) => {
                if (response.error) {
                    logger.error('knime id error: ', response.error);

                    return res
                        .status(400)
                        .json({
                            title: 'knime id error',
                            obj: response.error
                        });
                }

                const jobId = response.body['id'];
                this.doKnimeValidation(req, res, jobId, filePath);
            });

    }

    private doKnimeValidation(req: Request, res: Response, jobId: string, filePath: string) {

        const urlResult = knimeConfig.urlResult + jobId;
        const user = knimeConfig.user;
        const pass = knimeConfig.pass;

        unirest
            .post(urlResult)
            .headers({
                'content-type': 'multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW'
            })
            .auth({
                user: user,
                pass: pass
            })
            .attach({
                'file-upload-210': fs.createReadStream(filePath)
            })
            // tslint:disable-next-line
            .end((response: any) => {
                if (response.error) {
                    logger.error('knime validation error: ', response.error);

                    return res
                        .status(400)
                        .json({
                            title: 'knime validation error',
                            obj: response.error
                        });
                }

                return res
                    .status(200)
                    .json({
                        title: 'file upload and knime validation ok',
                        obj: response.raw_body
                    });
            });
    }

}

export function createController(validationService: IFormValidatorPort, autocorrectionService: IFormAutoCorrectionPort) {
    return new ValidationController(validationService, autocorrectionService);
}
