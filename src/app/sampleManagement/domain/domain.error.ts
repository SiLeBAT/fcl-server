import { ApplicationDomainError } from '../../core/domain/domain.error';

export class NotValidatedIdError extends ApplicationDomainError {
    // tslint:disable-next-line: no-any
    constructor(...args: any[]) {
        super(...args);
    }
}
export class ValidationErrorCodeNotFoundError extends ApplicationDomainError {
    // tslint:disable-next-line: no-any
    constructor(...args: any[]) {
        super(...args);
    }
}
export class MalformedValidationOptionsError extends ApplicationDomainError {
    // tslint:disable-next-line: no-any
    constructor(...args: any[]) {
        super(...args);
    }
}
