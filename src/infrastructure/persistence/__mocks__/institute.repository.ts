import { InstituteRepository } from '../../../app/ports';
import { genericInstitute } from './../../../app/authentication/application/__mocks__/institute.service';

export function getMockInstituteRepository(): InstituteRepository {
    return {
        findByInstituteId: jest.fn(() => Promise.resolve(genericInstitute)),
        findByInstituteName: jest.fn(() => Promise.resolve(genericInstitute)),
        retrieve: jest.fn(() => Promise.resolve([genericInstitute])),
        createInstitute: jest.fn()
    };
}
