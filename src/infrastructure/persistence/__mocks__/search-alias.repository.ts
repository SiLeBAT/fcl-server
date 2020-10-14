import { SearchAliasRepository } from '../../../app/ports';

export function getMockSearchAliasRepository(): SearchAliasRepository {
    return {
        getAliases: jest.fn()
    };
}
