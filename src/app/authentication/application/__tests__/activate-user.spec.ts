import { getContainer } from '../../../../aspects/container/container';
import { RegistrationService } from '../../model/registration.model';
import { getMockTokenService } from '../__mocks__/token.service';
import { getMockUserService } from '../__mocks__/user.service';
import { getMockNotificationService } from '../../../core/application/__mocks__/notification.service';
import { Container } from 'inversify';
import { getApplicationContainerModule } from '../../../ports';
import { mockPersistenceContainerModule } from '../../../../infrastructure/persistence/__mocks__/persistence-mock.module';
import { APPLICATION_TYPES } from '../../../application.types';
import { rebindMocks } from '../../../../__mocks__/util';

describe('Activate User Use Case', () => {
    let service: RegistrationService;
    let token: string;
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
        service = container.get<RegistrationService>(
            APPLICATION_TYPES.RegistrationService
        );
        token = 'test';
    });
    afterEach(() => {
        container = null;
    });
    it('should return a promise', () => {
        const result = service.activateUser(token);
        // tslint:disable-next-line: no-floating-promises
        expect(result).toBeInstanceOf(Promise);
    });

    it('should call token repository to retrieve userId', () => {
        const mockTokenService = getMockTokenService();
        service = rebindMocks<RegistrationService>(
            container,
            APPLICATION_TYPES.RegistrationService,
            [
                {
                    id: APPLICATION_TYPES.TokenService,
                    instance: mockTokenService
                }
            ]
        );
        expect.assertions(1);
        return service
            .activateUser(token)
            .then(result =>
                expect(
                    mockTokenService.getUserTokenByJWT.mock.calls.length
                ).toBe(1)
            );
    });
    it('should verify the token against the retrieved userId', () => {
        const mockTokenService = getMockTokenService();
        service = rebindMocks<RegistrationService>(
            container,
            APPLICATION_TYPES.RegistrationService,
            [
                {
                    id: APPLICATION_TYPES.TokenService,
                    instance: mockTokenService
                }
            ]
        );
        expect.assertions(1);
        return service
            .activateUser(token)
            .then(result =>
                expect(
                    mockTokenService.verifyTokenWithUser.mock.calls.length
                ).toBe(1)
            );
    });
    it('should activate the user', () => {
        const mockUserService = getMockUserService();
        const mockTokenService = getMockTokenService();
        service = rebindMocks<RegistrationService>(
            container,
            APPLICATION_TYPES.RegistrationService,
            [
                {
                    id: APPLICATION_TYPES.TokenService,
                    instance: mockTokenService
                },
                {
                    id: APPLICATION_TYPES.UserService,
                    instance: mockUserService
                }
            ]
        );
        expect.assertions(1);
        const isActivated = jest.fn();
        (mockUserService.getUserById as jest.Mock).mockReturnValueOnce({
            isActivated
        });
        return service
            .activateUser(token)
            .then(result => expect(isActivated.mock.calls.length).toBe(1));
    });
    it('should call the token Repository to delete the token', () => {
        const mockTokenService = getMockTokenService();
        service = rebindMocks<RegistrationService>(
            container,
            APPLICATION_TYPES.RegistrationService,
            [
                {
                    id: APPLICATION_TYPES.TokenService,
                    instance: mockTokenService
                }
            ]
        );
        expect.assertions(1);
        return service
            .activateUser(token)
            .then(result =>
                expect(
                    mockTokenService.deleteTokenForUser.mock.calls.length
                ).toBe(1)
            );
    });
    it('should be throw an error because user is faulty', () => {
        const mockUserService = getMockUserService();
        const mockTokenService = getMockTokenService();
        service = rebindMocks<RegistrationService>(
            container,
            APPLICATION_TYPES.RegistrationService,
            [
                {
                    id: APPLICATION_TYPES.TokenService,
                    instance: mockTokenService
                },
                {
                    id: APPLICATION_TYPES.UserService,
                    instance: mockUserService
                }
            ]
        );
        mockUserService.getUserById = jest.fn(() => {
            throw new Error();
        });
        expect.assertions(1);
        return service.activateUser(token).then(
            result =>
                expect(
                    mockTokenService.deleteTokenForUser.mock.calls.length
                ).toBe(0),
            err => expect(err).toBeTruthy()
        );
    });
    it('should trigger notification: sendNotification', () => {
        const mockNotificationService = getMockNotificationService();
        const mockTokenService = getMockTokenService();
        service = rebindMocks<RegistrationService>(
            container,
            APPLICATION_TYPES.RegistrationService,
            [
                {
                    id: APPLICATION_TYPES.TokenService,
                    instance: mockTokenService
                },
                {
                    id: APPLICATION_TYPES.NotificationService,
                    instance: mockNotificationService
                }
            ]
        );
        expect.assertions(1);
        return service
            .activateUser(token)
            .then(result =>
                expect(
                    mockNotificationService.sendNotification.mock.calls.length
                ).toBe(1)
            );
    });
});
