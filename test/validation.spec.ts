import * as fs from 'fs';
import * as path from 'path';
import * as _ from 'lodash';
import * as config from 'config';
import * as moment from 'moment';
import axios from 'axios';
import { logger } from '../src/aspects';
import { SampleSet } from '../src/app/ports';
import { SampleSetMetaData, Sample } from '../src/app/sampleManagement/model/sample.model';
import { SampleDataContainerDTO } from '../src/ui/server/model/shared-dto.model';
import { DefaultExcelUnmarshalService } from '../src/app/sampleManagement/application/excel-unmarshal.service';
moment.locale('de');

const ENDPOINT = '/v1/samples/validated';
const API_URL = config.get('application.apiUrl');
const DATA_DIR: string = 'testData';

// tslint:disable-next-line
type TestData = any;
// tslint:disable-next-line
type ServerResponse = any;

const testUrl = API_URL + ENDPOINT;

const parser = new DefaultExcelUnmarshalService();

describe('Test verification endpoint: ' + ENDPOINT, () => {
    let queryArray: TestData[];
    beforeAll(async () => {
        queryArray = await getDataFromFiles();
    });

    it('should give response', async () => {
        expect.assertions(queryArray.reduce((acc, current) => {
            return acc + current.order.samples.length * 2;
        }, 0));

        const responseArray: ServerResponse[] = [];
        queryArray.forEach(
            q => {
                responseArray.push(axios.put(testUrl, q)
                    .then(function (response) {
                        return response.data;
                    })
                    .catch(function (error) {
                        throw error;
                    }));
            }
        );

        await Promise.all(responseArray).then(
            dataArray => {
                dataArray.forEach(
                    d => {

                        d.order.samples.forEach((element: SampleDataContainerDTO) => {
                            const receivedCodes: number[] = [];
                            for (let key of Object.keys(element.sample)) {
                                const ary = element.sample[key].errors || [];
                                receivedCodes.push(...ary.map(e => e.code));

                            }
                            let expectedCodes: number[] = [];

                            if (element.sample.comment.value) {
                                expectedCodes = element.sample.comment.value.split(',').map((str: string) => parseInt(str.trim(), 10));
                            }

                            logger.info('Expected Codes: ' + expectedCodes);
                            logger.info('Received Codes: ' + receivedCodes);
                            console.log('Expected Codes: ' + expectedCodes);
                            console.log('Received Codes: ' + receivedCodes);
                            expect(receivedCodes.length).toBe(expectedCodes.length);
                            expect(receivedCodes).toEqual(expect.arrayContaining(expectedCodes));
                        });
                    }
                );
            }
        );
    });
});


async function getDataFromFiles(): Promise<TestData[]> {
    const filenames: string[] = [];
    fs.readdirSync(path.join('.', DATA_DIR)).forEach(function (file) {

        file = path.join('.', DATA_DIR, file);

        if (path.extname(file) === '.xlsx') {
            filenames.push(file);
        }

    });
    logger.info(`Found ${filenames.length} datafiles in directory ${DATA_DIR}`);
    const result: SampleSet[] = await Promise.all(filenames.map(file => {
        const buffer = fs.readFileSync(file);
        return parser.convertExcelToJSJson(buffer, file);
    }));
    return result.map(r => ({
        order: {
            samples: fromSampleCollectionToDTO(r.samples).map(
                dto => ({ sample: dto })
            ),
            meta: fromSampleSetMetaDataToDTO(r.meta)
        }
    }));
}

function fromSampleCollectionToDTO(
    sampleCollection: Sample[]
) {
    return sampleCollection.map((sample: Sample) =>
        sample.getAnnotatedData()
    );
}

function fromSampleSetMetaDataToDTO(
    data: SampleSetMetaData
) {
    return {
        nrl: data.nrl,
        analysis: data.analysis,
        sender: data.sender,
        urgency: data.urgency.toString()
    };
}
