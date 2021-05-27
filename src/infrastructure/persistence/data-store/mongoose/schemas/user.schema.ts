import { Schema, Document } from 'mongoose';
import { ObjectId } from 'bson';
import mongooseUniqueValidator from 'mongoose-unique-validator';
import { MongooseUpdateResponse } from '../mongoose.repository';
import { InstitutionModel } from './institution.schema';

export interface UserModelUpdateResponse extends MongooseUpdateResponse {}

export interface UserModel extends Document {
    _id: ObjectId;
    password: string;
    email: string;
    firstName: string;
    lastName: string;
    institution: InstitutionModel;
    dataProtectionAgreed: boolean;
    dataProtectionDate: Date;
    newsRegAgreed: boolean;
    newsMailAgreed: boolean;
    newsDate: Date;
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
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        uniqueCaseInsensitive: true,
    },
    password: {
        type: String,
        required: true,
    },
    enabled: {
        type: Boolean,
        default: false,
        required: true,
    },
    adminEnabled: {
        type: Boolean,
        default: false,
        required: true,
    },
    numAttempt: {
        type: Number,
        default: 0,
        required: true,
    },
    lastAttempt: {
        type: Number,
        default: Date.now(),
        required: true,
    },
    institution: {
        type: Schema.Types.ObjectId,
        ref: 'Institution',
    },
    dataProtectionAgreed: {
        type: Boolean,
        required: true,
    },
    dataProtectionDate: {
        type: Date,
        required: true,
    },
    newsRegAgreed: {
        type: Boolean,
        required: true,
    },
    newsMailAgreed: {
        type: Boolean,
        required: true,
    },
    newsDate: {
        type: Date,
        required: true,
    },
    created: {
        type: Date,
        default: Date.now,
        required: true,
    },
    updated: {
        type: Date,
        default: Date.now,
        required: true,
    },
}).pre('save', function (next) {
    if (this) {
        let doc = this as UserModel;
        let now = new Date();
        if (!doc.created) {
            doc.created = now;
        }
        doc.updated = now;
    }
    next();
});

userSchema.plugin(mongooseUniqueValidator);
