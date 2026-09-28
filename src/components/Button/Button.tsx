import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { useAppTheme } from '../../theme/ThemeProvider';

type Props = { label: string; loading?: boolean; onPress: () => void };
export function PrimaryButton({ label, loading = false, onPress }: Props): React.JSX.Element {
  const { colors, radii, spacing, typography } = useAppTheme();
  return (
    <Pressable
      accessibilityRole="button"
      disabled={loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: pressed ? colors.primaryPressed : colors.primary,
          borderRadius: radii.button,
          paddingHorizontal: spacing.lg,
        },
        loading ? styles.disabled : null,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={colors.onPrimary} />
      ) : (
        <Text style={[typography.bodyMedium, { color: colors.onPrimary }]}>{label}</Text>
      )}
    </Pressable>
  );
}
const styles = StyleSheet.create({
  button: { alignItems: 'center', justifyContent: 'center', minHeight: 54 },
  disabled: { opacity: 0.65 },
});
