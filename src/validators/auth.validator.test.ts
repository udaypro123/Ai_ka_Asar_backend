import { googleAuthSchema, registerSchema, resetPasswordSchema } from './auth.validator';

describe('authentication request validation', () => {
  it('does not accept a client-supplied account role', () => {
    const result = registerSchema.safeParse({
      name: 'Test User',
      email: 'test@example.com',
      password: 'correct-horse-battery',
      role: 'ADMIN',
    });

    expect(result.success).toBe(true);
    if (result.success) expect(result.data).not.toHaveProperty('role');
  });

  it('requires passwords to be at least eight characters', () => {
    expect(resetPasswordSchema.safeParse({ token: 'valid-token', password: 'short7' }).success).toBe(false);
    expect(resetPasswordSchema.safeParse({ token: 'valid-token', password: 'long-enough' }).success).toBe(true);
  });

  it('requires exactly one Google ID or access token', () => {
    expect(googleAuthSchema.safeParse({ idToken: '' }).success).toBe(false);
    expect(googleAuthSchema.safeParse({ idToken: 'signed-id-token' }).success).toBe(true);
    expect(googleAuthSchema.safeParse({ accessToken: 'google-access-token' }).success).toBe(true);
    expect(googleAuthSchema.safeParse({ idToken: 'signed-id-token', accessToken: 'google-access-token' }).success).toBe(false);
    expect(googleAuthSchema.safeParse({}).success).toBe(false);
  });
});
