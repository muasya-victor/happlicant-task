// hooks/useAuth.ts
import { useEffect } from "react";
import type { User } from "@supabase/supabase-js";
import client from "@/api/client";
import { useAuthStore } from "@/store/auth-store";

export const useAuth = () => {
  const {
    user,
    profile,
    loading,
    errors,
    setUser,
    setProfile,
    setLoading,
    setError,
    clearErrors,
  } = useAuthStore();

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        setLoading("auth", true);
        const {
          data: { session },
        } = await client.auth.getSession();

        if (!mounted) return;

        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          // ✅ Set all loading states to false when no user
          setLoading("auth", false);
          setLoading("profile", false);
        }
      } catch (error) {
        if (!mounted) return;
        console.error("Auth initialization error:", error);
        // ✅ Ensure loading states are cleared on error
        setLoading("auth", false);
        setLoading("profile", false);
        setError("auth", {
          message:
            error instanceof Error
              ? error.message
              : "Failed to initialize auth",
          code: "AUTH_INIT_ERROR",
          timestamp: Date.now(),
        });
      }
    };

    initializeAuth();

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      try {
        setLoading("auth", true);
        setUser(session?.user ?? null);

        if (session?.user) {
          await fetchProfile(session.user.id);
          clearErrors();
        } else {
          setProfile(null);
          // ✅ Clear loading states on sign out
          setLoading("auth", false);
          setLoading("profile", false);
        }
      } catch (error) {
        console.error("Auth state change error:", error);
        setLoading("auth", false);
        setLoading("profile", false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      setLoading("profile", true);
      setError("profile", null);

      const { data, error } = await client
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error("Error fetching profile:", error);
      setError("profile", {
        message:
          error instanceof Error ? error.message : "Failed to fetch profile",
        code: "PROFILE_FETCH_ERROR",
        timestamp: Date.now(),
      });
    } finally {
      // ✅ CRITICAL: Only set profile loading to false here
      setLoading("profile", false);
    }
  };

  const refetchProfile = async () => {
    if (user?.id) {
      await fetchProfile(user.id);
    }
  };

  const signOut = async () => {
    try {
      setLoading("auth", true);
      await client.auth.signOut();
      clearErrors();
    } catch (error) {
      setError("auth", {
        message: error instanceof Error ? error.message : "Failed to sign out",
        code: "SIGNOUT_ERROR",
        timestamp: Date.now(),
      });
    } finally {
      setLoading("auth", false);
    }
  };

  return {
    user,
    profile,
    loading: loading.auth || loading.profile,
    loadingStates: loading,
    errors,
    isAuthenticated: !!user,
    signOut,
    refetchProfile,
    clearErrors,
  };
};
