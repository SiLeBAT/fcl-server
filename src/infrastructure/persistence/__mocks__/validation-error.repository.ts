import { ValidationErrorRepository } from '../../../app/ports';

export const genericValidationErrors = [
    {
        code: 3,
        level: 2,
        message: 'Probenummer kommt mehrfach vor (bei identischem Erreger).'
    },
    {
        code: 5,
        level: 2,
        message: 'Probenummer nach AVVData fehlt (Pflicht bei ZoMo).'
    },
    {
        code: 6,
        level: 2,
        message:
            'Probenummer nach AVVData kommt mehrfach vor (bei identischem Erreger).'
    },
    {
        code: 8,
        level: 2,
        message:
            'Erreger nicht erkannt. Der verwendete Text/Code kodiert keinen Erreger, der am BfR untersucht wird.'
    },
    {
        code: 10,
        level: 2,
        message: 'Kein Erreger eingetragen.'
    },
    {
        code: 11,
        level: 1,
        message: 'Datum fehlt.'
    },
    {
        code: 12,
        level: 2,
        message: 'Dieses Datum gibt es nicht.'
    },
    {
        code: 13,
        level: 2,
        message: 'Datum liegt in der Zukunft.'
    },
    {
        code: 14,
        level: 2,
        message: 'Datum fehlt (Pflicht bei ZoMo).'
    },
    {
        code: 15,
        level: 1,
        message: 'Datum fehlt.'
    },
    {
        code: 16,
        level: 2,
        message: 'Dieses Datum gibt es nicht.'
    },
    {
        code: 17,
        level: 2,
        message: 'Datum liegt in der Zukunft.'
    },
    {
        code: 18,
        level: 2,
        message: 'Datum fehlt (Pflicht bei ZoMo).'
    },
    {
        code: 19,
        level: 2,
        message:
            'Entweder das Probenahme- oder das Isolationsdatum muss angegeben sein.'
    },
    {
        code: 20,
        level: 2,
        message: 'Probenahme erfolgte nach der Isolierung?'
    },
    {
        code: 24,
        level: 2,
        message:
            'Code ist nicht im ADV - Katalog Nr. 9 enthalten oder es ist kein Code.'
    },
    {
        code: 25,
        level: 1,
        message: 'Ortsname ohne PLZ angegeben.'
    },
    {
        code: 27,
        level: 2,
        message: 'Keine Postleitzahl. Postleitzahlen bestehen aus 5 Ziffern.'
    },
    {
        code: 28,
        level: 1,
        message: 'PLZ ohne Ortsname angegeben.'
    },
    {
        code: 30,
        level: 2,
        message: 'Code ist nicht im ADV - Katalog Nr. 2 enthalten.'
    },
    {
        code: 32,
        level: 1,
        message: 'Bitte geben Sie einen ADV - Code für die Matrix an!'
    },
    {
        code: 33,
        level: 2,
        message: 'Code ist nicht im ADV - Katalog Nr. 3 enthalten.'
    },
    {
        code: 34,
        level: 2,
        message:
            'Bitte geben Sie den ADV-Code für die Matrix an! (Pflicht bei ZoMo).'
    },
    {
        code: 37,
        level: 2,
        message: 'Bitte geben Sie eine Matrix an!'
    },
    {
        code: 39,
        level: 2,
        message:
            'Bitte geben Sie einen ADV - Code für den Verarbeitungszustand an! (Pflicht bei Betriebsart = Einzelhandel).'
    },
    {
        code: 40,
        level: 2,
        message: 'Code ist nicht im ADV - Katalog Nr. 12 enthalten.'
    },
    {
        code: 42,
        level: 2,
        message: 'Code ist nicht im ADV - Katalog Nr. 4 enthalten.'
    },
    {
        code: 44,
        level: 1,
        message: 'Bitte geben Sie einen Probenahmegrund an!'
    },
    {
        code: 46,
        level: 2,
        message: 'Code ist nicht im ADV - Katalog Nr. 8 enthalten.'
    },
    {
        code: 48,
        level: 2,
        message: 'Keine Betriebsart angegeben (Pflicht bei ZoMo).'
    },
    {
        code: 49,
        level: 1,
        message:
            'Kombination aus ADV2-Code, ADV3-Code, ADV8-Code und Jahr passt zu keinem Zoonosen-Monitoring-Programm.'
    },
    {
        code: 61,
        level: 1,
        message: 'War die Isolierung wirklich über 1 Jahr nach der Probennahme?'
    },
    {
        code: 62,
        level: 1,
        message: 'Datum liegt über 10 Jahre zurück.'
    },
    {
        code: 63,
        level: 1,
        message: 'Datum liegt über 10 Jahre zurück.'
    },
    {
        code: 64,
        level: 1,
        message: 'Ortsangabe fehlt.'
    },
    {
        code: 68,
        level: 1,
        message: 'Wenn vorhanden, geben Sie bitte auch ihre Probenummer ein.'
    },
    {
        code: 69,
        level: 2,
        message: 'Keine Probenummer angegeben.'
    },
    {
        code: 70,
        level: 2,
        message:
            "Matrix - Code ist nicht eindeutig.Bitte Spalte 'Oberbegriff (Kodiersystem) der Matrizes' ausfüllen!"
    },
    {
        code: 71,
        level: 1,
        message: 'Bitte tragen Sie eine Betriebsart ein!'
    },
    {
        code: 72,
        level: 1,
        message: 'Das Format der AVV Nummer scheint nicht korrekt zu sein.'
    },
    {
        code: 73,
        level: 1,
        message: 'Ausgewähltes NRL passt nicht zu dem gewählten Erreger.'
    },
    {
        code: 74,
        level: 2,
        message: 'Falscher Code. ADV9 - Codes sind maximal 8 Ziffern lang.'
    },
    {
        code: 75,
        level: 2,
        message: 'Keine gültige Postleitzahl.'
    },
    {
        code: 76,
        level: 2,
        message: 'Falscher Code. ADV2 - Codes bestehen aus 2 Ziffern.'
    },
    {
        code: 77,
        level: 2,
        message:
            'Falscher Code. ADV2 - Codes bestehen ausschliesslich aus Ziffern.'
    },
    {
        code: 78,
        level: 2,
        message: 'Falscher Code. ADV3 - Codes bestehen aus 6 Ziffern.'
    },
    {
        code: 79,
        level: 2,
        message:
            'Falscher Code. ADV3 - Codes bestehen ausschliesslich aus Ziffern.'
    },
    {
        code: 80,
        level: 2,
        message: 'Falscher Code. ADV12 - Codes bestehen aus 3 Ziffern.'
    },
    {
        code: 81,
        level: 2,
        message:
            'Falscher Code. ADV12 - Codes bestehen ausschliesslich aus Ziffern.'
    },
    {
        code: 82,
        level: 2,
        message: 'Falscher Code. ADV4 - Codes bestehen aus 2 Ziffern.'
    },
    {
        code: 83,
        level: 2,
        message:
            'Falscher Code. ADV4 - Codes bestehen ausschliesslich aus Ziffern.'
    },
    {
        code: 84,
        level: 2,
        message: 'Falscher Code. ADV8 - Codes bestehen aus 7 Ziffern.'
    },
    {
        code: 85,
        level: 2,
        message:
            'Falscher Code. ADV8 - Codes bestehen ausschliesslich aus Ziffern.'
    },
    {
        code: 86,
        level: 2,
        message: 'Ortsangabe fehlt (Pflicht bei ZoMo).'
    },
    {
        code: 87,
        level: 4,
        message:
            'ADV16-Code wurde erkannt und durch den entsprechenden ADV-Text ersetzt.'
    },
    {
        code: 88,
        level: 4,
        message:
            'Erreger erkannt. Ursprünglicher Text wurde durch Text aus ADV-Katalog Nr. 16 ersetzt.'
    },
    {
        code: 89,
        level: 4,
        message:
            'Code erkannt. Ursprünglicher Code wurde durch Code aus ADV-Katalog Nr. 9 ersetzt.'
    },
    {
        code: 90,
        level: 4,
        message:
            'Code erkannt. Ursprünglicher Code wurde durch Code aus ADV-Katalog Nr. 8 ersetzt.'
    },
    {
        code: 91,
        level: 4,
        message:
            'Code erkannt. Ursprünglicher Code wurde durch Code aus ADV-Katalog Nr. 3 ersetzt.'
    },
    {
        code: 92,
        level: 4,
        message:
            'Eintrag erkannt. Ursprünglicher Eintrag wurde durch Code aus ADV-Katalog Nr. 12 ersetzt.'
    },
    {
        code: 93,
        level: 4,
        message:
            'Falscher ADV2-Code. Ursprünglicher Code wurde durch den zum ADV3-Code passenden Code ersetzt.'
    },
    {
        code: 94,
        level: 4,
        message:
            'Code erkannt. Ursprünglicher Code wurde durch Code aus ADV-Katalog Nr. 2 ersetzt.'
    },
    {
        code: 95,
        level: 1,
        message:
            'Planproben sind normalerweise nicht für das NRL Antibiotikaresistenz bestimmt.'
    }
];
export function getMockValidationErrorRepository(): ValidationErrorRepository {
    return {
        getAllErrors: jest.fn(() => Promise.resolve(genericValidationErrors))
    };
}
