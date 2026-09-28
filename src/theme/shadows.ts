import { Platform, StyleSheet } from 'react-native';

export const shadows = StyleSheet.create({
  none: {},

  sm: Platform.select({
    ios: {
      shadowColor: '#000000',
      shadowOpacity: 0.08,
      shadowRadius: 4,
      shadowOffset: {
        width: 0,
        height: 2,
      },
    },
    android: {
      elevation: 2,
    },
    default: {},
  }),

  md: Platform.select({
    ios: {
      shadowColor: '#000000',
      shadowOpacity: 0.12,
      shadowRadius: 10,
      shadowOffset: {
        width: 0,
        height: 4,
      },
    },
    android: {
      elevation: 5,
    },
    default: {},
  }),

  lg: Platform.select({
    ios: {
      shadowColor: '#000000',
      shadowOpacity: 0.16,
      shadowRadius: 18,
      shadowOffset: {
        width: 0,
        height: 8,
      },
    },
    android: {
      elevation: 9,
    },
    default: {},
  }),
});
