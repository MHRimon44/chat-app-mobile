import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { colors, radii, spacing, typography } from '../theme/tokens';

type Props = { label: string; loading?: boolean; onPress: () => void };
export function PrimaryButton({ label, loading = false, onPress }: Props): React.JSX.Element {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        pressed ? styles.pressed : null,
        loading ? styles.disabled : null,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={colors.surface} />
      ) : (
        <Text style={styles.label}>{label}</Text>
      )}
    </Pressable>
  );
}
const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    minHeight: 52,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  pressed: { backgroundColor: colors.primaryPressed },
  disabled: { opacity: 0.65 },
  label: { ...typography.body, color: colors.surface, fontWeight: '700' },
});
