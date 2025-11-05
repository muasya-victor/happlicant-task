// app/auth/callback/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import client from "@/api/client";

export default function AuthCallback() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await client.auth.getSession();

        if (sessionError) throw sessionError;

        if (session?.user) {
          const { data: existingProfile } = await client
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .single();

          if (!existingProfile) {
            const { data: newCompany, error: companyError } = await client
              .from("companies")
              .insert({
                name: `${session.user.user_metadata.full_name || session.user.email?.split("@")[0]}'s Company`,
                description: "Company created via Google sign-up",
              })
              .select()
              .single();

            if (companyError) throw companyError;

            // Create profile
            const { error: profileError } = await client
              .from("profiles")
              .insert({
                id: session.user.id,
                email: session.user.email!,
                user_type: "company_admin",
              });

            if (profileError) throw profileError;

            // Link user as company admin
            const { error: adminError } = await client
              .from("company_admins")
              .insert({
                user_id: session.user.id,
                company_id: newCompany.id,
                role: "owner",
              });

            if (adminError) throw adminError;
          }

          router.push("/dashboard");
        } else {
          throw new Error("No session found");
        }
      } catch (error) {
        console.error("Auth callback error:", error);
        setError(
          error instanceof Error ? error.message : "Authentication failed",
        );
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
          <h2 className="text-lg font-semibold">Completing sign up...</h2>
          <p className="text-muted-foreground">
            Please wait while we set up your account.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-red-600">
            Authentication Error
          </h2>
          <p className="text-muted-foreground">{error}</p>
          <button
            onClick={() => router.push("/register")}
            className="mt-4 text-blue-600 hover:underline"
          >
            Back to registration
          </button>
        </div>
      </div>
    );
  }

  return null;
}
