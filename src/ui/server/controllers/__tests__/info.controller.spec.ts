/// <reference types='jest' />

import * as mockRes from 'mock-express-response';
import { SystemInfoController } from '../../model/controller.model';
import { getServerContainerModule } from '../../server.module';
import { Container } from 'inversify';
import { getApplicationContainerModule } from '../../../../app/ports';
import { mockPersistenceContainerModule } from '../../../../infrastructure/persistence/__mocks__/persistence-mock.module';
import SERVER_TYPES from '../../server.types';
import { getContainer } from '../../../../aspects/container/container';

// tslint:disable
describe('Info controller', () => {
    let controller: SystemInfoController;

    let container: Container | null;
    beforeEach(() => {
        container = getContainer();
        container.load(
            getServerContainerModule({
                port: 1,
                apiRoot: '',
                publicAPIDoc: {},
                jwtSecret: 'test',
                logLevel: 'info',
                supportContact: 'test',
            }),
            getApplicationContainerModule({
                appName: 'test',
                jobRecipient: 'test',
                login: {
                    threshold: 0,
                    secondsDelay: 0,
                },
                clientUrl: 'test',
                supportContact: 'test',
                jwtSecret: 'test',
                gdprDate: 'test',
            }),
            mockPersistenceContainerModule
        );
        controller = container.get<SystemInfoController>(
            SERVER_TYPES.InfoController
        );
    });
    afterEach(() => {
        container = null;
    });

    it('should respond with JSON', function () {
        const res = new mockRes();
        expect.assertions(4);
        return controller.getSystemInfo(res).then((success) => {
            expect(res.statusCode).toBe(200);
            const body = res._getJSON();
            expect(body).toHaveProperty('version');
            expect(body).toHaveProperty('supportContact');
            expect(body).toHaveProperty('lastChange');
        });
    });
});
