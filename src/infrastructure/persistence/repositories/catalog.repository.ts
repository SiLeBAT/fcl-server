import { logger } from '../../../aspects';
import {
    CatalogRepository,
    Catalog,
    createCatalog,
    CatalogData
} from '../../../app/ports';
import { loadCSVFile } from '../data-store/file/file-loader';

interface CatalogConfig {
    filename: string;
    id: string;
    uId?: string;
    filterFunction?: Function;
}

class FileCatalogRepository implements CatalogRepository {
    private catalogs: {
        [key: string]: Catalog<CatalogData>;
    };
    constructor(private dataDir: string) {
        this.catalogs = {};
    }

    initialise() {
        logger.verbose(
            `${this.constructor.name}.${this.initialise.name}, loading Catalog data from Filesystem.`
        );

        const catalogsConfig: CatalogConfig[] = [
            {
                filename: 'ADV2.csv',
                id: 'adv2',
                uId: 'Kode'
            },
            {
                filename: 'ADV3.csv',
                id: 'adv3'
            },
            {
                filename: 'ADV4.csv',
                id: 'adv4',
                uId: 'Kode'
            },
            {
                filename: 'ADV8.csv',
                id: 'adv8',
                uId: 'Kode'
            },
            {
                filename: 'ADV9.csv',
                id: 'adv9',
                uId: 'Kode'
            },
            {
                filename: 'ADV12.csv',
                id: 'adv12',
                uId: 'Kode'
            },
            {
                filename: 'ADV16.csv',
                id: 'adv16',
                uId: 'Kode',
                filterFunction: (entry: { Kode: string }) => {
                    const code = parseInt(entry.Kode, 10);
                    return (
                        (code >= 302000 && code < 306000) ||
                        (code >= 500000 && code < 1700000) ||
                        (code >= 3402000 && code < 3402080) ||
                        (code >= 5500000 && code < 6000000)
                    );
                }
            },
            {
                filename: 'BW_Grund_Codes.csv',
                id: 'bw_grund',
                uId: 'Kode'
            },
            {
                filename: 'BW_Matrix_Codes.csv',
                id: 'bw_matrix',
                uId: 'Kode'
            },
            {
                filename: 'BW_MatrixOberbegriff_Codes.csv',
                id: 'bw_ober',
                uId: 'Kode'
            },
            {
                filename: 'NRLs_u_Erreger.csv',
                id: 'erreger'
            },
            {
                filename: 'PLZ.csv',
                id: 'plz',
                uId: 'plz'
            }
        ];

        this.addZoMoDates(catalogsConfig);

        const promiseArray = catalogsConfig.map(catalogConfig => {
            return loadCSVFile<CatalogData>(
                catalogConfig.filename,
                this.dataDir,
                catalogConfig.filterFunction
            ).then(
                (data: CatalogData[]) =>
                    (this.catalogs[catalogConfig.id] = createCatalog<
                        CatalogData
                    >(data, catalogConfig.uId)),
                (error: Error) => {
                    return new Promise((resolve, reject) => {
                        logger.warn(
                            `${this.constructor.name}.${this.initialise.name}, Catalog missing on Filesystem. catalog=${catalogConfig.filename}; error=${error}`
                        );
                        this.catalogs[catalogConfig.id] = createCatalog<
                            CatalogData
                        >([], catalogConfig.uId);
                        resolve();
                    });
                }
            );
        });

        return Promise.all(promiseArray).then(() =>
            logger.info(
                `${this.constructor.name}.${this.initialise.name}, finished initialising Catalog Repository from Filesystem.`
            )
        );
    }

    getCatalog(catalogName: string): Catalog<CatalogData> {
        return this.catalogs[catalogName];
    }

    private addZoMoDates(catalogsConfig: CatalogConfig[]): CatalogConfig[] {
        const currentYear = new Date().getFullYear();

        const currentName: string = 'zsp' + currentYear;
        const lastName: string = 'zsp' + (currentYear - 1);
        const futureName: string = 'zsp' + (currentYear + 1);

        catalogsConfig.push({
            filename: currentName.toUpperCase() + '.csv',
            id: currentName
        });

        catalogsConfig.push({
            filename: lastName.toUpperCase() + '.csv',
            id: lastName
        });

        catalogsConfig.push({
            filename: futureName.toUpperCase() + '.csv',
            id: futureName
        });

        return catalogsConfig;
    }
}

let repo: FileCatalogRepository;

export async function initialiseRepository(
    dataDir: string
): Promise<CatalogRepository> {
    const repository = repo ? repo : new FileCatalogRepository(dataDir);
    repo = repository;
    return repository.initialise().then(() => repository);
}
