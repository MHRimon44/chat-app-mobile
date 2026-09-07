export type AuthUser = Readonly<{ id: string; displayName: string; email: string }>;
export type TokenPair = Readonly<{
  accessToken: string;
  accessTokenExpiresAt: string;
  refreshToken: string;
  user: AuthUser;
}>;
export type DeviceMetadata = Readonly<{
  deviceName: string;
  platform: 'android' | 'ios';
  appVersion: string;
}>;
export type ApiEnvelope<T> = Readonly<{ data: T }>;
