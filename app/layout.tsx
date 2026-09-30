import type { Metadata, Viewport } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#089744",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: "Corex Arena and Academy | Football Turf Booking in Mirpur, Dhaka",
  description:
    "Book premium football turf slots at Corex Arena and Academy in Shagufta, Mirpur 12, Dhaka. FIFA standard artificial turf, floodlights, academy coaching & easy bKash booking.",
  keywords: [
    "Corex Arena",
    "Football Turf Dhaka",
    "Mirpur Turf Booking",
    "Corex Academy",
    "Football Ground Dhaka",
    "Turf Booking Bangladesh",
    "Shagufta Mirpur Football",
  ],
  authors: [{ name: "Corex Arena and Academy" }],
  openGraph: {
    title: "Corex Arena and Academy | Football Turf Booking",
    description: "Book premium football turf slots in Mirpur 12, Dhaka. Day slots ৳2,000 / Night slots ৳4,000.",
    url: "https://corexarena.com",
    siteName: "Corex Arena and Academy",
    images: [
      {
        url: "/assets/cover.jpg",
        width: 1200,
        height: 630,
        alt: "Corex Arena and Academy Football Turf",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  icons: {
    icon: "/assets/logo.jpg",
    apple: "/assets/logo.jpg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable} dark scroll-smooth`}>
      <body className="min-h-screen bg-stadium-950 text-stadium-100 flex flex-col font-sans selection:bg-pitch-500 selection:text-stadium-950">
        {children}
      </body>
    </html>
  );
}
