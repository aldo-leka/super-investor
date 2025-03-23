import type {Metadata} from "next";
import {Merriweather} from "next/font/google";
import "./globals.css";

const merriweather = Merriweather({
    variable: "--font-merriweather",
    subsets: ["latin"],
    weight: ["400"]
});

export const metadata: Metadata = {
    title: "Super Investor",
    description: "Analyze SEC filings with ease",
    openGraph: {
        title: "Super Investor",
        description: "Analyze SEC filings with ease",
        url: "https://superinvestor.pro",
        siteName: "Super Investor",
        images: [
            {
                url: "https://superinvestor.pro/og-image.png",
                width: 1200,
                height: 630,
                alt: "Super Investor Preview",
            },
        ],
        locale: "en_US",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Super Investor",
        description: "Analyze SEC filings with ease",
        images: ["https://superinvestor.pro/og-image.png"],
        creator: "@aldo_valueguy",
    },
};

export default function RootLayout(
    {
        children,
    }: Readonly<{ children: React.ReactNode; }>
) {
    return (
        <html lang="en">
        <body className={`${merriweather.className} antialiased`}>
            {children}
        </body>
        </html>
    );
}
