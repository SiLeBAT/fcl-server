const SERVER_TYPES = {
    AppServerConfiguration: Symbol.for('AppServerConfiguration'),
    InfoController: Symbol.for('InfoController'),
    InstitutesController: Symbol.for('InstitutesController'),
    UsersController: Symbol.for('UsersController'),
    VersionRootController: Symbol.for('VersionRootController'),
    APIDocsController: Symbol.for('APIDocsController'),
    SwaggerMW: Symbol.for('SwaggerMW'),
    TokensController: Symbol.for('TokensController'),
};

export default SERVER_TYPES;
