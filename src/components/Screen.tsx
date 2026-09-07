import type { PropsWithChildren } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '../theme/tokens';

export function Screen({ children }: PropsWithChildren): React.JSX.Element {
  return (
    <SafeAreaView edges={['top', 'right', 'bottom', 'left']} style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboard}
      >
        <View style={styles.content}>{children}</View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safeArea: { backgroundColor: colors.background, flex: 1 },
  keyboard: { flex: 1 },
  content: { flex: 1, paddingHorizontal: spacing.lg },
});
