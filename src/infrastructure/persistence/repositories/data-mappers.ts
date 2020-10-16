import {
    Institute,
    createInstitution,
    createUser,
    User
} from '../../../app/ports';
import { InstitutionModel } from '../data-store/mongoose/schemas/institution.schema';
import { UserModel } from '../data-store/mongoose/schemas/user.schema';

function mapModelToInstitution(i: InstitutionModel): Institute {
    const inst = createInstitution(i._id);
    return {
        ...inst,
        ...{
            stateShort: i.state_short,
            name: i.name1,
            addendum: i.name2,
            city: i.city,
            zip: i.zip,
            phone: i.phone,
            fax: i.fax,
            email: i.email
        }
    };
}

function mapModelToUser(model: UserModel): User {
    return createUser(
        model._id.toHexString(),
        model.email,
        model.firstName,
        model.lastName,
        {
            uniqueId: '5ceb924cc76307386ddbf038',
            stateShort: 'BB',
            name: 'Temporary Institute',
            addendum: 'Temporary Address',
            city: 'Berlin',
            zip: '12345',
            phone: '',
            fax: '',
            email: []
        },
        model.password,
        model.dataProtectionAgreed,
        model.dataProtectionDate,
        model.newsRegAgreed,
        model.newsMailAgreed,
        model.newsDate,
        model.enabled,
        model.adminEnabled,
        model.numAttempt,
        model.lastAttempt
    );
}

export { mapModelToInstitution, mapModelToUser };
