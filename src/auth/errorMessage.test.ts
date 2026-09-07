import { authErrorMessage } from './errorMessage';

describe('authErrorMessage', () => {
  it('returns a safe API message when present', () => {
    expect(authErrorMessage({ data: { error: { message: 'Invalid credentials.' } } })).toBe(
      'Invalid credentials.',
    );
  });

  it('uses a generic network-safe fallback', () => {
    expect(authErrorMessage(new Error('internal detail'))).toBe(
      'Something went wrong. Check your connection and try again.',
    );
  });
});
