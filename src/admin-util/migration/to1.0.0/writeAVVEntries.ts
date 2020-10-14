import * as path from 'path';
import * as fs from 'fs';
import * as config from 'config';
import { logger } from '../../../aspects';
import {
    createDataStore,
    mapCollectionToRepository
} from '../../../infrastructure/ports';

/**
 * Script used to insert AVV entries into existing DB: For Ticket mps#49
 * Run: >NODE_CONFIG_DIR=../../../config node writeAVVEntries.js ../../../data/states.json
 */
start().catch(err => {
    throw err;
});

async function start() {
    let filename = parseCommandLine();
    parseJSONFile(filename);
}

function connectToDB() {
    let connectionString: string;
    try {
        connectionString = config.get('dataStore.connectionString');
    } catch (e) {
        logger.error(`Error during state insert. err= ${e}`);
        return process.exit(1);
    }
    return createDataStore(connectionString);
}

function parseCommandLine(): string {
    const argv = process.argv;

    if (argv.length < 3) {
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

// tslint:disable-next-line:no-any
function writeToDB(collection: string, entries: any[]) {
    const db = connectToDB();
    // tslint:disable-next-line:no-any
    const promises: Promise<any>[] = [];
    // tslint:disable-next-line:no-any
    const repo: any = mapCollectionToRepository(collection);
    entries.forEach(e => {
        logger.info(
            `Adding entry to collection. collection=${collection} entry=${e.short}`
        );
        promises.push(
            repo
                .findOne({ short: e['short'] })
                .then(
                    // tslint:disable-next-line:no-any
                    (d: any) => {
                        return repo
                            .update(d._id.toString(), { AVV: e['AVV'] })
                            .catch((e: Error) => {
                                throw e;
                            });
                    }
                )
                .catch((e: Error) => {
                    throw e;
                })
        );
    });
    Promise.all(promises)
        .then(() => db.close())
        .catch((err: Error) => {
            logger.error(`Error during state insert. err= ${err}`);
            return process.exit(1);
        });
    return db;
}
