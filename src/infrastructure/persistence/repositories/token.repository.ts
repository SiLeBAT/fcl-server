import { TokenModel } from '../data-store/mongoose/schemas/resetToken.schema';
import { MongooseRepositoryBase } from '../data-store/mongoose/mongoose.repository';
import { JsonWebTokenError } from 'jsonwebtoken';
import {
    TokenRepository,
    User,
    TokenType,
    UserToken
} from './../../../app/ports';
import { injectable, inject } from 'inversify';
import { Model } from 'mongoose';
import { PERSISTENCE_TYPES } from '../persistence.types';

@injectable()
export class DefaultTokenRepository extends MongooseRepositoryBase<TokenModel>
    implements TokenRepository {
    constructor(
        @inject(PERSISTENCE_TYPES.TokenModel) private model: Model<TokenModel>
    ) {
        super(model);
    }
    hasTokenForUser(
        user: User,
        type: TokenType = TokenType.ACTIVATE
    ): Promise<boolean> {
        return super._find({ user: user.uniqueId, type }, {}, {}).then(docs => {
            return docs.length > 0;
        });
    }
    deleteTokenForUser(
        user: User,
        type: TokenType = TokenType.ACTIVATE
    ): Promise<boolean> {
        return super
            ._findOne({ user: user.uniqueId, type })
            .then((token: TokenModel) => !!super._delete(token._id));
    }

    saveToken(token: UserToken): Promise<UserToken> {
        const newToken = new this.model({
            token: token.token,
            type: token.type,
            user: token.userId
        });
        return super._create(newToken).then(res => newToken);
    }
    getUserTokenByJWT(token: string): Promise<UserToken> {
        return super._findOne({ token: token }).then((model: TokenModel) => {
            if (!model) {
                throw new JsonWebTokenError(
                    `No UserToken for JWT Token. token=${token}`
                );
            }
            return {
                token: model.token,
                type: model.type,
                userId: model.user
            };
        });
    }
}
