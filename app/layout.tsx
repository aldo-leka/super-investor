import '@/app/ui/globals.css';
import { Metadata } from 'next';
import { inter } from '@/app/ui/fonts';
import AppBar from '@/app/ui/app-bar';
import { auth } from '@/auth';
import { SessionProvider } from 'next-auth/react';
import Footer from '@/app/ui/footer';
import { getTickers } from './lib/tickers';

export const metadata: Metadata = {
  title: {
    template: '%s | Super Investor',
    default: 'Super Investor',
  },
  description: 'Enhance your SEC filings workflow with Super Investor.',
  metadataBase: new URL('https://getsuperinvestor.com'),
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const tickers = await getTickers();

  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <SessionProvider session={session}>
          <AppBar tickers={tickers} />
          {children}
          <Footer />
        </SessionProvider>
      </body>
    </html>
  );
}