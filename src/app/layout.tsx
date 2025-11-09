import Sidebar from "@/components/layout/sidebar";
import TopNavbar from "@/components/layout/top-nav";
import "@/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";

export const metadata: Metadata = {
  title: "Happlicant Task",
  description: "Happlicant Task",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable}`}>
      <body>
        <div className="flex min-h-screen w-screen bg-gray-50">
          <div className="w-screen flex min-h-screen  flex-1 flex-col transition-all">
            <TopNavbar />
            <div className="flex h-full w-full flex-1 border">
              <Sidebar />
              <main className="flex-1 p-4 md:p-6">{children}</main>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
