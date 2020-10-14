interface AddressDTO {
    readonly instituteName: string;
    readonly department?: string;
    readonly street: string;
    readonly zip: string;
    readonly city: string;
    readonly contactPerson: string;
    readonly telephone: string;
    readonly email: string;
}

interface AnalysisDTO {
    readonly species: boolean;
    readonly serological: boolean;
    readonly phageTyping: boolean;
    readonly resistance: boolean;
    readonly vaccination: boolean;
    readonly molecularTyping: boolean;
    readonly toxin: boolean;
    readonly zoonosenIsolate: boolean;
    readonly esblAmpCCarbapenemasen: boolean;
    readonly other: string;
    readonly compareHuman: boolean;
}
export interface SampleSetMetaDTO {
    readonly nrl: string;
    readonly sender: AddressDTO;
    readonly analysis: AnalysisDTO;
    readonly urgency: string;
    readonly fileName?: string;
}

interface SampleValidationErrorDTO {
    readonly code: number;
    readonly level: number;
    readonly message: string;
}

export interface SampleDataEntryDTO {
    readonly value: string;
    readonly errors?: SampleValidationErrorDTO[];
    readonly correctionOffer?: string[];
    readonly oldValue?: string;
}
export interface SampleDataDTO {
    readonly [key: string]: SampleDataEntryDTO;
}

export interface SampleDataContainerDTO {
    readonly sample: SampleDataDTO;
}

export interface SampleSetDTO {
    readonly samples: SampleDataContainerDTO[];
    readonly meta: SampleSetMetaDTO;
}

export interface OrderDTO {
    order: SampleSetDTO;
}
