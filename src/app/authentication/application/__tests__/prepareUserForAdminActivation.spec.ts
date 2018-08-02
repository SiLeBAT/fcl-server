import { createService, IRegistrationService } from './../registration.service';
import { generateAdminToken, createUser, IUser } from '../../domain';

jest.mock('./../../domain', () => ({
    generateAdminToken: jest.fn(),
    verifyToken: jest.fn(),
    createUser: jest.fn(() => ({
        updatePassword: jest.fn()
    })),
    TokenType: {
        ADMIN: 0
    },
    NotificationType: {
        REQUEST_ADMIN_ACTIVATION: 0,
        REQUEST_ALTERNATIVE_CONTACT: 1,
        REQUEST_RESET: 2,
        NOTIFICATION_RESET: 3
    }
}));

describe('Prepare User for Activation Use Case', () => {
    // tslint:disable-next-line
    let mockUserRepository: any;
    // tslint:disable-next-line
    let mockTokenRepository: any;
    // tslint:disable-next-line
    let mockNotificationService: any;
    // tslint:disable-next-line
    let service: IRegistrationService;
    let user: IUser;
    beforeEach(() => {
        mockUserRepository = {
            hasUser: jest.fn(() => false),
            createUser: jest.fn(() => true)
        };

        mockTokenRepository = {
            deleteAdminTokenForUser: jest.fn(() => true),
            saveToken: jest.fn(() => true),
            hasAdminTokenForUser: jest.fn(() => true)
        };

        mockNotificationService = {
            sendNotification: jest.fn(() => true)
        };

        user = {
            uniqueId: 'test',
            firstName: 'test',
            lastName: 'test',
            email: 'test',
            password: 'test',
            isAuthorized: jest.fn(),
            isActivated: jest.fn(),
            isAdminActivated: jest.fn(),
            updatePassword: jest.fn(),
            getNumberOfFailedAttempts: jest.fn(),
            getLastLoginAttempt: jest.fn(),
            updateNumberOfFailedAttempts: jest.fn(),
            updateLastLoginAttempt: jest.fn()
        };
        // tslint:disable-next-line
        (createUser as any).mockClear();
        // tslint:disable-next-line
        (generateAdminToken as any).mockClear();

        service = createService(mockUserRepository, mockTokenRepository, mockNotificationService);

    });

    // it('should return a promise', () => {
    //     const result = service.prepareUserForAdminActivation(user);
    //     expect(result).toBeInstanceOf(Promise);
	// });

    it('should ask the token repository if the user has admin tokens', () => {
        expect.assertions(1);
        return service.prepareUserForAdminActivation(user).then(
            result => expect(mockTokenRepository.hasAdminTokenForUser.mock.calls.length).toBe(1)
        );
    });

    it('should trigger deletion of old user admin tokens', () => {
        expect.assertions(1);
        return service.prepareUserForAdminActivation(user).then(
            result => expect(mockTokenRepository.deleteAdminTokenForUser.mock.calls.length).toBe(1)
        );
    });
    it('should not trigger deletion of old user admin tokens if user does not have any', () => {
        mockTokenRepository.hasAdminTokenForUser = jest.fn(() => false);
        expect.assertions(1);
        return service.prepareUserForAdminActivation(user).then(
            result => expect(mockTokenRepository.deleteAdminTokenForUser.mock.calls.length).toBe(0)
        );
    });
    it('should generate a new admin token', () => {
        expect.assertions(1);
        return service.prepareUserForAdminActivation(user).then(
            // tslint:disable-next-line
            result => expect((generateAdminToken as any).mock.calls.length).toBe(1)
        );
    });
    it('should save the new admin token', () => {
        expect.assertions(1);
        return service.prepareUserForAdminActivation(user).then(
            result => expect(mockTokenRepository.saveToken.mock.calls.length).toBe(1)
        );
    });
    it('should trigger notification: sendNotification', () => {
        expect.assertions(1);
        return service.prepareUserForAdminActivation(user).then(
            result => expect(mockNotificationService.sendNotification.mock.calls.length).toBe(1)
        );
    });
});
