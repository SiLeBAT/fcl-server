import {
    InstituteRepository,
    Institute,
    createInstitution,
} from '../../../app/ports';
import { mapModelToInstitution } from './data-mappers';
import { InstitutionModel } from '../data-store/mongoose/schemas/institution.schema';
import { MongooseRepositoryBase } from '../data-store/mongoose/mongoose.repository';
import { injectable, inject } from 'inversify';
import { Model } from 'mongoose';
import { PERSISTENCE_TYPES } from '../persistence.types';

@injectable()
export class MongooseInstituteRepository
    extends MongooseRepositoryBase<InstitutionModel>
    implements InstituteRepository {
    constructor(
        @inject(PERSISTENCE_TYPES.InstitutionModel)
        private model: Model<InstitutionModel>
    ) {
        super(model);
    }

    findByInstituteId(id: string): Promise<Institute> {
        return Promise.resolve(this.returnTemporaryInstitute());
    }

    retrieve(): Promise<Institute[]> {
        return super._retrieve().then((modelArray) => {
            return modelArray.map((m) => mapModelToInstitution(m));
        });
    }

    createInstitute(institution: Institute): Promise<Institute> {
        const newInstitution = new this.model({
            state_short: institution.stateShort,
            name1: institution.name,
            city: institution.city,
            zip: institution.zip,
            phone: institution.phone,
            fax: institution.fax,
        });
        return super
            ._create(newInstitution)
            .then((model) => createInstitution(model._id.toHexString()));
    }

    findByInstituteName(name: string): Promise<Institute> {
        return Promise.resolve(this.returnTemporaryInstitute());
    }

    // FIXME: Remove this for fcl
    private returnTemporaryInstitute(): Institute {
        return {
            uniqueId: '5ceb924cc76307386ddbf038',
            stateShort: 'BB',
            name: 'Temporary Institute',
            addendum: 'Temporary Address',
            city: 'Berlin',
            zip: '12345',
            phone: '',
            fax: '',
            email: [],
        };
    }
}
