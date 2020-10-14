import * as jwt from 'express-jwt';
import { ROUTE } from '../model/enums';

function validateToken(secret: string) {
    const whiteList = [
        '/api-docs' + ROUTE.VERSION,
        ROUTE.VERSION,
        ROUTE.VERSION + '/',
        ROUTE.VERSION + '/info',
        ROUTE.VERSION + '/info/gdpr-date',
        ROUTE.VERSION + '/institutes',
        ROUTE.VERSION + '/users/login',
        ROUTE.VERSION + '/users/gdpr-agreement',
        ROUTE.VERSION + '/users/registration',
        ROUTE.VERSION + '/users/reset-password-request',
        ROUTE.VERSION + '/samples/validated',
        ROUTE.VERSION + '/samples',
        /\/v1\/users\/reset-password\/*/,
        /\/v1\/users\/verification\/*/,
        /\/v1\/users\/activation\/*/,
        /\/v1\/users\/news-confirmation\/*/
    ];

    return jwt({
        secret,
        getToken: getTokenFromHeader
    }).unless({
        path: whiteList
    });
}

// tslint:disable-next-line: no-any
function getTokenFromHeader(req: any): string | null {
    if (
        req.headers.authorization &&
        req.headers.authorization.split(' ')[0] === 'Bearer'
    ) {
        return req.headers.authorization.split(' ')[1];
    }
    return null;
}
export { validateToken, getTokenFromHeader };
