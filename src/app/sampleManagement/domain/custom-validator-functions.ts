import * as moment from 'moment';
import * as _ from 'lodash';
import {
    ValidationError,
    DependentFieldEntryOptions,
    MatchRegexPatternOptions,
    MatchIdToYearOptions,
    ValidatorFunction,
    NonUniqueEntryOptions,
    InCatalogOptions,
    MatchADVNumberOrStringOptions,
    RegisteredZoMoOptions,
    AtLeastOneOfOptions,
    DependentFieldsOptions,
    NumbersOnlyOptions,
    ReferenceDateOptions
} from '../model/validation.model';
import { CatalogService } from '../model/catalog.model';
import { SampleProperty, SamplePropertyValues } from '../model/sample.model';
import { MalformedValidationOptionsError } from './domain.error';

moment.locale('de');

function dependentFieldEntry(
    value: string,
    options: DependentFieldEntryOptions,
    key: SampleProperty,
    attributes: Record<string, string>
) {
    const re = new RegExp(options.regex);
    const matchResult = re.test(attributes[options.field]);
    if (matchResult && isEmptyString(attributes[key])) {
        return { ...options.message };
    }
    return null;
}

function numbersOnlyValue(value: string): boolean {
    const numbersOnly = /^\d+$/;
    return numbersOnly.test(value);
}
function matchesRegexPattern(
    value: string,
    options: MatchRegexPatternOptions,
    key: SampleProperty,
    attributes: SamplePropertyValues
) {
    if (!value || !options.regex.length) {
        return null;
    }
    if (options.ignoreNumbers && numbersOnlyValue(value)) {
        return null;
    }
    let success = false;
    const regexpAry = options.regex.map(str => {
        return new RegExp(str, options.caseInsensitive ? 'i' : undefined);
    });
    regexpAry.forEach(regexp => {
        if (regexp.test(value)) {
            success = true;
        }
    });
    return success ? null : { ...options.message };
}

function matchesIdToSpecificYear(
    value: string,
    options: MatchIdToYearOptions,
    key: SampleProperty,
    attributes: SamplePropertyValues
) {
    if (!value) {
        return null;
    }
    let currentYear = moment();
    let nextYear = moment().add(1, 'year');
    let lastYear = moment().subtract(1, 'year');
    if (attributes['sampling_date']) {
        currentYear = moment(attributes['sampling_date'], 'DD.MM.YYYY');
        nextYear = moment(attributes['sampling_date'], 'DD.MM.YYYY').add(
            1,
            'year'
        );
        lastYear = moment(attributes['sampling_date'], 'DD.MM.YYYY').subtract(
            1,
            'year'
        );
    }

    const changedArray = _.flatMap(options.regex, (entry: string) => {
        const result: string[] = [];
        if (entry.includes('yyyy')) {
            const currentEntry = entry.replace(
                'yyyy',
                currentYear.format('YYYY')
            );
            const nextEntry = entry.replace('yyyy', nextYear.format('YYYY'));
            const lastEntry = entry.replace('yyyy', lastYear.format('YYYY'));
            result.push(lastEntry);
            result.push(currentEntry);
            result.push(nextEntry);
        } else if (entry.includes('yy')) {
            const currentEntry = entry.replace('yy', currentYear.format('YY'));
            const nextEntry = entry.replace('yy', nextYear.format('YY'));
            const lastEntry = entry.replace('yy', lastYear.format('YY'));
            result.push(lastEntry);
            result.push(currentEntry);
            result.push(nextEntry);
        } else {
            result.push(entry);
        }
        return result;
    });
    options.regex = changedArray;
    return matchesRegexPattern(
        value,
        { ...options, ...{ ignoreNumbers: false } },
        key,
        attributes
    );
}

