import { createService, ILoginService } from './../login.service';
import { LoginResult } from '../../domain';

jest.mock('./../../../sharedKernel', () => ({
    RepositoryType: {
        USER: 0
    }
}));

describe('Login User Use Case', () => {
    // tslint:disable-next-line
    let mockUserRepository: any;
    // tslint:disable-next-line
    let mockActivationService: any;
    let service: ILoginService;
    beforeEach(() => {

        mockUserRepository = jest.fn(() => ({
            findByUsername: jest.fn()
        }));

        mockActivationService = jest.fn(() => ({
            prepareUserForActivation: jest.fn(),
            prepareUserForAdminActivation: jest.fn(),
            handleUserIfNotAdminActivated: jest.fn()
        }));

        service = createService(mockUserRepository, mockActivationService);
    });

    // it('should return a promise', () => {
    //     mockUserRepository.findByUsername = jest.fn(() => ({
    //         isActivated: () => true,
    //         isAdminActivated: () => true,
    //         isAuthorized: () => true,
    //         getLastLoginAttempt: () => 0,
    //         getNumberOfFailedAttempts: () => 0
    //     }));
    //     const credentials = {
    //         email: 'test',
    //         password: 'test',
    //         userAgent: 'test',
    //         host: 'test'
    //     };
    //     const result = service.loginUser(credentials);
    //     expect(result).toBeInstanceOf(Promise);
    // });

    it('should be return a login success', () => {

        const mockUser = {
            isActivated: () => true,
            isAdminActivated: () => true,
            isAuthorized: () => true,
            getLastLoginAttempt: () => 0,
            getNumberOfFailedAttempts: () => 0
        };
        mockUserRepository.findByUsername = jest.fn(() => mockUser);
        mockUserRepository.updateUser = jest.fn(() => mockUser);

        const credentials = {
            email: 'test',
            password: 'test',
            userAgent: 'test',
            host: 'test'
        };
        const result = service.loginUser(credentials);
        expect.assertions(1);
        return result.then(
            data => expect(data.user).toEqual(mockUser)
        );
    });

    it('should be return a login fail because unauthorized', () => {

        mockUserRepository.findByUsername = jest.fn(() => ({
            isActivated: () => true,
            isAdminActivated: () => true,
            isAuthorized: () => false,
            getLastLoginAttempt: () => 0,
            getNumberOfFailedAttempts: () => 0
        }));

        const credentials = {
            email: 'test',
            password: 'test',
            userAgent: 'test',
            host: 'test'
        };
       // expect(service.loginUser(credentials)).toThrowError();
        const result = service.loginUser(credentials);
        expect.assertions(1);
        return result.then(
            data => expect(data).toBe(LoginResult.FAIL),
            err => {
                return expect(err).toBeTruthy();
            }
        );
    });

    it('should be throw an error because inactive user is faulty', () => {

        mockUserRepository.findByUsername = jest.fn(() => ({
            isActivated: () => false,
            isAdminActivated: () => true,
            isAuthorized: () => true,
            getLastLoginAttempt: () => 0,
            getNumberOfFailedAttempts: () => 0
        }));

        mockActivationService.prepareUserForActivation = jest.fn(() => Promise.reject(true));
        mockActivationService.prepareUserForAdminActivation = jest.fn(() => Promise.reject(true));
        mockActivationService.handleUserIfNotAdminActivated = jest.fn(() => Promise.reject(true));

        const credentials = {
            email: 'test',
            password: 'test',
            userAgent: 'test',
            host: 'test'
        };
        const result = service.loginUser(credentials);
        expect.assertions(1);
        return result.then(
            data => {
                return true;
            },
            err => {
                return expect(err).toBeTruthy();
            }
        );
    });

    it('should be throw an error because user not activated by admin is faulty', () => {

        mockUserRepository.findByUsername = jest.fn(() => ({
            isActivated: () => true,
            isAdminActivated: () => false,
            isAuthorized: () => true,
            getLastLoginAttempt: () => 0,
            getNumberOfFailedAttempts: () => 0

        }));

        mockActivationService.prepareUserForActivation = jest.fn(() => Promise.reject(true));
        mockActivationService.prepareUserForAdminActivation = jest.fn(() => Promise.reject(true));
        mockActivationService.handleUserIfNotAdminActivated = jest.fn(() => Promise.reject(true));

        const credentials = {
            email: 'test',
            password: 'test',
            userAgent: 'test',
            host: 'test'
        };
        const result = service.loginUser(credentials);
        expect.assertions(1);
        return result.then(
            data => {
                return true;
            },
            err => {
                return expect(err).toBeTruthy();
            }
        );
    });

    it('should be throw an error because inactive user and user not activated by admin is faulty', () => {

        mockUserRepository.findByUsername = jest.fn(() => ({
            isActivated: () => false,
            isAdminActivated: () => false,
            isAuthorized: () => true,
            getLastLoginAttempt: () => 0,
            getNumberOfFailedAttempts: () => 0

        }));

        mockActivationService.prepareUserForActivation = jest.fn(() => Promise.reject(true));
        mockActivationService.prepareUserForAdminActivation = jest.fn(() => Promise.reject(true));
        mockActivationService.handleUserIfNotAdminActivated = jest.fn(() => Promise.reject(true));

        const credentials = {
            email: 'test',
            password: 'test',
            userAgent: 'test',
            host: 'test'
        };
        const result = service.loginUser(credentials);
        expect.assertions(1);
        return result.then(
            data => {
                return true;
            },
            err => {
                return expect(err).toBeTruthy();
            }
        );
    });

});
