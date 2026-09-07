import { api } from '../store/api';
import type { AuthUser } from '../auth/types';

export type PresenceVisibility = 'everyone' | 'contacts' | 'nobody';
export type PrivateProfile = AuthUser &
  Readonly<{
    bio?: string;
    presenceVisibility: PresenceVisibility;
    createdAt: string;
  }>;

export type ProfileUpdate = Readonly<{
  username?: string;
  displayName?: string;
  bio?: string;
  presenceVisibility?: PresenceVisibility;
}>;

export const profileApi = api.injectEndpoints({
  endpoints: (build) => ({
    getMyProfile: build.query<PrivateProfile, void>({
      query: () => '/v1/users/me',
      transformResponse: (response: { data: PrivateProfile }) => response.data,
      providesTags: [{ id: 'ME', type: 'User' }],
    }),
    updateMyProfile: build.mutation<PrivateProfile, ProfileUpdate>({
      query: (body) => ({ body, method: 'PATCH', url: '/v1/users/me' }),
      transformResponse: (response: { data: PrivateProfile }) => response.data,
      invalidatesTags: [{ id: 'ME', type: 'User' }],
    }),
  }),
});

export const { useGetMyProfileQuery, useUpdateMyProfileMutation } = profileApi;
