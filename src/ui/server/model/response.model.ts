export interface RegistrationRequestResponseDTO {
    readonly registerRequest: boolean;
    readonly email: string;
}

export interface PasswordResetRequestResponseDTO {
    readonly passwordResetRequest: boolean;
    readonly email: string;
}

export interface PasswordResetResponseDTO {
    readonly passwordReset: boolean;
}

export interface ActivationResponseDTO {
    readonly activation: boolean;
    readonly username: string;
}

export interface NewsConfirmationResponseDTO {
    readonly newsconfirmation: boolean;
    readonly username: string;
}

export interface TokenRefreshConfirmationResponseDTO {
    readonly refresh: boolean;
    readonly token: string;
}

interface ErrorDTO {
    readonly code: number;
    readonly message: string;
}

export interface DefaultServerErrorDTO extends ErrorDTO {}

export interface FailedLoginErrorDTO extends ErrorDTO {
    readonly waitTime?: number;
}

export interface TokenizedUserDTO {
    readonly firstName: string;
    readonly lastName: string;
    readonly email: string;
    readonly token: string;
    readonly instituteId: string;
    readonly gdprAgreementRequested: boolean;
}

export interface SystemInformationDTO {
    readonly version: string;
    readonly lastChange: string;
    readonly supportContact: string;
}

export interface GDPRDateDTO {
    readonly gdprDate: string;
}

export interface InstituteCollectionDTO {
    readonly institutes: InstituteDTO[];
}
export interface InstituteDTO {
    readonly id: string;
    readonly short: string;
    readonly name: string;
    readonly addendum: string;
    readonly city: string;
    readonly zip: string;
    readonly phone: string;
    readonly fax: string;
    readonly email: string[];
}
