import * as _ from 'lodash';
import { logger } from '../../../aspects';
import {
    FormValidatorService,
    Validator,
    AVVFormatProvider,
    ValidationErrorProvider,
    NRLSelectorProvider,
    ValidationOptions,
    ValidationConstraints,
    ValidationRuleSet,
    ValidationRule
} from '../model/validation.model';
import { CatalogService } from '../model/catalog.model';
import { createValidator } from '../domain/validator.entity';
import { Sample } from '../model/sample.model';
import {
    baseConstraints,
    zoMoConstraints,
    standardConstraints
} from '../domain/validation-constraints';
import { injectable, inject } from 'inversify';
import { APPLICATION_TYPES } from './../../application.types';
import { NotValidatedIdError } from '../domain/domain.error';

enum ConstraintSet {
    STANDARD = 'standard',
    ZOMO = 'ZoMo'
}

@injectable()
export class DefaultFormValidatorService implements FormValidatorService {
    private validator: Validator;

    constructor(
        @inject(APPLICATION_TYPES.CatalogService)
        private catalogService: CatalogService,
        @inject(APPLICATION_TYPES.AVVFormatProvider)
        private avvFormatProvider: AVVFormatProvider,
        @inject(APPLICATION_TYPES.ValidationErrorProvider)
        private validationErrorProvider: ValidationErrorProvider,
        @inject(APPLICATION_TYPES.NRLSelectorProvider)
        private nrlSelectorProvider: NRLSelectorProvider
    ) {
        this.validator = createValidator({
            dateFormat: 'DD-MM-YYYY',
            dateTimeFormat: 'DD-MM-YYYY hh:mm:ss',
            catalogService: this.catalogService
        });
    }

    async validateSamples(
        sampleCollection: Sample[],
        validationOptions: ValidationOptions
    ): Promise<Sample[]> {
        logger.verbose(
            `${this.constructor.name}.${this.validateSamples.name}, starting Sample validation`
        );

        let results = this.validateIndividualSamples(
            sampleCollection,
            validationOptions
        );
        if (results.length > 1) {
            results = this.validateSamplesBatch(results);
        }

        logger.info(
            `${this.constructor.name}.${this.validateSamples.name}, finishing Sample validation`
        );
        sampleCollection = results;
        return sampleCollection;
    }

    private validateIndividualSamples(
        samples: Sample[],
        validationOptions: ValidationOptions
    ): Sample[] {
        return samples.map(sample => {
            const constraintSet = sample.isZoMo()
                ? this.getConstraints(ConstraintSet.ZOMO, validationOptions)
                : this.getConstraints(
                      ConstraintSet.STANDARD,
                      validationOptions
                  );
            const validationErrors = this.validator.validateSample(
                sample,
                constraintSet
            );
            sample.addErrors(validationErrors);
            return sample;
        });
    }

    private validateSamplesBatch(samples: Sample[]): Sample[] {
        const checkedForDuplicateIds = this.checkForDuplicateIdEntries(
            samples,
            'pathogenId'
        );
        return this.checkForDuplicateIdEntries(
            checkedForDuplicateIds,
            'pathogenIdAVV'
        );
    }

    private checkForDuplicateIdEntries(
        samples: Sample[],
        uniqueId: keyof Sample
    ): Sample[] {
        const config = this.getUniqueIdErrorConfig(uniqueId);

        const pathogenArrayIdDuplicates = this.getDuplicateEntries(
            samples,
            uniqueId
        );

        _.filter(samples, sample =>
            _.includes(pathogenArrayIdDuplicates, sample[uniqueId])
        ).forEach(e => {
            e.addErrorTo(
                config.sampleId,
                this.validationErrorProvider.getError(config.error)
            );
        });

        return [...samples];
    }

    private getDuplicateEntries(samples: Sample[], uniqueId: keyof Sample) {
        const pathogenArrayId = samples
            .map(sample => sample[uniqueId])
            .filter(x => x);
        return _.filter(pathogenArrayId, function(value, index, iteratee) {
            return _.includes(iteratee, value, index + 1);
        });
    }

    private getUniqueIdErrorConfig(uniqueId: string) {
        switch (uniqueId) {
            case 'pathogenId':
                return {
                    sampleId: 'sample_id',
                    error: 3
                };
            case 'pathogenIdAVV':
                return {
                    sampleId: 'sample_id_avv',
                    error: 6
                };
            default:
                throw new NotValidatedIdError(
                    `Invalid Input: This unique ID is not validated uniqueId=${uniqueId}`
                );
        }
    }

    private getConstraints(set: ConstraintSet, options: ValidationOptions) {
        let newConstraints: ValidationConstraints =
            _.cloneDeep(baseConstraints) || {};

        switch (set) {
            case ConstraintSet.ZOMO:
                _.forEach(newConstraints, (value: ValidationRuleSet, key) => {
                    if (zoMoConstraints.hasOwnProperty(key)) {
                        newConstraints[key] = {
                            ...value,
                            ...zoMoConstraints[key]
                        };
                    }
                });
                break;
            case ConstraintSet.STANDARD:
            default:
                _.forEach(newConstraints, (value: ValidationRuleSet, key) => {
                    if (standardConstraints.hasOwnProperty(key)) {
                        newConstraints[key] = {
                            ...value,
                            ...standardConstraints[key]
                        };
                    }
                });
        }

        newConstraints = this.setStateSpecificConstraints(
            newConstraints,
            options
        );
        newConstraints = this.setNRLConstraints(newConstraints, options);

        _.forEach(newConstraints, (v: ValidationRuleSet, k) => {
            _.forEach(v, (v2: ValidationRule, k2) => {
                v2['message'] = this.validationErrorProvider.getError(
                    v2['error']
                );
            });
        });
        return newConstraints;
    }

    private setStateSpecificConstraints(
        newConstraints: ValidationConstraints,
        options: ValidationOptions
    ): ValidationConstraints {
        if (
            newConstraints['sample_id_avv'] &&
            newConstraints['sample_id_avv']['matchesIdToSpecificYear']
        ) {
            // Necessary because of Ticket #49
            newConstraints['sample_id_avv'][
                'matchesIdToSpecificYear'
            ].regex = this.avvFormatProvider.getFormat(options.state);
        }
        return { ...newConstraints };
    }

    private setNRLConstraints(
        newConstraints: ValidationConstraints,
        options: ValidationOptions
    ): ValidationConstraints {
        if (
            newConstraints['pathogen_adv'] &&
            newConstraints['pathogen_adv']['matchesRegexPattern']
        ) {
            // Necessary because of Ticket #54
            newConstraints['pathogen_adv'][
                'matchesRegexPattern'
            ].regex = this.nrlSelectorProvider.getSelectors(options.nrl);
        }
        switch (options.nrl) {
            case 'NRL-AR':
                newConstraints['sampling_reason_adv'] =
                    newConstraints['sampling_reason_adv'] || {};
                newConstraints['sampling_reason_adv']['exclusion'] = {
                    error: 95,
                    within: [10, '10', 'Planprobe']
                };
                newConstraints['sampling_reason_text'] =
                    newConstraints['sampling_reason_text'] || {};
                newConstraints['sampling_reason_text']['exclusion'] = {
                    error: 95,
                    within: [10, 'Planprobe', '10']
                };
                break;
            default:
        }
        return { ...newConstraints };
    }
}
