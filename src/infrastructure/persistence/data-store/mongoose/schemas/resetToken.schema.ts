import * as mongoose from 'mongoose';
import { UserToken } from '../../../../../app/ports';

const Schema = mongoose.Schema;

export interface TokenModel extends mongoose.Document, UserToken {
    user: string;
    created: Date;
    updated: Date;
}

export const tokenSchema = new Schema({
    token: {
        type: String,
        required: true
    },
    type: {
        type: String,
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
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
}).pre('save', function(next) {
    if (this) {
        let doc = this as TokenModel;
        let now = new Date();
        if (!doc.created) {
            doc.created = now;
        }
        doc.updated = now;
    }
    next();
});
