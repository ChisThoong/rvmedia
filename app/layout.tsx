import type { ReactNode } from "react";
import "./globals.css";
import { Be_Vietnam_Pro, Merriweather } from "next/font/google";

const beVietnam = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-body"
});

const merriweather = Merriweather({
  subsets: ["latin", "vietnamese"],
  weight: ["300", "700"],
  variable: "--font-heading"
});

export const metadata = {
  title: "RV Media | Premium 360° Virtual Tours",
  description: "Premium 360° virtual tours for real estate and hospitality."
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.css"
        />
      </head>
      <body className={`${beVietnam.variable} ${merriweather.variable}`}>
        {children}
      </body>
    </html>
  );
}
