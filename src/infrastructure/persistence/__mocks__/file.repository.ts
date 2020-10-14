import { FileRepository } from '../../../app/ports';

export function getMockFileRepository(): FileRepository {
    return {
        getFileBuffer: jest.fn()
    };
}
