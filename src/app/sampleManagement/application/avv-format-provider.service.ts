import * as _ from 'lodash';
import * as moment from 'moment';
import { AVVFormatProvider } from '../model/validation.model';
import { AVVFormatCollection, StateRepository } from '../../ports';
import { injectable, inject } from 'inversify';
import { APPLICATION_TYPES } from './../../application.types';

moment.locale('de');

// TODO: should these be in the DB?
@injectable()
export class DefaultAVVFormatProvider implements AVVFormatProvider {
    private stateFormats: AVVFormatCollection = {};

    constructor(
        @inject(APPLICATION_TYPES.StateRepository)
        private stateRepository: StateRepository
    ) {
        this.stateRepository
            .getAllFormats()
            .then(data => (this.stateFormats = data))
            .catch(error => {
                throw error;
            });
    }
    getFormat(state?: string): string[] {
        let usedFormats = _.flatMap(this.stateFormats);
        if (state) {
            usedFormats = _.flatMap(
                _.filter(this.stateFormats, (v, k) => k === state)
            );
        }
        return usedFormats;
    }
}
export function createService(repository: StateRepository): AVVFormatProvider {
    return new DefaultAVVFormatProvider(repository);
}
