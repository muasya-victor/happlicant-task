// hooks/useAuth.ts
import { useEffect } from "react";
import { User } from "@supabase/supabase-js";
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
    // Get initial session
    client.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading("auth", false);
        setLoading("profile", false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = client.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchProfile(session.user.id);
        clearErrors();
      } else {
        setProfile(null);
        setLoading("auth", false);
        setLoading("profile", false);
      }
    });

    return () => subscription.unsubscribe();
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
      setLoading("profile", false);
      setLoading("auth", false);
    }
  };

  const refetchProfile = async () => {
    if (user?.id) {
      await fetchProfile(user.id);
    }
  };

  const signOut = async () => {
    try {
      await client.auth.signOut();
      clearErrors();
    } catch (error) {
      setError("auth", {
        message: error instanceof Error ? error.message : "Failed to sign out",
        code: "SIGNOUT_ERROR",
        timestamp: Date.now(),
      });
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
