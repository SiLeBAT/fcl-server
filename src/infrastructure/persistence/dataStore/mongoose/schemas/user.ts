import { Schema, Document } from 'mongoose';
import { ObjectId } from 'bson';
import * as mongooseUniqueValidator from 'mongoose-unique-validator';
import { IMongooseUpdateResponse } from '../mongooseRepository';
import { IUserBase } from '../../../../../app/ports';

export interface IUserModelUpdateResponse extends IMongooseUpdateResponse {
}

export interface IUserModel extends Document, IUserBase {
    _id: ObjectId;
    password: string;
    enabled: boolean;
    adminEnabled: boolean;
    numAttempt: number;
    lastAttempt: number;
    created: Date;
    updated: Date;
}

export const userSchema = new Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
		unique: true,
		uniqueCaseInsensitive: true
    },
    password: {
        type: String,
        required: true
    },
    enabled: {
        type: Boolean,
        default: false,
        required: true
    },
    adminEnabled: {
        type: Boolean,
        default: false,
        required: true
    },
    numAttempt: {
        type: Number,
        default: 0,
        required: true
    },
    lastAttempt: {
        type: Number,
        default: Date.now(),
        required: true
    },
    created: {
        type: Date,
        default: Date.now,
        required: true
    },
    updated: {
        type: Date,
        default: Date.now,
        required: true
    }
}).pre('save', function (next) {
    if (this) {
        let doc = this as IUserModel;
        let now = new Date();
        if (!doc.created) {
            doc.created = now;
        }
        doc.updated = now;
    }
    next();
});

userSchema.plugin(mongooseUniqueValidator);
