import { UserRepository, createUser, User } from '../../../app/ports';
import { mapModelToUser } from './data-mappers';
import { UserModel } from '../data-store/mongoose/schemas/user.schema';
import { MongooseRepositoryBase } from '../data-store/mongoose/mongoose.repository';
import { UserNotFoundError, UserUpdateError } from '../model/domain.error';
import { injectable, inject } from 'inversify';
import { Model } from 'mongoose';
import { PERSISTENCE_TYPES } from '../persistence.types';

@injectable()
export class DefaultUserRepository extends MongooseRepositoryBase<UserModel>
    implements UserRepository {
    constructor(
        @inject(PERSISTENCE_TYPES.UserModel) private model: Model<UserModel>
    ) {
        super(model);
    }

    findByUserId(id: string) {
        return super
            ._findById(id)
            .then((userModel: UserModel) => {
                if (!userModel) {
                    throw new UserNotFoundError(`User not found. id=${id}`);
                }
                return mapModelToUser(userModel);
            })
            .catch((error) => {
                throw error;
            });
    }

    findByUsername(username: string) {
        const nameRegex = new RegExp(username, 'i');

        return (
            super
                ._findOne({ email: { $regex: nameRegex } })
                .then((userModel: UserModel) => {
                    if (!userModel) {
                        throw new UserNotFoundError(
                            `User not found. username=${username}`
                        );
                    }
                    return mapModelToUser(userModel);
                })
                // tslint:disable-next-line:no-any
                .catch((error: any) => {
                    throw error;
                })
        );
    }

    getPasswordForUser(username: string) {
        const nameRegex = new RegExp(username, 'i');

        return (
            super
                ._findOne({ email: { $regex: nameRegex } })
                .then((userModel: UserModel) => {
                    if (!userModel) {
                        throw new UserNotFoundError(
                            `User not found. username=${username}`
                        );
                    }
                    return userModel.password;
                })
                // tslint:disable-next-line:no-any
                .catch((error: any) => {
                    throw error;
                })
        );
    }

    hasUserWithEmail(username: string) {
        const nameRegex = new RegExp(username, 'i');

        return super
            ._findOne({ email: { $regex: nameRegex } })
            .then((docs: UserModel) => !!docs);
    }

    createUser(user: User) {
        const newUser = new this.model({
            institution: user.institution.uniqueId,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            password: user.password,
            dataProtectionAgreed: user.dataProtectionAgreed,
            dataProtectionDate: user.dataProtectionDate,
            newsRegAgreed: user.newsRegAgreed,
            newsMailAgreed: user.newsMailAgreed,
            newsDate: user.newsDate,
        });

        return super
            ._create(newUser)
            .then((model) =>
                createUser(
                    model._id.toHexString(),
                    user.email,
                    user.firstName,
                    user.lastName,
                    user.institution,
                    user.password,
                    user.dataProtectionAgreed,
                    user.dataProtectionDate,
                    user.newsRegAgreed,
                    user.newsMailAgreed,
                    user.newsDate,
                    model.enabled,
                    model.adminEnabled
                )
            )
            .catch((error) => {
                throw error;
            });
    }

    updateUser(user: User) {
        return super
            ._update(user.uniqueId, {
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                password: user.password,
                enabled: user.isVerified(),
                adminEnabled: user.isActivated(),
                numAttempt: user.getNumberOfFailedAttempts(),
                lastAttempt: user.getLastLoginAttempt(),
                dataProtectionAgreed: user.dataProtectionAgreed,
                dataProtectionDate: user.dataProtectionDate,
                newsRegAgreed: user.newsRegAgreed,
                newsMailAgreed: user.newsMailAgreed,
                newsDate: user.newsDate,
            })
            .then(async (response) => {
                if (response === null) {
                    throw new UserUpdateError(
                        `Response not OK. Unable to update user. user=${user}`
                    );
                }
                return this.findByUserId(user.uniqueId);
            })
            .catch((error) => {
                throw error;
            });
    }
}
