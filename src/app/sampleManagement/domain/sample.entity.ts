import * as _ from 'lodash';
import {
    Sample,
    SampleData,
    AnnotatedSampleDataEntry,
    SampleProperty
} from '../model/sample.model';
import { EditValue } from '../model/autocorrection.model';
import {
    ValidationError,
    ValidationErrorCollection
} from '../model/validation.model';

class DefaultSample implements Sample {
    static ZOMO_CODE: number = 81;
    static ZOMO_STRING: string = 'Zoonosen-Monitoring - Planprobe';
    static create(data: SampleData): Sample {
        const cleanedData = _.cloneDeep(data);
        _.forEach(
            cleanedData,
            (v: AnnotatedSampleDataEntry, k: SampleProperty) => {
                cleanedData[k].value = ('' + v.value).trim();
            }
        );
        return new DefaultSample(cleanedData);
    }

    static toDTO(sample: Sample): SampleData {
        return sample.getAnnotatedData();
    }
    constructor(private data: SampleData) {}

    getPropertyvalues() {
        const valuesOnly: Record<SampleProperty, string> = {};
        return Object.keys(this.data).reduce((accumulator, property) => {
            accumulator[property] = this.data[property].value;
            return accumulator;
        }, valuesOnly);
    }

    getDataValues(): Record<string, { value: string }> {
        const valuesOnly: Record<SampleProperty, { value: string }> = {};
        return Object.keys(this.data).reduce((accumulator, property) => {
            accumulator[property] = { value: this.data[property].value };
            return accumulator;
        }, valuesOnly);
    }

    getValueFor(property: SampleProperty): string {
        return this.data[property].value;
    }

    getEntryFor(property: SampleProperty): AnnotatedSampleDataEntry {
        return this.data[property];
    }

    getAnnotatedData(): SampleData {
        return this.data;
    }

    getOldValues(): Record<string, EditValue> {
        const valuesOnly: Record<SampleProperty, string> = {};
        return Object.keys(this.data).reduce((accumulator, property) => {
            if (!_.isNil(this.data[property].oldValue)) {
                accumulator[property] = this.data[property].oldValue || '';
            }
            return accumulator;
        }, valuesOnly);
    }

    get pathogenId(): string | undefined {
        if (
            !this.getPropertyvalues().sample_id ||
            !this.getPropertyvalues().pathogen_adv
        ) {
            return;
        }
        return (
            this.getPropertyvalues().sample_id +
            this.getPropertyvalues().pathogen_adv
        );
    }

    get pathogenIdAVV(): string | undefined {
        if (
            !this.getPropertyvalues().sample_id_avv ||
            !this.getPropertyvalues().pathogen_adv
        ) {
            return;
        }
        return (
            this.getPropertyvalues().sample_id_avv +
            this.getPropertyvalues().pathogen_adv +
            (this.getPropertyvalues().sample_id
                ? this.getPropertyvalues().sample_id
                : '')
        );
    }

    addErrors(errors: ValidationErrorCollection = {}) {
        _.forEach(errors, (v, k) => {
            if (this.data[k].errors) {
                this.data[k].errors = _.uniqWith(
                    [...this.data[k].errors, ...v],
                    _.isEqual
                );
            } else {
                this.data[k].errors = [...v];
            }
        });
    }

    getErrorCount(level: number): number {
        const valuesOnly: number = 0;
        return Object.keys(this.data).reduce((accumulator, property) => {
            accumulator += this.data[property].errors.filter(
                e => e.level === level
            ).length;
            return accumulator;
        }, valuesOnly);
    }

    isZoMo(): boolean {
        return (
            this.data.sampling_reason_adv.value ===
                '' + DefaultSample.ZOMO_CODE ||
            this.data.sampling_reason_text.value === DefaultSample.ZOMO_STRING
        );
    }

    addErrorTo(id: string, error: ValidationError) {
        this.data[id].errors.push(error);
    }

    addCorrectionTo(id: string, correctionOffer: string[]) {
        this.data[id].correctionOffer = this.data[id].correctionOffer.concat(
            correctionOffer
        );
    }

    isValid(): boolean {
        let errors: ValidationError[] = [];
        for (const prop of Object.keys(this.data)) {
            errors = errors.concat(this.data[prop].errors);
        }
        return !!errors.length;
    }

    clearSingleCorrectionSuggestions() {
        return Object.keys(this.data).forEach(property => {
            if (this.data[property].correctionOffer.length === 1) {
                this.data[property].oldValue = this.data[property].value;
                this.data[property].value = this.data[
                    property
                ].correctionOffer[0];
                this.data[property].correctionOffer = [];
            }
        });
    }

    clone() {
        const d = _.cloneDeep(this.data);
        const s = new DefaultSample(d);
        return s;
    }
}

function createSample(data: SampleData): Sample {
    return DefaultSample.create(data);
}

function toSampleDTO(data: Sample): SampleData {
    return DefaultSample.toDTO(data);
}

export { createSample, toSampleDTO };
