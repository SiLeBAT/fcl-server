import { sign, verify } from 'jsonwebtoken';
import { ConfigurationService } from '../../core/model/configuration.model';
import {
    TokenService,
    TokenPayload,
    AdminTokenPayload,
    TokenRepository,
    NewsletterTokenPayload,
} from '../model/token.model';
import { User, UserToken } from '../model/user.model';
import { TokenType } from '../domain/enums';
import { injectable, inject } from 'inversify';
import { APPLICATION_TYPES } from './../../application.types';

@injectable()
export class DefaultTokenService implements TokenService {
    private expirationTime = 60 * 60 * 24;
    private adminExpirationTime = 60 * 60 * 24 * 7;
    private jwtSecret: string;
    constructor(
        @inject(APPLICATION_TYPES.ConfigurationService)
        private configurationService: ConfigurationService,
        @inject(APPLICATION_TYPES.TokenRepository)
        private tokenRepository: TokenRepository
    ) {
        const serverConfig =
            this.configurationService.getApplicationConfiguration();
        this.jwtSecret = serverConfig.jwtSecret;
    }

    generateToken(userId: string): string {
        const payload: TokenPayload = {
            sub: userId,
        };
        return sign(payload, this.jwtSecret, {
            expiresIn: this.expirationTime,
        });
    }

    generateAdminToken(id: string): string {
        const payload: AdminTokenPayload = {
            sub: id,
            admin: true,
        };
        return sign(payload, this.jwtSecret, {
            expiresIn: this.adminExpirationTime,
        });
    }

    generateNewsletterToken(id: string): string {
        const payload: NewsletterTokenPayload = {
            sub: id,
            newsletter: true,
        };
        return sign(payload, this.jwtSecret, {
            expiresIn: this.expirationTime,
        });
    }

    verifyTokenWithUser(token: string, id: string): TokenPayload {
        return verify(token, this.jwtSecret, { subject: id }) as TokenPayload;
    }

    verifyToken(token: string): TokenPayload {
        return verify(token, this.jwtSecret) as TokenPayload;
    }

    saveToken(
        token: string,
        type: TokenType,
        userId: string
    ): Promise<UserToken> {
        return this.tokenRepository.saveToken({
            token,
            type,
            userId,
        });
    }
    getUserTokenByJWT(token: string): Promise<UserToken> {
        return this.tokenRepository.getUserTokenByJWT(token);
    }

    deleteTokenForUser(
        user: User,
        type: TokenType
    ): Promise<boolean> {
        return this.tokenRepository.deleteTokenForUser(user, type);
    }

    hasTokenForUser(
        user: User,
        type: TokenType
    ): Promise<boolean> {
        return this.tokenRepository.hasTokenForUser(user, type);
    }
}
