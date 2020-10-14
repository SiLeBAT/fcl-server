import { Schema, Document } from 'mongoose';

export interface NRLModel extends Document {
    name: string;
    selector: string[];
    created: Date;
    updated: Date;
}

export const nrlSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    selector: [
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
        let doc = this as NRLModel;
        let now = new Date();
        if (!doc.created) {
            doc.created = now;
        }
        doc.updated = now;
    }
    next();
});
