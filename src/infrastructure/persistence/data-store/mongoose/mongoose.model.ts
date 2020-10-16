import * as mongoose from 'mongoose';

import {
    institutionSchema,
    InstitutionModel
} from './schemas/institution.schema';

import { tokenSchema, TokenModel } from './schemas/resetToken.schema';

import { userSchema, UserModel } from './schemas/user.schema';

export const MongooseInstitutionModel = mongoose.model<InstitutionModel>(
    'Institution',
    institutionSchema
);

export const MongooseTokenModel = mongoose.model<TokenModel>(
    'ResetToken',
    tokenSchema
);

export const MongooseUserModel = mongoose.model<UserModel>('User', userSchema);
