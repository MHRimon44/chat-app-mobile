import { zodResolver } from '@hookform/resolvers/zod';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, StyleSheet, Text } from 'react-native';
import { z } from 'zod';
import { authErrorMessage } from '../auth/errorMessage';
import { persistTokenPair } from '../auth/refreshCoordinator';
import { useLoginMutation } from '../auth/authApi';
import { AuthLayout } from '../components/AuthLayout';
import { FormField } from '../components/FormField';
import { PrimaryButton } from '../components/PrimaryButton';
import type { RootStackParamList } from '../navigation/types';
import { useAppDispatch } from '../store/hooks';
import { colors, spacing } from '../theme/tokens';

const schema = z.object({
  email: z.email('Enter a valid email address.'),
  password: z.string().min(1, 'Password is required.').max(128),
});
type Values = z.infer<typeof schema>;
type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props): React.JSX.Element {
  const dispatch = useAppDispatch();
  const [login, request] = useLoginMutation();
  const { control, handleSubmit } = useForm<Values>({
    defaultValues: { email: '', password: '' },
    resolver: zodResolver(schema),
  });
  const submit = handleSubmit(async (values) => {
    try {
      const pair = await login(values).unwrap();
      await persistTokenPair(pair, dispatch);
    } catch {
      /* rendered from request state */
    }
  });
  return (
    <AuthLayout subtitle="Use your email and password to continue." title="Welcome back">
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
      <Controller
        control={control}
        name="password"
        render={({ field, fieldState }) => (
          <FormField
            autoComplete="password"
            error={fieldState.error?.message}
            label="Password"
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
        label="Log in"
        loading={request.isLoading}
        onPress={() => {
          void submit();
        }}
      />
      <Pressable accessibilityRole="button" onPress={() => navigation.navigate('ForgotPassword')}>
        <Text style={styles.link}>Forgot password?</Text>
      </Pressable>
      <Pressable accessibilityRole="button" onPress={() => navigation.navigate('Register')}>
        <Text style={styles.link}>Create an account</Text>
      </Pressable>
    </AuthLayout>
  );
}
const styles = StyleSheet.create({
  error: { color: colors.danger },
  link: { color: colors.primary, paddingVertical: spacing.sm, textAlign: 'center' },
});
