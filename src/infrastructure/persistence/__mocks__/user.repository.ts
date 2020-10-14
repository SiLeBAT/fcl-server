import { UserRepository } from '../../../app/ports';
import { genericUser } from './../../../app/authentication/application/__mocks__/user.service';

export function getMockUserRepository(): UserRepository {
    return {
        findByUserId: jest.fn(() => Promise.resolve(genericUser)),
        getPasswordForUser: jest.fn(() =>
            Promise.resolve(genericUser.password)
        ),
        findByUsername: jest.fn(() => Promise.resolve(genericUser)),
        hasUserWithEmail: jest.fn(() => Promise.resolve(false)),
        createUser: jest.fn(() => Promise.resolve(genericUser)),
        updateUser: jest.fn(() => Promise.resolve(genericUser))
    };
}
