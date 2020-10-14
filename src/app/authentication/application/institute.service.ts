import {
    InstituteService,
    Institute,
    InstituteRepository
} from '../model/institute.model';
import { injectable, inject } from 'inversify';
import { APPLICATION_TYPES } from './../../application.types';

@injectable()
export class DefaultInstituteService implements InstituteService {
    constructor(
        @inject(APPLICATION_TYPES.InstituteRepository)
        private instituteRepository: InstituteRepository
    ) {}

    retrieveInstitutes(): Promise<Institute[]> {
        return this.instituteRepository.retrieve().then(institutes => {
            return institutes.filter(
                (institute: Institute) => institute.name !== 'dummy'
            );
        });
    }

    getInstituteById(instituteId: string): Promise<Institute> {
        return this.instituteRepository.findByInstituteId(instituteId);
    }

    getInstituteByName(name: string): Promise<Institute> {
        return this.instituteRepository.findByInstituteName(name);
    }

    createInstitute(institute: Institute): Promise<Institute> {
        return this.instituteRepository.createInstitute(institute);
    }
}
