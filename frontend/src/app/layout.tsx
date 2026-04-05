import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'Stellar Reward Vault | Green Belt',
  description:
    'A production-ready reward distribution dApp on the Stellar blockchain. Connect your wallet and claim your SRT reward tokens.',
  metadataBase: new URL('https://stellar-reward-vault.vercel.app'),
  openGraph: {
    title: 'Stellar Reward Vault',
    description: 'Claim your Stellar Reward Tokens from the vault.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
