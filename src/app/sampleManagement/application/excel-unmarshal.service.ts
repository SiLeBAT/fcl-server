import { WorkBook, WorkSheet, read, utils, CellObject } from 'xlsx';
import * as _ from 'lodash';
import * as moment from 'moment';
import 'moment/locale/de';
import {
    SampleSet,
    AnnotatedSampleDataEntry,
    Sample,
    SampleData,
    SampleSetMetaData,
    Address,
    Analysis
} from '../model/sample.model';

import { ExcelUnmarshalService } from '../model/excel.model';
import { createSample } from '../domain/sample.entity';
import { Urgency } from '../domain/enums';
import { injectable } from 'inversify';
import {
    VALID_SHEET_NAME,
    META_ANALYSIS_SPECIES_CELL,
    META_ANALYSIS_TOXIN_CELL,
    META_ANALYSIS_OTHER_CELL,
    META_SENDER_DEPARTMENT_CELL,
    META_SENDER_STREET_CELL,
    META_SENDER_ZIP_CITY_CELL,
    META_SENDER_TELEPHONE_CELL,
    META_SENDER_EMAIL_CELL,
    META_UREGENCY_CELL,
    META_NRL_CELL,
    FORM_PROPERTIES,
    META_ANALYSIS_PHAGETYPING_CELL,
    META_ANALYSIS_RESISTANCE_CELL,
    META_ANALYSIS_VACCINATION_CELL,
    META_ANALYSIS_MOLECULARTYPING_CELL,
    META_ANALYSIS_ZOONOSENISOLATE_CELL,
    META_ANALYSIS_ESBLAMPCCARBAPENEMASEN_CELL,
    META_ANALYSIS_COMPAREHUMAN_CELL,
    META_SENDER_INSTITUTENAME_CELL,
    META_ANALYSIS_SEROLOGICAL_CELL,
    META_SENDER_CONTACTPERSON_CELL
} from '../domain/constants';

@injectable()
export class DefaultExcelUnmarshalService implements ExcelUnmarshalService {
    async convertExcelToJSJson(
        buffer: Buffer,
        fileName: string
    ): Promise<SampleSet> {
        try {
            const sampleSheet: WorkSheet = await this.fromFileToWorkSheet(
                buffer
            );
            const data: Sample[] = this.fromWorksheetToData(sampleSheet);
            const meta: SampleSetMetaData = this.getMetaDataFromFileData(
                sampleSheet,
                fileName
            );

            return {
                samples: data,
                meta
            };
        } catch (error) {
            throw error;
        }
    }

    private async fromFileToWorkSheet(buffer: Buffer): Promise<WorkSheet> {
        return new Promise<WorkSheet>((resolve, reject) => {
            const workbook: WorkBook = read(buffer, {
                type: 'buffer',
                cellDates: true,
                cellText: false,
                cellStyles: true,
                cellNF: true
            });
            const worksheetName: string = workbook.SheetNames[0];
            const sampleSheet: WorkSheet = workbook.Sheets[worksheetName];
            if (worksheetName === VALID_SHEET_NAME) {
                resolve(sampleSheet);
            } else {
                reject(
                    `Not a valid excel sheet, name of first sheet must be ${VALID_SHEET_NAME}`
                );
            }
        });
    }

    private getMetaDataFromFileData(
        workSheet: WorkSheet,
        fileName: string
    ): SampleSetMetaData {
        const meta: SampleSetMetaData = {
            nrl: this.getNRLFromWorkSheet(workSheet),
            urgency: this.getUrgencyFromWorkSheet(workSheet),
            sender: this.getSenderFromWorkSheet(workSheet),
            analysis: this.getAnalysisFromWorkSheet(workSheet),
            fileName
        };

        return meta;
    }

