"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import client from "@/api/client";
import { useAuthStore } from "@/store/auth-store";
import type { Profile } from "@/types/user";
import type { Company } from "@/types/company";

// Define proper types for RPC response
interface RPCResponse {
  error: Error | null;
  data?: unknown;
}

export default function AuthCallback() {
  const router = useRouter();
  const {
    setUser,
    setProfile,
    refetchCompanies,
    setCurrentCompany,
    setLoading,
    setError,
  } = useAuthStore();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        setLoading("auth", true);

        // Get the session from Supabase
        const sessionResult = await client.auth.getSession();
        if (sessionResult.error) throw sessionResult.error;

        const user = sessionResult.data.session?.user ?? null;
        if (!user) throw new Error("No user session found");
        setUser(user);

        // Check if a profile exists with proper typing
        const profileResult = await client
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();

        if (profileResult.error) {
          console.error("Profile fetch error:", profileResult.error);
          throw new Error("Failed to fetch user profile");
        }

        const existingProfile: Profile | null = profileResult.data;

        // If no profile exists, create one via RPC
        if (!existingProfile) {
          const companyName =
            user.user_metadata?.full_name ??
            user.email?.split("@")[0] ??
            "New Company";

          const rpcResult = (await client.rpc("create_company_admin_profile", {
            user_id: user.id,
            user_email: user.email ?? "",
            company_name: companyName,
            company_description: "Company created via Google sign-up",
          })) as RPCResponse;

          if (rpcResult.error) throw rpcResult.error;
        }

        // Fetch companies and set current company safely
        await refetchCompanies();

        const state = useAuthStore.getState();
        const firstCompany: Company | null = state.companies[0] ?? null;

        if (!state.currentCompany && firstCompany) {
          setCurrentCompany(firstCompany);
        }

        // Create fallback profile that matches Profile type
        const fallbackProfile: Profile = {
          id: user.id,
          email: user.email ?? "",
          user_type: "company_admin",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        // Safe assignment - both sides are properly typed
        setProfile(existingProfile ?? fallbackProfile);

        router.push("/dashboard/companies");
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Authentication failed";
        console.error("Auth callback error:", message);

        setError("auth", {
          message,
          code: "AUTH_CALLBACK_ERROR",
          timestamp: Date.now(),
        });

        setTimeout(
          () => router.push(`/login?error=${encodeURIComponent(message)}`),
          3000,
        );
      } finally {
        setLoading("auth", false);
      }
    };

    void handleAuthCallback();
  }, [
    router,
    setUser,
    setProfile,
    refetchCompanies,
    setCurrentCompany,
    setLoading,
    setError,
  ]);

  return null;
}
