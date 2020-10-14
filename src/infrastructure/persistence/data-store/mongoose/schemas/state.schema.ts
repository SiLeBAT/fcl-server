import { Schema, Document } from 'mongoose';

export interface StateModel extends Document {
    name: string;
    short: string;
    AVV: string[];
    created: Date;
    updated: Date;
}

export const stateSchema = new Schema({
    short: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    AVV: [
        {
            type: String
        }
    ],
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
}).pre('save', function(next) {
    if (this) {
        let doc = this as StateModel;
        let now = new Date();
        if (!doc.created) {
            doc.created = now;
        }
        doc.updated = now;
    }
    next();
});
