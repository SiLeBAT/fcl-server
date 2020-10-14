import { User, UserService } from '../../model/user.model';

export const genericUser: User = {
    uniqueId: 'test',
    firstName: 'test',
    lastName: 'test',
    email: 'test',
    password: 'test',
    dataProtectionAgreed: false,
    dataProtectionDate: new Date('01.07.2020'),
    newsRegAgreed: false,
    newsMailAgreed: false,
    newsDate: new Date('01.07.2020'),
    institution: {
        uniqueId: 'test',
        stateShort: 'test',
        name: 'test',
        addendum: 'test',
        city: 'test',
        zip: 'test',
        phone: 'test',
        fax: 'test',
        email: []
    },
    getFullName: jest.fn(),
    isAuthorized: jest.fn(),
    updatePassword: jest.fn(),
    isActivated: jest.fn(() => true),
    isVerified: jest.fn(() => true),
    getNumberOfFailedAttempts: jest.fn(),
    getLastLoginAttempt: jest.fn(),
    updateNumberOfFailedAttempts: jest.fn(),
    updateLastLoginAttempt: jest.fn(),
    isNewsMailAgreed: jest.fn(() => true),

};

export function getMockUserService(): UserService {
    return {
        getUserById: jest.fn(() => Promise.resolve(genericUser)),
        getUserByEmail: jest.fn(() => Promise.resolve(genericUser)),
        updateUser: jest.fn(),
        createUser: jest.fn(() => Promise.resolve(genericUser)),
        hasUserWithEmail: jest.fn(() => Promise.resolve(false))
    };
}
