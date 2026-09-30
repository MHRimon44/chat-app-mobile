import * as Keychain from 'react-native-keychain';
const service = 'com.chatmobile.refresh-token';
export const credentialStore = {
  async getRefreshToken(): Promise<string | null> {
    const result = await Keychain.getGenericPassword({ service });
    return result === false ? null : result.password;
  },
  async setRefreshToken(token: string): Promise<void> {
    await Keychain.setGenericPassword('refresh-token', token, {
      accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      service,
    });
  },
  async clearRefreshToken(): Promise<void> {
    await Keychain.resetGenericPassword({ service });
  },
};
