import { useAuth } from './useAuth';

export const useRole = () => {
  const { role } = useAuth();
  return role;
};

export default useRole;
