import { genericUser } from './user.service';

export function getMockLoginService() {
    return {
        loginUser: jest.fn(() =>
            Promise.resolve({
                user: genericUser,
                token: 'token',
            })
        ),
    };
}
