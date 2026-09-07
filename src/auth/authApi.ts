import { api } from '../store/api';
import { getDeviceMetadata } from './deviceMetadata';
import type { ApiEnvelope, TokenPair } from './types';

type LoginInput = { email: string; password: string };
type RegisterInput = LoginInput & { displayName: string };

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
    register: build.mutation<TokenPair, RegisterInput>({
      query: (body) => ({
        body: { ...body, device: getDeviceMetadata() },
        method: 'POST',
        url: '/v1/auth/register',
      }),
      transformResponse: (response: ApiEnvelope<TokenPair>) => response.data,
    }),
    forgotPassword: build.mutation<{ accepted: boolean }, { email: string }>({
      query: (body) => ({ body, method: 'POST', url: '/v1/auth/password/forgot' }),
      transformResponse: (response: ApiEnvelope<{ accepted: boolean }>) => response.data,
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
} = authApi;