function nonUniqueEntry(
    catalogService: CatalogService
): ValidatorFunction<NonUniqueEntryOptions> {
    return (
        value: string,
        options: NonUniqueEntryOptions,
        key: SampleProperty,
        attributes: SamplePropertyValues
    ) => {
        if (attributes[key]) {
            const cat = catalogService.getCatalog(options.catalog);
            if (cat && options.key) {
                const entries = cat.getEntriesWithKeyValue(options.key, value);
                if (entries.length < 2) return null;
                if (attributes[options.differentiator[1]]) {
                    const n = _.filter(
                        entries,
                        e =>
                            e[options.differentiator[0]] ===
                            attributes[options.differentiator[1]]
                    );
                    if (n.length === 1) return null;
                }
                // TODO: find better way to do this
                const newMessage: ValidationError = { ...options.message };
                newMessage.message += ` Entweder '${entries[0].Kodiersystem}' für '${entries[0].Text1}' oder '${entries[1].Kodiersystem}' für '${entries[1].Text1}'.`;
                return newMessage;
            }
        }
        return null;
    };
}

function inCatalog(
    catalogService: CatalogService
): ValidatorFunction<InCatalogOptions> {
    return (
        value: string,
        options: InCatalogOptions,
        key: SampleProperty,
        attributes: SamplePropertyValues
    ) => {
        const trimmedValue = value.trim();
        if (attributes[key]) {
            const cat = catalogService.getCatalog(options.catalog);

            if (cat) {
                const key: string = options.key
                    ? options.key
                    : cat.getUniqueId();
                if (key && !cat.containsEntryWithKeyValue(key, trimmedValue)) {
                    return { ...options.message };
                }
            }
        }
        return null;
    };
}

// Matching for ADV16 accorind to #mps53
function matchADVNumberOrString(
    catalogService: CatalogService
): ValidatorFunction<InCatalogOptions> {
    return (
        value: string,
        options: MatchADVNumberOrStringOptions,
        key: SampleProperty,
        attributes: SamplePropertyValues
    ) => {
        const trimmedValue = value.trim();
        const altKeys = options.alternateKeys || [];
        if (attributes[key]) {
            const cat = catalogService.getCatalog(options.catalog);

            if (cat) {
                const key: string = options.key
                    ? options.key
                    : cat.getUniqueId();
                if (!key) {
                    return null;
                }
                if (numbersOnlyValue(value)) {
                    if (!cat.containsEntryWithKeyValue(key, trimmedValue)) {
                        return { ...options.message };
                    }
                } else {
                    let found = false;
                    altKeys.forEach(k => {
                        found =
                            cat.containsEntryWithKeyValue(k, trimmedValue) ||
                            found;
                    });
                    if (found) {
                        return null;
                    }
                    return { ...options.message };
                }
            }
        }
        return null;
    };
}

function registeredZoMo(
    catalogService: CatalogService
): ValidatorFunction<RegisteredZoMoOptions> {
    return (
        value: string,
        options: RegisteredZoMoOptions,
        key: SampleProperty,
        attributes: SamplePropertyValues
    ) => {
        const years = options.year.map((y: SampleProperty) => {
            const yearValue = attributes[y];
            const formattedYear = moment
                .utc(yearValue, 'DD-MM-YYYY')
                .format('YYYY');
            return parseInt(formattedYear, 10);
        });
        if (years.length > 0) {
            const yearToCheck = Math.min(...years);
            const cat = catalogService.getCatalog('zsp' + yearToCheck);
            if (cat) {
                const groupValues = options.group.map(g => attributes[g.attr]);
                const entry = cat.getEntriesWithKeyValue(
                    options.group[0].code,
                    groupValues[0]
                );
                const filtered = _.filter(
                    entry,
                    e => e[options.group[2].code] === groupValues[2]
                ).filter(m => m[options.group[1].code] === groupValues[1]);
                if (filtered.length < 1) {
                    return { ...options.message };
                }
            } else {
                return { ...options.message };
            }
        } else {
            return { ...options.message };
        }
        return null;
    };
}

