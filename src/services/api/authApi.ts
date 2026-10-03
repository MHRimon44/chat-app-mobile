import { z } from 'zod';
import { authFeatures } from '../../config/authFeatures';
import { api } from '../../store/api';
import { getDeviceMetadata } from '../auth/deviceMetadata';
import type { ApiEnvelope, TokenPair } from '../../@types/auth';

type LoginInput = { email: string; password: string };
type RegisterInput = LoginInput & { displayName: string; username: string };
type MessageResponse = { message: string };
type RegistrationResponse = MessageResponse | TokenPair;

// Direct registration uses the same session contract as login/verification.
// Reject incomplete responses before writing credentials or claiming success.
const tokenPairSchema = z.object({
  accessToken: z.string().min(1),
  accessTokenExpiresAt: z.iso.datetime(),
  refreshToken: z.string().min(1),
  user: z.object({
    id: z.string().min(1),
    username: z.string().optional(),
    displayName: z.string(),
    email: z.string(),
  }),
});
const registrationOtpResponseSchema = z.object({ message: z.string() });

export function parseRegistrationResponse(response: ApiEnvelope<unknown>): RegistrationResponse {
  if (authFeatures.registrationOtpEnabled) {
    return registrationOtpResponseSchema.parse(response.data);
  }
  const pair = tokenPairSchema.parse(response.data);
  const { username, ...user } = pair.user;
  return { ...pair, user: { ...user, ...(username === undefined ? {} : { username }) } };
}
type VerifyRegistrationInput = { email: string; otp: string };
type VerifyResetOtpInput = { email: string; otp: string };
type VerifyResetOtpResponse = { resetToken: string };

export const authApi = api.injectEndpoints({
  endpoints: (build) => ({
    login: build.mutation<TokenPair, LoginInput>({
      query: (body) => ({
        body: { ...body, device: getDeviceMetadata() },
        method: 'POST',
        url: '/v1/auth/login',
      }),
      transformResponse: (response: ApiEnvelope<TokenPair>) => response.data,
    }),
    register: build.mutation<RegistrationResponse, RegisterInput>({
      query: (body) => ({
        body: { ...body, device: getDeviceMetadata() },
        method: 'POST',
        url: '/v1/auth/register',
      }),
      transformResponse: parseRegistrationResponse,
    }),
    verifyRegistration: build.mutation<TokenPair, VerifyRegistrationInput>({
      query: (body) => ({
        body: { ...body, device: getDeviceMetadata() },
        method: 'POST',
        url: '/v1/auth/register/verify',
      }),
      transformResponse: (response: ApiEnvelope<TokenPair>) => response.data,
    }),
    forgotPassword: build.mutation<MessageResponse, { email: string }>({
      query: (body) => ({ body, method: 'POST', url: '/v1/auth/password/forgot' }),
      transformResponse: (response: ApiEnvelope<MessageResponse>) => response.data,
    }),
    verifyPasswordResetOtp: build.mutation<VerifyResetOtpResponse, VerifyResetOtpInput>({
      query: (body) => ({ body, method: 'POST', url: '/v1/auth/password/verify-otp' }),
      transformResponse: (response: ApiEnvelope<VerifyResetOtpResponse>) => response.data,
    }),
    resetPassword: build.mutation<void, { password: string; token: string }>({
      query: (body) => ({ body, method: 'POST', url: '/v1/auth/password/reset' }),
    }),
    logout: build.mutation<void, void>({
      query: () => ({ method: 'POST', url: '/v1/auth/logout' }),
    }),
    logoutAll: build.mutation<void, void>({
      query: () => ({ method: 'POST', url: '/v1/auth/logout-all' }),
    }),
  }),
});

export const {
  useForgotPasswordMutation,
  useLoginMutation,
  useLogoutAllMutation,
  useLogoutMutation,
  useRegisterMutation,
  useResetPasswordMutation,
  useVerifyPasswordResetOtpMutation,
  useVerifyRegistrationMutation,
} = authApi;
