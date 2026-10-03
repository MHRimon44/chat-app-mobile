import { authFeatures } from '../../config/authFeatures';
import { authApi, parseRegistrationResponse } from './authApi';
import { authErrorMessage } from '../../utils/errorMessage';

jest.mock('../../store/api', () => ({
  api: {
    injectEndpoints: ({ endpoints }: { endpoints: (builder: unknown) => unknown }) =>
      endpoints({ mutation: (definition: unknown) => definition }),
  },
}));
jest.mock('../auth/deviceMetadata', () => ({
  getDeviceMetadata: () => ({
    deviceName: 'Test device',
    platform: 'android',
    appVersion: '1.0.0',
  }),
}));

const pair = {
  accessToken: 'access',
  accessTokenExpiresAt: '2026-10-03T10:00:00.000Z',
  refreshToken: 'refresh',
  user: { id: 'user-id', displayName: 'Sara', email: 'sara@example.com' },
};

afterEach(() => {
  authFeatures.registrationOtpEnabled = false;
});

test('direct registration preserves the backend session contract', () => {
  expect(parseRegistrationResponse({ data: pair })).toEqual(pair);
});

test.each([
  undefined,
  { message: 'A verification code has been sent to your email.' },
  { ...pair, refreshToken: '' },
  { ...pair, user: undefined },
  { ...pair, accessToken: undefined },
])('direct registration rejects incomplete or legacy OTP responses: %p', (data) => {
  expect(() => parseRegistrationResponse({ data })).toThrow();
});

test('re-enabling OTP restores the legacy message contract', () => {
  authFeatures.registrationOtpEnabled = true;
  expect(parseRegistrationResponse({ data: { message: 'Code sent' } })).toEqual({
    message: 'Code sent',
  });
});

test('both email-dependent features default to disabled', () => {
  expect(authFeatures).toEqual({ registrationOtpEnabled: false, forgotPasswordEnabled: false });
});

test('registration posts the existing input and device metadata to the direct endpoint', () => {
  // The injected builder is mocked to expose endpoint definitions, without making network calls.
  const endpoints = authApi as unknown as {
    register: { query: (input: unknown) => unknown };
  };
  const input = {
    username: 'sara',
    displayName: 'Sara',
    email: 'sara@example.com',
    password: 'test-password-only',
  };
  expect(endpoints.register.query(input)).toEqual({
    method: 'POST',
    url: '/v1/auth/register',
    body: {
      ...input,
      device: { deviceName: 'Test device', platform: 'android', appVersion: '1.0.0' },
    },
  });
});

test.each([
  [409, 'That email or username is already in use.'],
  [400, 'Invalid input.'],
  [500, 'Server failure.'],
])('backend registration error %s retains its message', (status, message) => {
  expect(authErrorMessage({ status, data: { error: { message } } })).toBe(message);
});

test('network failure retains the existing retry feedback', () => {
  expect(authErrorMessage({ status: 'FETCH_ERROR', error: 'Network request failed' })).toBe(
    'Something went wrong. Check your connection and try again.',
  );
});
