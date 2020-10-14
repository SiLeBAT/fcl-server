import { ContainerModule, interfaces } from 'inversify';
import { MailConfiguration } from './mail.model';
import { MAIL_TYPES } from './mail.types';
import { DefaultMailService } from './mail';

export function getMailContainerModule(
    mailConfig: MailConfiguration
): ContainerModule {
    return new ContainerModule(
        (bind: interfaces.Bind, unbind: interfaces.Unbind) => {
            bind(MAIL_TYPES.MailConfiguration).toConstantValue(mailConfig);
            bind(MAIL_TYPES.MailService).to(DefaultMailService);
        }
    );
}
