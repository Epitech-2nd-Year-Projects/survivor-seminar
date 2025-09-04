import "@/styles/globals.css";
import { ThemeProvider } from "@/components/theme-provider";

import { type Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Survivor",
  description: "Show case projects from startup incubator",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <html lang="en" suppressHydrationWarning className={inter.className}>
        <head />
        <body>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Providers>{children}</Providers>
          </ThemeProvider>
        </body>
      </html>
    </>
  );
}
