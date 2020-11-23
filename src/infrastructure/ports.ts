export { MAIL_TYPES } from './mail/mail.types';

export { getPersistenceContainerModule } from './persistence/persistence.module';
export { UserNotFoundError } from './persistence/model/domain.error';
export { createRepository } from './persistence/data-store/mongoose/mongoose.repository';
export {
    createDataStore,
    mapCollectionToRepository,
} from './persistence/data-store/mongoose/mongoose';
export { DataStore } from './persistence/model/data-store.model';

export { MailService } from './mail/mail.model';

export { getMailContainerModule } from './mail/mail.module';
