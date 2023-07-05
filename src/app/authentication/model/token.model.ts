import { UserToken, User } from './user.model';
import { TokenType } from '../domain/enums';

export interface TokenPayload {
    sub: string;
}

export interface AdminTokenPayload extends TokenPayload {
    admin: boolean;
}

export interface NewsletterTokenPayload extends TokenPayload {
    newsletter: boolean;
}

export interface TokenPort {
    generateToken(userId: string): string;
    verifyTokenWithUser(token: string, id: string): TokenPayload;
    verifyToken(token: string): TokenPayload;
}

export interface TokenService extends TokenPort {
    generateAdminToken(id: string): string;
    generateNewsletterToken(id: string): string;
    saveToken(
        token: string,
        type: TokenType,
        userId: string
    ): Promise<UserToken>;
    getUserTokenByJWT(token: string): Promise<UserToken>;
    deleteTokenForUser(user: User, type: TokenType): Promise<boolean>;
    hasTokenForUser(user: User, type: TokenType): Promise<boolean>;
}

export interface TokenRepository {
    hasTokenForUser(user: User, type: TokenType): Promise<boolean>;
    deleteTokenForUser(user: User, type: TokenType): Promise<boolean>;
    saveToken(token: UserToken): Promise<UserToken>;
    getUserTokenByJWT(token: string): Promise<UserToken>;
}
