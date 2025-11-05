// app/auth/callback/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import client from "@/api/client";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const {
          data: { session },
          error,
        } = await client.auth.getSession();

        if (error) throw error;

        if (session?.user) {
          const { data: profile } = await client
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .single();

          if (!profile) {
            await client.from("profiles").insert({
              id: session.user.id,
              email: session.user.email,
              user_type: "company_admin",
            });
          }

          router.push("/dashboard");
        }
      } catch (error) {
        console.error("Auth callback error:", error);
        router.push("/register");
      }
    };

    handleAuthCallback();
  }, [router]);

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
