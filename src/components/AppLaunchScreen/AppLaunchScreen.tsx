/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import React, { useEffect, useRef } from 'react';
import { Animated, Image, StyleSheet, Text, useColorScheme, View } from 'react-native';
export const AppLaunchScreen = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const pulse = useRef(new Animated.Value(0)).current;
  const spin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 850,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 850,
          useNativeDriver: true,
        }),
      ]),
    );

    const spinAnimation = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 1600,
        useNativeDriver: true,
      }),
    );

    pulseAnimation.start();
    spinAnimation.start();

    return () => {
      pulseAnimation.stop();
      spinAnimation.stop();
    };
  }, [pulse, spin]);

  const pulseScale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.08],
  });

  const pulseOpacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.55, 1],
  });

  const rotation = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const colors = {
    background: isDark ? '#0F172A' : '#F8FAFC',
    title: isDark ? '#F8FAFC' : '#0F172A',
    subtitle: isDark ? '#94A3B8' : '#64748B',

    primary: '#4F46E5',
    primaryLight: '#818CF8',

    bubble: '#FFFFFF',

    loaderTrack: isDark ? '#334155' : '#E2E8F0',
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
        },
      ]}
    >
      <View style={styles.content}>
        <Animated.View
          style={[
            styles.logoContainer,
            {
              transform: [{ scale: pulseScale }],
              opacity: pulseOpacity,
            },
          ]}
        >
          <Image
            source={require('../../../assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>

        <Text
          style={[
            styles.title,
            {
              color: colors.title,
            },
          ]}
        >
          Alap
        </Text>

        <Text
          style={[
            styles.subtitle,
            {
              color: colors.subtitle,
            },
          ]}
        >
          Getting your conversations ready...
        </Text>

        <View style={styles.loaderContainer}>
          <Animated.View
            style={[
              styles.loader,
              {
                borderColor: colors.loaderTrack,
                borderTopColor: colors.primary,
                transform: [{ rotate: rotation }],
              },
            ]}
          />

          <View
            style={[
              styles.loaderCenter,
              {
                backgroundColor: colors.primary,
              },
            ]}
          />
        </View>

        <View style={styles.dotsContainer}>
          <Animated.View
            style={[
              styles.dot,
              {
                backgroundColor: colors.primaryLight,
                opacity: pulseOpacity,
              },
            ]}
          />

          <View
            style={[
              styles.dot,
              {
                backgroundColor: colors.primaryLight,
              },
            ]}
          />

          <Animated.View
            style={[
              styles.dot,
              {
                backgroundColor: colors.primaryLight,
                opacity: pulseOpacity,
              },
            ]}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  content: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },

  logoContainer: {
    width: 110,
    height: 110,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 22,
  },

  logo: {
    width: 110,
    height: 110,
  },

  title: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '700',
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 32,
  },

  loaderContainer: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 22,
  },

  loader: {
    position: 'absolute',
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 3,
  },

  loaderCenter: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
