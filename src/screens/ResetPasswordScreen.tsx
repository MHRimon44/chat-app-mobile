import { zodResolver } from '@hookform/resolvers/zod';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, Text } from 'react-native';
import { z } from 'zod';
import { useResetPasswordMutation } from '../auth/authApi';
import { authErrorMessage } from '../auth/errorMessage';
import { AuthLayout } from '../components/AuthLayout';
import { FormField } from '../components/FormField';
import { PrimaryButton } from '../components/PrimaryButton';
import type { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/tokens';

const schema = z.object({
  token: z.string().min(40, 'Enter the reset token.'),
  password: z.string().min(12, 'Use at least 12 characters.').max(128),
});
type Values = z.infer<typeof schema>;
type Props = NativeStackScreenProps<RootStackParamList, 'ResetPassword'>;
export function ResetPasswordScreen({ navigation, route }: Props): React.JSX.Element {
  const [reset, request] = useResetPasswordMutation();
  const { control, handleSubmit } = useForm<Values>({
    defaultValues: { password: '', token: route.params?.token ?? '' },
    resolver: zodResolver(schema),
  });
  const submit = handleSubmit(async (values) => {
    try {
      await reset(values).unwrap();
      navigation.replace('Login');
    } catch {
      /* rendered from request state */
    }
  });
  return (
    <AuthLayout subtitle="Choose a new password for your account." title="Set new password">
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
      {request.error === undefined ? null : (
        <Text accessibilityLiveRegion="polite" style={styles.error}>
          {authErrorMessage(request.error)}
        </Text>
      )}
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
const styles = StyleSheet.create({ error: { color: colors.danger } });
