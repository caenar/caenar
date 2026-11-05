import "../styles/globals.css";
import { Inclusive_Sans, Google_Sans_Code } from "next/font/google";
import type { Metadata } from "next";
import { PopupProvider } from "@/shared/context/popup-context";

import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import Popup from "@/components/popup";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import SmoothScroll from "@/components/scroll-smooth";

const inclusiveSans = Inclusive_Sans({
  variable: "--font-normal",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const googleSansCode = Google_Sans_Code({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
  adjustFontFallback: false,
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
      <SmoothScroll />
      <body
        className={`flex flex-col min-h-screen ${googleSansCode.variable} ${inclusiveSans.variable} antialiased `}
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
