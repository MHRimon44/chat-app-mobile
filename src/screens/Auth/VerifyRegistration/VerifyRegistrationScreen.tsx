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
import { useVerifyRegistrationMutation } from '../../../services/api/authApi';
import { persistTokenPair } from '../../../services/auth/refreshCoordinator';
import { useAppDispatch } from '../../../store/hooks';
import { useAppTheme } from '../../../theme/ThemeProvider';
import { authErrorMessage } from '../../../utils/errorMessage';

const schema = z.object({ otp: z.string().regex(/^\d{6}$/, 'Enter the 6-digit code.') });
type Values = z.infer<typeof schema>;
type Props = NativeStackScreenProps<RootStackParamList, 'VerifyRegistration'>;

export function VerifyRegistrationScreen({ navigation, route }: Props): React.JSX.Element {
  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const { colors, typography } = useAppTheme();
  const [verify, request] = useVerifyRegistrationMutation();
  const { control, handleSubmit } = useForm<Values>({
    defaultValues: { otp: '' },
    resolver: zodResolver(schema),
  });

  const submit = handleSubmit(async ({ otp }) => {
    try {
      const pair = await verify({ email: route.params.email, otp }).unwrap();
      showToast({ type: 'success', title: 'Account verified', message: 'Welcome to Alap.' });
      await persistTokenPair(pair, dispatch);
    } catch (error) {
      showToast({ type: 'error', title: 'Verification failed', message: authErrorMessage(error) });
    }
  });

  return (
    <AuthLayout
      icon="email-check-outline"
      title="Verify your email"
      subtitle={`Enter the 6-digit code sent to ${route.params.email}.`}
      footer={
        <Pressable accessibilityRole="button" onPress={() => navigation.goBack()}>
          <Text style={[typography.bodyMedium, { color: colors.primary }]}>Change account details</Text>
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
            label="Verification code"
            maxLength={6}
            onBlur={field.onBlur}
            onChangeText={(value) => field.onChange(value.replace(/\D/g, ''))}
            value={field.value}
          />
        )}
      />
      <PrimaryButton
        label="Verify and create account"
        loading={request.isLoading}
        onPress={() => {
          void submit();
        }}
      />
    </AuthLayout>
  );
}
