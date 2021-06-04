import { getContainer } from '../../../../aspects/container/container';
import { User } from '../../model/user.model';
import { RegistrationService } from '../../model/registration.model';
import { genericUser, getMockUserService } from '../__mocks__/user.service';
import { getMockTokenService } from '../__mocks__/token.service';
import { Container } from 'inversify';
import { mockPersistenceContainerModule } from '../../../../infrastructure/persistence/__mocks__/persistence-mock.module';
import { APPLICATION_TYPES } from '../../../application.types';
import { rebindMocks } from '../../../../__mocks__/util';
import { getApplicationContainerModule } from '../../../application.module';

describe('Verify User Use Case', () => {
    let service: RegistrationService;
    let token: string;
    let user: User;
    let container: Container | null;
    beforeEach(() => {
        container = getContainer();
        container.load(
            getApplicationContainerModule({
                appName: 'test',
                jobRecipient: 'test',
                login: {
                    threshold: 0,
                    secondsDelay: 0,
                },
                clientUrl: 'test',
                supportContact: 'test',
                jwtSecret: 'test',
                gdprDate: 'test',
            }),
            mockPersistenceContainerModule
        );
        service = container.get<RegistrationService>(
            APPLICATION_TYPES.RegistrationService
        );
        user = { ...genericUser };

        token = 'test';
    });
    afterEach(() => {
        container = null;
    });
    it('should return a promise', () => {
        const result = service.verifyUser(token);
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
                    instance: mockTokenService,
                },
            ]
        );
        expect.assertions(1);
        return service
            .verifyUser(token)
            .then((result) =>
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
                    instance: mockTokenService,
                },
            ]
        );
        expect.assertions(1);
        return service
            .verifyUser(token)
            .then((result) =>
                expect(
                    mockTokenService.verifyTokenWithUser.mock.calls.length
                ).toBe(1)
            );
    });
    it('should verify the user', () => {
        const mockUserService = getMockUserService();
        const mockTokenService = getMockTokenService();
        service = rebindMocks<RegistrationService>(
            container,
            APPLICATION_TYPES.RegistrationService,
            [
                {
                    id: APPLICATION_TYPES.TokenService,
                    instance: mockTokenService,
                },
                {
                    id: APPLICATION_TYPES.UserService,
                    instance: mockUserService,
                },
            ]
        );
        expect.assertions(1);
        const isVerified = jest.fn();
        (mockUserService.getUserById as jest.Mock).mockReturnValueOnce({
            ...user,
            ...{ isVerified },
        });
        return service
            .verifyUser(token)
            .then((result) => expect(isVerified.mock.calls.length).toBe(1));
    });
    it('should call the user Repository to update the user', () => {
        const mockUserService = getMockUserService();
        const mockTokenService = getMockTokenService();
        service = rebindMocks<RegistrationService>(
            container,
            APPLICATION_TYPES.RegistrationService,
            [
                {
                    id: APPLICATION_TYPES.TokenService,
                    instance: mockTokenService,
                },
                {
                    id: APPLICATION_TYPES.UserService,
                    instance: mockUserService,
                },
            ]
        );
        expect.assertions(1);
        return service
            .verifyUser(token)
            .then((result) =>
                expect(
                    (mockUserService.updateUser as jest.Mock).mock.calls.length
                ).toBe(1)
            );
    });
    it('should call the token Repository to delete the token', () => {
        const mockTokenService = getMockTokenService();
        service = rebindMocks<RegistrationService>(
            container,
            APPLICATION_TYPES.RegistrationService,
            [
                {
                    id: APPLICATION_TYPES.TokenService,
                    instance: mockTokenService,
                },
            ]
        );
        expect.assertions(1);
        return service
            .verifyUser(token)
            .then((result) =>
                expect(
                    mockTokenService.deleteTokenForUser.mock.calls.length
                ).toBe(2)
            );
    });
    it('should throw an error because user is faulty', () => {
        const mockUserService = getMockUserService();
        const mockTokenService = getMockTokenService();
        service = rebindMocks<RegistrationService>(
            container,
            APPLICATION_TYPES.RegistrationService,
            [
                {
                    id: APPLICATION_TYPES.TokenService,
                    instance: mockTokenService,
                },
                {
                    id: APPLICATION_TYPES.UserService,
                    instance: mockUserService,
                },
            ]
        );
        mockUserService.getUserById = jest.fn(() => {
            throw new Error();
        });

        mockTokenService.deleteTokenForUser.mockReset();
        expect.assertions(1);
        return service.verifyUser(token).then(
            (result) =>
                expect(
                    mockTokenService.deleteTokenForUser.mock.calls.length
                ).toBe(0),
            (err) => expect(err).toBeTruthy()
        );
    });
});
