import { SearchAlias } from './validation.model';

export type CatalogData = Record<string, string>;
export interface Catalog<CatalogData> {
    getEntriesWithKeyValue(key: string, value: string): CatalogData[];
    getUniqueEntryWithId(id: string): CatalogData;
    containsUniqueEntryWithId(id: string): boolean;
    containsEntryWithKeyValue(key: string, value: string): boolean;
    hasUniqueId(): boolean;
    getUniqueId(): string;
    // tslint:disable-next-line
    getFuzzyIndex(options: Fuse.FuseOptions, enhamcements?: any[]): Fuse;
    dump(): CatalogData[];
}

export interface CatalogPort {
    getCatalog(catalogName: string): Catalog<Record<string, string>>;
    getCatalogSearchAliases(catalogName: string): SearchAlias[];
}

export interface CatalogService extends CatalogPort {}