function atLeastOneOf(
    value: string,
    options: AtLeastOneOfOptions,
    key: SampleProperty,
    attributes: SamplePropertyValues
) {
    if (isEmptyString(attributes[key])) {
        for (let i = 0; i < options.additionalMembers.length; i++) {
            const element = options.additionalMembers[i];
            if (!isEmptyString(attributes[element])) {
                return null;
            }
        }
        return { ...options.message };
    }
    return null;
}
function dateAllowEmpty(
    value: string,
    options: AtLeastOneOfOptions,
    key: SampleProperty,
    attributes: SamplePropertyValues
) {
    if (isEmptyString(value)) {
        return null;
    } else if (
        moment
            .utc(
                value,
                ['DD.MM.YYYY', 'D.MM.YYYY', 'D.M.YYYY', 'DD.M.YYYY'],
                true
            )
            .isValid()
    ) {
        return null;
    } else {
        return { ...options.message };
    }
    return null;
}

function dependentFields(
    value: string,
    options: DependentFieldsOptions,
    key: SampleProperty,
    attributes: SamplePropertyValues
) {
    if (attributes[key]) {
        for (let i = 0; i < options.dependents.length; i++) {
            const element = options.dependents[i];
            if (!attributes[element]) {
                return { ...options.message };
            }
        }
    }
    return null;
}

function numbersOnly(
    value: string,
    options: NumbersOnlyOptions,
    key: SampleProperty,
    attributes: SamplePropertyValues
) {
    if (attributes[key]) {
        if (!numbersOnlyValue(value)) {
            return { ...options.message };
        }
    }
    return null;
}

function referenceDate(
    value: string,
    options: ReferenceDateOptions,
    key: SampleProperty,
    // tslint:disable-next-line
    attributes: any
) {
    if (moment.utc(value, 'DD-MM-YYYY').isValid()) {
        let referenceDateId;
        let refereceOperation;
        let referenceDate;

        if (options.earliest) {
            referenceDateId = options.earliest;
            refereceOperation = dateIsSameOrBeforeReference;
        } else if (options.latest) {
            referenceDateId = options.latest;
            refereceOperation = dateIsSameOrAfterReference;
        } else {
            throw new MalformedValidationOptionsError(
                'Error occured trying to validate'
            );
        }

        if (attributes[referenceDateId]) {
            referenceDate = moment.utc(
                attributes[referenceDateId],
                'DD-MM-YYYY'
            );
        } else if (referenceDateId === 'NOW') {
            referenceDate = moment();
        } else {
            referenceDate = moment.utc(referenceDateId, 'DD-MM-YYYY');
        }

        if (options.earliest) {
            if (options.modifier) {
                // tslint:disable-next-line: deprecation
                referenceDate = referenceDate.subtract(
                    // tslint:disable-next-line
                    options.modifier.value as any,
                    options.modifier.unit
                );
            }
        } else if (options.latest) {
            if (options.modifier) {
                // tslint:disable-next-line: deprecation
                referenceDate = referenceDate.add(
                    // tslint:disable-next-line
                    options.modifier.value as any,
                    options.modifier.unit
                );
            }
        }

        if (
            !referenceDate.isValid() ||
            refereceOperation(moment.utc(value, 'DD-MM-YYYY'), referenceDate)
        ) {
            return null;
        } else {
            return { ...options.message };
        }
    }
    return null;
}

function dateIsSameOrAfterReference(
    date: moment.Moment,
    referenceDate: moment.Moment
) {
    return referenceDate.isSameOrAfter(date, 'day');
}

function dateIsSameOrBeforeReference(
    date: moment.Moment,
    referenceDate: moment.Moment
) {
    return referenceDate.isSameOrBefore(date, 'day');
}

function isEmptyString(str: string): boolean {
    return !('' + str).trim();
}

export {
    referenceDate,
    atLeastOneOf,
    dateAllowEmpty,
    dependentFields,
    dependentFieldEntry,
    numbersOnly,
    inCatalog,
    registeredZoMo,
    nonUniqueEntry,
    matchADVNumberOrString,
    matchesRegexPattern,
    matchesIdToSpecificYear
};
