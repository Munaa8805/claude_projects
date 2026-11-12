import type { Metadata } from "next";
import { Archivo } from "next/font/google";
import "./globals.css";

// Variable Archivo with its width axis, so one family covers condensed display and body text.
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  axes: ["wdth"],
});

export const metadata: Metadata = {
  title: "Calorie Tracker",
  description: "Log what you eat and see today's calories and macros at a glance.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${archivo.variable} antialiased`}>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
