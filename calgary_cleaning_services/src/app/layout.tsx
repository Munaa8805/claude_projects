import type { Metadata } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  axes: ["wdth", "opsz"],
});

export const metadata: Metadata = {
  title: "Chinook Clean Co. | House & office cleaning in Calgary",
  description:
    "Home, deep, move-out and office cleaning across Calgary, Airdrie, Cochrane and Chestermere. See prices and book online.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${bricolage.variable} antialiased`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
