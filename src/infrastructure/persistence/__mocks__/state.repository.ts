import { StateRepository } from '../../../app/ports';

export function getMockStateRepository(): StateRepository {
    return {
        getAllFormats: jest.fn(() => Promise.resolve({}))
    };
}
