import * as _ from 'lodash';
import * as moment from 'moment';
import { NRLRepository } from '../../ports';
import { NRLConfig, NRLSelectorProvider } from '../model/validation.model';
import { injectable, inject } from 'inversify';
import { APPLICATION_TYPES } from './../../application.types';

moment.locale('de');

@injectable()
export class DefaultNRLSelectorProvider implements NRLSelectorProvider {
    private nrls: NRLConfig[] = [];
    constructor(
        @inject(APPLICATION_TYPES.NRLRepository)
        private nrlRepository: NRLRepository
    ) {
        this.nrlRepository
            .getAllNRLs()
            .then(data => (this.nrls = data))
            .catch(error => {
                throw error;
            });
    }
    getSelectors(nrl?: string): RegExp[] {
        let result: RegExp[] = [];
        if (!nrl) {
            return result;
        }
        const found = this.nrls.find(n => n.name === nrl);
        if (found) {
            result = found.selectors.map(s => new RegExp(s));
        }
        return result;
    }
}
