
import { MongooseDataStore } from './mongoose';
import { logger } from './../../../aspects';

export interface IDataStore {
    initialize(connectionString: string): void;
}

export enum DataStoreType {
    MONGO = 'MongoDB'
}

function createDataStore(type: DataStoreType): IDataStore {
    logger.info('Creating datastore', { type: type });
    switch (type) {
        case DataStoreType.MONGO:
            return new MongooseDataStore();
        default:
            throw new Error(`Unable to create datastore: Unknown DataStore Type, type=${type}`);
    }

}

export {
    createDataStore
};
