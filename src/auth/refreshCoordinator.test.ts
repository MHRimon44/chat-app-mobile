import { credentialStore } from '../security/credentialStore';
import type { AppDispatch } from '../store/store';
import { refreshSession } from './refreshCoordinator';

jest.mock('../security/credentialStore', () => ({
  credentialStore: {
    clearRefreshToken: jest.fn(),
    getRefreshToken: jest.fn(),
    setRefreshToken: jest.fn(),
  },
}));

jest.mock('../config/environment', () => ({
  environment: { apiBaseUrl: 'https://api.example.test' },
}));

const pair = {
  accessToken: 'access-next',
  accessTokenExpiresAt: '2030-01-01T00:00:00.000Z',
  refreshToken: 'refresh-next',
  user: { displayName: 'Ada', email: 'ada@example.com', id: 'user-1' },
};

describe('refreshSession', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('coalesces concurrent rotations and persists the replacement credential once', async () => {
    jest.mocked(credentialStore.getRefreshToken).mockResolvedValue('refresh-current');
    const fetchMock = jest.fn().mockResolvedValue({
      json: jest.fn().mockResolvedValue({ data: pair }),
      ok: true,
    });
    globalThis.fetch = fetchMock as unknown as typeof fetch;
    const dispatch = jest.fn() as unknown as AppDispatch;

    const [first, second] = await Promise.all([refreshSession(dispatch), refreshSession(dispatch)]);

    expect(first).toEqual(pair);
    expect(second).toEqual(pair);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(credentialStore.setRefreshToken).toHaveBeenCalledTimes(1);
    expect(dispatch).toHaveBeenCalledTimes(1);
  });

  it('clears local credentials when rotation is rejected', async () => {
    jest.mocked(credentialStore.getRefreshToken).mockResolvedValue('refresh-current');
    globalThis.fetch = jest.fn().mockResolvedValue({ ok: false }) as unknown as typeof fetch;
    const dispatch = jest.fn() as unknown as AppDispatch;

    await expect(refreshSession(dispatch)).resolves.toBeNull();
    expect(credentialStore.clearRefreshToken).toHaveBeenCalledTimes(1);
    expect(dispatch).toHaveBeenCalledTimes(1);
  });
});
