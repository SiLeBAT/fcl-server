import { Sample, SampleData, SampleProperty } from './sample.model';

export interface CorrectionSuggestions {
    field: SampleProperty;
    original: string;
    correctionOffer: string[];
    code: number;
}

export type EditValue = string;

export interface CorrectionFunction {
    (sampleData: SampleData): CorrectionSuggestions | null;
}

export interface SearchAlias {
    catalog: string;
    token: string;
    alias: string[];
}

export interface CatalogEnhancement {
    alias: string;
    text: string;
}

export interface ResultOptions {
    alias?: string;
    original: string;
    numberOfResults: number;
    property: SampleProperty;
}
export interface FuzzySearchResultEntry {
    item: string;
    score: number;
}

export interface FormAutoCorrectionPort {
    applyAutoCorrection(sampleCollection: Sample[]): Promise<Sample[]>;
}

export interface FormAutoCorrectionService extends FormAutoCorrectionPort {}
