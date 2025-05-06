import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Toaster } from '@/components/ui/sonner';
import { SessionProvider } from '@/components/session-provider';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "shorly.uk - URL Shortener with Analytics",
  description: "Simple, powerful URL shortening service with detailed analytics and tracking.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionProvider>
          <div className="relative flex min-h-screen flex-col">
            <Header />
            <main className="flex-1 px-4 sm:px-6 md:px-8 lg:px-10">
              {children}
            </main>
            <Footer />
          </div>
          <Toaster />
        </SessionProvider>
      </body>
    </html>
  );
}
