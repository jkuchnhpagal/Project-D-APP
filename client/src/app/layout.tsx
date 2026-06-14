import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ClientLayoutWrapper } from "../components/ClientLayoutWrapper";

export const metadata: Metadata = {
  title: "Astraea | Futuristic Web3 dApp Portal",
  description: "Experience the next generation of decentralized finance and web3 applications. Connect wallets, stake tokens, swap, participate in governance, and explore live blockchains in premium 3D graphics.",
  keywords: ["blockchain", "web3", "dapp", "defi", "staking", "dao", "cross-chain", "nextjs", "ethereum"],
  authors: [{ name: "Astraea Labs" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ClientLayoutWrapper>{children}</ClientLayoutWrapper>
      </body>
    </html>
  );
}
