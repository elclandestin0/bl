// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import { WalletProvider } from "./lib/wallet/WalletProvider";
// If you’re using React Query as earlier, keep it here too.

export const metadata: Metadata = {
  title: "Lend / Borrow — Mock",
  description: "Dirt-cheap, beautiful borrower–lender UX demo.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <WalletProvider>
          {children}
        </WalletProvider>
      </body>
    </html>
  );
}
