import { zodResolver } from '@hookform/resolvers/zod';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, Text, View } from 'react-native';
import { z } from 'zod';
import { useRegisterMutation } from '../../../services/api/authApi';
import { authErrorMessage } from '../../../utils/errorMessage';
import { persistTokenPair } from '../../../services/auth/refreshCoordinator';
import { AuthLayout } from '../../../components/AuthLayout/AuthLayout';
import { FormField } from '../../../components/FormField/FormField';
import { PrimaryButton } from '../../../components/Button/Button';
import { useToast } from '../../../components/Toast/ToastProvider';
import type { RootStackParamList } from '../../../navigation/types';
import { useAppDispatch } from '../../../store/hooks';
import { useAppTheme } from '../../../theme/ThemeProvider';

const schema = z.object({
  username: z
    .string()
    .trim()
    .regex(/^[a-zA-Z0-9_]{3,30}$/, 'Use 3–30 letters, numbers, or underscores.'),
  displayName: z.string().trim().min(1, 'Name is required.').max(80),
  email: z.email('Enter a valid email address.'),
  password: z.string().min(12, 'Use at least 12 characters.').max(128),
});
type Values = z.infer<typeof schema>;
type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;
export function RegisterScreen({ navigation }: Props): React.JSX.Element {
  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const { colors, typography } = useAppTheme();
  const [register, request] = useRegisterMutation();
  const { control, handleSubmit } = useForm<Values>({
    defaultValues: { username: '', displayName: '', email: '', password: '' },
    resolver: zodResolver(schema),
  });
  const submit = handleSubmit(async (values) => {
    try {
      const pair = await register(values).unwrap();
      showToast({ type: 'success', title: 'Account created', message: 'Welcome to Alap.' });
      await persistTokenPair(pair, dispatch);
    } catch (error) {
      showToast({ type: 'error', title: 'Registration failed', message: authErrorMessage(error) });
    }
  });
  return (
    <AuthLayout
      icon="account-plus-outline"
      subtitle="Create your profile and start conversations that feel closer."
      title="Create your account"
      footer={
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={[typography.body, { color: colors.textMuted }]}>
            Already have an account?{' '}
          </Text>
          <Pressable accessibilityRole="button" onPress={() => navigation.navigate('Login')}>
            <Text style={[typography.bodyMedium, { color: colors.primary }]}>Sign in</Text>
          </Pressable>
        </View>
      }
    >
      <Controller
        control={control}
        name="username"
        render={({ field, fieldState }) => (
          <FormField
            autoCapitalize="none"
            autoCorrect={false}
            error={fieldState.error?.message}
            label="Username"
            onBlur={field.onBlur}
            onChangeText={field.onChange}
            placeholder=""
            value={field.value}
          />
        )}
      />
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
            showPasswordToggle
            value={field.value}
          />
        )}
      />
      <PrimaryButton
        label="Create account"
        loading={request.isLoading}
        onPress={() => {
          void submit();
        }}
      />
    </AuthLayout>
  );
}
