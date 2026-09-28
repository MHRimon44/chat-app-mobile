/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-require-imports */
import { Image, Pressable, StatusBar, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { useAppTheme } from '../../theme/ThemeProvider';
import { styles } from './WelcomeScreen.styles';
import { SafeAreaView } from 'react-native-safe-area-context';

const logo = require('../../../assets/logo.png');

type Props = NativeStackScreenProps<RootStackParamList, 'Welcome'>;

export function WelcomeScreen({ navigation }: Props): React.JSX.Element {
  const { colors, dark } = useAppTheme();

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar
        animated

        barStyle={dark ? 'light-content' : 'dark-content'}
      />

      <View pointerEvents="none" style={[styles.glowTop, { backgroundColor: colors.cyan }]} />
      <View pointerEvents="none" style={[styles.glowBottom, { backgroundColor: colors.accent }]} />

      <View style={styles.content}>
        <View style={styles.brandArea}>
          <View
            style={[
              styles.logoHalo,
              { backgroundColor: dark ? colors.surfaceElevated : colors.primarySoft },
            ]}
          >
            <Image source={logo} style={styles.logo} resizeMode="contain" />
          </View>

          <Text accessibilityRole="header" style={[styles.name, { color: colors.text }]}>
            Alap
          </Text>
          <Text style={[styles.tagline, { color: colors.text }]}>
            Conversations that feel closer.
          </Text>
          <Text style={[styles.description, { color: colors.textMuted }]}>
            Connect, chat and stay in touch with the people who matter.
          </Text>
        </View>

        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            onPress={() => navigation.navigate('Register')}
            style={({ pressed }) => [
              styles.button,
              { backgroundColor: pressed ? colors.primaryPressed : colors.primary },
            ]}
          >
            <Text style={styles.primaryLabel}>Get Started</Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={() => navigation.navigate('Login')}
            style={({ pressed }) => [
              styles.button,
              styles.secondary,
              {
                borderColor: colors.border,
                backgroundColor: pressed ? colors.primarySoft : colors.surface,
              },
            ]}
          >
            <Text style={[styles.secondaryLabel, { color: colors.text }]}>
              I already have an account
            </Text>
          </Pressable>

          <Text style={[styles.footer, { color: colors.textMuted }]}>
            Private conversations. Simple connections.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
