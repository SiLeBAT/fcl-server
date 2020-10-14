import { getContainer } from '../../../../aspects/container/container';
import { RegistrationService } from '../../model/registration.model';
import { User } from '../../model/user.model';
import { RecoveryData } from '../../model/login.model';
import { createUser } from '../../domain/user.entity';
import { getMockNotificationService } from '../../../core/application/__mocks__/notification.service';
import { getMockTokenService } from '../__mocks__/token.service';
import { Container } from 'inversify';
import { getApplicationContainerModule } from '../../../ports';
import { mockPersistenceContainerModule } from '../../../../infrastructure/persistence/__mocks__/persistence-mock.module';
import { APPLICATION_TYPES } from '../../../application.types';
import { rebindMocks } from '../../../../__mocks__/util';
import { genericUser } from '../__mocks__/user.service';

jest.mock('./../../domain/user.entity', () => ({
    createUser: jest.fn(() => ({
        updatePassword: jest.fn()
    }))
}));

describe('Prepare User for Activation Use Case', () => {
    let service: RegistrationService;
    let user: User;
    let recoveryData: RecoveryData;
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
        user = { ...genericUser };
        recoveryData = {
            email: 'test',
            userAgent: 'test',
            host: 'test'
        };

        (createUser as jest.Mock).mockClear();
    });
    afterEach(() => {
        container = null;
    });
    it('should return a promise', () => {
        const result = service.prepareUserForVerification(user, recoveryData);
        // tslint:disable-next-line: no-floating-promises
        expect(result).toBeInstanceOf(Promise);
    });
    it('should ask the token repository if the user has tokens', () => {
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
            .prepareUserForVerification(user, recoveryData)
            .then(result =>
                expect(mockTokenService.hasTokenForUser.mock.calls.length).toBe(
                    1
                )
            );
    });

    it('should trigger deletion of old user tokens', () => {
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
            .prepareUserForVerification(user, recoveryData)
            .then(result =>
                expect(
                    mockTokenService.deleteTokenForUser.mock.calls.length
                ).toBe(1)
            );
    });
    it('should not trigger deletion of old user tokens if user does not have any', () => {
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
        mockTokenService.hasTokenForUser = jest.fn(() =>
            Promise.resolve(false)
        );
        expect.assertions(1);
        return service
            .prepareUserForVerification(user, recoveryData)
            .then(result =>
                expect(
                    mockTokenService.deleteTokenForUser.mock.calls.length
                ).toBe(0)
            );
    });
    it('should generate a new token', () => {
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
            .prepareUserForVerification(user, recoveryData)
            .then(result =>
                expect(mockTokenService.generateToken.mock.calls.length).toBe(1)
            );
    });
    it('should save the new token', () => {
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
            .prepareUserForVerification(user, recoveryData)
            .then(result =>
                expect(mockTokenService.saveToken.mock.calls.length).toBe(1)
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
            .prepareUserForVerification(user, recoveryData)
            .then(result =>
                expect(
                    mockNotificationService.sendNotification.mock.calls.length
                ).toBe(1)
            );
    });
});
