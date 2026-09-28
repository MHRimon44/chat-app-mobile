import { useState } from 'react';
import type { TextInputProps } from 'react-native';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { useAppTheme } from '../../theme/ThemeProvider';
import { AppIcon } from '../AppIcon/AppIcon';

type Props = TextInputProps & {
  error?: string | undefined;
  label: string;
  showPasswordToggle?: boolean;
};

export function FormField({
  error,
  label,
  style,
  secureTextEntry,
  showPasswordToggle = false,
  ...inputProps
}: Props): React.JSX.Element {
  const { colors, radii, spacing, typography } = useAppTheme();

  const [passwordVisible, setPasswordVisible] = useState(false);

  const isPasswordField = secureTextEntry && showPasswordToggle;

  return (
    <View style={{ gap: spacing.xs }}>
      <Text style={[typography.label, { color: colors.textSecondary }]}>{label}</Text>

      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: colors.inputBackground,
            borderColor: error === undefined ? colors.border : colors.danger,
            borderRadius: radii.input,
          },
        ]}
      >
        <TextInput
          accessibilityLabel={label}
          autoCapitalize="none"
          placeholderTextColor={colors.placeholder}
          selectionColor={colors.primary}
          secureTextEntry={secureTextEntry ? !passwordVisible : false}
          style={[
            styles.input,
            typography.body,
            {
              color: colors.text,
              paddingLeft: spacing.lg,
              paddingRight: isPasswordField ? spacing.sm : spacing.lg,
            },
            style,
          ]}
          {...inputProps}
        />

        {isPasswordField ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={passwordVisible ? 'Hide password' : 'Show password'}
            hitSlop={8}
            onPress={() => {
              setPasswordVisible((current) => !current);
            }}
            style={styles.eyeButton}
          >
            <AppIcon
              type="icon"
              name={passwordVisible ? 'eye-off-outline' : 'eye-outline'}
              size={22}
              color={colors.icon}
            />
          </Pressable>
        ) : null}
      </View>

      {error === undefined ? null : (
        <Text accessibilityLiveRegion="polite" style={[styles.error, { color: colors.danger }]}>
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    minHeight: 54,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },

  input: {
    flex: 1,
    minHeight: 52,
    paddingVertical: 0,
  },

  eyeButton: {
    width: 48,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },

  error: {
    fontSize: 13,
    lineHeight: 18,
  },
});
