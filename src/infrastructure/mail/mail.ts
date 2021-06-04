// core

// npm
import handlebars from 'handlebars';
import nodemailer from 'nodemailer';
import readFilePromise from 'fs-readfile-promise';

// local
import { logger } from './../../aspects';
import { NotificationType } from '../../app/ports';
import { injectable, inject } from 'inversify';
import {
    MailService,
    MailConfiguration,
    EmailData,
    MailOptions,
} from './mail.model';
import { MAIL_TYPES } from './mail.types';

@injectable()
export class DefaultMailService implements MailService {
    private host = 'localhost';
    private port = 25;

    private viewsDir = __dirname + '/views/en/';

    constructor(
        @inject(MAIL_TYPES.MailConfiguration)
        private mailConfiguration: MailConfiguration
    ) {}

    getMailHandler() {
        return async (data: EmailData) => {
            let templateFile;
            logger.info(
                `${this.constructor.name}, handling notification type. data.type=${data.type}`
            );
            switch (data.type) {
                case NotificationType.RESET_SUCCESS:
                    templateFile = await readFilePromise(
                        this.viewsDir + 'pwnotification.html'
                    );
                    break;
                case NotificationType.REQUEST_ACTIVATION:
                    templateFile = await readFilePromise(
                        this.viewsDir + 'regactivation.html'
                    );
                    break;
                case NotificationType.REQUEST_ALTERNATIVE_CONTACT:
                    templateFile = await readFilePromise(
                        this.viewsDir + 'pwresethelp.html'
                    );
                    break;
                case NotificationType.REQUEST_RESET:
                    templateFile = await readFilePromise(
                        this.viewsDir + 'pwreset.html'
                    );
                    break;
                case NotificationType.REQUEST_JOB:
                    templateFile = await readFilePromise(
                        this.viewsDir + 'jobnotification.html'
                    );
                    break;
                case NotificationType.REQUEST_ADMIN_ACTIVATION:
                    templateFile = await readFilePromise(
                        this.viewsDir + 'adminactivation.html'
                    );
                    break;
                case NotificationType.REQUEST_UNKNOWN_INSTITUTE:
                    templateFile = await readFilePromise(
                        this.viewsDir + 'adminactivationUnknownInst.html'
                    );
                    break;
                case NotificationType.NOTIFICATION_ADMIN_ACTIVATION:
                    templateFile = await readFilePromise(
                        this.viewsDir + 'adminactivationNotification.html'
                    );
                    break;
                case NotificationType.NOTIFICATION_NOT_ADMIN_ACTIVATED:
                    templateFile = await readFilePromise(
                        this.viewsDir + 'notAdminactivationNotification.html'
                    );
                    break;
                case NotificationType.NOTIFICATION_ALREADY_REGISTERED:
                    templateFile = await readFilePromise(
                        this.viewsDir + 'reguserexists.html'
                    );
                    break;
                case NotificationType.REMINDER_ADMIN_ACTIVATION:
                    templateFile = await readFilePromise(
                        this.viewsDir + 'adminactivationReminder.html'
                    );
                    break;
                case NotificationType.NOTIFICATION_SENT:
                    templateFile = await readFilePromise(
                        this.viewsDir + 'sentnotification.html'
                    );
                    break;
                case NotificationType.NEWSLETTER_AGREEMENT:
                    templateFile = await readFilePromise(
                        this.viewsDir + 'newsagreement.html'
                    );
                    break;
                default:
                    logger.warn('Unknown notification type', {
                        notification: data.type,
                    });
            }
            if (templateFile) {
                this.sendMail(data.payload, templateFile.toString('utf-8'), {
                    ...data.meta,
                    ...{
                        from: this.mailConfiguration.fromAddress,
                        replyTo: this.mailConfiguration.replyToAddress,
                    },
                });
            }
        };
    }

    private sendMail(
        // tslint:disable-next-line
        templateData: any,
        templateFile: string,
        options: MailOptions
    ) {
        templateData.copyrightYear = new Date().getFullYear();

        let template = handlebars.compile(templateFile);
        let result = template(templateData);

        const transporter = nodemailer.createTransport({
            host: this.host,
            port: this.port,
            tls: {
                rejectUnauthorized: false,
            },
        });

        const mailOptions = {
            ...options,
            ...{
                html: result,
            },
        };

        try {
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    logger.error(
                        `Error sending mail. error=${error} mailSubject="${mailOptions.subject}"`
                    );
                    return error;
                } else {
                    logger.info('Email sent', {
                        subject: mailOptions.subject,
                    });
                    logger.verbose(JSON.stringify(info));
                    return info;
                }
            });
        } catch (error) {
            logger.error(
                `Error sending mail. error=${error} mailSubject="${mailOptions.subject}"`
            );
            throw error;
        }
    }
}
