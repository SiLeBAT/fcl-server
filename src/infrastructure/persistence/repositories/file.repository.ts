import { FileRepository } from '../../../app/ports';
import { loadBinaryFile } from '../data-store/file/file-loader';
import { injectable, inject } from 'inversify';
import { PERSISTENCE_TYPES } from '../persistence.types';

@injectable()
export class DefaultFileRepository implements FileRepository {
    constructor(@inject(PERSISTENCE_TYPES.DataDir) private dataDir: string) {}
    getFileBuffer(fileName: string) {
        try {
            return loadBinaryFile(fileName, this.dataDir);
        } catch (error) {
            throw error;
        }
    }
}
