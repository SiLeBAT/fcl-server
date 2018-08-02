import { createRepository, ResetTokenSchema, IResetTokenModel } from './../dataStore';
import { IRepositoryBase, ITokenRepository, IUserToken, IUser } from './../../../app/ports';
import { TokenType } from '../../../app/authentication/domain';

class TokenRepository implements ITokenRepository {
    constructor(private baseRepo: IRepositoryBase<IResetTokenModel>) {
    }
    hasTokenForUser(user: IUser): Promise<boolean> {
        return this.baseRepo.find({ user: user.uniqueId, type: TokenType.ACTIVATE }, {}, {}).then(
            (docs) => {
                return docs.length > 0;
            }
        );
    }
    hasResetTokenForUser(user: IUser): Promise<boolean> {
        return this.baseRepo.find({ user: user.uniqueId, type: TokenType.RESET }, {}, {}).then(
            (docs) => {
                return docs.length > 0;
            }
        );
    }
    hasAdminTokenForUser(user: IUser): Promise<boolean> {
        return this.baseRepo.find({ user: user.uniqueId, type: TokenType.ADMIN }, {}, {}).then(
            (docs) => {
                return docs.length > 0;
            }
        );
    }
    deleteTokenForUser(user: IUser): Promise<boolean> {
        return this.baseRepo.findOne({ user: user.uniqueId, type: TokenType.ACTIVATE }).then(
            (token: IResetTokenModel) => !!this.baseRepo.delete(token._id)
        );
    }
    deleteResetTokenForUser(user: IUser): Promise<boolean> {
        return this.baseRepo.findOne({ user: user.uniqueId, type: TokenType.RESET }).then(
            (token: IResetTokenModel) => !!this.baseRepo.delete(token._id)
        );
    }
    deleteAdminTokenForUser(user: IUser): Promise<boolean> {
        return this.baseRepo.findOne({ user: user.uniqueId, type: TokenType.ADMIN }).then(
            (token: IResetTokenModel) => !!this.baseRepo.delete(token._id)
        );
    }
    saveToken(token: IUserToken): Promise<IUserToken> {
        const newToken = new ResetTokenSchema({
            token: token.token,
            type: token.type,
            user: token.userId
        });
        return this.baseRepo.create(newToken).then(
            res => newToken
        );
    }
    getUserTokenByJWT(token: string): Promise<IUserToken | null> {
        return this.baseRepo.findOne({ token: token }).then(
            model => {
                if (!model) return null;
                return {
                    token: model.token,
                    type: model.type,
                    userId: model.user
                };
            }
        );
    }
}

export const repository: ITokenRepository = new TokenRepository(createRepository(ResetTokenSchema));
