import { credentialStore } from './credentialStore';
import { bootstrapSession, clearSession, persistTokenPair } from './refreshCoordinator';
import { signedIn, signedOut } from '../../store/slices/sessionSlice';

jest.mock('./credentialStore', () => ({
  credentialStore: {
    setRefreshToken: jest.fn(),
    getRefreshToken: jest.fn(),
    clearRefreshToken: jest.fn(),
  },
}));

const pair = {
  accessToken: 'access',
  accessTokenExpiresAt: '2026-10-03T10:00:00.000Z',
  refreshToken: 'refresh',
  user: { id: 'user-id', displayName: 'Sara', email: 'sara@example.com' },
};

test('registration session stores refresh credential before signing in', async () => {
  const dispatch = jest.fn();
  await persistTokenPair(pair, dispatch);
  expect(credentialStore.setRefreshToken).toHaveBeenCalledWith(pair.refreshToken);
  expect(dispatch).toHaveBeenCalledWith(
    signedIn({ accessToken: pair.accessToken, user: pair.user }),
  );
  expect(jest.mocked(credentialStore.setRefreshToken).mock.invocationCallOrder[0]).toBeLessThan(
    dispatch.mock.invocationCallOrder[0]!,
  );
});

test('credential storage failure does not authenticate', async () => {
  const dispatch = jest.fn();
  jest.mocked(credentialStore.setRefreshToken).mockRejectedValueOnce(new Error('Storage failure'));
  await expect(persistTokenPair(pair, dispatch)).rejects.toThrow('Storage failure');
  expect(dispatch).not.toHaveBeenCalled();
});

test('app restart refreshes the saved session; logout clears it', async () => {
  const dispatch = jest.fn();
  jest.mocked(credentialStore.getRefreshToken).mockResolvedValueOnce(pair.refreshToken);
  const fetchMock = jest.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
    ok: true,
    json: async () => ({ data: pair }),
  } as Response);
  try {
    await bootstrapSession(dispatch);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/v1/auth/refresh'),
      expect.objectContaining({ body: JSON.stringify({ refreshToken: pair.refreshToken }) }),
    );
    expect(dispatch).toHaveBeenCalledWith(
      signedIn({ accessToken: pair.accessToken, user: pair.user }),
    );
    await clearSession(dispatch);
    expect(credentialStore.clearRefreshToken).toHaveBeenCalled();
    expect(dispatch).toHaveBeenLastCalledWith(signedOut());
  } finally {
    fetchMock.mockRestore();
  }
});
