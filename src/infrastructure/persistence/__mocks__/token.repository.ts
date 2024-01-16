import { TokenRepository, TokenType, UserToken } from '../../../app/ports';

const tokenTypes = Object.values(TokenType).filter(x => !isNaN(Number(x))) as TokenType[];

const mockTokens: UserToken[] = tokenTypes.map(
    tokenType => ({
        token: `testTokenOfType${TokenType[tokenType]}`,
        type: tokenType,
        userId: 'test'
    })
);

export function getMockUserTokenOfType(type: TokenType): UserToken {
    const userToken = mockTokens.find(t => t.type === type);
    if (!userToken) {
        throw new Error(`No mock token of type ${type} available.`);
    }
    return userToken;
}

export function getMockUserTokenNotOfType(type: TokenType): UserToken[] {
    return mockTokens.filter(t => t.type !== type);
}

export function getMockUserTokenWithJWT(token: string): UserToken {
    const userToken = mockTokens.find(t => t.token === token);
    if (!userToken) {
        throw new Error(`No mock user token with token '${token}' in mock token repo.`);
    }
    return userToken;
}

export function getMockTokenRepository(): TokenRepository {
    return {
        hasTokenForUser: jest.fn((user, tokenType) => Promise.resolve(true)),
        deleteTokenForUser: jest.fn((user, tokenType) => Promise.resolve(true)),
        saveToken: jest.fn(
            (userToken) => Promise.resolve({
                ...userToken,
                ...mockTokens[userToken.type]
            })
        ),
        getUserTokenByJWT: jest.fn(
            (token) => Promise.resolve(getMockUserTokenWithJWT(token))
        ),
    };
}
