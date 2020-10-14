import { MongooseRepositoryBase } from '../data-store/mongoose/mongoose.repository';
import {
    StateRepository,
    State,
    AVVFormatCollection
} from '../../../app/ports';
import { mapModelToState } from './data-mappers';
import { StateModel } from '../data-store/mongoose/schemas/state.schema';
import { injectable, inject } from 'inversify';
import { Model } from 'mongoose';
import { PERSISTENCE_TYPES } from '../persistence.types';

@injectable()
export class DefaultStateRepository extends MongooseRepositoryBase<StateModel>
    implements StateRepository {
    constructor(
        @inject(PERSISTENCE_TYPES.StateModel) model: Model<StateModel>
    ) {
        super(model);
    }

    getAllFormats(): Promise<AVVFormatCollection> {
        return this.retrieve().then(states => {
            const collection: AVVFormatCollection = {};
            states.forEach(entry => (collection[entry.short] = entry.AVV));
            return collection;
        });
    }

    private retrieve(): Promise<State[]> {
        return super._retrieve().then(modelArray => {
            return modelArray.map(m => mapModelToState(m));
        });
    }
}
