export const genericInstitute = {
    uniqueId: 'test',
    stateShort: 'test',
    name: 'test',
    addendum: 'test',
    city: 'test',
    zip: 'test',
    phone: 'test',
    fax: 'test',
    email: []
};

export function getMockInstituteService() {
    return {
        getInstituteById: jest.fn(() => Promise.resolve(genericInstitute)),
        getInstituteByName: jest.fn(() => Promise.resolve(genericInstitute)),
        retrieveInstitutes: jest.fn(() => Promise.resolve([genericInstitute])),
        createInstitute: jest.fn()
    };
}
