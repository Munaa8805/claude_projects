import type { Metadata } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import "./globals.css";

// Variable Bricolage Grotesque: the width and optical-size axes give one family
// a compressed display cut for the heading and a calm text cut for tasks.
const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  axes: ["wdth", "opsz"],
});

export const metadata: Metadata = {
  title: "To do",
  description: "A simple to-do list with due dates, priorities, and drag-to-reorder.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${bricolage.variable} antialiased`}>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
