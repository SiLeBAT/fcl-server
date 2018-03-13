import { getRepository, RepositoryType } from '../../../../core';
import { ServerError } from './../../../../../aspects';
import { IUserEntity } from './../../../shared/entities';
import { IUserdata } from '../../../shared/entities/user';
import { IUserdataRepository, IUserRepository } from '../../../shared/gateway';

async function addUserData(userId: string, userdata: IUserdata): Promise<IUserEntity> {
    try {
        const userRepository: IUserRepository = getRepository(RepositoryType.USER);
        const userDataRepository: IUserdataRepository = getRepository(RepositoryType.USERDATA);
        const data = await userDataRepository.saveUserdata(userdata);
        return await userRepository.addDataToUser(userId, data);
    } catch (err) {
        throw new ServerError(`Unable to update user, err=${err}`);
    }

}

async function updateUserData(userId: string, userdata: IUserdata): Promise<boolean> {
    try {
        const userDataRepository: IUserdataRepository = getRepository(RepositoryType.USERDATA);
        return await userDataRepository.updateUserData(userId, userdata);
    } catch (err) {
        throw new ServerError(`Unable to update user, err=${err}`);
    }

}

async function deleteUserData(userDataId: string, userId: string): Promise<IUserEntity> {
    try {
        const userRepository: IUserRepository = getRepository(RepositoryType.USER);
        const userDataRepository: IUserdataRepository = getRepository(RepositoryType.USERDATA);
        await userDataRepository.deleteUserData(userDataId);
        return await userRepository.deleteDataFromUser(userId, userDataId);
    } catch (err) {
        throw new ServerError(`Unable to update user, err=${err}`);
    }

}

export {
    addUserData,
    updateUserData,
    deleteUserData
};
