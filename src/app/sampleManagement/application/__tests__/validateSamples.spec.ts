import { getContainer } from './../../../../aspects/container/container';
import { createSample } from '../../domain/sample.entity';
import {
    FormValidatorService,
    ValidationError
} from '../../model/validation.model';
import { Sample, SampleData } from '../../../ports';
import { genericValidationErrors } from '../../../../infrastructure/persistence/__mocks__/validation-error.repository';
import { Container } from 'inversify';
import { mockPersistenceContainerModule } from '../../../../infrastructure/persistence/__mocks__/persistence-mock.module';
import { APPLICATION_TYPES } from '../../../application.types';
import { getApplicationContainerModule } from '../../../application.module';

jest.mock('./../../domain/validator.entity', () => ({
    createValidator: () => ({
        validateSample: jest.fn()
    })
}));

describe('Validate Sample Use Case', () => {
    let service: FormValidatorService;

    let genericTestSampleCollection: Sample[];
    let testSampleData: SampleData;
    let genericTestSample: Sample;
    let validationErrors: ValidationError[];
    let container: Container | null;
    beforeEach(() => {
        container = getContainer();
        container.load(
            getApplicationContainerModule({
                appName: 'test',
                jobRecipient: 'test',
                login: {
                    threshold: 0,
                    secondsDelay: 0
                },
                apiUrl: 'test',
                supportContact: 'test',
                jwtSecret: 'test',
                gdprDate: 'test'
            }),
            mockPersistenceContainerModule
        );
        service = container.get<FormValidatorService>(
            APPLICATION_TYPES.FormValidatorService
        );

        validationErrors = [...genericValidationErrors];
        testSampleData = {
            sample_id: { value: '1', errors: [], correctionOffer: [] },
            sample_id_avv: { value: '1-ABC', errors: [], correctionOffer: [] },
            pathogen_adv: {
                value: 'Escherichia coli',
                errors: [],
                correctionOffer: []
            },
            pathogen_text: { value: '', errors: [], correctionOffer: [] },
            sampling_date: {
                value: '01.02.2017',
                errors: [],
                correctionOffer: []
            },
            isolation_date: {
                value: '01.03.2017',
                errors: [],
                correctionOffer: []
            },
            sampling_location_adv: {
                value: '11000000',
                errors: [],
                correctionOffer: []
            },
            sampling_location_zip: {
                value: '10787',
                errors: [],
                correctionOffer: []
            },
            sampling_location_text: {
                value: 'Berlin',
                errors: [],
                correctionOffer: []
            },
            topic_adv: { value: '01', errors: [], correctionOffer: [] },
            matrix_adv: { value: '063502', errors: [], correctionOffer: [] },
            matrix_text: {
                value: 'Hähnchen auch tiefgefroren',
                errors: [],
                correctionOffer: []
            },
            process_state_adv: {
                value: '999',
                errors: [],
                correctionOffer: []
            },
            sampling_reason_adv: {
                value: '10',
                errors: [],
                correctionOffer: []
            },
            sampling_reason_text: {
                value: 'Planprobe',
                errors: [],
                correctionOffer: []
            },
            operations_mode_adv: {
                value: '4010000',
                errors: [],
                correctionOffer: []
            },
            operations_mode_text: {
                value: 'Lebensmitteleinzelhandel',
                errors: [],
                correctionOffer: []
            },
            vvvo: { value: '', errors: [], correctionOffer: [] },
            comment: { value: '', errors: [], correctionOffer: [] }
        };
        genericTestSample = createSample(testSampleData);
        genericTestSampleCollection = [];
    });
    afterEach(() => {
        container = null;
    });

    it('should successfully complete Happy Path with empty sampleCollection', async () => {
        expect.assertions(1);
        const result = await service.validateSamples(
            genericTestSampleCollection,
            {}
        );
        expect(result).toEqual([]);
    });

    it('should successfully complete Happy Path with single entry sample collection', async () => {
        const specificTestSampleCollection = [genericTestSample];

        expect.assertions(2);
        const result = await service.validateSamples(
            specificTestSampleCollection,
            {}
        );

        expect(result[0].getAnnotatedData()['sample_id'].errors).toEqual([]);
        expect(result[0].getAnnotatedData()['sample_id_avv'].errors).toEqual(
            []
        );
    });

    it('should not cause error because of different sample_id', async () => {
        const specificSample = { ...testSampleData };
        specificSample.sample_id = {
            value: '2',
            errors: [],
            correctionOffer: []
        };
        const secondSample = createSample(specificSample);
        const specificTestSampleCollection = [genericTestSample, secondSample];

        expect.assertions(2);
        const result = await service.validateSamples(
            specificTestSampleCollection,
            {}
        );

        expect(result[0].getAnnotatedData()['sample_id'].errors).toEqual([]);
        expect(result[0].getAnnotatedData()['sample_id_avv'].errors).toEqual(
            []
        );
    });

    it('should not cause error because of different pathogen_adv', async () => {
        const specificSample = { ...testSampleData };
        specificSample.pathogen_adv = {
            value: 'Listeria monocytogenes',
            errors: [],
            correctionOffer: []
        };
        const secondSample = createSample(specificSample);
        const specificTestSampleCollection = [genericTestSample, secondSample];

        expect.assertions(2);
        const result = await service.validateSamples(
            specificTestSampleCollection,
            {}
        );

        expect(result[0].getAnnotatedData()['sample_id'].errors).toEqual([]);
        expect(result[0].getAnnotatedData()['sample_id_avv'].errors).toEqual(
            []
        );
    });

    it('should flag an identical ID error because of identical AVV IDs', async () => {
        const sampleOne = { ...testSampleData };
        const sampleTwo = { ...testSampleData };
        sampleOne.sample_id = { value: '', errors: [], correctionOffer: [] };
        sampleTwo.sample_id = { value: '', errors: [], correctionOffer: [] };

        const firstSample = createSample(sampleOne);
        const secondSample = createSample(sampleTwo);

        const specificTestSampleCollection = [firstSample, secondSample];

        expect.assertions(2);
        const result = await service.validateSamples(
            specificTestSampleCollection,
            {}
        );

        expect(result[0].getAnnotatedData()['sample_id_avv'].errors[0]).toEqual(
            validationErrors[2]
        );
        expect(result[0].getAnnotatedData()['sample_id'].errors).toEqual([]);
    });

    it('should flag an identical ID error because of identical AVV IDs', async () => {
        const sampleOne = { ...testSampleData };
        const sampleTwo = { ...testSampleData };
        sampleOne.sample_id = { value: '5', errors: [], correctionOffer: [] };
        sampleTwo.sample_id = { value: '5', errors: [], correctionOffer: [] };

        const firstSample = createSample(sampleOne);
        const secondSample = createSample(sampleTwo);

        const specificTestSampleCollection = [firstSample, secondSample];

        expect.assertions(2);
        const result = await service.validateSamples(
            specificTestSampleCollection,
            {}
        );

        expect(result[0].getAnnotatedData()['sample_id_avv'].errors[0]).toEqual(
            validationErrors[2]
        );
        expect(result[0].getAnnotatedData()['sample_id'].errors[0]).toEqual(
            validationErrors[0]
        );
    });

    it('should not flag an identical ID error because of identical AVV IDs', async () => {
        const sampleOne = { ...testSampleData };
        const sampleTwo = { ...testSampleData };
        sampleOne.sample_id = { value: '5', errors: [], correctionOffer: [] };
        sampleTwo.sample_id = { value: '4', errors: [], correctionOffer: [] };

        const firstSample = createSample(sampleOne);
        const secondSample = createSample(sampleTwo);

        const specificTestSampleCollection = [firstSample, secondSample];

        expect.assertions(2);
        const result = await service.validateSamples(
            specificTestSampleCollection,
            {}
        );

        expect(result[0].getAnnotatedData()['sample_id_avv'].errors).toEqual(
            []
        );
        expect(result[0].getAnnotatedData()['sample_id'].errors).toEqual([]);
    });

    it('should flag an identical ID error because of identical IDs', async () => {
        const sampleOne = { ...testSampleData };
        const sampleTwo = { ...testSampleData };
        sampleOne.sample_id_avv = {
            value: '',
            errors: [],
            correctionOffer: []
        };
        sampleTwo.sample_id_avv = {
            value: '',
            errors: [],
            correctionOffer: []
        };

        const firstSample = createSample(sampleOne);
        const secondSample = createSample(sampleTwo);

        const specificTestSampleCollection = [firstSample, secondSample];

        expect.assertions(2);
        const result = await service.validateSamples(
            specificTestSampleCollection,
            {}
        );

        expect(result[0].getAnnotatedData()['sample_id'].errors[0]).toEqual(
            validationErrors[0]
        );
        expect(result[0].getAnnotatedData()['sample_id_avv'].errors).toEqual(
            []
        );
    });

    it('should flag an identical ID error with two entry sample collection', async () => {
        const identicalSample = createSample(testSampleData);
        const specificTestSampleCollection = [
            genericTestSample,
            identicalSample
        ];

        const result = await service.validateSamples(
            specificTestSampleCollection,
            {}
        );

        expect(result[0].getAnnotatedData()['sample_id'].errors[0]).toEqual(
            validationErrors[0]
        );
        expect(result[0].getAnnotatedData()['sample_id_avv'].errors[0]).toEqual(
            validationErrors[2]
        );
        expect.assertions(2);
    });
});
