import {
    Document,
    Model,
    Types,
    MongooseFilterQuery,
    CreateQuery
} from 'mongoose';
import { injectable } from 'inversify';

interface UpdateResponse {}
export interface MongooseUpdateResponse extends UpdateResponse {
    ok: number;
}

interface ModelAttributes {}
interface Read<T> {
    retrieve: () => Promise<T[]>;
    findById: (id: string) => Promise<T | null>;
    findOne(cond?: Object): Promise<T | null>;
    find(cond: Object, fields: Object, options: Object): Promise<T[]>;
}

interface Write<T> {
    create: (item: T) => Promise<T>;
    update: (
        _id: string,
        attributes: ModelAttributes
    ) => Promise<UpdateResponse>;
    delete: (_id: string) => Promise<T>;
}

export interface RepositoryBase<T> extends Read<T>, Write<T> {}

@injectable()
export class MongooseRepositoryBase<T extends Document> {
    private _model: Model<T>;

    constructor(schemaModel: Model<T>) {
        this._model = schemaModel;
    }

    protected _create(item: T) {
        return this._model.create(item as CreateQuery<T>);
    }

    protected _retrieve() {
        return this._model.find({}).exec();
    }

    protected _update(
        _id: string,
        attr: ModelAttributes
    ): Promise<MongooseUpdateResponse> {
        return this._model
            .update(
                { _id: this._toObjectId(_id) } as MongooseFilterQuery<T>,
                {
                    ...attr,
                    ...{ updated: Date.now() }
                    // tslint:disable-next-line:no-any
                } as any
            )
            .exec();
    }

    protected _delete(_id: string) {
        return this._model
            .remove({ _id: _id } as MongooseFilterQuery<T>)
            .exec();
    }

    protected _findById(_id: string) {
        return this._model.findById(_id).exec();
    }

    protected _findOne(cond?: Object) {
        return this._model.findOne(cond as MongooseFilterQuery<T>).exec();
    }

    protected _find(
        cond?: Object,
        fields?: Object,
        options?: Object
    ): Promise<T[]> {
        return this._model.find(cond as MongooseFilterQuery<T>, options).exec();
    }

    private _toObjectId(_id: string): Types.ObjectId {
        return Types.ObjectId.createFromHexString(_id);
    }
}

function createRepository<T extends Document>(schema: Model<T>) {
    return new MongooseRepositoryBase(schema);
}

export { createRepository };
