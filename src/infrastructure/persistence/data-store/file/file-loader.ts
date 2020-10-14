import * as path from 'path';
import * as fs from 'fs';
import * as csv from 'fast-csv';
import { logger } from '../../../../aspects';
import { FileNotFoundError } from '../../model/domain.error';

// TODO: Turn into class
async function loadBinaryFile(
    fileName: string,
    dataDir: string
): Promise<Buffer> {
    logger.verbose(
        `Loading data from Filesystem. fileName=${fileName} dataDir=${dataDir}`
    );
    const filePath = resolveFilePath(fileName, dataDir);
    return importBinaryFile(filePath);
}

async function loadCSVFile<T>(
    fileName: string,
    dataDir: string,
    filterFunction?: Function
): Promise<T[]> {
    logger.verbose(
        `Loading data from Filesystem. fileName=${fileName} dataDir=${dataDir}`
    );
    const filePath = resolveFilePath(fileName, dataDir);
    return importCSVFile<T>(filePath, filterFunction);
}

async function loadJSONFile(fileName: string, dataDir: string): Promise<{}> {
    logger.verbose(
        `Loading data from Filesystem. fileName=${fileName} dataDir=${dataDir}`
    );
    const filePath = resolveFilePath(fileName, dataDir);
    return importJSONFile(filePath);
}

async function importCSVFile<T>(
    filePath: string,
    entryFilter: Function = () => true
): Promise<T[]> {
    const data: T[] = [];

    return new Promise<T[]>(function(resolve, reject) {
        csv.fromPath(filePath, { headers: true })
            .on('data', function(entry) {
                if (entryFilter(entry)) {
                    data.push(entry);
                }
            })
            .on('end', function() {
                resolve(data);
            });
    });
}

async function importJSONFile(filePath: string): Promise<{}> {
    return new Promise(function(resolve, reject) {
        fs.readFile(filePath, 'utf8', function(err, data) {
            if (err) {
                reject(err);
            } else {
                const jsonContent = JSON.parse(data);
                resolve(jsonContent);
            }
        });
    });
}

// tslint:disable-next-line: no-any
async function importBinaryFile(filePath: string): Promise<any> {
    return new Promise(function(resolve, reject) {
        fs.readFile(filePath, function(err, data) {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
}

function resolveFilePath(fileName: string, dataDir: string) {
    const filePath = path.join(dataDir, fileName);
    if (fs.existsSync(filePath)) {
        return filePath;
    } else {
        throw new FileNotFoundError(`File not found. fileName=${fileName}`);
    }
}

export { loadCSVFile, loadJSONFile, loadBinaryFile };
