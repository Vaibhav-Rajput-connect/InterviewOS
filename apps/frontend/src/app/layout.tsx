import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Syne } from "next/font/google";
import { LenisProvider } from "@/providers/lenis-provider";
import { QueryProvider } from "@/providers/query-provider";
import { ConsoleProvider } from "@/providers/console-provider";
import { ToastContainer } from "@/components/ui/toast";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "InterviewOS — The AI Operating System for Interview Success",
  description:
    "Master every interview with AI-powered mock interviews, coding challenges, resume intelligence, and real-time coaching. The complete platform for interview preparation.",
  keywords: [
    "interview preparation",
    "AI mock interview",
    "coding interview",
    "resume builder",
    "career coaching",
    "interview practice",
  ],
  openGraph: {
    title: "InterviewOS — The AI Operating System for Interview Success",
    description:
      "Master every interview with AI. Practice with intelligent mock interviews, ace coding challenges, and get real-time coaching.",
    type: "website",
    url: "https://interviewos.ai",
    siteName: "InterviewOS",
  },
  twitter: {
    card: "summary_large_image",
    title: "InterviewOS — Master Every Interview with AI",
    description:
      "The AI-powered operating system that prepares you for any interview.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html data-scroll-behavior="smooth"
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} ${syne.variable} antialiased`}
    >
      <body className="min-h-screen bg-[#050816] text-slate-100 font-sans">
        <a
          href="#main-content"
          className="skip-link"
        >
          Skip to main content
        </a>
        <ConsoleProvider>
          <QueryProvider>
            <LenisProvider>
              {children}
              <ToastContainer />
            </LenisProvider>
          </QueryProvider>
        </ConsoleProvider>
      </body>
    </html>
  );
}
