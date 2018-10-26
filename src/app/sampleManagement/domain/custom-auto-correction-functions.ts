import * as _ from 'lodash';
import { CorrectionSuggestions, SampleData } from './sample.entity';
import { ICatalogService } from '../application';
import { logger } from '../../../aspects';

export interface CorrectionFunction {
    (sampleData: SampleData): CorrectionSuggestions | null;
}

export interface SearchAlias {
    catalog: string;
    token: string;
    alias: string[];
}

interface ResultOptions {
    alias?: string;
    original: string;
    numberOfResults: number;
    property: keyof SampleData;
}
interface FuzzySearchResultEntry {
    item: string;
    score: number;
}

function autoCorrectADV2(catalogService: ICatalogService) {
    const dependencyCatalogName = 'adv3';
    const property: keyof SampleData = 'topic_adv';
    const dependencyProperty: keyof SampleData = 'matrix_adv';
    const dependencyCatalog = catalogService.getCatalog(dependencyCatalogName);
    logger.debug('Initializing auto-correction: Topic (ADV-2) & creating closure');

    return (sampleData: SampleData): CorrectionSuggestions | null => {

        let trimmedEntry = sampleData[property].trim();
        // Ignore empty entries
        if (!trimmedEntry) {
            return null;
        }

        const dependencies = dependencyCatalog.getEntriesWithKeyValue('Kode', sampleData[dependencyProperty]);

        if (dependencies.length === 0) {
            return null;
        } else if (dependencies.length === 1) {
            const value = dependencies[0]['Kodiersystem'];
            if (sampleData[property] === value) {
                return null;

            } else {
                return createCacheEntry(property, sampleData[property], [value], 93);
            }
        }
        return null;
    };
}

function autoCorrectADV12(catalogService: ICatalogService) {
    const catalogName = 'adv12';
    const property: keyof SampleData = 'process_state_adv';
    const catalog = catalogService.getCatalog(catalogName);
    logger.debug('Initializing auto-correction: Process state (ADV-12) & creating closure');

    const searchCache: Record<string, CorrectionSuggestions> = {};

    return (sampleData: SampleData): CorrectionSuggestions | null => {

        let trimmedEntry = sampleData[property].trim();
        // Ignore empty entries
        if (!trimmedEntry) {
            return null;
        }
        // Return cached result
        if (searchCache[sampleData[property]]) {
            return searchCache[trimmedEntry];
        }

        // Check Number codes
        let alteredEntry = checkAndUnshift(trimmedEntry, /^\d{2}$/, '0');
        if (alteredEntry && catalog.containsEntryWithId(alteredEntry)) {
            searchCache[trimmedEntry] = createCacheEntry(property, sampleData[property], [catalog.getEntryWithId(alteredEntry)['Kode']], 92);
            return searchCache[trimmedEntry];
        }

        if (catalog.containsEntryWithKeyValue('Text1', trimmedEntry)) {
            searchCache[trimmedEntry] = {
                field: property,
                original: sampleData[property],
                correctionOffer: [catalog.getEntriesWithKeyValue('Text1', trimmedEntry)[0]['Kode']],
                code: 92
            };
            return searchCache[trimmedEntry];
        }

        return null;
    };
}

function autoCorrectADV3(catalogService: ICatalogService) {
    const catalogName = 'adv3';
    const property: keyof SampleData = 'matrix_adv';
    const catalog = catalogService.getCatalog(catalogName);
    logger.debug('Initializing auto-correction: Matrix (ADV-3) & creating closure');

    const searchCache: Record<string, CorrectionSuggestions> = {};

    return (sampleData: SampleData): CorrectionSuggestions | null => {

        let trimmedEntry = sampleData[property].trim();
        // Ignore empty entries
        if (!trimmedEntry) {
            return null;
        }
        // Return cached result
        if (searchCache[sampleData[property]]) {
            return searchCache[trimmedEntry];
        }

        // Check Number codes
        let alteredEntry = checkAndUnshift(trimmedEntry, /^\d{5}$/, '0');
        if (alteredEntry && catalog.containsEntryWithId(alteredEntry)) {
            searchCache[trimmedEntry] = createCacheEntry(property, sampleData[property], [catalog.getEntryWithId(alteredEntry)['Kode']], 91);
            return searchCache[trimmedEntry];
        }

        return null;
    };
}

