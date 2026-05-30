import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mood Deck — Tiny quests. No pressure.",
  description:
    "Bốc một ý tưởng nhỏ cho đời sống cá nhân, làm khi thích, rồi ghi nhận lại mỗi lần hoàn thành.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi" className={geist.variable}>
      <body className="bg-surface min-h-screen overflow-x-hidden text-stone-100 antialiased">
        {children}
      </body>
    </html>
  );
}
