import { createController, ILoginController } from './../login.controller';
import * as mockReq from 'mock-express-request';
import * as mockRes from 'mock-express-response';
import { LoginResult, ILoginPort } from '../../../../app/ports';

jest.genMockFromModule('./../../../../aspects');
jest.mock('./../../../../aspects');
jest.mock('./../../../../app/ports', () => ({
    loginUser: jest.fn(),
    LoginResult: {
        SUCCESS: 2,
        FAIL: 0
    }
}));

describe('Login controller', () => {

    let controller: ILoginController;
    let mockLoginService: ILoginPort = {
        loginUser: jest.fn()
    };
    beforeEach(() => {
        controller = createController(mockLoginService);
    });
    // it('should be return a promise', () => {
    //     // tslint:disable-next-line
    //     (mockLoginService.loginUser as any).mockReturnValueOnce({
    //         result: LoginResult.SUCCESS
    //     });
    //     const req = new mockReq({
    //         body: {
    //             email: 'test'
    //         }
    //     });
    //     const res = new mockRes();
    //     const result = controller.login(req, res);
    //     expect(result).toBeInstanceOf(Promise);
    // });
    it('should be return a 401 response', () => {
        // tslint:disable-next-line
        (mockLoginService.loginUser as any).mockReturnValueOnce({
            result: LoginResult.FAIL
        });
        const req = new mockReq({
            body: {
                email: 'test'
            }
        });
        const res = new mockRes();
        const result = controller.login(req, res);
        expect.assertions(1);
        return result.then(data => {
            return expect(res.statusCode).toBe(401);
        });
    });
    it('should be return a 200 response', () => {
        // tslint:disable-next-line
        (mockLoginService.loginUser as any).mockReturnValueOnce({
            user: {}
        });
        const req = new mockReq({
            body: {
                email: 'test'
            }
        });
        const res = new mockRes();
        const result = controller.login(req, res);
        expect.assertions(1);
        return result.then(data => {
            return expect(res.statusCode).toBe(200);
        });
    });
});
