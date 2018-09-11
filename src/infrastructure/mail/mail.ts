// core

// npm
import * as handlebars from 'handlebars';
import * as nodemailer from 'nodemailer';
import * as config from 'config';
import * as readFilePromise from 'fs-readfile-promise';

// local
import { logger } from './../../aspects';
import { INotificationPort, NotificationType, INotification } from '../../app/ports';

interface IMailConfig {
    replyToAddress: string;
    fromAddress: string;
}

interface IMailOptions {
    to: string;
    cc: string[];
    subject: string;
    // tslint:disable-next-line
    attachments: any[];
}

const mailConfig: IMailConfig = config.get('mail');

const fromAddress = mailConfig.fromAddress;
const replyToAddress = mailConfig.replyToAddress;
const host = 'localhost';
const port = 25;

const viewsDir = __dirname + '/views/en/';

function registerListeners(notificationService: INotificationPort) {
    notificationService.addHandler(async (data: INotification) => {
        let templateFile;
        switch (data.type) {
            case NotificationType.RESET_SUCCESS:
                templateFile = await readFilePromise(viewsDir + 'pwnotification.html');
                break;
            case NotificationType.REQUEST_ACTIVATION:
                templateFile = await readFilePromise(viewsDir + 'regactivation.html');
                break;
            case NotificationType.REQUEST_ALTERNATIVE_CONTACT:
                templateFile = await readFilePromise(viewsDir + 'pwresethelp.html');
                break;
            case NotificationType.REQUEST_RESET:
                templateFile = await readFilePromise(viewsDir + 'pwreset.html');
                break;
            case NotificationType.REQUEST_ADMIN_ACTIVATION:
                templateFile = await readFilePromise(viewsDir + 'adminactivation.html');
                break;
            case NotificationType.NOTIFICATION_ADMIN_ACTIVATION:
                templateFile = await readFilePromise(viewsDir + 'adminactivationNotification.html');
                break;
            case NotificationType.NOTIFICATION_NOT_ADMIN_ACTIVATED:
                templateFile = await readFilePromise(viewsDir + 'notAdminactivationNotification.html');
                break;
            case NotificationType.NOTIFICATION_ALREADY_REGISTERED:
                templateFile = await readFilePromise(viewsDir + 'reguserexists.html');
                break;
            case NotificationType.REMINDER_ADMIN_ACTIVATION:
                templateFile = await readFilePromise(viewsDir + 'adminactivationReminder.html');
                break;
            default:
                logger.warn('Unknown notification type', { notification: data.type });
        }
        if (templateFile) {
            sendMail(data.payload, templateFile.toString('utf-8'), {
                to: data.meta.email,
                cc: data.meta.cc ? data.meta.cc : [],
                subject: data.title,
                attachments: []
            });
        }
    });

}

// tslint:disable-next-line
function sendMail(templateData: any, templateFile: string, options: IMailOptions) {
    let template = handlebars.compile(templateFile);
    let result = template(templateData);

    const transporter = nodemailer.createTransport({
        host: host,
        port: port,
        tls: {
            rejectUnauthorized: false
        }
    });

    const mailOptions = {
        ...options,
        ...{
            from: fromAddress,
            replyTo: replyToAddress,
            html: result
        }
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            logger.error('Error sending mail', { error: error });
        } else {
            logger.info('Email sent', {
                subject: mailOptions.subject
            });
        }
    });

}

export {
    registerListeners
};
