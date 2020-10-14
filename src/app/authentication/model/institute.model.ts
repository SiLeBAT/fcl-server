export interface Institute {
    uniqueId: string;
    stateShort: string;
    name: string;
    addendum: string;
    city: string;
    zip: string;
    phone: string;
    fax: string;
    email: string[];
}

export interface InstitutePort {
    retrieveInstitutes(): Promise<Institute[]>;
    getInstituteById(instituteId: string): Promise<Institute>;
}

export interface InstituteService extends InstitutePort {
    getInstituteByName(name: string): Promise<Institute>;
    createInstitute(institute: Institute): Promise<Institute>;
}

export interface InstituteRepository {
    retrieve(): Promise<Institute[]>;
    findByInstituteId(id: string): Promise<Institute>;
    createInstitute(institution: Institute): Promise<Institute>;
    findByInstituteName(name: string): Promise<Institute>;
}
