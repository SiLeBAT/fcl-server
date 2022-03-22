import { Model, Types } from 'mongoose';
import { injectable } from 'inversify';
import { CommonDocument } from './common.model';

@injectable()
export class MongooseRepositoryBase<T extends CommonDocument> {
    private _model: Model<T>;

    constructor(schemaModel: Model<T>) {
        this._model = schemaModel;
    }

    protected async _create(item: T): Promise<T> {
        return this._model.create(item);
    }

    protected async _retrieve(): Promise<T[]> {
        return this._model.find({}).exec();
    }

    protected async _retrievePopulatedWith(populate: string[]): Promise<T[]> {
        let query = this._model.find({});
        populate.forEach((p) => {
            query = query.populate(p);
        });
        return query.exec();
    }

    protected async _update(_id: string, attr: Partial<T>): Promise<T | null> {
        return this._model
            .findByIdAndUpdate(
                this._toObjectId(_id),
                { ...attr, updated: Date.now() },
                { useFindAndModify: false }
            )
            .exec();
    }

    protected async _delete(_id: string): Promise<T | null> {
        return this._model.findByIdAndRemove(_id).exec();
    }

    protected async _findById(_id: string): Promise<T | null> {
        return this._model.findById(_id).exec();
    }

    protected async _findOne(cond: {}): Promise<T | null> {
        return this._model.findOne(cond).exec();
    }

    protected async _find(
        cond: {},
        fields?: Object,
        options?: Object
    ): Promise<T[]> {
        return this._model.find(cond, options).exec();
    }

    private _toObjectId(_id: string): Types.ObjectId {
        return new Types.ObjectId(_id);
    }
}

function createRepository<T extends CommonDocument>(schema: Model<T>) {
    return new MongooseRepositoryBase(schema);
}

export { createRepository };
