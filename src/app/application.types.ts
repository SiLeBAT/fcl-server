export const APPLICATION_TYPES = {
    ApplicationConfiguration: Symbol.for('ApplicationConfiguration'),

    ConfigurationService: Symbol.for('ConfigurationService'),
    NotificationService: Symbol.for('NotificationService'),
    InstituteService: Symbol.for('InstituteService'),
    UserService: Symbol.for('UserService'),
    TokenService: Symbol.for('TokenService'),
    RegistrationService: Symbol.for('RegistrationService'),
    PasswordService: Symbol.for('PasswordService'),
    LoginService: Symbol.for('LoginService'),

    InstituteRepository: Symbol.for('InstituteRepository'),
    UserRepository: Symbol.for('UserRepository'),
    TokenRepository: Symbol.for('TokenRepository'),
};
