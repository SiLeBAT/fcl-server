import { Schema, Document } from 'mongoose';

export interface InstitutionModel extends Document {
    created: Date;
    updated: Date;
    state_short: string;
    name1: string;
    name2: string;
    location: string;
    zip: string;
    city: string;
    phone: string;
    fax: string;
    email: string[];
}

export const institutionSchema = new Schema({
    state_short: {
        type: String,
        required: true
    },
    name1: {
        type: String,
        required: true
    },
    name2: {
        type: String
    },
    location: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    fax: {
        type: String
    },
    zip: {
        type: String
    },
    city: {
        type: String
    },
    email: [
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
        let doc = this as InstitutionModel;
        let now = new Date();
        if (!doc.created) {
            doc.created = now;
        }
        doc.updated = now;
    }
    next();
});
