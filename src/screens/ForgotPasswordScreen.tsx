import { zodResolver } from '@hookform/resolvers/zod';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, Text } from 'react-native';
import { z } from 'zod';
import { useForgotPasswordMutation } from '../auth/authApi';
import { authErrorMessage } from '../auth/errorMessage';
import { AuthLayout } from '../components/AuthLayout';
import { FormField } from '../components/FormField';
import { PrimaryButton } from '../components/PrimaryButton';
import type { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/tokens';

const schema = z.object({ email: z.email('Enter a valid email address.') });
type Values = z.infer<typeof schema>;
export function ForgotPasswordScreen(
  _props: NativeStackScreenProps<RootStackParamList, 'ForgotPassword'>,
): React.JSX.Element {
  const [forgot, request] = useForgotPasswordMutation();
  const { control, handleSubmit } = useForm<Values>({
    defaultValues: { email: '' },
    resolver: zodResolver(schema),
  });
  const submit = handleSubmit(async (values) => {
    try {
      await forgot(values).unwrap();
    } catch {
      /* rendered from request state */
    }
  });
  return (
    <AuthLayout
      subtitle="If an account exists, we will send password-reset instructions."
      title="Reset password"
    >
      <Controller
        control={control}
        name="email"
        render={({ field, fieldState }) => (
          <FormField
            autoComplete="email"
            error={fieldState.error?.message}
            keyboardType="email-address"
            label="Email"
            onBlur={field.onBlur}
            onChangeText={field.onChange}
            value={field.value}
          />
        )}
      />
      {request.isSuccess ? (
        <Text accessibilityLiveRegion="polite" style={styles.success}>
          Check your email for the next step.
        </Text>
      ) : null}
      {request.error === undefined ? null : (
        <Text accessibilityLiveRegion="polite" style={styles.error}>
          {authErrorMessage(request.error)}
        </Text>
      )}
      <PrimaryButton
        label="Send reset instructions"
        loading={request.isLoading}
        onPress={() => {
          void submit();
        }}
      />
    </AuthLayout>
  );
}
const styles = StyleSheet.create({
  error: { color: colors.danger },
  success: { color: colors.success },
});
