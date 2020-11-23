export class ServerDomainError extends Error {
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

export class MalformedRequestError extends ServerDomainError {
    // tslint:disable-next-line: no-any
    constructor(...args: any[]) {
        super(...args);
    }
}
export class TokenNotFoundError extends ServerDomainError {
    // tslint:disable-next-line: no-any
    constructor(...args: any[]) {
        super(...args);
    }
}
export class UnknownPackageConfigurationError extends ServerDomainError {
    // tslint:disable-next-line: no-any
    constructor(...args: any[]) {
        super(...args);
    }
}