    private getAnalysisFromWorkSheet(workSheet: WorkSheet): Analysis {
        return {
            species:
                !!this.getDataFromCell(workSheet[META_ANALYSIS_SPECIES_CELL]) ||
                false,
            serological:
                !!this.getDataFromCell(
                    workSheet[META_ANALYSIS_SEROLOGICAL_CELL]
                ) || false,
            phageTyping:
                !!this.getDataFromCell(
                    workSheet[META_ANALYSIS_PHAGETYPING_CELL]
                ) || false,
            resistance:
                !!this.getDataFromCell(
                    workSheet[META_ANALYSIS_RESISTANCE_CELL]
                ) || false,
            vaccination:
                !!this.getDataFromCell(
                    workSheet[META_ANALYSIS_VACCINATION_CELL]
                ) || false,
            molecularTyping:
                !!this.getDataFromCell(
                    workSheet[META_ANALYSIS_MOLECULARTYPING_CELL]
                ) || false,
            toxin:
                !!this.getDataFromCell(workSheet[META_ANALYSIS_TOXIN_CELL]) ||
                false,
            zoonosenIsolate:
                !!this.getDataFromCell(
                    workSheet[META_ANALYSIS_ZOONOSENISOLATE_CELL]
                ) || false,
            esblAmpCCarbapenemasen:
                !!this.getDataFromCell(
                    workSheet[META_ANALYSIS_ESBLAMPCCARBAPENEMASEN_CELL]
                ) || false,
            other: (
                '' + this.getDataFromCell(workSheet[META_ANALYSIS_OTHER_CELL])
            ).trim(),
            compareHuman:
                !!this.getDataFromCell(
                    workSheet[META_ANALYSIS_COMPAREHUMAN_CELL]
                ) || false
        };
    }

    private getSenderFromWorkSheet(workSheet: WorkSheet): Address {
        return {
            instituteName: (
                '' +
                this.getDataFromCell(workSheet[META_SENDER_INSTITUTENAME_CELL])
            ).trim(),
            department: (
                '' +
                this.getDataFromCell(workSheet[META_SENDER_DEPARTMENT_CELL])
            ).trim(),
            street: (
                '' + this.getDataFromCell(workSheet[META_SENDER_STREET_CELL])
            ).trim(),
            zip: (
                '' + this.getDataFromCell(workSheet[META_SENDER_ZIP_CITY_CELL])
            )
                .split(',')[0]
                .trim(),
            city: (
                this.getDataFromCell(workSheet[META_SENDER_ZIP_CITY_CELL]) + ','
            )
                .split(',')[1]
                .trim(),
            contactPerson: (
                '' +
                this.getDataFromCell(workSheet[META_SENDER_CONTACTPERSON_CELL])
            ).trim(),
            telephone: (
                '' + this.getDataFromCell(workSheet[META_SENDER_TELEPHONE_CELL])
            ).trim(),
            email: (
                '' + this.getDataFromCell(workSheet[META_SENDER_EMAIL_CELL])
            ).trim()
        };
    }

