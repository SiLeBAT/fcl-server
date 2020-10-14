import { RegistrationService } from './../../model/registration.model';

export function getMockRegistrationService(): RegistrationService {
    return {
        prepareUserForVerification: jest.fn(),
        verifyUser: jest.fn(),
        activateUser: jest.fn(),
        registerUser: jest.fn(),
        handleNotActivatedUser: jest.fn(),
        confirmNewsletterSubscription: jest.fn()
    };
}
