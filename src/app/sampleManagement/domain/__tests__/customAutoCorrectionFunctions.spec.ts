import * as _ from 'lodash';
import * as Fuse from 'fuse.js';
import {
    autoCorrectADV16,
    autoCorrectADV8,
    autoCorrectADV9,
    autoCorrectADV3,
    autoCorrectADV12,
    autoCorrectADV2
} from '../custom-auto-correction-functions';
import { CorrectionFunction } from '../../model/autocorrection.model';
import { SampleData } from '../../model/sample.model';
jest.mock('../../../core/application/configuration.service');

describe('Custom Auto-correction Functions', () => {
    const genericSampleData: SampleData = {
        sample_id: { value: '1', errors: [], correctionOffer: [] },
        sample_id_avv: { value: '1-ABC', errors: [], correctionOffer: [] },
        pathogen_adv: {
            value: 'Escherichia coli',
            errors: [],
            correctionOffer: []
        },
        pathogen_text: { value: '', errors: [], correctionOffer: [] },
        sampling_date: { value: '01.02.2017', errors: [], correctionOffer: [] },
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
        process_state_adv: { value: '999', errors: [], correctionOffer: [] },
        sampling_reason_adv: { value: '10', errors: [], correctionOffer: [] },
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
    describe('autoCorrectADV16', () => {
        // tslint:disable-next-line
        let mockCatalogService: any;

        beforeEach(() => {
            let mockADVEntries = [
                {
                    Kode: '0801001',
                    'P-Code3': 'Escherichia coli',
                    Text1: 'Escherichia coli'
                },
                {
                    Kode: '0803326',
                    'P-Code3': 'S.Colindale',
                    Text1: 'Salmonella Colindale'
                },
                {
                    Kode: '0803502',
                    'P-Code3': 'S.Dublin',
                    Text1: 'Salmonella Dublin'
                },
                {
                    Kode: '0801014',
                    'P-Code3': '',
                    Text1: 'Escherichia coli Carbapenemase-bildend'
                }
            ];

            mockCatalogService = {
                getCatalog: jest.fn(() => {
                    return {
                        dump: () => mockADVEntries,
                        getFuzzyIndex: (options: Fuse.FuseOptions) =>
                            new Fuse(mockADVEntries, options),
                        containsEntryWithKeyValue: (k: string, v: string) =>
                            // @ts-ignore
                            !!_.filter(mockADVEntries, e => e[k] === v)[0],
                        containsUniqueEntryWithId: (v: string) =>
                            // @ts-ignore
                            !!_.filter(mockADVEntries, e => e['Kode'] === v)[0],
                        getUniqueEntryWithId: (v: string) =>
                            // @ts-ignore
                            _.filter(mockADVEntries, e => e['Kode'] === v)[0]
                    };
                }),
                getCatalogSearchAliases: () => []
            };
        });

        it('should not attempt to correct string Escherichia coli in pathogen_adv', () => {
            const specificSampleData = {
                ...genericSampleData
            };

            const correctionFunction: CorrectionFunction = autoCorrectADV16(
                mockCatalogService
            );

            const autoCorrection = correctionFunction(specificSampleData);
            expect(autoCorrection).toEqual(null);
        });

        it('should successfully autocorrect Escherigia coli in pathogen_adv', () => {
            const specificSampleData = {
                ...genericSampleData,
                ...{
                    pathogen_adv: {
                        value: 'Escherigia coli',
                        errors: [],
                        correctionOffer: []
                    }
                }
            };

            const correctionFunction: CorrectionFunction = autoCorrectADV16(
                mockCatalogService
            );

            const autoCorrection = correctionFunction(specificSampleData);
            expect(autoCorrection).toEqual({
                field: 'pathogen_adv',
                original: 'Escherigia coli',
                correctionOffer: [
                    'Escherichia coli',
                    'Escherichia coli Carbapenemase-bildend'
                ],
                code: 0
            });
        });

        it('should offer corrections for 801014 in pathogen_adv', () => {
            const specificSampleData = {
                ...genericSampleData,
                ...{
                    pathogen_adv: {
                        value: '801014',
                        errors: [],
                        correctionOffer: []
                    }
                }
            };

            const correctionFunction: CorrectionFunction = autoCorrectADV16(
                mockCatalogService
            );

            const autoCorrection = correctionFunction(specificSampleData);
            expect(autoCorrection).toEqual({
                field: 'pathogen_adv',
                original: '801014',
                correctionOffer: ['Escherichia coli Carbapenemase-bildend'],
                code: 87
            });
        });

        it('should offer corrections for 0801014 in pathogen_adv', () => {
            const specificSampleData = {
                ...genericSampleData,
                ...{
                    pathogen_adv: {
                        value: '0801014',
                        errors: [],
                        correctionOffer: []
                    }
                }
            };

            const correctionFunction: CorrectionFunction = autoCorrectADV16(
                mockCatalogService
            );

            const autoCorrection = correctionFunction(specificSampleData);
            expect(autoCorrection).toEqual({
                field: 'pathogen_adv',
                original: '0801014',
                correctionOffer: ['Escherichia coli Carbapenemase-bildend'],
                code: 87
            });
        });

        it('should successfully offer corrections for E. coli in pathogen_adv', () => {
            const specificSampleData = {
                ...genericSampleData,
                ...{
                    pathogen_adv: {
                        value: 'E. coli',
                        errors: [],
                        correctionOffer: []
                    }
                }
            };

            const correctionFunction: CorrectionFunction = autoCorrectADV16(
                mockCatalogService
            );

            const autoCorrection = correctionFunction(specificSampleData);
            expect(autoCorrection).toEqual({
                field: 'pathogen_adv',
                original: 'E. coli',
                correctionOffer: [
                    'Escherichia coli',
                    'Salmonella Colindale',
                    'Escherichia coli Carbapenemase-bildend',
                    'Salmonella Dublin'
                ],
                code: 0
            });
        });

        it('should not attempt to correct empty string pathogen_adv', () => {
            const specificSampleData = {
                ...genericSampleData,
                ...{
                    pathogen_adv: { value: '', errors: [], correctionOffer: [] }
                }
            };

            const correctionFunction: CorrectionFunction = autoCorrectADV16(
                mockCatalogService
            );

            const autoCorrection = correctionFunction(specificSampleData);
            expect(autoCorrection).toEqual(null);
        });

        it('should not attempt to correct white space only pathogen_adv', () => {
            const specificSampleData = {
                ...genericSampleData,
                ...{
                    pathogen_adv: {
                        value: ' ',
                        errors: [],
                        correctionOffer: []
                    }
                }
            };

            const correctionFunction: CorrectionFunction = autoCorrectADV16(
                mockCatalogService
            );

            const autoCorrection = correctionFunction(specificSampleData);
            expect(autoCorrection).toEqual(null);
        });
    });

    describe('autoCorrectADV8', () => {
        // tslint:disable-next-line
        let mockCatalogService: any;

        beforeEach(() => {
            let mockADVEntries = [
                {
                    Kode: '4000000'
                },
                {
                    Kode: '4010000'
                },
                {
                    Kode: '4010100'
                },
                {
                    Kode: '4010110'
                },
                {
                    Kode: '4010120'
                }
            ];

            mockCatalogService = {
                getCatalog: jest.fn(() => {
                    return {
                        dump: () => mockADVEntries,
                        getFuzzyIndex: (options: Fuse.FuseOptions) =>
                            new Fuse(mockADVEntries, options),
                        containsEntryWithKeyValue: (k: string, v: string) =>
                            // @ts-ignore
                            !!_.filter(mockADVEntries, e => e[k] === v)[0],
                        containsUniqueEntryWithId: (v: string) =>
                            // @ts-ignore
                            !!_.filter(mockADVEntries, e => e['Kode'] === v)[0],
                        getUniqueEntryWithId: (v: string) =>
                            // @ts-ignore
                            _.filter(mockADVEntries, e => e['Kode'] === v)[0]
                    };
                }),
                getCatalogSearchAliases: () => []
            };
        });

        it('should not attempt to correct correct string 4010000 operations_mode_adv', () => {
            const specificSampleData = {
                ...genericSampleData
            };

            const correctionFunction: CorrectionFunction = autoCorrectADV8(
                mockCatalogService
            );

            const autoCorrection = correctionFunction(specificSampleData);
            expect(autoCorrection).toEqual(null);
        });

        it('should not attempt to correct empty string operations_mode_adv', () => {
            const specificSampleData = {
                ...genericSampleData,
                ...{
                    operations_mode_adv: {
                        value: '',
                        errors: [],
                        correctionOffer: []
                    }
                }
            };

            const correctionFunction: CorrectionFunction = autoCorrectADV8(
                mockCatalogService
            );

            const autoCorrection = correctionFunction(specificSampleData);
            expect(autoCorrection).toEqual(null);
        });

        it('should attempt to correct incorrect string 40xxxxx operations_mode_adv', () => {
            const specificSampleData = {
                ...genericSampleData,
                ...{
                    operations_mode_adv: {
                        value: '40xxxxx',
                        errors: [],
                        correctionOffer: []
                    }
                }
            };

            const correctionFunction: CorrectionFunction = autoCorrectADV8(
                mockCatalogService
            );

            const autoCorrection = correctionFunction(specificSampleData);
            expect(autoCorrection).toEqual({
                code: 90,
                correctionOffer: ['4000000'],
                field: 'operations_mode_adv',
                original: '40xxxxx'
            });
        });

        it('should attempt to correct incorrect string 4010xxx operations_mode_adv', () => {
            const specificSampleData = {
                ...genericSampleData,
                ...{
                    operations_mode_adv: {
                        value: '4010xxx',
                        errors: [],
                        correctionOffer: []
                    }
                }
            };

            const correctionFunction: CorrectionFunction = autoCorrectADV8(
                mockCatalogService
            );

            const autoCorrection = correctionFunction(specificSampleData);
            expect(autoCorrection).toEqual({
                code: 90,
                correctionOffer: ['4010000'],
                field: 'operations_mode_adv',
                original: '4010xxx'
            });
        });

        it('should attempt to correct incorrect string 401xxxx operations_mode_adv', () => {
            const specificSampleData = {
                ...genericSampleData,
                ...{
                    operations_mode_adv: {
                        value: '401xxxx',
                        errors: [],
                        correctionOffer: []
                    }
                }
            };

            const correctionFunction: CorrectionFunction = autoCorrectADV8(
                mockCatalogService
            );

            const autoCorrection = correctionFunction(specificSampleData);
            expect(autoCorrection).toEqual({
                code: 90,
                correctionOffer: ['4010000'],
                field: 'operations_mode_adv',
                original: '401xxxx'
            });
        });

        it('should attempt to correct incorrect string 4xxxxxx operations_mode_adv', () => {
            const specificSampleData = {
                ...genericSampleData,
                ...{
                    operations_mode_adv: {
                        value: '4xxxxxx',
                        errors: [],
                        correctionOffer: []
                    }
                }
            };

            const correctionFunction: CorrectionFunction = autoCorrectADV8(
                mockCatalogService
            );

            const autoCorrection = correctionFunction(specificSampleData);
            expect(autoCorrection).toEqual({
                code: 90,
                correctionOffer: ['4000000'],
                field: 'operations_mode_adv',
                original: '4xxxxxx'
            });
        });
    });

    describe('autoCorrectADV9', () => {
        // tslint:disable-next-line
        let mockCatalogService: any;

        beforeEach(() => {
            let mockADVEntries = [
                {
                    Kode: '11000000'
                },
                {
                    Kode: '01051032'
                },
                {
                    Kode: '11000'
                }
            ];

            mockCatalogService = {
                getCatalog: jest.fn(() => {
                    return {
                        dump: () => mockADVEntries,
                        getFuzzyIndex: (options: Fuse.FuseOptions) =>
                            new Fuse(mockADVEntries, options),
                        containsEntryWithKeyValue: (k: string, v: string) =>
                            // @ts-ignore
                            !!_.filter(mockADVEntries, e => e[k] === v)[0],
                        containsUniqueEntryWithId: (v: string) =>
                            // @ts-ignore
                            !!_.filter(mockADVEntries, e => e['Kode'] === v)[0],
                        getUniqueEntryWithId: (v: string) =>
                            // @ts-ignore
                            _.filter(mockADVEntries, e => e['Kode'] === v)[0]
                    };
                }),
                getCatalogSearchAliases: () => []
            };
        });

        it('should not attempt to correct correct string 11000000 sampling_location_adv', () => {
            const specificSampleData = {
                ...genericSampleData
            };

            const correctionFunction: CorrectionFunction = autoCorrectADV9(
                mockCatalogService
            );

            const autoCorrection = correctionFunction(specificSampleData);
            expect(autoCorrection).toEqual(null);
        });

        it('should not attempt to correct empty string sampling_location_adv', () => {
            const specificSampleData = {
                ...genericSampleData,
                ...{
                    sampling_location_adv: {
                        value: '',
                        errors: [],
                        correctionOffer: []
                    }
                }
            };

            const correctionFunction: CorrectionFunction = autoCorrectADV9(
                mockCatalogService
            );

            const autoCorrection = correctionFunction(specificSampleData);
            expect(autoCorrection).toEqual(null);
        });

        it('should not attempt to correct string 01051032 sampling_location_adv', () => {
            const specificSampleData = {
                ...genericSampleData,
                ...{
                    sampling_location_adv: {
                        value: '01051032',
                        errors: [],
                        correctionOffer: []
                    }
                }
            };

            const correctionFunction: CorrectionFunction = autoCorrectADV9(
                mockCatalogService
            );

            const autoCorrection = correctionFunction(specificSampleData);
            expect(autoCorrection).toEqual(null);
        });

        it('should attempt to correct incorrect string 1051032 sampling_location_adv', () => {
            const specificSampleData = {
                ...genericSampleData,
                ...{
                    sampling_location_adv: {
                        value: '1051032',
                        errors: [],
                        correctionOffer: []
                    }
                }
            };

            const correctionFunction: CorrectionFunction = autoCorrectADV9(
                mockCatalogService
            );

            const autoCorrection = correctionFunction(specificSampleData);
            expect(autoCorrection).toEqual({
                code: 89,
                correctionOffer: ['01051032'],
                field: 'sampling_location_adv',
                original: '1051032'
            });
        });

        it('should attempt to correct incorrect string 11000xxx sampling_location_adv', () => {
            const specificSampleData = {
                ...genericSampleData,
                ...{
                    sampling_location_adv: {
                        value: '11000xxx',
                        errors: [],
                        correctionOffer: []
                    }
                }
            };

            const correctionFunction: CorrectionFunction = autoCorrectADV9(
                mockCatalogService
            );

            const autoCorrection = correctionFunction(specificSampleData);
            expect(autoCorrection).toEqual({
                code: 89,
                correctionOffer: ['11000'],
                field: 'sampling_location_adv',
                original: '11000xxx'
            });
        });
    });

    describe('autoCorrectADV3', () => {
        // tslint:disable-next-line
        let mockCatalogService: any;

        beforeEach(() => {
            let mockADVEntries = [
                {
                    Kode: '063502'
                }
            ];

            mockCatalogService = {
                getCatalog: jest.fn(() => {
                    return {
                        dump: () => mockADVEntries,
                        getFuzzyIndex: (options: Fuse.FuseOptions) =>
                            new Fuse(mockADVEntries, options),
                        containsEntryWithKeyValue: (k: string, v: string) =>
                            // @ts-ignore
                            !!_.filter(mockADVEntries, e => e[k] === v)[0],
                        containsUniqueEntryWithId: (v: string) =>
                            // @ts-ignore
                            !!_.filter(mockADVEntries, e => e['Kode'] === v)[0],
                        getUniqueEntryWithId: (v: string) =>
                            // @ts-ignore
                            _.filter(mockADVEntries, e => e['Kode'] === v)[0]
                    };
                }),
                getCatalogSearchAliases: () => []
            };
        });

        it('should not attempt to correct correct string 063502 matrix_adv', () => {
            const specificSampleData = {
                ...genericSampleData
            };

            const correctionFunction: CorrectionFunction = autoCorrectADV3(
                mockCatalogService
            );

            const autoCorrection = correctionFunction(specificSampleData);
            expect(autoCorrection).toEqual(null);
        });

        it('should not attempt to correct empty string matrix_adv', () => {
            const specificSampleData = {
                ...genericSampleData,
                ...{
                    matrix_adv: { value: '', errors: [], correctionOffer: [] }
                }
            };

            const correctionFunction: CorrectionFunction = autoCorrectADV3(
                mockCatalogService
            );

            const autoCorrection = correctionFunction(specificSampleData);
            expect(autoCorrection).toEqual(null);
        });

        it('should attempt to correct incorrect string 63502 matrix_adv', () => {
            const specificSampleData = {
                ...genericSampleData,
                ...{
                    matrix_adv: {
                        value: '63502',
                        errors: [],
                        correctionOffer: []
                    }
                }
            };

            const correctionFunction: CorrectionFunction = autoCorrectADV3(
                mockCatalogService
            );

            const autoCorrection = correctionFunction(specificSampleData);
            expect(autoCorrection).toEqual({
                code: 91,
                correctionOffer: ['063502'],
                field: 'matrix_adv',
                original: '63502'
            });
        });
    });

    describe('autoCorrectADV12', () => {
        // tslint:disable-next-line
        let mockCatalogService: any;

        beforeEach(() => {
            let mockADVEntries = [
                {
                    Kode: '046',
                    Text1: 'Kaltgeräuchert'
                }
            ];

            mockCatalogService = {
                getCatalog: jest.fn(() => {
                    return {
                        dump: () => mockADVEntries,
                        getFuzzyIndex: (options: Fuse.FuseOptions) =>
                            new Fuse(mockADVEntries, options),
                        containsEntryWithKeyValue: (k: string, v: string) =>
                            // @ts-ignore
                            !!_.filter(mockADVEntries, e => e[k] === v)[0],
                        containsUniqueEntryWithId: (v: string) =>
                            // @ts-ignore
                            !!_.filter(mockADVEntries, e => e['Kode'] === v)[0],
                        getUniqueEntryWithId: (v: string) =>
                            // @ts-ignore
                            _.filter(mockADVEntries, e => e['Kode'] === v)[0],
                        getEntriesWithKeyValue: (k: string, v: string) =>
                            // @ts-ignore
                            _.filter(mockADVEntries, e => e[k] === v)
                    };
                }),
                getCatalogSearchAliases: () => []
            };
        });

        it('should not attempt to correct correct string 046 process_state_adv', () => {
            const specificSampleData = {
                ...genericSampleData
            };

            const correctionFunction: CorrectionFunction = autoCorrectADV12(
                mockCatalogService
            );

            const autoCorrection = correctionFunction(specificSampleData);
            expect(autoCorrection).toEqual(null);
        });

        it('should not attempt to correct empty string process_state_adv', () => {
            const specificSampleData = {
                ...genericSampleData,
                ...{
                    process_state_adv: {
                        value: '',
                        errors: [],
                        correctionOffer: []
                    }
                }
            };

            const correctionFunction: CorrectionFunction = autoCorrectADV12(
                mockCatalogService
            );

            const autoCorrection = correctionFunction(specificSampleData);
            expect(autoCorrection).toEqual(null);
        });

        it('should attempt to correct incorrect string 46 process_state_adv', () => {
            const specificSampleData = {
                ...genericSampleData,
                ...{
                    process_state_adv: {
                        value: '46',
                        errors: [],
                        correctionOffer: []
                    }
                }
            };

            const correctionFunction: CorrectionFunction = autoCorrectADV12(
                mockCatalogService
            );

            const autoCorrection = correctionFunction(specificSampleData);
            expect(autoCorrection).toEqual({
                code: 92,
                correctionOffer: ['046'],
                field: 'process_state_adv',
                original: '46'
            });
        });

        it('should attempt to correct incorrect string Kaltgeräuchert process_state_adv', () => {
            const specificSampleData = {
                ...genericSampleData,
                ...{
                    process_state_adv: {
                        value: 'Kaltgeräuchert',
                        errors: [],
                        correctionOffer: []
                    }
                }
            };

            const correctionFunction: CorrectionFunction = autoCorrectADV12(
                mockCatalogService
            );

            const autoCorrection = correctionFunction(specificSampleData);
            expect(autoCorrection).toEqual({
                code: 92,
                correctionOffer: ['046'],
                field: 'process_state_adv',
                original: 'Kaltgeräuchert'
            });
        });
    });

    describe('autoCorrectADV2', () => {
        // tslint:disable-next-line
        let mockCatalogService: any;

        beforeEach(() => {
            let mockADVEntries = [
                {
                    Kode: '020302',
                    Kodiersystem: '01'
                },
                {
                    Kode: '020302',
                    Kodiersystem: '15'
                },
                {
                    Kode: '001014',
                    Kodiersystem: '15'
                }
            ];

            mockCatalogService = {
                getCatalog: jest.fn(() => {
                    return {
                        dump: () => mockADVEntries,
                        getFuzzyIndex: (options: Fuse.FuseOptions) =>
                            new Fuse(mockADVEntries, options),
                        containsEntryWithKeyValue: (k: string, v: string) =>
                            // @ts-ignore
                            !!_.filter(mockADVEntries, e => e[k] === v)[0],
                        getEntriesWithKeyValue: (k: string, v: string) =>
                            // @ts-ignore
                            _.filter(mockADVEntries, e => e[k] === v),
                        containsUniqueEntryWithId: (v: string) => true
                    };
                }),
                getCatalogSearchAliases: () => []
            };
        });

        it('should not attempt to correct correct string 046 topic_adv', () => {
            const specificSampleData = {
                ...genericSampleData
            };

            const correctionFunction: CorrectionFunction = autoCorrectADV2(
                mockCatalogService
            );

            const autoCorrection = correctionFunction(specificSampleData);
            expect(autoCorrection).toEqual(null);
        });

        it('should attempt to correct empty string topic_adv', () => {
            const specificSampleData = {
                ...genericSampleData,
                ...{
                    matrix_adv: {
                        value: '001014',
                        errors: [],
                        correctionOffer: []
                    },
                    topic_adv: { value: '', errors: [], correctionOffer: [] }
                }
            };

            const correctionFunction: CorrectionFunction = autoCorrectADV2(
                mockCatalogService
            );

            const autoCorrection = correctionFunction(specificSampleData);
            expect(autoCorrection).toEqual({
                code: 93,
                correctionOffer: ['15'],
                field: 'topic_adv',
                original: ''
            });
        });

        it('should correct topic 01 topic_adv to 15', () => {
            const specificSampleData = {
                ...genericSampleData,
                ...{
                    topic_adv: { value: '01', errors: [], correctionOffer: [] },
                    matrix_adv: {
                        value: '001014',
                        errors: [],
                        correctionOffer: []
                    }
                }
            };

            const correctionFunction: CorrectionFunction = autoCorrectADV2(
                mockCatalogService
            );

            const autoCorrection = correctionFunction(specificSampleData);
            expect(autoCorrection).toEqual({
                code: 93,
                correctionOffer: ['15'],
                field: 'topic_adv',
                original: '01'
            });
        });

        it('should not correct topic 01 topic_adv', () => {
            const specificSampleData = {
                ...genericSampleData,
                ...{
                    topic_adv: { value: '01', errors: [], correctionOffer: [] },
                    matrix_adv: {
                        value: '020302',
                        errors: [],
                        correctionOffer: []
                    }
                }
            };

            const correctionFunction: CorrectionFunction = autoCorrectADV2(
                mockCatalogService
            );

            const autoCorrection = correctionFunction(specificSampleData);
            expect(autoCorrection).toEqual(null);
        });
    });
});
