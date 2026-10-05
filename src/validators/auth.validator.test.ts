import { googleAuthSchema, registerSchema, resetPasswordSchema } from './auth.validator';

describe('authentication request validation', () => {
  it('allows only User and HR roles on manual signup', () => {
    const signup = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'correct-horse-battery',
    };

    expect(registerSchema.safeParse({ ...signup, role: 'HR' }).success).toBe(true);
    expect(registerSchema.safeParse({ ...signup, role: 'USER' }).success).toBe(true);
    expect(registerSchema.safeParse({ ...signup, role: 'ADMIN' }).success).toBe(false);
    expect(registerSchema.parse(signup).role).toBe('USER');
  });

  it('requires passwords to be at least eight characters', () => {
    expect(resetPasswordSchema.safeParse({ token: 'valid-token', password: 'short7' }).success).toBe(false);
    expect(resetPasswordSchema.safeParse({ token: 'valid-token', password: 'long-enough' }).success).toBe(true);
  });

  it('requires exactly one Google ID or access token', () => {
    expect(googleAuthSchema.safeParse({ idToken: '' }).success).toBe(false);
    expect(googleAuthSchema.safeParse({ idToken: 'signed-id-token' }).success).toBe(true);
    expect(googleAuthSchema.safeParse({ accessToken: 'google-access-token' }).success).toBe(true);
    expect(googleAuthSchema.safeParse({ accessToken: 'google-access-token', role: 'HR' }).success).toBe(true);
    expect(googleAuthSchema.safeParse({ accessToken: 'google-access-token', role: 'ADMIN' }).success).toBe(false);
    expect(googleAuthSchema.safeParse({ idToken: 'signed-id-token', accessToken: 'google-access-token' }).success).toBe(false);
    expect(googleAuthSchema.safeParse({}).success).toBe(false);
  });
});
