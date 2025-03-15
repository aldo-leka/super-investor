import type {Metadata} from "next";
import {Merriweather} from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import {StonksContextProvider} from "@/store/StonksContext";

const merriweather = Merriweather({
    variable: "--font-merriweather",
    subsets: ["latin"],
    weight: ["400"]
});

export const metadata: Metadata = {
    title: "Stonks",
    description: "A Convenient Stocks Reader",
};

export default function RootLayout(
    {
        children,
    }: Readonly<{ children: React.ReactNode; }>
) {
    return (
        <html lang="en">
        <body
            className={`${merriweather.className} antialiased`}
        >
        <StonksContextProvider>
            <Navbar/>
            {children}
        </StonksContextProvider>
        </body>
        </html>
    );
}
