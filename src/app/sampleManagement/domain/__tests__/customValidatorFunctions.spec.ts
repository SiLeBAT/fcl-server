import * as moment from 'moment';
import * as _ from 'lodash';
import {
    referenceDate,
    atLeastOneOf,
    dependentFieldEntry,
    dependentFields,
    numbersOnly,
    registeredZoMo,
    nonUniqueEntry,
    inCatalog,
    matchADVNumberOrString,
    matchesRegexPattern,
    matchesIdToSpecificYear
} from '../custom-validator-functions';
import {
    ValidationError,
    MatchADVNumberOrStringOptions
} from './../../model/validation.model';
import { CatalogService, Catalog } from '../../model/catalog.model';
jest.mock('../../../ports');

moment.locale('de');

describe('Custom Validator Functions', () => {
    let testSample: Record<string, string>;
    let validationError: ValidationError;

    beforeEach(() => {
        validationError = {
            code: 0,
            level: 1,
            message: 'TEST ERROR MESSAGE'
        };

        testSample = {
            sample_id: '1',
            sample_id_avv: '17-L-00412-1-1',
            pathogen_adv: 'Escherichia coli',
            pathogen_text: '',
            sampling_date: '01.02.2017',
            isolation_date: '01.03.2017',
            sampling_location_adv: '11000000',
            sampling_location_zip: '10787',
            sampling_location_text: 'Berlin',
            topic_adv: '01',
            matrix_adv: '063502',
            matrix_text: 'Hähnchen auch tiefgefroren',
            process_state_adv: '999',
            sampling_reason_adv: '10',
            sampling_reason_text: 'Planprobe',
            operations_mode_adv: '4010000',
            operations_mode_text: 'Lebensmitteleinzelhandel',
            vvvo: '',
            comment: ''
        };
    });

    describe('dependentFieldEntry', () => {
        it('should validate without errors', () => {
            const error = dependentFieldEntry(
                testSample.process_state_adv,
                {
                    message: validationError,
                    field: 'operations_mode_adv',
                    regex: '^4'
                },
                'process_state_adv',
                testSample
            );
            expect(error).toBe(null);
        });

        it('should validate without errors', () => {
            const error = dependentFieldEntry(
                testSample.process_state_adv,
                {
                    message: validationError,
                    field: 'operations_mode_adv',
                    regex: '^1'
                },
                'process_state_adv',
                testSample
            );
            expect(error).toBe(null);
        });

        it('should fail validation with error message', () => {
            const differentSample = {
                ...testSample,
                ...{ process_state_adv: '' }
            };
            const error = dependentFieldEntry(
                differentSample.process_state_adv,
                {
                    message: validationError,
                    field: 'operations_mode_adv',
                    regex: '^4'
                },
                'process_state_adv',
                differentSample
            );
            expect(error).toEqual(validationError);
        });

        it('should validate without errors', () => {
            const differentSample = {
                ...testSample,
                ...{ process_state_adv: '' }
            };
            const error = dependentFieldEntry(
                differentSample.process_state_adv,
                {
                    message: validationError,
                    field: 'operations_mode_adv',
                    regex: '^1'
                },
                'process_state_adv',
                differentSample
            );
            expect(error).toBe(null);
        });
    });

    describe('atLeastOneOf', () => {
        it('should validate without errors because sampling_reason_adv & sampling_reason_text present', () => {
            const error = atLeastOneOf(
                testSample.sampling_reason_adv,
                {
                    message: validationError,
                    additionalMembers: ['sampling_reason_text']
                },
                'sampling_reason_adv',
                testSample
            );
            expect(error).toBe(null);
        });

        it('should validate without errors because sampling_reason_adv present', () => {
            const error = atLeastOneOf(
                testSample.sampling_reason_adv,
                {
                    message: validationError,
                    additionalMembers: ['comment']
                },
                'sampling_reason_adv',
                testSample
            );
            expect(error).toBe(null);
        });

        it('should fail validation with error message because vvvo & comment absent', () => {
            const error = atLeastOneOf(
                testSample.vvvo,
                {
                    message: validationError,
                    additionalMembers: ['comment']
                },
                'vvvo',
                testSample
            );
            expect(error).toEqual(validationError);
        });
        it('should fail validation with error message because vvvo, comment & pathogen_text absent', () => {
            const error = atLeastOneOf(
                testSample.vvvo,
                {
                    message: validationError,
                    additionalMembers: ['comment', 'pathogen_text']
                },
                'vvvo',
                testSample
            );
            expect(error).toEqual(validationError);
        });
        it('should validate without errors because sampling_reason_adv present', () => {
            const error = atLeastOneOf(
                testSample.comment,
                {
                    message: validationError,
                    additionalMembers: ['sampling_reason_adv']
                },
                'sampling_reason_adv',
                testSample
            );
            expect(error).toBe(null);
        });
        it('should validate without errors because sampling_reason_adv present', () => {
            const error = atLeastOneOf(
                testSample.comment,
                {
                    message: validationError,
                    additionalMembers: ['sampling_reason_adv', 'pathogen_text']
                },
                'sampling_reason_adv',
                testSample
            );
            expect(error).toBe(null);
        });
        it('should validate without errors because sampling_reason_adv present', () => {
            const error = atLeastOneOf(
                testSample.comment,
                {
                    message: validationError,
                    additionalMembers: ['pathogen_text', 'sampling_reason_adv']
                },
                'sampling_reason_adv',
                testSample
            );
            expect(error).toBe(null);
        });
    });

    describe('referenceDate', () => {
        describe('latest', () => {
            it('should validate because Isolation happened on same day as sampling', () => {
                const oldSample = {
                    ...testSample,
                    ...{
                        sampling_date: '01.02.2016',
                        isolation_date: '01.02.2016'
                    }
                };

                const error = referenceDate(
                    oldSample.sampling_date,
                    {
                        message: validationError,
                        latest: 'isolation_date'
                    },
                    'sampling_date',
                    oldSample
                );
                expect(error).toBe(null);
            });

            it('should validate because isolation happened after sampling', () => {
                const oldSample = {
                    ...testSample,
                    ...{
                        sampling_date: '01.02.2016',
                        isolation_date: '01.03.2016'
                    }
                };

                const error = referenceDate(
                    oldSample.sampling_date,
                    {
                        message: validationError,
                        latest: 'isolation_date'
                    },
                    'sampling_date',
                    oldSample
                );
                expect(error).toBe(null);
            });

            it('should not validate because Isolation happened before sampling', () => {
                const oldSample = {
                    ...testSample,
                    ...{
                        sampling_date: '01.02.2016',
                        isolation_date: '01.01.2016'
                    }
                };

                const error = referenceDate(
                    oldSample.sampling_date,
                    {
                        message: validationError,
                        latest: 'isolation_date'
                    },
                    'sampling_date',
                    oldSample
                );
                expect(error).toEqual(validationError);
            });
        });

        describe('earliest', () => {
            it('should validate because sampling happened before isolation', () => {
                const oldSample = {
                    ...testSample,
                    ...{
                        sampling_date: '01.02.2016',
                        isolation_date: '01.03.2016'
                    }
                };

                const error = referenceDate(
                    oldSample.isolation_date,
                    {
                        message: validationError,
                        earliest: 'sampling_date'
                    },
                    'isolation_date',
                    oldSample
                );
                expect(error).toBe(null);
            });

            it('should validate because sampling happened on same day as isolation', () => {
                const oldSample = {
                    ...testSample,
                    ...{
                        sampling_date: '01.02.2016',
                        isolation_date: '01.02.2016'
                    }
                };

                const error = referenceDate(
                    oldSample.isolation_date,
                    {
                        message: validationError,
                        earliest: 'sampling_date'
                    },
                    'isolation_date',
                    oldSample
                );
                expect(error).toBe(null);
            });

            it('should not validate because sampling happened after isolation', () => {
                const oldSample = {
                    ...testSample,
                    ...{
                        sampling_date: '01.02.2016',
                        isolation_date: '01.01.2016'
                    }
                };

                const error = referenceDate(
                    oldSample.isolation_date,
                    {
                        message: validationError,
                        earliest: 'sampling_date'
                    },
                    'isolation_date',
                    oldSample
                );
                expect(error).toEqual(validationError);
            });
        });

        it('should not validate', () => {
            const oldSample = {
                ...testSample,
                ...{
                    sampling_date: '01.02.2016',
                    isolation_date: '01.03.2017'
                }
            };

            const error = referenceDate(
                oldSample.sampling_date,
                {
                    message: validationError,
                    earliest: 'isolation_date',
                    modifier: {
                        value: 1,
                        unit: 'year'
                    }
                },
                'sampling_date',
                oldSample
            );
            expect(error).toEqual(validationError);
        });

        it('should not validate', () => {
            const oldSample = {
                ...testSample,
                ...{
                    sampling_date: '14.11.2006',
                    isolation_date: '15.11.2016'
                }
            };

            const error = referenceDate(
                oldSample.sampling_date,
                {
                    message: validationError,
                    earliest: 'NOW',
                    modifier: {
                        value: 10,
                        unit: 'year'
                    }
                },
                'sampling_date',
                oldSample
            );
            expect(error).toEqual(validationError);
        });
    });

    describe('dependentFields', () => {
        it('should validate without errors', () => {
            const error = dependentFields(
                testSample.sampling_location_zip,
                {
                    message: validationError,
                    dependents: ['sampling_location_text']
                },
                'sampling_location_zip',
                testSample
            );
            expect(error).toBe(null);
        });
    });

    describe('numbersOnly', () => {
        it('should validate without errors', () => {
            const error = numbersOnly(
                testSample.topic_adv,
                {
                    message: validationError
                },
                'topic_adv',
                testSample
            );
            expect(error).toBe(null);
        });
    });

    describe('registeredZoMo', () => {
        it('should validate without errors', () => {
            const zoMoSample: Record<string, string> = {
                ...testSample,
                ...{
                    sampling_reason_adv: '81',
                    sampling_reason_text: ''
                }
            };

            const fakeEntry = {
                'ADV8-Kode': '4010000',
                'ADV8-Text1': 'Milcherzeuger',
                Kodiersystem: '01',
                'ADV3-Kode': '063502',
                'ADV3-Text1': 'Mastschweine; Kot',
                Programm: 'EB4',
                Tierart: 'Mastschwein',
                Matrix: 'Kot',
                Probenahmeort: 'Erzeugerbetrieb',
                Erreger: 'EC',
                JAHR: 2017,
                'Matrix-B': 'TNShMsKo',
                ADV8_1digit: 1
            };

            // tslint:disable-next-line
            const mockCatalog: Catalog<any> = {
                getEntriesWithKeyValue: (key: string, value: string) => [
                    fakeEntry
                ],
                getUniqueEntryWithId: (id: string) => ({}),
                containsUniqueEntryWithId: (id: string) => true,
                containsEntryWithKeyValue: (key: string, value: string) => true,
                hasUniqueId: () => true,
                getUniqueId: () => '',
                getFuzzyIndex: jest.fn(),
                dump: () => []
            };

            const mockCatalogService: CatalogService = {
                getCatalog: () => mockCatalog,
                getCatalogSearchAliases: jest.fn()
            };
            const error = registeredZoMo(mockCatalogService)(
                zoMoSample.operations_mode_adv,
                {
                    message: validationError,
                    group: [
                        {
                            attr: 'operations_mode_adv',
                            code: 'ADV8-Kode'
                        },
                        {
                            attr: 'matrix_adv',
                            code: 'ADV3-Kode'
                        },
                        {
                            attr: 'topic_adv',
                            code: 'Kodiersystem'
                        }
                    ],
                    year: ['sampling_date', 'isolation_date']
                },
                'operations_mode_adv',
                zoMoSample
            );
            expect(error).toBe(null);
        });
    });

    describe('nonUniqueEntry', () => {
        it('should validate without errors', () => {
            // tslint:disable-next-line
            const mockCatalog: Catalog<any> = {
                getEntriesWithKeyValue: (key: string, value: string) => [],
                getUniqueEntryWithId: (id: string) => ({}),
                containsUniqueEntryWithId: (id: string) => true,
                containsEntryWithKeyValue: (key: string, value: string) => true,
                hasUniqueId: () => true,
                getUniqueId: () => '',
                getFuzzyIndex: jest.fn(),
                dump: () => []
            };
            const mockCatalogService: CatalogService = {
                getCatalog: () => mockCatalog,
                getCatalogSearchAliases: jest.fn()
            };
            const error = nonUniqueEntry(mockCatalogService)(
                testSample.matrix_adv,
                {
                    message: validationError,
                    catalog: 'adv3',
                    key: 'Kode',
                    differentiator: ['Kodiersystem', 'topic_adv']
                },
                'matrix_adv',
                testSample
            );
            expect(error).toBe(null);
        });

        it('should validate without errors because topic makes entry unique', () => {
            // tslint:disable-next-line
            const mockCatalog: Catalog<any> = {
                getEntriesWithKeyValue: (key: string, value: string) => [
                    {
                        Kodiersystem: '01',
                        Kode: '020301',
                        Text1: 'Test1'
                    },
                    {
                        Kodiersystem: '15',
                        Kode: '020301',
                        Text1: 'Test2'
                    }
                ],
                getUniqueEntryWithId: (id: string) => ({}),
                containsUniqueEntryWithId: (id: string) => true,
                containsEntryWithKeyValue: (key: string, value: string) => true,
                hasUniqueId: () => true,
                getUniqueId: () => '',
                getFuzzyIndex: jest.fn(),
                dump: () => []
            };
            const mockCatalogService: CatalogService = {
                getCatalog: () => mockCatalog,
                getCatalogSearchAliases: jest.fn()
            };
            const error = nonUniqueEntry(mockCatalogService)(
                testSample.matrix_adv,
                {
                    message: validationError,
                    catalog: 'adv3',
                    key: 'Kode',
                    differentiator: ['Kodiersystem', 'topic_adv']
                },
                'matrix_adv',
                testSample
            );
            expect(error).toEqual(null);
        });

        it('should not validate without errors because topic does not differentiate', () => {
            testSample.topic_adv = '12';

            // tslint:disable-next-line
            const mockCatalog: Catalog<any> = {
                getEntriesWithKeyValue: (key: string, value: string) => [
                    {
                        Kodiersystem: '01',
                        Kode: '020301',
                        Text1: 'Test1'
                    },
                    {
                        Kodiersystem: '15',
                        Kode: '020301',
                        Text1: 'Test2'
                    }
                ],
                getUniqueEntryWithId: (id: string) => ({}),
                containsUniqueEntryWithId: (id: string) => true,
                containsEntryWithKeyValue: (key: string, value: string) => true,
                hasUniqueId: () => true,
                getUniqueId: () => '',
                getFuzzyIndex: jest.fn(),
                dump: () => []
            };
            const mockCatalogService: CatalogService = {
                getCatalog: () => mockCatalog,
                getCatalogSearchAliases: jest.fn()
            };
            const error = nonUniqueEntry(mockCatalogService)(
                testSample.matrix_adv,
                {
                    message: validationError,
                    catalog: 'adv3',
                    key: 'Kode',
                    differentiator: ['Kodiersystem', 'topic_adv']
                },
                'matrix_adv',
                testSample
            );
            const amendedError = { ...validationError };
            amendedError.message =
                amendedError.message +
                " Entweder '01' für 'Test1' oder '15' für 'Test2'.";
            expect(error).toEqual(amendedError);
        });

        it('should not validate without errors because of missing Topic', () => {
            testSample.topic_adv = '';

            // tslint:disable-next-line
            const mockCatalog: Catalog<any> = {
                getEntriesWithKeyValue: (key: string, value: string) => [
                    {
                        Kodiersystem: '01',
                        Kode: '020301',
                        Text1: 'Test1'
                    },
                    {
                        Kodiersystem: '15',
                        Kode: '020301',
                        Text1: 'Test2'
                    }
                ],
                getUniqueEntryWithId: (id: string) => ({}),
                containsUniqueEntryWithId: (id: string) => true,
                containsEntryWithKeyValue: (key: string, value: string) => true,
                hasUniqueId: () => true,
                getUniqueId: () => '',
                getFuzzyIndex: jest.fn(),
                dump: () => []
            };
            const mockCatalogService: CatalogService = {
                getCatalog: () => mockCatalog,
                getCatalogSearchAliases: jest.fn()
            };
            const error = nonUniqueEntry(mockCatalogService)(
                testSample.matrix_adv,
                {
                    message: validationError,
                    catalog: 'adv3',
                    key: 'Kode',
                    differentiator: ['Kodiersystem', 'topic_adv']
                },
                'matrix_adv',
                testSample
            );
            const amendedError = { ...validationError };
            amendedError.message =
                amendedError.message +
                " Entweder '01' für 'Test1' oder '15' für 'Test2'.";
            expect(error).toEqual(amendedError);
        });
    });

    describe('inCatalog', () => {
        // tslint:disable-next-line
        let mockCatalog: Catalog<any>;
        let mockCatalogService: CatalogService;

        beforeEach(() => {
            mockCatalog = {
                getEntriesWithKeyValue: (key: string, value: string) => [],
                getUniqueEntryWithId: (id: string) => ({}),
                containsUniqueEntryWithId: (id: string) => true,
                containsEntryWithKeyValue: (key: string, value: string) => true,
                hasUniqueId: () => true,
                getUniqueId: () => '',
                getFuzzyIndex: jest.fn(),
                dump: () => []
            };
            mockCatalogService = {
                getCatalog: () => mockCatalog,
                getCatalogSearchAliases: jest.fn()
            };
        });

        it('should validate without errors', () => {
            const error = inCatalog(mockCatalogService)(
                testSample.matrix_adv,
                {
                    message: validationError,
                    catalog: 'adv3',
                    key: 'Kode'
                },
                'matrix_adv',
                testSample
            );
            expect(error).toBe(null);
        });

        it('should not validate because entry 62 is not in ADV12', () => {
            testSample.process_state_adv = '62';
            mockCatalog.containsEntryWithKeyValue = (
                key: string,
                value: string
            ) => false;
            const error = inCatalog(mockCatalogService)(
                testSample.process_state_adv,
                {
                    message: validationError,
                    catalog: 'adv12',
                    key: 'Kode'
                },
                'process_state_adv',
                testSample
            );
            expect(error).toEqual(validationError);
        });
    });

    describe('matchADVNumberOrString', () => {
        // tslint:disable-next-line
        let mockCatalog: Catalog<any>;
        let mockCatalogService: CatalogService;

        beforeEach(() => {
            // tslint:disable-next-line
            mockCatalog = {
                getEntriesWithKeyValue: (key: string, value: string) => [],
                getUniqueEntryWithId: (id: string) => ({}),
                containsUniqueEntryWithId: (id: string) => true,
                containsEntryWithKeyValue: (key: string, value: string) => {
                    switch (value) {
                        case '1234567':
                            return true;
                        case 'Escherichia coli':
                            return true;
                        default:
                            return false;
                    }
                },
                hasUniqueId: () => true,
                getUniqueId: () => '',
                getFuzzyIndex: jest.fn(),
                dump: () => []
            };

            mockCatalogService = {
                getCatalog: () => mockCatalog,
                getCatalogSearchAliases: jest.fn()
            };
        });

        it('should validate without errors', () => {
            testSample.pathogen_adv = '';
            const error = matchADVNumberOrString(mockCatalogService)(
                testSample.pathogen_adv,
                {
                    message: validationError,
                    catalog: 'adv16',
                    key: 'Kode',
                    alternateKeys: ['Text1']
                } as MatchADVNumberOrStringOptions,
                'pathogen_adv',
                testSample
            );
            expect(error).toBe(null);
        });

        it('should not validate because entry 62 is not in ADV16', () => {
            testSample.pathogen_adv = '62';

            const error = matchADVNumberOrString(mockCatalogService)(
                testSample.pathogen_adv,
                {
                    message: validationError,
                    catalog: 'adv16',
                    key: 'Kode',
                    alternateKeys: ['Text1']
                } as MatchADVNumberOrStringOptions,
                'pathogen_adv',
                testSample
            );
            expect(error).toEqual(validationError);
        });

        it('should validate because entry 1234567 is in ADV16', () => {
            testSample.pathogen_adv = '1234567';

            const error = matchADVNumberOrString(mockCatalogService)(
                testSample.pathogen_adv,
                {
                    message: validationError,
                    catalog: 'adv16',
                    key: 'Kode',
                    alternateKeys: ['Text1']
                } as MatchADVNumberOrStringOptions,
                'pathogen_adv',
                testSample
            );
            expect(error).toEqual(null);
        });

        it('should validate because entry 1234567 is in ADV16 and value is trimmed', () => {
            testSample.pathogen_adv = '    1234567    ';

            const error = matchADVNumberOrString(mockCatalogService)(
                testSample.pathogen_adv,
                {
                    message: validationError,
                    catalog: 'adv16',
                    key: 'Kode',
                    alternateKeys: ['Text1']
                } as MatchADVNumberOrStringOptions,
                'pathogen_adv',
                testSample
            );
            expect(error).toEqual(null);
        });

        it('should validate because entry Escherichia coli is in ADV16 and value is trimmed', () => {
            testSample.pathogen_adv = '    Escherichia coli    ';

            const error = matchADVNumberOrString(mockCatalogService)(
                testSample.pathogen_adv,
                {
                    message: validationError,
                    catalog: 'adv16',
                    key: 'Kode',
                    alternateKeys: ['Text1']
                } as MatchADVNumberOrStringOptions,
                'pathogen_adv',
                testSample
            );
            expect(error).toEqual(null);
        });

        it('should not validate because entry 1234  567 contains spaces', () => {
            testSample.pathogen_adv = '1234  567';

            const error = matchADVNumberOrString(mockCatalogService)(
                testSample.pathogen_adv,
                {
                    message: validationError,
                    catalog: 'adv16',
                    key: 'Kode',
                    alternateKeys: ['Text1']
                } as MatchADVNumberOrStringOptions,
                'pathogen_adv',
                testSample
            );
            expect(error).toEqual(validationError);
        });
    });

    describe('matchesRegexPattern', () => {
        it('should validate without errors', () => {
            const error = matchesRegexPattern(
                testSample.sample_id_avv,
                {
                    message: validationError,
                    regex: ['^17-[LF]-[0-9]{5}-[0-9]-[0-9]$'],
                    ignoreNumbers: false
                },
                'sample_id_avv',
                testSample
            );
            expect(error).toBe(null);
        });

        it('should validate list without errors', () => {
            const stateFormats: { [key: string]: string[] } = {
                BW: ['^17[0-9]{7}$', '^17/[0-9]{5}[.-][0-9]$'],
                BY: ['^17-[0-9]{7}-[0-9]{3}$', '^17-[0-9]{7}$'],
                BE: [
                    '^17-(W|TW|CMO|T|UKF)-[0-9]{1,4}$',
                    '^17[0-9]{5}(MK|T|CMO|TK)( *)[0-9]{1,4}$'
                ],
                BB: [
                    '^17-(UKF|T|FA|W|CMO)-[0-9]{2,4}$',
                    '^17[0-9]{5}(MK|UKF|UWF|MI|T|CMO|L|MM)( *)[0-9]{1,4}$'
                ],
                HB: ['^[0-9]{5,7}17[0-9]{4,5}$'],
                HH: ['^17-[LF]-[0-9]{5}-[0-9]-[0-9]$'],
                HE: ['^17[0-9]{7}$'],
                MV: ['^17[A-Za-z]{2,4}[0-9]{4}-[0-9]{2,3}$'],
                NI: ['^[0-9]{4,5}17[0-9]{4,6}$'],
                NW: [
                    '^2017-[0-9]{7}$',
                    '^2017(MEL|OWL|RRW|WFL)[0-9]{6}$',
                    '^[0-9]{5}$',
                    '^(D)[0-9]{2,4}$',
                    '^(D)[0-9]{3,4}-[0-9]{2,4}$',
                    '^(K)( *)[0-9]{3,4}$',
                    '^(D)( *)[0-9]{4}-[0-9]{2,4}$'
                ],
                RP: ['^2017-[0-9]{8}$'],
                SL: ['^L-2017-[0-9]{5}$'],
                ST: ['^17[0-9]{9}$', '^[0-9]{3}-[0-9]{2}-[0-9]{3}-17$'],
                SH: ['^[NF]17[0-9]{6}-[0-9]{3}$'],
                SN: [
                    '^L/2017/[0-9]{5,6}$',
                    '^V[L|D]-2017/[0-9]{5}$',
                    '^17(B|L)[0-9]{3}$'
                ],
                TH: ['^B-2017/[0-9]{4,5}$', '^[0-9]{4,5}17$']
            };

            const data = require('./AVVExamples.json');

            _.forEach(data, (exampleAVVs: string[], state: string) => {
                exampleAVVs.forEach(avv => {
                    _.forEach(stateFormats, (regex: string[], st: string) => {
                        const error = matchesRegexPattern(
                            avv,
                            {
                                message: validationError,
                                regex: regex,
                                ignoreNumbers: false
                            },
                            'sample_id_avv',
                            testSample
                        );
                        if (state === st) {
                            expect(error).toBe(null);
                        }
                    });
                });
            });
        });

        it('should validate without errors because it ignores numbers', () => {
            const mySample = { ...testSample };
            mySample.sample_id_avv = '121111112';
            const error = matchesRegexPattern(
                mySample.sample_id_avv,
                {
                    message: validationError,
                    regex: ['^17-[LF]-[0-9]{5}-[0-9]-[0-9]$'],
                    ignoreNumbers: true
                },
                'sample_id_avv',
                mySample
            );
            expect(error).toBe(null);
        });

        it('should give validation error because it does not ignore numbers', () => {
            const mySample = { ...testSample };
            mySample.sample_id_avv = '121111112';
            const error = matchesRegexPattern(
                mySample.sample_id_avv,
                {
                    message: validationError,
                    regex: ['^17-[LF]-[0-9]{5}-[0-9]-[0-9]$'],
                    ignoreNumbers: false
                },
                'sample_id_avv',
                mySample
            );
            expect(error).toEqual(validationError);
        });

        it('should give validation error because this is not a number', () => {
            const mySample = { ...testSample };
            mySample.sample_id_avv = 'A21111112';
            const error = matchesRegexPattern(
                mySample.sample_id_avv,
                {
                    message: validationError,
                    regex: ['^17-[LF]-[0-9]{5}-[0-9]-[0-9]$'],
                    ignoreNumbers: true
                },
                'sample_id_avv',
                mySample
            );
            expect(error).toEqual(validationError);
        });
    });

    describe('matchesIdToSpecificYear', () => {
        it('should validate without errors because it is the correct date', () => {
            const mySample = { ...testSample };
            mySample.sample_id_avv = '17-L-12345-3-2';
            mySample.sampling_date = '24.12.2017';
            const error = matchesIdToSpecificYear(
                testSample.sample_id_avv,
                {
                    message: validationError,
                    regex: ['^yy-[LF]-[0-9]{5}-[0-9]-[0-9]$']
                },
                'sample_id_avv',
                mySample
            );
            expect(error).toBe(null);
        });

        it('should validate without errors because it is 1 year in the past', () => {
            const mySample = { ...testSample };
            mySample.sample_id_avv = '17-L-12345-3-2';
            mySample.sampling_date = '24.12.2016';
            const error = matchesIdToSpecificYear(
                testSample.sample_id_avv,
                {
                    message: validationError,
                    regex: ['^yy-[LF]-[0-9]{5}-[0-9]-[0-9]$']
                },
                'sample_id_avv',
                mySample
            );
            expect(error).toBe(null);
        });

        it('should validate without errors because it is 1 year in the future', () => {
            const mySample = { ...testSample };
            mySample.sample_id_avv = '17-L-12345-3-2';
            mySample.sampling_date = '24.12.2018';
            const error = matchesIdToSpecificYear(
                testSample.sample_id_avv,
                {
                    message: validationError,
                    regex: ['^yy-[LF]-[0-9]{5}-[0-9]-[0-9]$']
                },
                'sample_id_avv',
                mySample
            );
            expect(error).toBe(null);
        });

        it('should give validation errors because it is 2 year in the past', () => {
            const mySample = { ...testSample };
            mySample.sample_id_avv = '17-L-12345-3-2';
            mySample.sampling_date = '24.12.2015';
            const error = matchesIdToSpecificYear(
                testSample.sample_id_avv,
                {
                    message: validationError,
                    regex: ['^yy-[LF]-[0-9]{5}-[0-9]-[0-9]$']
                },
                'sample_id_avv',
                mySample
            );
            expect(error).toEqual(validationError);
        });

        it('should give validation errors because it is 2 year in the future', () => {
            const mySample = { ...testSample };
            mySample.sample_id_avv = '17-L-12345-3-2';
            mySample.sampling_date = '24.12.2019';
            const error = matchesIdToSpecificYear(
                testSample.sample_id_avv,
                {
                    message: validationError,
                    regex: ['^yy-[LF]-[0-9]{5}-[0-9]-[0-9]$']
                },
                'sample_id_avv',
                mySample
            );
            expect(error).toEqual(validationError);
        });
    });
});
