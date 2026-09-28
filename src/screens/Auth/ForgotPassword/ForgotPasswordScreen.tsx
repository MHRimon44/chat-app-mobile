import { zodResolver } from '@hookform/resolvers/zod';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, Text, View } from 'react-native';
import { z } from 'zod';
import { useForgotPasswordMutation } from '../../../services/api/authApi';
import { authErrorMessage } from '../../../utils/errorMessage';
import { AuthLayout } from '../../../components/AuthLayout/AuthLayout';
import { FormField } from '../../../components/FormField/FormField';
import { PrimaryButton } from '../../../components/Button/Button';
import type { RootStackParamList } from '../../../navigation/types';
import { useAppTheme } from '../../../theme/ThemeProvider';

const schema = z.object({ email: z.email('Enter a valid email address.') });
type Values = z.infer<typeof schema>;
export function ForgotPasswordScreen(
  _props: NativeStackScreenProps<RootStackParamList, 'ForgotPassword'>,
): React.JSX.Element {
  const { navigation } = _props;
  const { colors, typography } = useAppTheme();
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
      icon="lock-reset"
      subtitle="Enter your email and we’ll send you the next step to securely reset your password."
      title="Forgot your password?"
      footer={
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={[typography.body, { color: colors.textMuted }]}>Remembered it? </Text>
          <Pressable accessibilityRole="button" onPress={() => navigation.goBack()}>
            <Text style={[typography.bodyMedium, { color: colors.primary }]}>Back to sign in</Text>
          </Pressable>
        </View>
      }
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
        <Text accessibilityLiveRegion="polite" style={[typography.label, { color: colors.success }]}>
          Check your email for the next step.
        </Text>
      ) : null}
      {request.error === undefined ? null : (
        <Text accessibilityLiveRegion="polite" style={[typography.label, { color: colors.danger }]}>
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
