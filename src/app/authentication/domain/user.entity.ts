import * as argon2 from 'argon2';

const defaultHashOptions = {
    hashLength: 128,
    timeCost: 10,
    memoryCost: 15,
    parallelism: 100,
    type: argon2.argon2id
};

export interface IUserCredentials {
    email: string;
    password: string;
}

export interface IUserBase {
    firstName: string;
    lastName: string;
    email: string;
}

export interface IUser extends IUserBase {
    uniqueId: string;
    readonly password: string;
    isAuthorized(credentials: IUserCredentials): Promise<boolean>;
    updatePassword(password: string): Promise<string>;
    updateNumberOfFailedAttempts(increment: boolean): void;
    updateLastLoginAttempt(): void;
    isActivated(active?: boolean): boolean;
    isAdminActivated(active?: boolean): boolean;
    getNumberOfFailedAttempts(): number;
    getLastLoginAttempt(): number;
}

class GenericUser implements IUser {
    uniqueId: string;
    firstName: string;
    lastName: string;
    email: string;

    constructor(id: string,
				email: string,
				fname: string,
				lname: string,
				private _password: string,
				private enabled: boolean,
				private adminEnabled: boolean,
				private numAttempt: number,
				private lastAttempt: number) {
        this.uniqueId = id;
        this.email = email;
        this.firstName = fname;
        this.lastName = lname;
    }

    get password(): string {
        return this._password;
    }

    isActivated(active?: boolean) {
        if (!(active === undefined)) {
            this.enabled = !!active;
        }
        return this.enabled;
    }

    isAdminActivated(active?: boolean) {
        if (!(active === undefined)) {
            this.adminEnabled = !!active;
        }
        return this.adminEnabled;
    }

    isAuthorized(credentials: IUserCredentials): Promise<boolean> {
        return this.verifyPassword(this._password, credentials.password);
    }

    updatePassword(password: string): Promise<string> {
        return this.hashPassword(password).then(
            hashed => this._password = hashed
        );
    }

    updateNumberOfFailedAttempts(increment: boolean) {
        increment ? this.numAttempt++ : this.numAttempt = 0;
    }

    updateLastLoginAttempt() {
        this.lastAttempt = Date.now();
    }

    getNumberOfFailedAttempts(): number {
        return this.numAttempt;
    }

    getLastLoginAttempt(): number {
        return this.lastAttempt;
    }

    private verifyPassword(hashedPassword: string, password: string) {
        return argon2.verify(hashedPassword, password);
    }

    private hashPassword(password: string, options = defaultHashOptions) {
        return argon2.hash(password, options);
    }

}

export function createUser(id: string,
						   email: string,
						   fname: string,
						   lname: string,
						   password: string,
						   enabled: boolean = false,
						   adminEnabled: boolean = false,
						   numAttempt: number = 0,
						   lastAttempt: number = Date.now()): IUser {
    return new GenericUser(id, email, fname, lname, password, enabled, adminEnabled, numAttempt, lastAttempt);
}
