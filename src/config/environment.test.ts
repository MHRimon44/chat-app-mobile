jest.mock('react-native', () => ({ NativeModules: {}, Platform: { OS: 'android' } }));

import { resolveDevelopmentHost } from './environment';

describe('mobile development environment', () => {
  it('uses the Metro host for a physical or LAN-connected device', () => {
    expect(
      resolveDevelopmentHost('http://192.168.1.25:8081/index.bundle?platform=android', 'android'),
    ).toBe('192.168.1.25');
  });

  it('uses Android Emulator host mapping when Metro metadata is unavailable', () => {
    expect(resolveDevelopmentHost(undefined, 'android')).toBe('10.0.2.2');
  });

  it('uses localhost for an iOS simulator fallback', () => {
    expect(resolveDevelopmentHost('invalid', 'ios')).toBe('localhost');
  });
});