    private getUrgencyFromWorkSheet(workSheet: WorkSheet): Urgency {
        const urgency: string =
            '' + this.getDataFromCell(workSheet[META_UREGENCY_CELL]);

        switch (urgency.trim().toLowerCase()) {
            case 'eilt':
                return Urgency.URGENT;
            case 'normal':
            default:
                return Urgency.NORMAL;
        }
    }
    private getNRLFromWorkSheet(workSheet: WorkSheet): string {
        const workSheetNRL: string = workSheet[META_NRL_CELL].v || '';
        let nrl = '';

        switch (workSheetNRL.trim()) {
            case 'NRL Überwachung von Bakterien in zweischaligen Weichtieren':
                nrl = 'NRL-Vibrio';
                break;

            case 'NRL Escherichia coli einschließlich verotoxinbildende E. coli':
            case 'NRL Verotoxinbildende Escherichia coli':
                nrl = 'NRL-VTEC';
                break;
            case 'Sporenbildner':
            case 'Bacillus spp.':
            case 'Clostridium spp. (C. difficile)':
                nrl = 'Sporenbildner';
                break;
            case 'NRL koagulasepositive Staphylokokken einschließlich Staphylococcus aureus':
                nrl = 'NRL-Staph';
                break;

            case 'NRL Salmonellen (Durchführung von Analysen und Tests auf Zoonosen)':
                nrl = 'NRL-Salm';
                break;
            case 'NRL Listeria monocytogenes':
                nrl = 'NRL-Listeria';
                break;
            case 'NRL Campylobacter':
                nrl = 'NRL-Campy';
                break;
            case 'NRL Antibiotikaresistenz':
                nrl = 'NRL-AR';
                break;
            case 'Yersinia':
                nrl = 'KL-Yersinia';
                break;
            case 'NRL Trichinella':
                nrl = 'NRL-Trichinella';
                break;
            case 'NRL Überwachung von Viren in zweischaligen Weichtieren':
                nrl = 'NRL-Virus';
                break;
            case 'Leptospira':
                nrl = 'KL-Leptospira';
                break;
            default:
        }

        return nrl;
    }

    private getDataFromCell(
        cell: CellObject
    ): string | number | boolean | Date | undefined {
        if (!cell) {
            return '';
        }
        return cell.v;
    }
    private fromWorksheetToData(workSheet: WorkSheet): Sample[] {
        const lineNumber: number = this.getVersionDependentLine(workSheet);
        const data = utils.sheet_to_json<Record<string, string>>(workSheet, {
            header: FORM_PROPERTIES,
            range: lineNumber,
            defval: ''
        });
        const cleanedData = this.fromDataToCleanedSamples(data);
        const formattedData: Sample[] = this.formatData(cleanedData);
        return formattedData;
    }

    private formatData(data: Record<string, string>[]): Sample[] {
        const formattedData = data.map((sample: Record<string, string>) => {
            const annotatedSampleData: Record<
                string,
                AnnotatedSampleDataEntry
            > = {};
            for (const props in sample) {
                if (this.isDateField(props)) {
                    sample[props] = this.parseDate(sample[props]);
                }
                annotatedSampleData[props] = this.createAnnotatedSampleEntry(
                    sample[props]
                );
            }
            return createSample(annotatedSampleData as SampleData);
        });
        return formattedData;
    }

    private createAnnotatedSampleEntry(
        value: string
    ): AnnotatedSampleDataEntry {
        return {
            value,
            errors: [],
            correctionOffer: []
        };
    }

    private parseDate(date: string) {
        let parseOptions = {
            dateFormat: 'DD.MM.YYYY'
        };
        const americanDF = /\d\d?\/\d\d?\/\d\d\d?\d?/;
        if (americanDF.test(date)) {
            parseOptions = {
                dateFormat: 'MM/DD/YYYY'
            };
        }
        try {
            const parsedDate = moment(date, parseOptions.dateFormat)
                .locale('de')
                .format('DD.MM.YYYY');
            if (parsedDate === 'Invalid date') {
                return date;
            }
            return parsedDate;
        } catch (e) {
            return date;
        }
    }

    private isDateField(field: string) {
        switch (field) {
            case 'sampling_date':
            case 'isolation_date':
                return true;
            default:
                return false;
        }
    }

    private getVersionDependentLine(workSheet: WorkSheet): number {
        let num = 41;
        _.find(workSheet, (o, i) => {
            if (o.v === 'Ihre Probe-nummer') {
                const h = i.replace(/\D/, '');
                num = parseInt(h, 10);
                return true;
            }
            return false;
        });
        return num;
    }

    private fromDataToCleanedSamples(
        data: Record<string, string>[]
    ): Record<string, string>[] {
        const cleanedData: Record<string, string>[] = data.filter(
            sampleObj =>
                Object.keys(sampleObj)
                    .map(key => sampleObj[key])
                    .filter(item => item !== '').length > 0
        );

        return cleanedData;
    }
}
