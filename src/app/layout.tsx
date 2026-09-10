import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "katex/dist/katex.min.css";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const baseUrl = "https://sat-alfa.uz";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "SAT ALFA — Digital SAT Tayyorgarlik Markazi",
    template: "%s | SAT ALFA",
  },
  description:
    "SAT ALFA — O'zbekistondagi nufuzli Digital SAT tayyorgarlik platformasi. Real Bluebook mock testlar, AI tahlil va professional ta'lim.",
  keywords: [
    "SAT ALFA",
    "Digital SAT Uzbekistan",
    "Digital SAT mock test",
    "SAT tayyorgarlik",
    "SAT kurslari",
    "SAT imtihoni",
    "Bluebook mock test",
    "Digital SAT practice test",
    "SAT Math",
    "SAT Reading and Writing",
  ],
  authors: [{ name: "SAT ALFA" }],
  creator: "SAT ALFA",
  publisher: "SAT ALFA",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "uz_UZ",
    url: baseUrl,
    siteName: "SAT ALFA",
    title: "SAT ALFA — Digital SAT Tayyorgarlik Platformasi",
    description:
      "O'zbekistondagi eng zamonaviy Digital SAT platformasi. Haqiqiy Bluebook formatidagi mock testlar va AI tahlil.",
    images: [
      {
        url: "/images/sat-alfa.jpg",
        width: 800,
        height: 800,
        alt: "SAT ALFA",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SAT ALFA — Digital SAT Tayyorgarlik",
    description: "Premium Digital SAT tayyorgarlik va mock testlar.",
    images: ["/images/sat-alfa.jpg"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-48x48.png", sizes: "48x48", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  verification: {
    google:
      process.env.GOOGLE_SITE_VERIFICATION ||
      process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ||
      "",
  },
  alternates: {
    canonical: baseUrl,
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  name: "SAT ALFA",
  url: baseUrl,
  logo: `${baseUrl}/images/sat-alfa.jpg`,
  description:
    "Digital SAT tayyorgarlik platformasi va o'quv markazi.",
  address: {
    "@type": "PostalAddress",
    addressCountry: "UZ",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="uz"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col transition-all duration-300 bg-slate-50 dark:bg-[#0a0a0a] text-slate-900 dark:text-white">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
