const SERVER_TYPES = {
    AppServerConfiguration: Symbol.for('AppServerConfiguration'),
    InfoController: Symbol.for('InfoController'),
    InstitutesController: Symbol.for('InstitutesController'),
    UsersController: Symbol.for('UsersController'),
    SamplesController: Symbol.for('SamplesController'),
    VersionRootController: Symbol.for('VersionRootController'),
    APIDocsController: Symbol.for('APIDocsController'),
    MulterMW: Symbol.for('MulterMW'),
    SwaggerMW: Symbol.for('SwaggerMW'),
    TokensController: Symbol.for('TokensController')
};

export default SERVER_TYPES;
