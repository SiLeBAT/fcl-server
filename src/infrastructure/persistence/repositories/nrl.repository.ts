import { NRLRepository, NRLConfig } from '../../../app/ports';
import { mapModelToNRL } from './data-mappers';
import { NRLModel } from '../data-store/mongoose/schemas/nrl.schema';
import { MongooseRepositoryBase } from '../data-store/mongoose/mongoose.repository';
import { injectable, inject } from 'inversify';
import { Model } from 'mongoose';
import { PERSISTENCE_TYPES } from '../persistence.types';

@injectable()
export class MongooseNRLRepository extends MongooseRepositoryBase<NRLModel>
    implements NRLRepository {
    constructor(@inject(PERSISTENCE_TYPES.NRLModel) model: Model<NRLModel>) {
        super(model);
    }

    getAllNRLs(): Promise<NRLConfig[]> {
        return this._retrieve()
            .then(modelArray => {
                return modelArray.map(m => mapModelToNRL(m));
            })
            .catch(error => {
                throw error;
            });
    }
}
