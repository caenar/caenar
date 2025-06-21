import "../styles/globals.css";
import { PT_Serif, Inclusive_Sans } from "next/font/google";
import type { Metadata } from "next";
import { PopupProvider } from "@/shared/context/popup-context";

import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import Popup from "@/components/popup";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { ReactLenis } from "lenis/react";

const ptSerif = PT_Serif({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "700",
});

const inclusiveSans = Inclusive_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Caenar Arteta",
  description:
    "A passionate graphic designer that fell in love with programming. Now turned into a full-stack developer.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <ReactLenis root />
      <body
        className={`flex flex-col min-h-screen ${ptSerif.variable} ${inclusiveSans.variable} antialiased `}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <PopupProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
            <Popup />
            <Toaster theme="dark" />
          </PopupProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
