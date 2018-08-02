// core
// npm
import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';
// local
import { IDataStore } from './../dataStoreFactory';
import { logger } from './../../../../aspects';

import { userSchema, resetTokenSchema, IResetTokenModel, IUserModel } from './schemas';

// tslint:disable-next-line
(mongoose as any).Promise = Promise;

export class MongooseDataStore implements IDataStore {
    initialize(connecionString: string) {
        mongoose.connect(connecionString).then(
            db => logger.info('Connected to DB', { connectionString: connecionString }),
            err => { throw new Error(`Unable to connect to DB. connectionString=${connecionString} error=${err}`); }
        );
    }
}

export const ResetTokenSchema = mongoose.model<IResetTokenModel>('ResetToken', resetTokenSchema);
export const UserSchema = mongoose.model<IUserModel>('User', userSchema);
