import { Merriweather } from "next/font/google";
import "./globals.css";
import { defaultMetadata } from "@/metadata";
import Script from "next/script";
import Providers from "@/components/Providers";

const merriweather = Merriweather({
    variable: "--font-merriweather",
    subsets: ["latin"],
    weight: ["400"]
});

export const metadata = defaultMetadata;

export default function RootLayout(
    {
        children,
    }: Readonly<{ children: React.ReactNode; }>
) {
    return (
        <html lang="en">
            <body className={`${merriweather.className} antialiased`}>
                <Providers>
                    {children}
                </Providers>
                <Script
                    src="https://accounts.google.com/gsi/client"
                    strategy="afterInteractive"
                />
            </body>
        </html>
    );
}
