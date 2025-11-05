import "@/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";
import { CompanyProvider } from "@/context/CompanyContext";

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
        <CompanyProvider>{children}</CompanyProvider>
      </body>
    </html>
  );
}
