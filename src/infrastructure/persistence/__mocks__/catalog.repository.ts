import { CatalogData, Catalog, CatalogRepository } from '../../../app/ports';

const mockFuse = {
    search: jest.fn(() => [])
};
const mockCatalog: Catalog<CatalogData> = {
    getEntriesWithKeyValue: jest.fn(() => []),
    getUniqueEntryWithId: jest.fn(),
    containsUniqueEntryWithId: jest.fn(),
    containsEntryWithKeyValue: jest.fn(),
    hasUniqueId: jest.fn(),
    getUniqueId: jest.fn(),
    getFuzzyIndex: jest.fn(() => mockFuse),
    dump: jest.fn()
};

export function getMockCatalogRepository(): CatalogRepository {
    return {
        getCatalog: jest.fn(() => mockCatalog)
    };
}
