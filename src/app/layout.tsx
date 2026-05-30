import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { ViewTransitions } from "next-view-transitions";
import { AppChrome } from "@/components/app/AppChrome";
import { Providers } from "./providers";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const APP_NAME = "Kairos Drift";
const APP_DESCRIPTION =
  "Bốc một ý tưởng nhỏ cho đời sống cá nhân, làm khi thích, rồi ghi nhận lại mỗi lần hoàn thành.";

export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: `${APP_NAME} — Tiny quests. No pressure.`,
  description: APP_DESCRIPTION,
  // Lets iOS launch the installed app full-screen with a matching status bar.
  appleWebApp: {
    capable: true,
    title: APP_NAME,
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  // Match the cozy near-black surface so the OS chrome blends into the app.
  themeColor: "#11100f",
  width: "device-width",
  initialScale: 1,
  // Draw under the notch / home indicator to pair with the full-bleed deck.
  viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi" className={geist.variable}>
      <body className="bg-surface min-h-screen overflow-x-hidden text-stone-100 antialiased">
        <ViewTransitions>
          <Providers>
            <AppChrome>{children}</AppChrome>
          </Providers>
        </ViewTransitions>
      </body>
    </html>
  );
}
