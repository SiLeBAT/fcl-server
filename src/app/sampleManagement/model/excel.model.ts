import { WorkSheet } from 'xlsx';
import { SampleSet } from './sample.model';

export interface ExcelUnmarshalService {
    convertExcelToJSJson(buffer: Buffer, fileName: string): Promise<SampleSet>;
}

export interface SampleMetaDataService {}

export interface ExcelUnmarshalPort extends ExcelUnmarshalService {}

export interface ImportedExcelFileDetails {
    workSheet: WorkSheet;
    file: File;
    oriDataLength: number;
}

export interface ExcelFileInfo {
    data: string;
    fileName: string;
    type: string;
}

export interface JSONMarshalService {
    convertJSONToExcel(data: SampleSet): Promise<ExcelFileInfo>;
}

export interface JSONMarshalPort extends JSONMarshalService {}
