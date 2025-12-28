import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userProfilesApi, type UserRole } from '@/lib/api';

interface UseUserProfilesParams {
  limit?: number;
  offset?: number;
}

export function useUserProfiles(params?: UseUserProfilesParams) {
  return useQuery({
    queryKey: ['user-profiles', params],
    queryFn: () => userProfilesApi.list(params),
  });
}

export function useUserProfile(id: string) {
  return useQuery({
    queryKey: ['user-profiles', id],
    queryFn: () => userProfilesApi.get(id),
    enabled: !!id,
  });
}

export function useCurrentUserProfile() {
  return useQuery({
    queryKey: ['user-profiles', 'me'],
    queryFn: () => userProfilesApi.me(),
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: UserRole }) =>
      userProfilesApi.updateRole(id, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profiles'] });
    },
  });
}
