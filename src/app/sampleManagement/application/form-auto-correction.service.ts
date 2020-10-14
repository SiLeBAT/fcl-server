import * as _ from 'lodash';
import { logger } from '../../../aspects';
import {
    autoCorrectADV16,
    autoCorrectADV9,
    autoCorrectADV8,
    autoCorrectADV12,
    autoCorrectADV3,
    autoCorrectADV2
} from '../domain/custom-auto-correction-functions';
import {
    CorrectionFunction,
    FormAutoCorrectionService,
    CorrectionSuggestions
} from '../model/autocorrection.model';
import { CatalogService } from '../model/catalog.model';
import { ValidationErrorProvider } from '../model/validation.model';
import { Sample, SampleData } from '../model/sample.model';
import { injectable, inject } from 'inversify';
import { APPLICATION_TYPES } from './../../application.types';

@injectable()
export class DefaultFormAutoCorrectionService
    implements FormAutoCorrectionService {
    private correctionFunctions: CorrectionFunction[] = [];

    constructor(
        @inject(APPLICATION_TYPES.CatalogService)
        private catalogService: CatalogService,
        @inject(APPLICATION_TYPES.ValidationErrorProvider)
        private validationErrorProvider: ValidationErrorProvider
    ) {
        this.registerCorrectionFunctions();
    }

    async applyAutoCorrection(sampleCollection: Sample[]): Promise<Sample[]> {
        logger.verbose(
            `${this.constructor.name}.${this.applyAutoCorrection.name}, starting Sample autoCorrection`
        );

        let results = sampleCollection.map(sample => {
            const newSample: Sample = sample.clone();
            const sampleData: SampleData = newSample.getAnnotatedData();
            this.correctionFunctions.forEach(fn => {
                const correction: CorrectionSuggestions | null = fn(sampleData);
                if (correction) {
                    newSample.addCorrectionTo(
                        '' + correction.field,
                        correction.correctionOffer
                    );
                    if (correction.code) {
                        const err = this.validationErrorProvider.getError(
                            correction.code
                        );
                        newSample.addErrorTo('' + correction.field, err);
                    }
                    newSample.clearSingleCorrectionSuggestions();
                }
            });
            return newSample;
        });
        logger.info(
            `${this.constructor.name}.${this.applyAutoCorrection.name}, finishing Sample autoCorrection`
        );
        return results;
    }

    private registerCorrectionFunctions() {
        this.correctionFunctions.push(autoCorrectADV16(this.catalogService));
        this.correctionFunctions.push(autoCorrectADV9(this.catalogService));
        this.correctionFunctions.push(autoCorrectADV8(this.catalogService));
        this.correctionFunctions.push(autoCorrectADV3(this.catalogService));
        this.correctionFunctions.push(autoCorrectADV12(this.catalogService));
        this.correctionFunctions.push(autoCorrectADV2(this.catalogService));
    }
}
