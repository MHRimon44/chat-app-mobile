import { zodResolver } from '@hookform/resolvers/zod';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, Text } from 'react-native';
import { z } from 'zod';

import { AuthLayout } from '../../../components/AuthLayout/AuthLayout';
import { PrimaryButton } from '../../../components/Button/Button';
import { FormField } from '../../../components/FormField/FormField';
import { useToast } from '../../../components/Toast/ToastProvider';
import type { RootStackParamList } from '../../../navigation/types';
import { useVerifyPasswordResetOtpMutation } from '../../../services/api/authApi';
import { useAppTheme } from '../../../theme/ThemeProvider';
import { authErrorMessage } from '../../../utils/errorMessage';

const schema = z.object({ otp: z.string().regex(/^\d{6}$/, 'Enter the 6-digit code.') });
type Values = z.infer<typeof schema>;
type Props = NativeStackScreenProps<RootStackParamList, 'VerifyResetOtp'>;

export function VerifyResetOtpScreen({ navigation, route }: Props): React.JSX.Element {
  const { showToast } = useToast();
  const { colors, typography } = useAppTheme();
  const [verify, request] = useVerifyPasswordResetOtpMutation();
  const { control, handleSubmit } = useForm<Values>({
    defaultValues: { otp: '' },
    resolver: zodResolver(schema),
  });

  const submit = handleSubmit(async ({ otp }) => {
    try {
      const result = await verify({ email: route.params.email, otp }).unwrap();
      navigation.replace('ResetPassword', { token: result.resetToken });
    } catch (error) {
      showToast({ type: 'error', title: 'Verification failed', message: authErrorMessage(error) });
    }
  });

  return (
    <AuthLayout
      icon="email-lock-outline"
      title="Enter reset code"
      subtitle={`Enter the 6-digit code sent to ${route.params.email}.`}
      footer={
        <Pressable accessibilityRole="button" onPress={() => navigation.goBack()}>
          <Text style={[typography.bodyMedium, { color: colors.primary }]}>Use another email</Text>
        </Pressable>
      }
    >
      <Controller
        control={control}
        name="otp"
        render={({ field, fieldState }) => (
          <FormField
            autoCapitalize="none"
            autoComplete="one-time-code"
            error={fieldState.error?.message}
            keyboardType="number-pad"
            label="Reset code"
            maxLength={6}
            onBlur={field.onBlur}
            onChangeText={(value) => field.onChange(value.replace(/\D/g, ''))}
            value={field.value}
          />
        )}
      />
      <PrimaryButton
        label="Verify code"
        loading={request.isLoading}
        onPress={() => {
          void submit();
        }}
      />
    </AuthLayout>
  );
}
