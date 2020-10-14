import * as path from 'path';
import * as fs from 'fs';
import * as readline from 'linebyline';
import * as config from 'config';
import { Document } from 'mongoose';
import { logger } from '../../../aspects';
import {
    createDataStore,
    mapCollectionToRepository,
    DataStore
} from '../../../infrastructure/ports';

start().catch(err => {
    throw err;
});

async function start() {
    let filename = parseCommandLine();
    const ext = path.extname(filename);

    switch (ext) {
        case '.txt':
            parseTabDelimitedFile(filename);
            break;
        case '.json':
            parseJSONFile(filename);
            break;
        default:
            throw new Error('File extension not recognized: ' + ext);
    }
}

function connectToDB() {
    return createDataStore(config.get('dataStore.connectionString'));
}

function insertNewEntry(fields: string[], values: string[]) {
    // tslint:disable-next-line:no-any
    const entry: any = {};
    for (let i = 0; i < fields.length; i++) {
        entry[fields[i]] = values[i];
    }
    return entry;
}

function parseCommandLine(): string {
    const argv = process.argv;
    const scriptName = path.posix.basename(argv[1]);

    if (argv.length < 3) {
        printUsage(scriptName);
        process.exit(1);
    }

    return argv[2];
}

function parseJSONFile(filename: string) {
    const rawData = fs.readFileSync(filename, { encoding: 'UTF-8' });
    const data = JSON.parse(rawData);
    const collection = path.basename(filename, '.json');
    // tslint:disable-next-line:no-any
    let entries: any[] = [];
    if (Array.isArray(data)) {
        entries = data;
    } else {
        entries = [data];
    }
    writeToDB(collection, entries);
}

function parseTabDelimitedFile(filename: string) {
    let lineReader = readline(filename);
    let collection: string;
    let fields: string[] = [];
    // tslint:disable-next-line:no-any
    let entries: any[] = [];
    let db: DataStore;
    lineReader
        .on('line', (line: string, lineCount: number) => {
            switch (lineCount) {
                case 1:
                    collection = line.substring(2);
                    if (!collection) {
                        throw new Error('Collection not defined.');
                    }

                    break;
                case 2:
                    fields = line.substring(2).split('\t');
                    break;
                default:
                    entries.push(insertNewEntry(fields, line.split('\t')));
            }
        })
        .on('close', () => {
            db = writeToDB(collection, entries);
        })
        .on('error', (error: Error) => {
            logger.error(`Error during readline. error=${error}`);
            if (db) {
                db.close();
            }
        });
}

// tslint:disable-next-line:no-any
function writeToDB(collection: string, entries: any[]) {
    const db = connectToDB();

    db.drop(collection);
    // tslint:disable-next-line: no-any
    const repo: any = mapCollectionToRepository(collection);
    const promises: Promise<Document>[] = [];
    entries.forEach(e => {
        logger.info(
            `Adding entry to collection. collection=${collection} entry=${e.toString()}`
        );
        promises.push(repo.create(e));
    });

    Promise.all(promises)
        .then(() => db.close())
        .catch((err: Error) => {
            logger.error(`Error during state insert. err= ${err}`);
            return process.exit(1);
        });
    return db;
}

function printUsage(scriptName: string) {
    logger.info('Usage:');
    logger.info('------');
    logger.info(`$ >node ${scriptName} <filename>.<txt|json>`);
    logger.info('');
    logger.info(
        '.txt files should be tab delimited with 2 header lines (indicated by //) referencing the collection name and listing the field names'
    );
    logger.info('e.g.');
    logger.info('//myCollection');
    logger.info('');
    logger.info(
        '.json files should have the basename of the file be the name of the collection'
    );
    logger.info('e.g.');
    logger.info('institutions.json');
}
