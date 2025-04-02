import { Metadata } from 'next';

export const siteConfig = {
  name: 'Super Investor',
  description: 'Advanced SEC filing analysis and insights for investors',
  url: 'https://superinvestor.pro',
  ogImage: 'https://superinvestor.pro/og.jpg',
  links: {
    twitter: 'https://twitter.com/Super__Investor',
    github: 'https://github.com/superinvestor',
  },
};

export const defaultMetadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    'SEC filings',
    'investment analysis',
    'financial data',
    'stock market',
    'investing',
  ],
  authors: [
    {
      name: 'Super Investor',
      url: siteConfig.url,
    },
  ],
  creator: 'Super Investor',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.name,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
    creator: '@aldoleka',
  },
  icons: {
    icon: '/favicon.svg',
    // shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
};