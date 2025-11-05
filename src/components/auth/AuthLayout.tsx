import React from "react";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="grid min-h-screen grid-cols-1 md:grid-cols-4">
      <div className="relative col-span-1 hidden bg-[url('/images/login.jpg')] bg-cover bg-center bg-no-repeat md:block">
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black/20"></div>

        {/* Logo at top */}
        <div className="absolute top-8 left-8 z-10">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-xl font-bold text-white">MUASYA ATS</h1>
            </div>
          </div>
        </div>

        {/* Content overlay at bottom */}
        <div className="absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black/80 to-transparent p-8">
          <div className="max-w-md">
            {/* Badge */}
            <div className="mb-6 inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 backdrop-blur-sm">
              <div className="mr-2 h-2 w-2 animate-pulse rounded-full bg-green-400"></div>
              <span className="text-sm font-medium text-white/90">
                Trusted by 500+ Companies
              </span>
            </div>

            {/* Main content */}
            <h2 className="mb-4 text-3xl leading-tight font-bold text-white">
              Streamline Your Hiring with Muasya ATS
            </h2>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-1/4 right-8 h-20 w-20 rounded-full bg-blue-400/20 blur-xl"></div>
        <div className="absolute bottom-1/3 left-12 h-16 w-16 rounded-full bg-purple-400/20 blur-xl"></div>
      </div>

      <div className="col-span-3 flex items-center justify-center p-6">
        {children}
      </div>
    </div>
  );
}
