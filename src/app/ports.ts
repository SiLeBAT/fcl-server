import { IUserToken, IUser } from './authentication';

export {
    IRepositoryFactory,
    IServiceFactory,
    RepositoryFactory,
    ServiceFactory,
    IController,
    INotification,
    NotificationType,
    INotificationPort
} from './sharedKernel';

export {
    IRegistrationPort,
    IPasswordPort,
    ILoginPort,
    LoginResult,
    createUser,
    IUser,
    IUserToken,
    IUserLoginInformation,
    ILoginResponse,
    IUserBase
} from './authentication';

export interface IModelAttributes {
}

export interface IUpdateResponse {
}

export interface IRead<T> {
    retrieve: () => Promise<T[]>;
    findById: (id: string) => Promise<T | null>;
    findOne(cond?: Object): Promise<T | null>;
    find(cond: Object, fields: Object, options: Object): Promise<T[]>;
}

export interface IWrite<T> {
    create: (item: T) => Promise<T>;
    update: (_id: string, attributes: IModelAttributes) => Promise<IUpdateResponse>;
    delete: (_id: string) => Promise<T>;
}

export interface IRepositoryBase<T> extends IRead<T>, IWrite<T> {
}

export interface IUserModelAttributes extends IModelAttributes {
    _id?: string;
    enabled?: boolean;
    adminEnabled?: boolean;
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
}

export interface ITokenRepository {
    hasTokenForUser(user: IUser): Promise<boolean>;
    hasResetTokenForUser(user: IUser): Promise<boolean>;
    hasAdminTokenForUser(user: IUser): Promise<boolean>;
    deleteTokenForUser(user: IUser): Promise<boolean>;
    deleteResetTokenForUser(user: IUser): Promise<boolean>;
    deleteAdminTokenForUser(user: IUser): Promise<boolean>;
    saveToken(token: IUserToken): Promise<IUserToken>;
    getUserTokenByJWT(token: string): Promise<IUserToken | null>;
}

export interface IUserRepository {
    findById(id: string): Promise<IUser | null>;
    getPasswordForUser(username: string): Promise<string | null>;
    findByUsername(username: string): Promise<IUser | null>;
    hasUser(username: string): Promise<boolean>;
    createUser(user: IUser): Promise<IUser>;
    updateUser(user: IUser): Promise<IUser | null>;
}
