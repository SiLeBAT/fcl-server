import { createCatalog } from './../catalog.entity';
import { Catalog } from '../../model/catalog.model';
jest.mock('./../../../../app/ports');
jest.mock('../../../core/application/configuration.service', () => ({
    getConfigurationService: () => ({
        getServerConfiguration: jest.fn()
    })
}));

interface IMockCatalogData {
    id: string;
    DatumGueltigkeit: string;
    Katalog: string;
    Kode: string;
    Kodiersystem: string;
    'P-Code3': string;
    Text1: string;
}
describe('Pathogen Index', () => {
    let testData: IMockCatalogData[];
    let catalog: Catalog<IMockCatalogData>;

    beforeEach(() => {
        testData = [
            {
                id: '801001',
                DatumGueltigkeit: '19990330',
                Katalog: '016',
                Kode: '0801001',
                Kodiersystem: '000',
                'P-Code3': 'Escherichia coli',
                Text1: 'Escherichia coli'
            },
            {
                id: '801004',
                DatumGueltigkeit: '20110609',
                Katalog: '016',
                Kode: '0801001',
                Kodiersystem: '000',
                'P-Code3': '',
                Text1: 'Escherichia coli O157:H7'
            },
            {
                id: '803101',
                DatumGueltigkeit: '19990330',
                Katalog: '016',
                Kode: '0803101',
                Kodiersystem: '000',
                'P-Code3': 'S.Typhi',
                Text1: 'Salmonella Typhi'
            }
        ];

        catalog = createCatalog(testData, 'id');
    });

    it('should dump test data', () => {
        expect(catalog.dump()).toEqual(testData);
    });

    it('should have Unique Id', () => {
        expect(catalog.hasUniqueId()).toBe(true);
    });

    it('should have Unique Id: id', () => {
        expect(catalog.getUniqueId()).toEqual('id');
    });

    it('should contain with id 803101', () => {
        expect(catalog.containsUniqueEntryWithId('803101')).toBe(true);
    });

    it('should return entry with id 803101', () => {
        expect(catalog.getUniqueEntryWithId('803101')).toEqual(testData[2]);
    });

    it('should not contain entry with id 803102', () => {
        expect(catalog.containsUniqueEntryWithId('803102')).toBe(false);
    });

    it('should not return entry with id 803102', () => {
        expect(catalog.getUniqueEntryWithId('803102')).toBeUndefined();
    });
});
