import { Schema, Document } from 'mongoose';

export interface ValidationErrorModel extends Document {
    code: number;
    level: number;
    message: string;
    created: Date;
    updated: Date;
}

export const validationErrorSchema = new Schema({
    code: {
        type: Number,
        required: true
    },
    level: {
        type: Number
    },
    message: {
        type: String
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
}).pre('save', function(next) {
    if (this) {
        let doc = this as ValidationErrorModel;
        let now = new Date();
        if (!doc.created) {
            doc.created = now;
        }
        doc.updated = now;
    }
    next();
});
