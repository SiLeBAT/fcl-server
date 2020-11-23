import { getContainer } from '../../../../aspects/container/container';
import {
    RegistrationService,
    UserRegistration,
} from '../../model/registration.model';
import { createUser } from '../../domain/user.entity';
import { Container } from 'inversify';
import { getApplicationContainerModule } from '../../../ports';
import { mockPersistenceContainerModule } from '../../../../infrastructure/persistence/__mocks__/persistence-mock.module';
import { APPLICATION_TYPES } from '../../../application.types';
import { rebindMocks } from '../../../../__mocks__/util';
import { getMockInstituteService } from '../__mocks__/institute.service';

jest.mock('./../../domain/user.entity', () => ({
    createUser: jest.fn(() => ({
        updatePassword: jest.fn(),
    })),
}));

describe('Register User Use Case', () => {
    let service: RegistrationService;
    let credentials: UserRegistration;
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
                apiUrl: 'test',
                supportContact: 'test',
                jwtSecret: 'test',
                gdprDate: 'test',
            }),
            mockPersistenceContainerModule
        );
        service = container.get<RegistrationService>(
            APPLICATION_TYPES.RegistrationService
        );

        credentials = {
            firstName: 'test',
            lastName: 'test',
            email: 'test',
            password: 'test',
            institution: 'test',
            dataProtectionAgreed: false,
            newsRegAgreed: false,
            newsMailAgreed: false,
            userAgent: 'test',
            host: 'test',
        };

        (createUser as jest.Mock).mockClear();
    });

    it('should return a promise', () => {
        const result = service.registerUser(credentials);
        // tslint:disable-next-line: no-floating-promises
        expect(result).toBeInstanceOf(Promise);
    });

    it('should throw an error because institute does not exist', () => {
        const mockInstituteService = getMockInstituteService();
        service = rebindMocks<RegistrationService>(
            container,
            APPLICATION_TYPES.RegistrationService,
            [
                {
                    id: APPLICATION_TYPES.InstituteService,
                    instance: mockInstituteService,
                },
            ]
        );
        mockInstituteService.getInstituteById = jest.fn(() => {
            throw new Error();
        });
        expect.assertions(1);
        return service.registerUser(credentials).then(
            (result) =>
                expect(
                    (mockInstituteService.getInstituteById as jest.Mock).mock
                        .calls.length
                ).toBe(1),
            (err) => {
                return expect(err).toBeTruthy();
            }
        );
    });
    it('should create a new User', () => {
        expect.assertions(1);
        return service
            .registerUser(credentials)
            .then((result) =>
                expect((createUser as jest.Mock).mock.calls.length).toBe(1)
            );
    });
    it('should update password for new user', () => {
        const updatePassword = jest.fn();
        (createUser as jest.Mock).mockReturnValueOnce({
            updatePassword,
        });
        expect.assertions(1);
        return service
            .registerUser(credentials)
            .then((result) =>
                expect((updatePassword as jest.Mock).mock.calls.length).toBe(1)
            );
    });
});
