import * as _ from 'lodash';
import { ValidationConstraints } from '../model/validation.model';

export const zoMoConstraints: ValidationConstraints = {
    sample_id_avv: {
        presence: {
            error: 5,
            allowEmpty: false
        }
    },
    sampling_date: {
        presence: {
            error: 14,
            allowEmpty: false
        }
    },
    isolation_date: {
        presence: {
            error: 18,
            allowEmpty: false
        }
    },
    matrix_adv: {
        presence: {
            error: 34,
            allowEmpty: false
        },
        registeredZoMo: {
            error: 49,
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
        }
    },
    operations_mode_adv: {
        atLeastOneOf: {
            error: 48,
            additionalMembers: ['operations_mode_text']
        },
        registeredZoMo: {
            error: 49,
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
        }
    },
    operations_mode_text: {
        atLeastOneOf: {
            error: 48,
            additionalMembers: ['operations_mode_adv']
        }
    },
    sampling_location_adv: {
        atLeastOneOf: {
            error: 86,
            additionalMembers: [
                'sampling_location_zip',
                'sampling_location_text'
            ]
        }
    },
    sampling_location_zip: {
        atLeastOneOf: {
            error: 86,
            additionalMembers: [
                'sampling_location_adv',
                'sampling_location_text'
            ]
        }
    },
    sampling_location_text: {
        atLeastOneOf: {
            error: 86,
            additionalMembers: [
                'sampling_location_adv',
                'sampling_location_zip'
            ]
        }
    },
    sampling_reason_adv: {
        registeredZoMo: {
            error: 49,
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
        }
    },
    sampling_reason_text: {
        registeredZoMo: {
            error: 49,
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
        }
    },
    process_state_adv: {
        dependentFieldEntry: {
            error: 39,
            field: 'operations_mode_adv',
            regex: '^4'
        }
    }
};

export const standardConstraints: ValidationConstraints = {
    sampling_date: {
        atLeastOneOf: {
            error: 19,
            additionalMembers: ['isolation_date']
        }
    },
    isolation_date: {
        atLeastOneOf: {
            error: 19,
            additionalMembers: ['sampling_date']
        }
    }
};

