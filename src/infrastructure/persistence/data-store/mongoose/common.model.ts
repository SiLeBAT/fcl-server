import { Document } from 'mongoose';

export interface CommonDocument extends Document {
    created: Date;
    updated: Date;
}
