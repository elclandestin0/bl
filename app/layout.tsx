// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import { WalletProvider } from "./lib/wallet/WalletProvider";
import MetaMaskButton from "./components/wallet/MetaMaskButton";

export const metadata: Metadata = {
  title: "Lend / Borrow — Mock",
  description: "Dirt-cheap, beautiful borrower–lender UX demo.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <WalletProvider>
          <header className="sticky top-0 z-40">
            <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-end">
              <MetaMaskButton />
            </div>
          </header>
          {children}
        </WalletProvider>
      </body>
    </html>
  );
}
