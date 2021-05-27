import * as argon2 from 'argon2';
import { User, UserCredentials } from '../model/user.model';
import { Institute } from '../model/institute.model';

const defaultHashOptions = {
    hashLength: 128,
    timeCost: 10,
    memoryCost: 1024,
    parallelism: 4,
    type: argon2.argon2id,
};

class GenericUser implements User {
    uniqueId: string;
    firstName: string;
    lastName: string;
    email: string;
    institution: Institute;
    dataProtectionAgreed: boolean;
    dataProtectionDate: Date;
    newsRegAgreed: boolean;
    newsMailAgreed: boolean;
    newsDate: Date;

    static create(
        id: string,
        email: string,
        fname: string,
        lname: string,
        inst: Institute,
        password: string,
        dataProtectionAgreed: boolean,
        dataProtectionDate: Date,
        newsRegAgreed: boolean,
        newsMailAgreed: boolean,
        newsDate: Date,
        enabled: boolean = false,
        adminEnabled: boolean = false,
        numAttempt: number = 0,
        lastAttempt: number = Date.now()
    ): User {
        return new GenericUser(
            id,
            email,
            fname,
            lname,
            inst,
            password,
            dataProtectionAgreed,
            dataProtectionDate,
            newsRegAgreed,
            newsMailAgreed,
            newsDate,
            enabled,
            adminEnabled,
            numAttempt,
            lastAttempt
        );
    }

    constructor(
        id: string,
        email: string,
        fname: string,
        lname: string,
        inst: Institute,
        private _password: string,
        dataProtectionAgreed: boolean,
        dataProtectionDate: Date,
        newsRegAgreed: boolean,
        newsMailAgreed: boolean,
        newsDate: Date,
        private enabled: boolean,
        private adminEnabled: boolean,
        private numAttempt: number,
        private lastAttempt: number
    ) {
        this.uniqueId = id;
        this.email = email;
        this.firstName = fname;
        this.lastName = lname;
        this.institution = inst;
        this.dataProtectionAgreed = dataProtectionAgreed;
        this.dataProtectionDate = dataProtectionDate;
        this.newsRegAgreed = newsRegAgreed;
        this.newsMailAgreed = newsMailAgreed;
        this.newsDate = newsDate;
    }

    get password(): string {
        return this._password;
    }

    getFullName() {
        return this.firstName + ' ' + this.lastName;
    }

    isVerified(verified?: boolean) {
        if (!(verified === undefined)) {
            this.enabled = !!verified;
        }
        return this.enabled;
    }

    isActivated(active?: boolean) {
        if (!(active === undefined)) {
            this.adminEnabled = !!active;
        }
        return this.adminEnabled;
    }

    isNewsMailAgreed(newsMailAgreed?: boolean) {
        if (!(newsMailAgreed === undefined)) {
            this.newsMailAgreed = !!newsMailAgreed;
        }
        return this.newsMailAgreed;
    }

    isAuthorized(credentials: UserCredentials): Promise<boolean> {
        return this.verifyPassword(this._password, credentials.password);
    }

    updatePassword(password: string): Promise<string> {
        return this.hashPassword(password).then(
            (hashed) => (this._password = hashed)
        );
    }

    updateNumberOfFailedAttempts(increment: boolean) {
        increment ? this.numAttempt++ : (this.numAttempt = 0);
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

export function createUser(
    id: string,
    email: string,
    fname: string,
    lname: string,
    inst: Institute,
    password: string,
    dataProtectionAgreed: boolean,
    dataProtectionDate: Date,
    newsRegAgreed: boolean,
    newsMailAgreed: boolean,
    newsDate: Date,
    enabled: boolean = false,
    adminEnabled: boolean = false,
    numAttempt: number = 0,
    lastAttempt: number = Date.now()
): User {
    return GenericUser.create(
        id,
        email,
        fname,
        lname,
        inst,
        password,
        dataProtectionAgreed,
        dataProtectionDate,
        newsRegAgreed,
        newsMailAgreed,
        newsDate,
        enabled,
        adminEnabled,
        numAttempt,
        lastAttempt
    );
}
