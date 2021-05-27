// these types should have been provided by @types/mongoose
// however, types in @types/mongoose/index.d.ts (5.10.5) do not match types in mongoose/index.d.ts anymore
// the mongoose version had to be increased from version 5.10.19 to 5.12.8 to fix a moderate vulnerability
// types were extracted from @types/mongoose 5.10.5

import mongodb from 'mongodb';
import { FilterQuery } from 'mongoose';

// the next definition is different to @types/mongoose 5.10.5
export type MongooseFilterQuery<T> = FilterQuery<T>;

type NonFunctionPropertyNames<T> = {
    [K in keyof T]: T[K] extends Function ? never : K;
}[keyof T];

type NonFunctionProperties<T> = Pick<T, NonFunctionPropertyNames<T>>;

type IfEquals<X, Y, A, B> = (<T>() => T extends X ? 1 : 2) extends <
    T
>() => T extends Y ? 1 : 2
    ? A
    : B;

type ReadonlyKeysOf<T> = {
    [P in keyof T]: IfEquals<
        { [Q in P]: T[P] },
        { -readonly [Q in P]: T[P] },
        never,
        P
    >;
}[keyof T];

type OmitReadonly<T> = Omit<T, ReadonlyKeysOf<T>>;

type MongooseBuiltIns =
    | mongodb.ObjectID
    | mongodb.Decimal128
    | Date
    | number
    | boolean;

type ImplicitMongooseConversions<T> = T extends MongooseBuiltIns
    ? T extends boolean | mongodb.Decimal128 | Date
        ? T | string | number // accept numbers for these
        : T | string
    : T;

type DeepCreateObjectTransformer<T> = T extends MongooseBuiltIns
    ? T
    : T extends object
    ? {
          [V in keyof NonFunctionProperties<OmitReadonly<T>>]: T[V] extends
              | object
              | undefined
              ? ImplicitMongooseConversions<
                    DeepCreateTransformer<NonNullable<T[V]>>
                >
              : ImplicitMongooseConversions<T[V]>;
      }
    : T;

// removes functions from schema from all levels
type DeepCreateTransformer<T> = T extends Map<infer KM, infer KV> // handle map values // Maps are not scrubbed, replace below line with this once minimum TS version is 3.7: // ? Map<KM, DeepNonFunctionProperties<KV>>
    ? { [key: string]: DeepCreateTransformer<KV> } | [KM, KV][] | Map<KM, KV>
    : T extends Array<infer U>
    ? Array<DeepCreateObjectTransformer<U>>
    : DeepCreateObjectTransformer<T>;

// mongoose allows Map<K, V> to be specified either as a Map or a Record<K, V>
type DeepMapAsObject<T> = T extends object | undefined
    ? {
          [K in keyof T]: T[K] extends Map<infer KM, infer KV> | undefined // if it's a map, transform it into Map | Record // only string keys allowed
              ? KM extends string
                  ?
                        | Map<KM, DeepMapAsObject<KV>>
                        | Record<KM, DeepMapAsObject<KV>>
                        | [KM, DeepMapAsObject<KV>][]
                  : never // otherwise if it's an object or undefined (for optional props), recursively go again
              : T[K] extends object | undefined
              ? DeepMapAsObject<T[K]>
              : T[K];
      }
    : T;

/* Helper type to extract a definition type from a Document type */
type DocumentDefinition<T> = Omit<T, Exclude<keyof Document, '_id'>>;

type ScrubCreateDefinition<T> = DeepMapAsObject<DeepCreateTransformer<T>>;

type CreateDocumentDefinition<T> = ScrubCreateDefinition<DocumentDefinition<T>>;

// check whether a type consists just of {_id: T} and no other properties
type HasJustId<T> = keyof Omit<T, '_id'> extends never ? true : false;

// ensure that if an empty document type is passed, we allow any properties
// for backwards compatibility
export type CreateQuery<D> = HasJustId<CreateDocumentDefinition<D>> extends true // tslint:disable-next-line:no-any
    ? { _id?: any } & Record<string, any>
    : D extends { _id: infer TId }
    ? mongodb.OptionalId<CreateDocumentDefinition<D> & { _id: TId }>
    : CreateDocumentDefinition<D>;
