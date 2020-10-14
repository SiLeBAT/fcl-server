export function getMockSampleService() {
    return {
        sendSampleFile: jest.fn(),
        convertToExcel: jest.fn(),
        convertToJson: jest.fn()
    };
}
