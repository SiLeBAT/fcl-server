import { Container } from 'inversify';
import { getContainer } from '../../../../aspects/container/container';
import { getApplicationContainerModule } from '../../../application.module';
import { PasswordService, RecoveryData } from '../../model/login.model';
import { mockPersistenceContainerModule } from '../../../../infrastructure/persistence/__mocks__/persistence-mock.module';
import { getMockNotificationService } from '../../../core/application/__mocks__/notification.service';
import { getMockUserService } from '../__mocks__/user.service';
import { getMockTokenService } from '../__mocks__/token.service';
import { APPLICATION_TYPES } from '../../../application.types';
import { rebindMocks } from '../../../../__mocks__/util';

describe('Recover Password Use Case', () => {
    let service: PasswordService;
    let credentials: RecoveryData;
    let container: Container | null;
    beforeEach(() => {
        container = getContainer();
        container.load(
            getApplicationContainerModule({
                appName: 'test',
                jobRecipient: 'test',
                login: {
                    threshold: 0,
                    secondsDelay: 0
                },
                apiUrl: 'test',
                supportContact: 'test',
                jwtSecret: 'test',
                gdprDate: 'test'
            }),
            mockPersistenceContainerModule
        );
        service = container.get<PasswordService>(
            APPLICATION_TYPES.PasswordService
        );
        credentials = {
            email: 'test',
            userAgent: 'test',
            host: 'test'
        };
    });

    afterEach(() => {
        container = null;
    });

    it('should return a promise', () => {
        const result = service.requestPasswordReset(credentials);
        // tslint:disable-next-line: no-floating-promises
        expect(result).toBeInstanceOf(Promise);
    });

    it('should ask the token repository if the user has tokens', () => {
        const mockTokenService = getMockTokenService();
        service = rebindMocks<PasswordService>(
            container,
            APPLICATION_TYPES.PasswordService,
            [
                {
                    id: APPLICATION_TYPES.TokenService,
                    instance: mockTokenService
                }
            ]
        );
        expect.assertions(1);
        return service
            .requestPasswordReset(credentials)
            .then(result =>
                expect(mockTokenService.hasTokenForUser.mock.calls.length).toBe(
                    1
                )
            );
    });
    it('should trigger deletion of old user tokens', () => {
        const mockTokenService = getMockTokenService();
        service = rebindMocks<PasswordService>(
            container,
            APPLICATION_TYPES.PasswordService,
            [
                {
                    id: APPLICATION_TYPES.TokenService,
                    instance: mockTokenService
                }
            ]
        );
        expect.assertions(1);
        return service
            .requestPasswordReset(credentials)
            .then(result =>
                expect(
                    mockTokenService.deleteTokenForUser.mock.calls.length
                ).toBe(1)
            );
    });
    it('should not trigger deletion of old user tokens if user does not have any', () => {
        const mockTokenService = getMockTokenService();
        service = rebindMocks<PasswordService>(
            container,
            APPLICATION_TYPES.PasswordService,
            [
                {
                    id: APPLICATION_TYPES.TokenService,
                    instance: mockTokenService
                }
            ]
        );
        mockTokenService.hasTokenForUser = jest.fn(() =>
            Promise.resolve(false)
        );
        expect.assertions(1);
        return service
            .requestPasswordReset(credentials)
            .then(result =>
                expect(
                    mockTokenService.deleteTokenForUser.mock.calls.length
                ).toBe(0)
            );
    });
    it('should generate a new token', () => {
        const mockTokenService = getMockTokenService();
        service = rebindMocks<PasswordService>(
            container,
            APPLICATION_TYPES.PasswordService,
            [
                {
                    id: APPLICATION_TYPES.TokenService,
                    instance: mockTokenService
                }
            ]
        );
        expect.assertions(1);
        return service
            .requestPasswordReset(credentials)
            .then(result =>
                expect(mockTokenService.generateToken.mock.calls.length).toBe(1)
            );
    });
    it('should save the new token', () => {
        const mockTokenService = getMockTokenService();
        service = rebindMocks<PasswordService>(
            container,
            APPLICATION_TYPES.PasswordService,
            [
                {
                    id: APPLICATION_TYPES.TokenService,
                    instance: mockTokenService
                }
            ]
        );
        expect.assertions(1);
        return service
            .requestPasswordReset(credentials)
            .then(result =>
                expect(mockTokenService.saveToken.mock.calls.length).toBe(1)
            );
    });
    it('should trigger notification: sendNotification', () => {
        const mockNotificationService = getMockNotificationService();
        service = rebindMocks<PasswordService>(
            container,
            APPLICATION_TYPES.PasswordService,
            [
                {
                    id: APPLICATION_TYPES.NotificationService,
                    instance: mockNotificationService
                }
            ]
        );
        expect.assertions(1);
        return service
            .requestPasswordReset(credentials)
            .then(result =>
                expect(
                    mockNotificationService.sendNotification.mock.calls.length
                ).toBe(1)
            );
    });
    it('should be throw an error because user is faulty', () => {
        const mockNotificationService = getMockNotificationService();
        const mockUserService = getMockUserService();

        service = rebindMocks<PasswordService>(
            container,
            APPLICATION_TYPES.PasswordService,
            [
                {
                    id: APPLICATION_TYPES.NotificationService,
                    instance: mockNotificationService
                },
                {
                    id: APPLICATION_TYPES.UserService,
                    instance: mockUserService
                }
            ]
        );
        mockUserService.getUserByEmail = jest.fn(() => {
            throw new Error();
        });
        expect.assertions(1);
        return service.requestPasswordReset(credentials).then(
            result =>
                expect(
                    mockNotificationService.sendNotification.mock.calls.length
                ).toBe(0),
            err => expect(err).toBeTruthy()
        );
    });
});
