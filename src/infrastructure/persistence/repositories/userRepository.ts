import { IRepositoryBase, IUserRepository, createUser, IUser } from './../../../app/ports';
import { UserSchema, IUserModel, IUserModelUpdateResponse, createRepository } from './../dataStore';
import { mapModelToUser } from './dataMappers';

class UserRepository implements IUserRepository {
    constructor(private baseRepo: IRepositoryBase<IUserModel>) {
    }

    findById(id: string) {
        return this.baseRepo.findById(id)
			.then((userModel: IUserModel) => {
			    if (!userModel) return null;
			    return mapModelToUser(userModel);
}
		);
    }

    findByUsername(username: string) {
        const nameRegex = new RegExp(username, 'i');

        return this.baseRepo.findOne({ 'email': { $regex: nameRegex } })
            .then((userModel: IUserModel | null) => {
                if (!userModel) return Promise.reject(null);
                return populateWithAuxData(userModel);
            })
            .then(
                (userModel: IUserModel) => {
                    if (!userModel) return null;
                    return mapModelToUser(userModel);
                }
            );
    }

    getPasswordForUser(username: string) {
        const nameRegex = new RegExp(username, 'i');

        return this.baseRepo.findOne({ 'email': { $regex: nameRegex } })
            .then((userModel: IUserModel) => {
                if (!userModel) return null;
                return userModel.password;
            }
        );
    }

    hasUser(username: string) {
        const nameRegex = new RegExp(username, 'i');

        return this.baseRepo.findOne({ 'email': { $regex: nameRegex } })
            .then(docs => !!docs
        );
    }

    createUser(user: IUser) {
        const newUser = new UserSchema({
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            password: user.password
        });
        return this.baseRepo.create(newUser).then(
            model => createUser(model._id.toHexString(), user.email, user.firstName, user.lastName, user.password, model.enabled, model.adminEnabled)
        );
    }

    // FIXME: Should also update institutions
    updateUser(user: IUser) {
        return this.baseRepo.update(user.uniqueId, {
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            password: user.password,
            enabled: user.isActivated(),
            adminEnabled: user.isAdminActivated(),
            numAttempt: user.getNumberOfFailedAttempts(),
            lastAttempt: user.getLastLoginAttempt()
        }).then(
            (response: IUserModelUpdateResponse) => {
                if (!response.ok) return null;
                return this.findById(user.uniqueId);
            }
        );
    }

}

function populateWithAuxData(model: IUserModel): Promise<IUserModel> {
    // For some reason .populate does not return a promise and only works with callback: although the docs promise otherwise.
    return new Promise(function (resolve, reject) {
        model.populate({ path: 'institution' }, function (err, data) {
            if (err !== null) return reject(err);
            resolve(data);
        });
    });

}

export const repository: IUserRepository = new UserRepository(createRepository(UserSchema));
