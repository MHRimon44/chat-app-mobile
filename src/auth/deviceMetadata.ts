import { Platform } from 'react-native';

import type { DeviceMetadata } from './types';

export function getDeviceMetadata(): DeviceMetadata {
  return {
    appVersion: '1.0.0',
    deviceName: `${Platform.OS} device`,
    platform: Platform.OS === 'android' ? 'android' : 'ios',
  };
}
