import { sessionReducer, sessionRestored, signedIn, signedOut } from './sessionSlice';
describe('sessionReducer', () => {
  it('moves through restored, authenticated and anonymous states', () => {
    const restored = sessionReducer(undefined, sessionRestored(null));
    expect(restored.status).toBe('anonymous');
    const user = { displayName: 'Ada', email: 'ada@example.com', id: 'user-1' };
    const authenticated = sessionReducer(restored, signedIn({ accessToken: 'access-token', user }));
    expect(authenticated).toEqual({ accessToken: 'access-token', status: 'authenticated', user });
    expect(sessionReducer(authenticated, signedOut())).toEqual({
      accessToken: null,
      status: 'anonymous',
      user: null,
    });
  });
});
