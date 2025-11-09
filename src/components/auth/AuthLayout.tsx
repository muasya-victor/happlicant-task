import React from "react";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="grid min-h-screen grid-cols-1 bg-white md:grid-cols-4">
      {/* left */}
      <div className="relative col-span-1 hidden bg-[url('/images/login.jpg')] bg-cover bg-center bg-no-repeat md:block">
        <div className="absolute inset-0 bg-black/20"></div>

        <div className="absolute top-8 left-8 z-10">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-xl font-bold text-white">Happlicant</h1>
            </div>
          </div>
        </div>

        <div className="absolute right-0 bottom-0 left-0 bg-linear-to-t from-black/80 to-transparent p-8">
          <div className="max-w-md">
            <h2 className="mb-4 text-3xl leading-tight font-bold text-white">
              Streamline Your Hiring with Happlicant
            </h2>
          </div>
        </div>
      </div>

      {/* right */}
      <div className="col-span-3 flex items-center justify-center p-6">
        {children}
      </div>
    </div>
  );
}
