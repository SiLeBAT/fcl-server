import { ApplicationDomainError } from '../../core/domain/domain.error';

export class AuthorizationError extends ApplicationDomainError {
    timeToWait: number = 0;
    // tslint:disable-next-line: no-any
    constructor(...args: any[]) {
        super(...args);
    }
}

export class UserNotActivatedError extends ApplicationDomainError {
    // tslint:disable-next-line: no-any
    constructor(...args: any[]) {
        super(...args);
    }
}

export class UserNotVerifiedError extends ApplicationDomainError {
    // tslint:disable-next-line: no-any
    constructor(...args: any[]) {
        super(...args);
    }
}

export class UserAlreadyExistsError extends ApplicationDomainError {
    // tslint:disable-next-line: no-any
    constructor(...args: any[]) {
        super(...args);
    }
}

export class UserRegistrationInputError extends ApplicationDomainError {
    // tslint:disable-next-line: no-any
    constructor(...args: any[]) {
        super(...args);
    }
}
