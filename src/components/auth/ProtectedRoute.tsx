import { useAuth } from "@/hooks/useAuth";
import { useRoles } from "@/hooks/useRoles";
import { useRouter } from "next/router";
import { useEffect } from "react";
import type { ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedUserTypes?: string[];
}

const ProtectedRoute = ({
  children,
  allowedUserTypes,
}: ProtectedRouteProps) => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { currentUserType, loading: rolesLoading } = useRoles();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !rolesLoading) {
      if (!isAuthenticated) {
        router.push("/login");
        return;
      }

      if (
        allowedUserTypes &&
        currentUserType &&
        !allowedUserTypes.includes(currentUserType)
      ) {
        router.push("/unauthorized");
        return;
      }
    }
  }, [
    isAuthenticated,
    authLoading,
    rolesLoading,
    currentUserType,
    allowedUserTypes,
    router,
  ]);

  if (authLoading || rolesLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  if (
    allowedUserTypes &&
    currentUserType &&
    !allowedUserTypes.includes(currentUserType)
  ) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
