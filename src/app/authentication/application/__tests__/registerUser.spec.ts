import { createService, IRegistrationService, IUserRegistration } from './../registration.service';
import { createUser } from '../../domain';

jest.mock('./../../../sharedKernel', () => ({
    RepositoryType: {
        USER: 0
    }
}));

jest.mock('./../../domain', () => ({
    generateToken: jest.fn(),
    verifyToken: jest.fn(),
    createUser: jest.fn(() => ({
        updatePassword: jest.fn()
    }))
}));

describe('Register User Use Case', () => {
    // tslint:disable-next-line
    let mockUserRepository: any;
    // tslint:disable-next-line
    let mockTokenRepository: any;
    // tslint:disable-next-line
    let mockNotificationService: any;
    // tslint:disable-next-line
    let service: IRegistrationService;
    let credentials: IUserRegistration;
    beforeEach(() => {
        mockUserRepository = {
            hasUser: jest.fn(() => false),
            createUser: jest.fn(() => true)
        };

        mockTokenRepository = {
            deleteTokenForUser: jest.fn(() => true)
        };

        credentials = {
            firstName: 'test',
            lastName: 'test',
            email: 'test',
            password: 'test',
            institution: 'test',
            userAgent: 'test',
            host: 'test'
        };

        // tslint:disable-next-line
        (createUser as any).mockClear();

        service = createService(mockUserRepository, mockTokenRepository, mockNotificationService);
        service.prepareUserForActivation = jest.fn(() => Promise.resolve(true));
        service.prepareUserForAdminActivation = jest.fn(() => Promise.resolve(true));

    });

    // it('should return a promise', () => {
    //     const result = service.registerUser(credentials);
    //     expect(result).toBeInstanceOf(Promise);
    // });

    it('should ask the user repository if the user exists', () => {
        expect.assertions(1);
        return service.registerUser(credentials).then(
            result => expect(mockUserRepository.hasUser.mock.calls.length).toBe(1)
        );
    });
    it('should throw an error because user does not exist', () => {
        mockUserRepository.hasUser = jest.fn(() => false);
        expect.assertions(1);
        return service.registerUser(credentials).then(
            result => expect(mockTokenRepository.deleteTokenForUser.mock.calls.length).toBe(0),
            err => expect(err).toBeTruthy()
        );
    });

    it('should create a new User', () => {
        expect.assertions(1);
        return service.registerUser(credentials).then(
            // tslint:disable-next-line
            result => expect((createUser as any).mock.calls.length).toBe(1)
        );
    });
    it('should update password for new user', () => {
        const updatePassword = jest.fn();
        // tslint:disable-next-line
        (createUser as any).mockReturnValueOnce({
            updatePassword
        });
        expect.assertions(1);
        return service.registerUser(credentials).then(
            // tslint:disable-next-line
            result => expect((updatePassword as any).mock.calls.length).toBe(1)
        );
    });
    it('should store new user in user repository', () => {
        expect.assertions(1);
        return service.registerUser(credentials).then(
            result => expect(mockUserRepository.createUser.mock.calls.length).toBe(1)
        );
    });
    it('should prepare user for activation', () => {
        expect.assertions(1);
        return service.registerUser(credentials).then(
            // tslint:disable-next-line
            result => expect((service.prepareUserForActivation as any).mock.calls.length).toBe(1)
        );
    });
    it('should prepare user for admin activation', () => {
        expect.assertions(1);
        return service.registerUser(credentials).then(
            // tslint:disable-next-line
            result => expect((service.prepareUserForAdminActivation as any).mock.calls.length).toBe(1)
        );
    });
});
