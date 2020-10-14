export function getMockValidationService() {
    return {
        validateSamples: jest.fn(samples => samples)
    };
}
