import { zodResolver } from '@hookform/resolvers/zod';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, StyleSheet, Text } from 'react-native';
import { z } from 'zod';
import { useRegisterMutation } from '../auth/authApi';
import { authErrorMessage } from '../auth/errorMessage';
import { persistTokenPair } from '../auth/refreshCoordinator';
import { AuthLayout } from '../components/AuthLayout';
import { FormField } from '../components/FormField';
import { PrimaryButton } from '../components/PrimaryButton';
import type { RootStackParamList } from '../navigation/types';
import { useAppDispatch } from '../store/hooks';
import { colors, spacing } from '../theme/tokens';

const schema = z.object({
  displayName: z.string().trim().min(1, 'Name is required.').max(80),
  email: z.email('Enter a valid email address.'),
  password: z.string().min(12, 'Use at least 12 characters.').max(128),
});
type Values = z.infer<typeof schema>;
type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;
export function RegisterScreen({ navigation }: Props): React.JSX.Element {
  const dispatch = useAppDispatch();
  const [register, request] = useRegisterMutation();
  const { control, handleSubmit } = useForm<Values>({
    defaultValues: { displayName: '', email: '', password: '' },
    resolver: zodResolver(schema),
  });
  const submit = handleSubmit(async (values) => {
    try {
      const pair = await register(values).unwrap();
      console.log('RegisterScreen: submit: pair', pair);
      await persistTokenPair(pair, dispatch);
    } catch {
      /* rendered from request state */
    }
  });
  return (
    <AuthLayout subtitle="Create a secure account to start messaging." title="Create account">
      <Controller
        control={control}
        name="displayName"
        render={({ field, fieldState }) => (
          <FormField
            autoCapitalize="words"
            autoComplete="name"
            error={fieldState.error?.message}
            label="Display name"
            onBlur={field.onBlur}
            onChangeText={field.onChange}
            value={field.value}
          />
        )}
      />
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
            autoComplete="new-password"
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
        label="Create account"
        loading={request.isLoading}
        onPress={() => {
          void submit();
        }}
      />
      <Pressable accessibilityRole="button" onPress={() => navigation.navigate('Login')}>
        <Text style={styles.link}>I already have an account</Text>
      </Pressable>
    </AuthLayout>
  );
}
const styles = StyleSheet.create({
  error: { color: colors.danger },
  link: { color: colors.primary, paddingVertical: spacing.sm, textAlign: 'center' },
});
