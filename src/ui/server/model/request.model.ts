export interface ResetRequestDTO {
    readonly email: string;
}

export interface NewPasswordRequestDTO {
    readonly password: string;
}
export interface RegistrationDetailsDTO {
    readonly email: string;
    readonly firstName: string;
    readonly instituteId: string;
    readonly lastName: string;
    readonly password: string;
    readonly dataProtectionAgreed: boolean;
    readonly newsRegAgreed: boolean;
    readonly newsMailAgreed: boolean;
}

export interface GDPRConfirmationRequestDTO {
    readonly email: string;
    readonly token: string;
    readonly gdprConfirmed: boolean;
}
