import { zodResolver } from '@hookform/resolvers/zod';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { useResetPasswordMutation } from '../../../services/api/authApi';
import { authErrorMessage } from '../../../utils/errorMessage';
import { AuthLayout } from '../../../components/AuthLayout/AuthLayout';
import { FormField } from '../../../components/FormField/FormField';
import { PrimaryButton } from '../../../components/Button/Button';
import { useToast } from '../../../components/Toast/ToastProvider';
import type { RootStackParamList } from '../../../navigation/types';

const schema = z.object({
  token: z.string().min(40, 'Enter the reset token.'),
  password: z.string().min(12, 'Use at least 12 characters.').max(128),
});
type Values = z.infer<typeof schema>;
type Props = NativeStackScreenProps<RootStackParamList, 'ResetPassword'>;
export function ResetPasswordScreen({ navigation, route }: Props): React.JSX.Element {
  const { showToast } = useToast();
  const [reset, request] = useResetPasswordMutation();
  const { control, handleSubmit } = useForm<Values>({
    defaultValues: { password: '', token: route.params?.token ?? '' },
    resolver: zodResolver(schema),
  });
  const submit = handleSubmit(async (values) => {
    try {
      await reset(values).unwrap();
      showToast({ type: 'success', title: 'Password updated', message: 'You can now sign in with your new password.' });
      navigation.replace('Login');
    } catch (error) {
      showToast({ type: 'error', title: 'Reset failed', message: authErrorMessage(error) });
    }
  });
  return (
    <AuthLayout
      icon="shield-lock-outline"
      subtitle="Choose a strong new password to keep your আলাপ account secure."
      title="Set a new password"
    >
      <Controller
        control={control}
        name="token"
        render={({ field, fieldState }) => (
          <FormField
            autoCapitalize="none"
            error={fieldState.error?.message}
            label="Reset token"
            onBlur={field.onBlur}
            onChangeText={field.onChange}
            value={field.value}
          />
        )}
      />
      <Controller
        control={control}
        name="password"
        render={({ field, fieldState }) => (
          <FormField
            autoComplete="new-password"
            error={fieldState.error?.message}
            label="New password"
            onBlur={field.onBlur}
            onChangeText={field.onChange}
            secureTextEntry
            value={field.value}
          />
        )}
      />
      <PrimaryButton
        label="Update password"
        loading={request.isLoading}
        onPress={() => {
          void submit();
        }}
      />
    </AuthLayout>
  );
}