export const baseConstraints: ValidationConstraints = {
    sample_id: {
        atLeastOneOf: {
            error: 69,
            additionalMembers: ['sample_id_avv']
        },
        presence: {
            error: 68,
            allowEmpty: false
        }
    },
    sample_id_avv: {
        atLeastOneOf: {
            error: 69,
            additionalMembers: ['sample_id']
        },
        matchesIdToSpecificYear: {
            error: 72,
            regex: []
        }
    },
    pathogen_adv: {
        presence: {
            error: 10,
            allowEmpty: false
        },
        matchADVNumberOrString: {
            error: 8,
            catalog: 'adv16',
            alternateKeys: ['Text1']
        },
        matchesRegexPattern: {
            caseInsensitive: true,
            error: 73,
            regex: [],
            ignoreNumbers: true
        }
    },
    sampling_date: {
        presence: {
            error: 11,
            allowEmpty: false
        },
        dateAllowEmpty: {
            error: 12
        },
        futureDate: {
            error: 13,
            latest: 'NOW'
        },
        referenceDate: {
            error: 20,
            latest: 'isolation_date'
        },
        timeBetween: {
            error: 61,
            earliest: 'isolation_date',
            modifier: {
                value: 1,
                unit: 'year'
            }
        },
        oldSample: {
            error: 62,
            earliest: 'NOW',
            modifier: {
                value: 10,
                unit: 'year'
            }
        }
    },
    isolation_date: {
        presence: {
            error: 15,
            allowEmpty: false
        },
        dateAllowEmpty: {
            error: 16
        },
        futureDate: {
            error: 17,
            latest: 'NOW'
        },
        referenceDate: {
            error: 20,
            earliest: 'sampling_date'
        },
        timeBetween: {
            error: 61,
            latest: 'sampling_date',
            modifier: {
                value: 1,
                unit: 'year'
            }
        },
        oldSample: {
            error: 63,
            earliest: 'NOW',
            modifier: {
                value: 10,
                unit: 'year'
            }
        }
    },
    sampling_location_adv: {
        atLeastOneOf: {
            error: 64,
            additionalMembers: [
                'sampling_location_zip',
                'sampling_location_text'
            ]
        },
        length: {
            error: 74,
            maximum: 8
        },
        inCatalog: {
            error: 24,
            catalog: 'adv9'
        }
    },
    sampling_location_zip: {
        atLeastOneOf: {
            error: 64,
            additionalMembers: [
                'sampling_location_adv',
                'sampling_location_text'
            ]
        },
        dependentFields: {
            error: 28,
            dependents: ['sampling_location_text']
        },
        length: {
            error: 27,
            is: 5,
            tokenizer: function(value: string) {
                // Necessary to deal with empty strings
                return value ? value : 'XXXXX';
            }
        },
        inCatalog: {
            error: 75,
            catalog: 'plz'
        }
    },
    sampling_location_text: {
        atLeastOneOf: {
            error: 64,
            additionalMembers: [
                'sampling_location_adv',
                'sampling_location_zip'
            ]
        },
        dependentFields: {
            error: 25,
            dependents: ['sampling_location_zip']
        }
    },
    topic_adv: {
        atLeastOneOf: {
            error: 37,
            additionalMembers: ['matrix_adv', 'matrix_text']
        },
        length: {
            error: 76,
            is: 2,
            tokenizer: function(value: string) {
                // Necessary to deal with empty strings
                return value ? value : 'XX';
            }
        },
        numbersOnly: {
            error: 77
        },
        inCatalog: {
            error: 30,
            catalog: 'adv2'
        }
    },
    matrix_adv: {
        atLeastOneOf: {
            error: 37,
            additionalMembers: ['matrix_text', 'topic_adv']
        },
        presence: {
            error: 32,
            allowEmpty: false
        },
        length: {
            error: 78,
            is: 6,
            tokenizer: function(value: string) {
                // Necessary to deal with empty strings
                return value ? value : 'XXXXXX';
            }
        },
        numbersOnly: {
            error: 79
        },
        inCatalog: {
            error: 33,
            catalog: 'adv3',
            key: 'Kode'
        },
        nonUniqueEntry: {
            error: 70,
            catalog: 'adv3',
            key: 'Kode',
            differentiator: ['Kodiersystem', 'topic_adv']
        }
    },
    matrix_text: {
        atLeastOneOf: {
            error: 37,
            additionalMembers: ['matrix_adv', 'topic_adv']
        }
    },
    process_state_adv: {
        length: {
            error: 80,
            is: 3,
            tokenizer: function(value: string) {
                // Necessary to deal with empty strings
                return value ? value : 'XXX';
            }
        },
        numbersOnly: {
            error: 81
        },
        inCatalog: {
            error: 40,
            catalog: 'adv12'
        }
    },
    sampling_reason_adv: {
        atLeastOneOf: {
            error: 44,
            additionalMembers: ['sampling_reason_text']
        },
        length: {
            error: 82,
            is: 2,
            tokenizer: function(value: string) {
                // Necessary to deal with empty strings
                return value ? value : 'XX';
            }
        },
        numbersOnly: {
            error: 83
        },
        inCatalog: {
            error: 42,
            catalog: 'adv4'
        }
    },
    sampling_reason_text: {
        atLeastOneOf: {
            error: 44,
            additionalMembers: ['sampling_reason_adv']
        }
    },
    operations_mode_adv: {
        atLeastOneOf: {
            error: 71,
            additionalMembers: ['operations_mode_text']
        },
        length: {
            error: 84,
            is: 7,
            tokenizer: function(value: string) {
                // Necessary to deal with empty strings
                return value ? value : 'XXXXXXX';
            }
        },
        numbersOnly: {
            error: 85
        },
        inCatalog: {
            error: 46,
            catalog: 'adv8'
        }
    },
    operations_mode_text: {
        atLeastOneOf: {
            error: 71,
            additionalMembers: ['operations_mode_adv']
        }
    },
    vvvo: {},
    comment: {}
};
