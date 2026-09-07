import type { TextInputProps } from 'react-native';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, radii, spacing, typography } from '../theme/tokens';

type Props = TextInputProps & { error?: string | undefined; label: string };

export function FormField({ error, label, ...inputProps }: Props): React.JSX.Element {
  return (
    <View style={styles.group}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        autoCapitalize="none"
        placeholderTextColor={colors.textMuted}
        style={[styles.input, error === undefined ? null : styles.inputError]}
        {...inputProps}
      />
      {error === undefined ? null : (
        <Text accessibilityLiveRegion="polite" style={styles.error}>
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  group: { gap: spacing.xs },
  label: { ...typography.body, color: colors.text, fontWeight: '600' },
  input: {
    ...typography.body,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    color: colors.text,
    minHeight: 52,
    paddingHorizontal: spacing.md,
  },
  inputError: { borderColor: colors.danger },
  error: { color: colors.danger, fontSize: 14, lineHeight: 20 },
});
