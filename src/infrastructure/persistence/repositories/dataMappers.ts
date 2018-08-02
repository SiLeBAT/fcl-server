import { createUser, IUser } from './../../../app/ports';
import { IUserModel } from './../dataStore';

function mapModelToUser(model: IUserModel): IUser {
    return createUser(model._id.toHexString(),
					  model.email,
					  model.firstName,
					  model.lastName,
					  model.password,
					  model.enabled,
					  model.adminEnabled,
					  model.numAttempt,
					  model.lastAttempt);
}

export {
    mapModelToUser
};
