import { TokenRepository, TokenType, UserToken } from '../../../app/ports';

export const genericUserToken: UserToken = {
    token: 'test',
    type: TokenType.ACTIVATE,
    userId: 'test',
};

export function getMockTokenRepository(): TokenRepository {
    return {
        hasTokenForUser: jest.fn(() => Promise.resolve(true)),
        deleteTokenForUser: jest.fn(() => Promise.resolve(true)),
        saveToken: jest.fn(() => Promise.resolve(genericUserToken)),
        getUserTokenByJWT: jest.fn(() => Promise.resolve(genericUserToken)),
    };
}