function autoCorrectADV8(catalogService: ICatalogService) {
    const catalogName = 'adv8';
    const property: keyof SampleData = 'operations_mode_adv';
    const catalog = catalogService.getCatalog(catalogName);
    logger.debug('Initializing auto-correction: Operations Mode (ADV-8) & creating closure');

    const searchCache: Record<string, CorrectionSuggestions> = {};

    return (sampleData: SampleData): CorrectionSuggestions | null => {

        let trimmedEntry = sampleData[property].trim();
        // Ignore empty entries
        if (!trimmedEntry) {
            return null;
        }
        // Return cached result
        if (searchCache[sampleData[property]]) {
            return searchCache[trimmedEntry];
        }

        // Check Number codes

        const replacements = [
            {
                pattern: /xxx$/,
                replacement: '000'
            },
            {
                pattern: /xxxx$/,
                replacement: '0000'
            },
            {
                pattern: /xxxxxx$/,
                replacement: '000000'
            }
        ];

        for (let rep of replacements) {
            let alteredEntry = checkAndReplace(trimmedEntry, rep.pattern, rep.replacement);
            if (alteredEntry && catalog.containsEntryWithId(alteredEntry)) {
                searchCache[trimmedEntry] = createCacheEntry(property, sampleData[property], [catalog.getEntryWithId(alteredEntry)['Kode']], 90);
                return searchCache[trimmedEntry];
            }
        }

        return null;
    };
}

function autoCorrectADV9(catalogService: ICatalogService) {
    const catalogName = 'adv9';
    const property: keyof SampleData = 'sampling_location_adv';
    const catalog = catalogService.getCatalog(catalogName);
    logger.debug('Initializing auto-correction: Sampling location (ADV-9) & creating closure');

    const searchCache: Record<string, CorrectionSuggestions> = {};

    return (sampleData: SampleData): CorrectionSuggestions | null => {

        let trimmedEntry = sampleData[property].trim();
        // Ignore empty entries
        if (!trimmedEntry) {
            return null;
        }
        // Return cached result
        if (searchCache[sampleData[property]]) {
            return searchCache[trimmedEntry];
        }

        // Check Number codes
        let alteredEntry = checkAndReplace(trimmedEntry, /xxx$/, '');
        if (alteredEntry && catalog.containsEntryWithId(alteredEntry)) {
            searchCache[trimmedEntry] = createCacheEntry(property, sampleData[property], [catalog.getEntryWithId(alteredEntry)['Kode']], 89);
            return searchCache[trimmedEntry];
        }

        alteredEntry = checkAndUnshift(trimmedEntry, /^\d{7}$/, '0');
        if (alteredEntry && catalog.containsEntryWithId(alteredEntry)) {
            searchCache[trimmedEntry] = createCacheEntry(property, sampleData[property], [catalog.getEntryWithId(alteredEntry)['Kode']], 89);
            return searchCache[trimmedEntry];
        }

        return null;
    };
}

