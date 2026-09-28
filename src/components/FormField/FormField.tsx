import type { TextInputProps } from 'react-native';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { useAppTheme } from '../../theme/ThemeProvider';

type Props = TextInputProps & { error?: string | undefined; label: string };

export function FormField({ error, label, style, ...inputProps }: Props): React.JSX.Element {
  const { colors, radii, spacing, typography } = useAppTheme();

  return (
    <View style={{ gap: spacing.xs }}>
      <Text style={[typography.label, { color: colors.textSecondary }]}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        autoCapitalize="none"
        placeholderTextColor={colors.placeholder}
        selectionColor={colors.primary}
        style={[
          styles.input,
          typography.body,
          {
            backgroundColor: colors.inputBackground,
            borderColor: error === undefined ? colors.border : colors.danger,
            borderRadius: radii.input,
            color: colors.text,
            paddingHorizontal: spacing.lg,
          },
          style,
        ]}
        {...inputProps}
      />
      {error === undefined ? null : (
        <Text accessibilityLiveRegion="polite" style={[styles.error, { color: colors.danger }]}>
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  input: { borderWidth: 1, minHeight: 54 },
  error: { fontSize: 13, lineHeight: 18 },
});
