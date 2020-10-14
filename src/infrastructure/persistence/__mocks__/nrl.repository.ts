import { NRLRepository } from '../../../app/ports';

export function getMockNRLRepository(): NRLRepository {
    return {
        getAllNRLs: jest.fn(() => Promise.resolve([]))
    };
}
