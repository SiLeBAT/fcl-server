import { createUser } from './../user.entity';

describe('User class', () => {
    it('should be created', () => {
        const user = createUser(
			'test',
			'test',
			'test',
			'test',
			'test',
			true,
			true,
			0,
			0
		);
        expect(user).toBeTruthy();
    });
});
