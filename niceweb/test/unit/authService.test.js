// @jest-environment node

const authService = require('../../auth/authService');

describe('authService', () => {
  const password = 'TestPassword123!';
  let hash, token;

  it('should hash and compare passwords correctly', async () => {
    hash = await authService.hashPassword(password);
    expect(typeof hash).toBe('string');
    const match = await authService.comparePassword(password, hash);
    expect(match).toBe(true);
    const fail = await authService.comparePassword('wrong', hash);
    expect(fail).toBe(false);
  });

  it('should sign and verify JWT tokens', () => {
    const payload = { id: 1, username: 'test' };
    token = authService.signToken(payload);
    expect(typeof token).toBe('string');
    const decoded = authService.verifyToken(token);
    expect(decoded.id).toBe(1);
    expect(decoded.username).toBe('test');
  });
});