import { TokenType } from '../../domain/enums';

export function getMockTokenService() {
    return {
        generateToken: jest.fn(),
        saveToken: jest.fn(() =>
            Promise.resolve({
                token: 'test',
                type: TokenType.ACTIVATE,
                userId: 'test',
            })
        ),
        generateAdminToken: jest.fn(),
        verifyTokenWithUser: jest.fn(),
        verifyToken: jest.fn(),
        getUserTokenByJWT: jest.fn(() =>
            Promise.resolve({
                token: 'test',
                type: TokenType.ACTIVATE,
                userId: 'test',
            })
        ),
        deleteTokenForUser: jest.fn(() => Promise.resolve(true)),
        hasTokenForUser: jest.fn(() => Promise.resolve(true)),
    };
}
