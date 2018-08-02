import { userRepository, tokenRepository } from './../../../infrastructure/persistence/repositories';
import { ApplicationSystemError } from '../errors';

export enum RepositoryType {
    USER, TOKEN
}
export interface IRepositoryFactory {
    // tslint:disable-next-line
    getRepository(repositoryName: RepositoryType): any;
}

export class RepositoryFactory implements IRepositoryFactory {
    getRepository(repositoryName: RepositoryType) {
        switch (repositoryName) {
            case RepositoryType.USER:
                return userRepository;
            case RepositoryType.TOKEN:
                return tokenRepository;
            default:
                throw new ApplicationSystemError(`Unknown repositoryName, repositoryName=${repositoryName}`);
        }
    }
}
