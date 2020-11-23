export class PersistenceError extends Error {
    // tslint:disable-next-line
    constructor(...args: any[]) {
        // Calling parent constructor of base Error class.
        super(...args);

        // Saving class name in the property of our custom error as a shortcut.
        this.name = this.constructor.name;

        // Capturing stack trace, excluding constructor call from it.
        Error.captureStackTrace(this, this.constructor);
    }
}
export class UserNotFoundError extends PersistenceError {
    // tslint:disable-next-line: no-any
    constructor(...args: any[]) {
        super(...args);
    }
}
export class UserUpdateError extends PersistenceError {
    // tslint:disable-next-line: no-any
    constructor(...args: any[]) {
        super(...args);
    }
}
export class InstituteNotFoundError extends PersistenceError {
    // tslint:disable-next-line: no-any
    constructor(...args: any[]) {
        super(...args);
    }
}
