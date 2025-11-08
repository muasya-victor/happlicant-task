"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import client from "@/api/client";

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log("Auth callback started");

        const hash = window.location.hash;
        if (hash) {
          const { data, error } = await client.auth.getSession();
          if (error) throw error;
        }

        const {
          data: { session },
          error: sessionError,
        } = await client.auth.getSession();

        if (sessionError) {
          console.error("Session error:", sessionError);
          throw sessionError;
        }

        console.log("Session:", session);

        if (!session?.user) {
          throw new Error("No user session found");
        }

        const user = session.user;
        console.log("User:", user);

        const { data: existingProfile, error: profileCheckError } = await client
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle(); 

        if (profileCheckError) {
          console.error("Profile check error:", profileCheckError);
          throw profileCheckError;
        }

        console.log("Existing profile:", existingProfile);

        if (!existingProfile) {
          console.log("Creating new profile and company...");

          const companyName = user.user_metadata.full_name
            ? `${user.user_metadata.full_name}'s Company`
            : `${user.email?.split("@")[0]}'s Company`;

          const { data: newCompany, error: companyError } = await client
            .from("companies")
            .insert({
              name: companyName,
              description: "Company created via Google sign-up",
            })
            .select()
            .single();

          if (companyError) {
            console.error("Company creation error:", companyError);
            throw companyError;
          }

          console.log("Company created:", newCompany);

          const { error: profileError } = await client.from("profiles").insert({
            id: user.id,
            email: user.email!,
            user_type: "company_admin",
          });

          if (profileError) {
            console.error("Profile creation error:", profileError);

            await client.from("companies").delete().eq("id", newCompany.id);
            throw profileError;
          }

          console.log("Profile created");

          const { error: adminError } = await client
            .from("company_admins")
            .insert({
              user_id: user.id,
              company_id: newCompany.id,
              role: "owner",
            });

          if (adminError) {
            console.error("Admin link error:", adminError);
            throw adminError;
          }

          console.log("Admin link created");
        } else {
          console.log("Profile already exists, skipping creation");
        }

        console.log("Redirecting to dashboard...");
        router.push("/dashboard");
      } catch (error) {
        console.error("Auth callback error:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Authentication failed";
        setError(errorMessage);

        setTimeout(() => {
          router.push(`/login?error=${encodeURIComponent(errorMessage)}`);
        }, 3000);
      } finally {
        setLoading(false);
      }
    };

    handleAuthCallback();
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <h2 className="text-xl font-semibold">Completing sign up...</h2>
          <p className="text-muted-foreground mt-2">
            Please wait while we set up your account.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="max-w-md text-center">
          <h2 className="mb-4 text-xl font-semibold text-red-600">
            Authentication Error
          </h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <div className="space-y-2">
            <button
              onClick={() => router.push("/register")}
              className="w-full rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              Back to Registration
            </button>
            <button
              onClick={() => router.push("/login")}
              className="w-full rounded border border-gray-300 px-4 py-2 hover:bg-gray-50"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
