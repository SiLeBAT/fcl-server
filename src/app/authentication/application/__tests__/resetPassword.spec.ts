import { createService, IPasswordService } from './../password.service';
import { verifyToken } from '../../domain';

jest.mock('./../../domain', () => ({
    generateToken: jest.fn(),
    verifyToken: jest.fn(),
    NotificationType: {
        REQUEST_ACTIVATION: 0,
        REQUEST_ALTERNATIVE_CONTACT: 1,
        REQUEST_RESET: 2,
        NOTIFICATION_RESET: 3
    }
}));

describe('Reset Password Use Case', () => {
    // tslint:disable-next-line
    let mockUserRepository: any;
    // tslint:disable-next-line
    let mockTokenRepository: any;
    // tslint:disable-next-line
    let mockNotificationService: any;
    let service: IPasswordService;
    let token: string;
    let password: string;
    beforeEach(() => {
        mockUserRepository = {
            findById: jest.fn(() => ({
                updatePassword: jest.fn()
            })),
            updateUser: jest.fn(() => true)
        };

        mockTokenRepository = {
            getUserTokenByJWT: jest.fn(() => true),
            deleteResetTokenForUser: jest.fn(() => true)
        };

        mockNotificationService = {
            sendNotification: jest.fn(() => true)
        };

        // tslint:disable-next-line
        (verifyToken as any).mockReset();
        token = 'test';
        password = 'test';

        service = createService(mockUserRepository, mockTokenRepository, mockNotificationService);
    });

    // it('should return a promise', () => {
    //     const result = service.resetPassword(token, password);
    //     expect(result).toBeInstanceOf(Promise);
    // });

    it('should call token repository to retrieve userId', () => {
        expect.assertions(1);
        return service.resetPassword(token, password).then(
            result => expect(mockTokenRepository.getUserTokenByJWT.mock.calls.length).toBe(1)
        );
    });
    it('should verify the token against the retrieved userId', () => {
        expect.assertions(1);
        return service.resetPassword(token, password).then(
            // tslint:disable-next-line
            result => expect((verifyToken as any).mock.calls.length).toBe(1)
        );
    });
    it('should call user repository to retrieve user', () => {
        expect.assertions(1);
        return service.resetPassword(token, password).then(
            result => expect(mockUserRepository.findById.mock.calls.length).toBe(1)
        );
    });
    it('should update the user password', () => {
        expect.assertions(1);
        const updatePassword = jest.fn();
        mockUserRepository.findById.mockReturnValueOnce({
            updatePassword
        });
        return service.resetPassword(token, password).then(
            result => expect(updatePassword.mock.calls.length).toBe(1)
        );
    });
    it('should call the user Repository to update the user', () => {
        expect.assertions(1);
        return service.resetPassword(token, password).then(
            result => expect(mockUserRepository.updateUser.mock.calls.length).toBe(1)
        );
    });
    it('should call the token Repository to delete the token', () => {
        expect.assertions(1);
        return service.resetPassword(token, password).then(
            result => expect(mockTokenRepository.deleteResetTokenForUser.mock.calls.length).toBe(1)
        );
    });
    it('should call the notification Service with a new notification', () => {
        expect.assertions(1);
        return service.resetPassword(token, password).then(
            result => expect(mockNotificationService.sendNotification.mock.calls.length).toBe(1)
        );
    });
    it('should be throw an error because user is faulty', () => {
        mockUserRepository.findById = jest.fn(() => { throw new Error(); });
        expect.assertions(1);
        return service.resetPassword(token, password).then(
            result => expect(mockNotificationService.sendNotification.mock.calls.length).toBe(0),
            err => expect(err).toBeTruthy()
        );
    });
});