// ADV16: see #mps53
function autoCorrectADV16(catalogService: ICatalogService) {

    const catalogName = 'adv16';
    const property: keyof SampleData = 'pathogen_adv';
    const catalog = catalogService.getCatalog(catalogName);
    logger.debug('Initializing auto-correction: Pathogen (ADV-16) & creating closure');
    const options = getFuseOptions();

    const catalogEnhancements = createCatalogEnhancements(catalogService, catalogName);

    const fuse = catalogService.getCatalog(catalogName).getFuzzyIndex(options);

    const searchCache: Record<string, CorrectionSuggestions> = {};

    return (sampleData: SampleData): CorrectionSuggestions | null => {

        let trimmedEntry = sampleData[property].trim();
        // Ignore empty entries
        if (!trimmedEntry) {
            return null;
        }
        // Return cached result
        if (searchCache[sampleData[property]]) {
            return searchCache[trimmedEntry];
        }

        // Check Number codes
        const numbersOnly = /^\d+$/;
        if (numbersOnly.test(trimmedEntry)) {
            trimmedEntry = checkAndUnshift(trimmedEntry, /^\d{6}$/, '0') || trimmedEntry;
            if (catalog.containsEntryWithId(trimmedEntry)) {
                searchCache[trimmedEntry] = createCacheEntry(property, sampleData[property], [catalog.getEntryWithId(trimmedEntry)['Text1']], 87);
                return searchCache[trimmedEntry];
            }
        }

        // Search for Genus
        const genusEntry = 'Genus ' + trimmedEntry;
        if (catalog.containsEntryWithKeyValue('Text1', genusEntry)) {
            searchCache[trimmedEntry] = {
                field: property,
                original: sampleData[property],
                correctionOffer: [genusEntry],
                code: 88
            };
            return searchCache[trimmedEntry];
        }

        // Search catalog enhancements
        const alias: string = searchCatalogEnhancements(trimmedEntry, catalogEnhancements);

        // Do fuzzy search
        const noSpaceDot = /\.(\S)/g;
        let alteredEntry = trimmedEntry;
        if (noSpaceDot.test(trimmedEntry)) {
            alteredEntry = trimmedEntry.replace(noSpaceDot, '. \$1');
        }

        const resultOptions: ResultOptions = {
            property,
            numberOfResults: 20,
            alias,
            original: sampleData[property]
        };
        searchCache[trimmedEntry] = doFuzzySearch(alteredEntry, fuse, resultOptions);
        return searchCache[trimmedEntry];
    };
}

// Utility functions
function createCacheEntry(field: keyof SampleData, original: string, correctionOffer: string[], code: number) {
    return {
        field,
        original,
        correctionOffer,
        code
    };
}

function checkAndReplace(value: string, predicate: RegExp, substitute: string) {
    if (predicate.test(value)) {
        return value.replace(predicate, substitute);
    }
    return '';
}

function checkAndUnshift(value: string, predicate: RegExp, pre: string) {
    if (predicate.test(value)) {
        return pre + value;
    }
    return '';
}

function doFuzzySearch(value: string, fuse: Fuse, options: ResultOptions) {
    let {
        property,
        numberOfResults,
        alias,
        original
    } = { ...options };

    let result: FuzzySearchResultEntry[] = fuse.search(value);

    if (alias) {
        result = _.filter(result, f => f.item !== alias);
        result.unshift({
            item: alias,
            score: 0
        });
        numberOfResults = 10;
    }
    const slicedResult = result.slice(0, numberOfResults).map(entry => entry.item);
    return {
        field: property,
        original: original,
        correctionOffer: slicedResult,
        code: 0
    };
}

// tslint:disable-next-line:no-any
function searchCatalogEnhancements(value: string, catalogEnhancements: any[]): string {
    let alias: string = '';
    catalogEnhancements.forEach((enhancement) => {
        if (enhancement.alias === value) {
            alias = enhancement.text;
        }
    });
    return alias;
}

function getFuseOptions() {
    return {
        id: 'Text1',
        shouldSort: true,
        tokenize: true,
        includeScore: true,
        matchAllTokens: true,
        threshold: 0.6,
        location: 0,
        distance: 100,
        maxPatternLength: 100,
        minMatchCharLength: 1,
        keys: [
            {
                'name': 'Text1',
                'weight': 0.9
            },
            {
                'name': 'P-Code3',
                'weight': 0.1
            }
        ]
    };
}

function createCatalogEnhancements(catalogService: ICatalogService, catalogName: string) {
    return _(catalogService.getCatalogSearchAliases(catalogName))
        .map((e: SearchAlias) => {
            return e.alias.map(alias => ({
                text: e.token,
                alias: alias
            }));
        })
        .flattenDeep()
        .value();
}

export {
    autoCorrectADV16,
    autoCorrectADV9,
    autoCorrectADV8,
    autoCorrectADV3,
    autoCorrectADV12,
    autoCorrectADV2
};
