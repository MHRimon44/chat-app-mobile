import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PrimaryButton } from '../components/PrimaryButton';
import { Screen } from '../components/Screen';
import type { RootStackParamList } from '../navigation/types';
import { colors, spacing, typography } from '../theme/tokens';

export function WelcomeScreen({
  navigation,
}: NativeStackScreenProps<RootStackParamList, 'Welcome'>): React.JSX.Element {
  return (
    <Screen>
      <View style={styles.container}>
        <Text accessibilityRole="header" style={styles.heading}>
          Chat securely, in real time.
        </Text>
        <Text style={styles.body}>Private one-to-one conversations across Android and iOS.</Text>
        <PrimaryButton label="Log in" onPress={() => navigation.navigate('Login')} />
        <PrimaryButton label="Create account" onPress={() => navigation.navigate('Register')} />
      </View>
    </Screen>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', gap: spacing.md },
  heading: { ...typography.heading, color: colors.text },
  body: { ...typography.body, color: colors.textMuted },
});
