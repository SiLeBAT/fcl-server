import * as winston from 'winston';
import * as config from 'config';
import { TransformableInfo } from 'logform';

/*
*
* Log levels are:
*   error: 0,
*   warn: 1,
*   info: 2,
*   verbose: 3,
*   debug: 4,
*   trace: 5
*
*/
export class Logger {

    private _logger: winston.Logger;

    constructor() {
        this._logger = winston.createLogger({
            level: Logger.mapLogLevels(config.get('server.logLevel')),
            format: winston.format.combine(
				winston.format.colorize(),
				winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
				winston.format.printf(info => Logger.mapLogMessage(info))
			),
            transports: [
                new winston.transports.Console()
            ]
        });
    }

    static mapLogMessage(info: TransformableInfo): string {
        let logMsg = `${info.timestamp} ${info.level} ${info.message}`;
        logMsg = (info.meta !== undefined) ?
				 logMsg + ' ' + (typeof(info.meta) === 'object' ? JSON.stringify(info.meta) : info.meta) :
				 logMsg;

        return logMsg;
    }

    static mapLogLevels(level: string): string {
        switch (level) {
            case 'trace':
                return 'silly';
            case 'info':
                return level;
            case 'error':
                return level;
            case 'verbose':
                return level;
            case 'warn':
                return level;
            case 'silly':
                return level;
            case 'debug':
                return level;
            default:
                return 'info';
        }
    }

    static mapLevelToMorganFormat(level: string): string {
        switch (level) {
            case 'trace':
                return 'dev';
            case 'info':
                return 'combined';
            case 'error':
                return 'combined';
            case 'verbose':
                return 'dev';
            case 'warn':
                return 'combined';
            case 'silly':
                return 'dev';
            case 'debug':
                return 'dev';
            default:
                return 'info';
        }
    }

    // tslint:disable-next-line
    error(msg: string, meta?: any) {
        this._logger.log('error', msg, { meta: meta });
    }

    // tslint:disable-next-line
    warn(msg: string, meta?: any) {
        this._logger.log('warn', msg, { meta: meta });
    }

    // tslint:disable-next-line
    info(msg: string, meta?: any) {
        this._logger.log('info', msg, { meta: meta });
    }

    // tslint:disable-next-line
    verbose(msg: string, meta?: any) {
        this._logger.log('verbose', msg, { meta: meta });
    }

    // tslint:disable-next-line
    debug(msg: string, meta?: any) {
        this._logger.log('debug', msg, { meta: meta });
    }

    // tslint:disable-next-line
    trace(msg: string, meta?: any) {
        this._logger.log('silly', msg, { meta: meta });
    }
}

const logger = new Logger();

export {
    logger
};
