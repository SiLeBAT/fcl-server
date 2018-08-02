import { createService, IPasswordService } from './../password.service';
import { generateToken } from '../../domain';
import { IRecoveryData } from '../../../sharedKernel';

jest.mock('./../../domain', () => ({
    generateToken: jest.fn(),
    verifyToken: jest.fn(),
    TokenType: {
        RESET: 0
    },
    NotificationType: {
        REQUEST_ACTIVATION: 0,
        REQUEST_ALTERNATIVE_CONTACT: 1,
        REQUEST_RESET: 2,
        NOTIFICATION_RESET: 3
    }
}));

describe('Recover Password Use Case', () => {
    // tslint:disable-next-line
    let mockUserRepository: any;
    // tslint:disable-next-line
    let mockTokenRepository: any;
    // tslint:disable-next-line
    let mockNotificationService: any;
    let service: IPasswordService;
    let credentials: IRecoveryData;
    beforeEach(() => {

        mockUserRepository = {
            findByUsername: jest.fn(() => true)
        };

        mockTokenRepository = {
            hasResetTokenForUser: jest.fn(() => true),
            deleteResetTokenForUser: jest.fn(() => true),
            saveToken: jest.fn(() => true)
        };

        mockNotificationService = {
            sendNotification:  jest.fn(() => true)
        };
        // tslint:disable-next-line
        (generateToken as any).mockReset();
        credentials = {
            email: 'test',
            userAgent: 'test',
            host: 'test'
        };
        service = createService(mockUserRepository, mockTokenRepository, mockNotificationService);
    });

    // it('should return a promise', () => {
    //     const result = service.recoverPassword(credentials);
    //     expect(result).toBeInstanceOf(Promise);
    // });

    it('should trigger notification: sendNotification because user does not exist', () => {
        mockUserRepository.hasUser = jest.fn(() => false);
        expect.assertions(1);
        return service.recoverPassword(credentials).then(
            result => expect(mockNotificationService.sendNotification.mock.calls.length).toBe(1)
        );
    });
    it('should retrieve the user from the user repository', () => {
        expect.assertions(1);
        return service.recoverPassword(credentials).then(
            result => expect(mockUserRepository.findByUsername.mock.calls.length).toBe(1)
        );
    });
    it('should ask the token repository if the user has tokens', () => {
        expect.assertions(1);
        return service.recoverPassword(credentials).then(
            result => expect(mockTokenRepository.hasResetTokenForUser.mock.calls.length).toBe(1)
        );
    });
    it('should trigger deletion of old user tokens', () => {
        expect.assertions(1);
        return service.recoverPassword(credentials).then(
            result => expect(mockTokenRepository.deleteResetTokenForUser.mock.calls.length).toBe(1)
        );
    });
    it('should not trigger deletion of old user tokens if user does not have any', () => {
        mockTokenRepository.hasResetTokenForUser = jest.fn(() => false);
        expect.assertions(1);
        return service.recoverPassword(credentials).then(
            result => expect(mockTokenRepository.deleteResetTokenForUser.mock.calls.length).toBe(0)
        );
    });
    it('should generate a new token', () => {
        expect.assertions(1);
        return service.recoverPassword(credentials).then(
            // tslint:disable-next-line
            result => expect((generateToken as any).mock.calls.length).toBe(1)
        );
    });
    it('should save the new token', () => {
        expect.assertions(1);
        return service.recoverPassword(credentials).then(
            result => expect(mockTokenRepository.saveToken.mock.calls.length).toBe(1)
        );
    });
    it('should trigger notification: sendNotification', () => {
        expect.assertions(1);
        return service.recoverPassword(credentials).then(
            result => expect(mockNotificationService.sendNotification.mock.calls.length).toBe(1)
        );
    });
    it('should be throw an error because user is faulty', () => {
        mockUserRepository.findByUsername = jest.fn(() => { throw new Error(); });
        expect.assertions(1);
        return service.recoverPassword(credentials).then(
            result => expect(mockNotificationService.sendNotification.mock.calls.length).toBe(0),
            err => expect(err).toBeTruthy()
        );
    });
});
