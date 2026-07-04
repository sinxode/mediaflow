import { useAuth } from './useAuth';

export const useCurrentUser = () => {
  const { user } = useAuth();
  return user;
};

export default useCurrentUser;
