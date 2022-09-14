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
        // here query and pquery are used because
        // query.populate(..) is not anymore assignable to query
        // since last mongoose bump (6.2.8 to 6.6.0)
        const query = this._model.find({});
        if (populate.length > 0) {
            let pquery = query.populate(populate[0]);
            populate.slice(1).forEach((p) => {
                pquery = pquery.populate(p);
            });
            return pquery.exec();
        } else {
            return query.exec();
        }
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
