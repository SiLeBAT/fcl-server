/// <reference types='jest' />

import { getContainer } from '../../../../aspects/container/container';
import * as httpMocks from 'node-mocks-http';
import { getApplicationContainerModule } from '../../../../app/ports';
import { InstitutesController } from '../../model/controller.model';
import { Container } from 'inversify';
import { getServerContainerModule } from '../../server.module';
import { mockPersistenceContainerModule } from '../../../../infrastructure/persistence/__mocks__/persistence-mock.module';
import SERVER_TYPES from '../../server.types';

// tslint:disable
describe('Institution controller', () => {
    let controller: InstitutesController;

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
        controller = container.get<InstitutesController>(
            SERVER_TYPES.InstitutesController
        );
    });
    afterEach(() => {
        container = null;
    });

    it('should respond with list of institutes', function () {
        const req = httpMocks.createRequest({
            method: 'GET',
            headers: {
                'content-type': 'application/json',
            },
        });
        const res = httpMocks.createResponse();
        expect.assertions(2);
        return controller.getInstitutes(req, res).then((success) => {
            expect(res.statusCode).toBe(200)
            const body = res._getJSONData();
            expect(body).toHaveProperty('institutes');
        });
    });
});
