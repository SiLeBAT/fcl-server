import { getMockUserTokenOfType, getMockUserTokenWithJWT } from '../../../../infrastructure/persistence/__mocks__/token.repository';

export function getMockTokenService() {
    return {
        generateToken: jest.fn(),
        saveToken: jest.fn((token, tokenType, userId) => {
            return Promise.resolve({
                ...getMockUserTokenOfType(tokenType)
            });
        }),
        generateAdminToken: jest.fn(),
        verifyTokenWithUser: jest.fn(),
        verifyToken: jest.fn(),
        getUserTokenByJWT: jest.fn((token) =>
            Promise.resolve({
                ...getMockUserTokenWithJWT(token)
            })
        ),
        deleteTokenForUser: jest.fn(() => Promise.resolve(true)),
        hasTokenForUser: jest.fn(() => Promise.resolve(true)),
    };
}
