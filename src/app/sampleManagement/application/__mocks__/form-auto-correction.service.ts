export function getMockAutoCorrectionService() {
    return {
        applyAutoCorrection: jest.fn(samples => samples)
    };
}
