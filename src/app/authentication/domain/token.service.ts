
import * as config from 'config';
import { sign, verify } from 'jsonwebtoken';

const EXPIRATION_TIME = 60 * 60 * 24;
const ADMIN_EXPIRATION_TIME = 60 * 60 * 24 * 7;
const JWT_SECRET: string = config.get('server.jwtSecret');

function generateToken(id: string) {
    return sign(
        { sub: id },
        JWT_SECRET,
        { expiresIn: EXPIRATION_TIME }
    );
}

function generateAdminToken(id: string) {
    return sign(
        { sub: id,
		  admin: true },
        JWT_SECRET,
        { expiresIn: ADMIN_EXPIRATION_TIME }
    );
}

function verifyToken(token: string, id: string) {
    return verify(token, JWT_SECRET, { subject: id });
}

export {
	generateToken,
	generateAdminToken,
    verifyToken
};
