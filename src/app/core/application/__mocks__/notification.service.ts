export function getMockNotificationService() {
    return {
        addHandler: jest.fn(),
        sendNotification: jest.fn(() => true),
        createEmailNotificationMetaData: jest.fn(() => ({
            to: '',
            cc: [],
            subject: '',
            attachments: []
        }))
    };
}
