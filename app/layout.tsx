import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Borrower & lend stuff and things",
  description: "Hello, this is a place for everything stuff and things",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}