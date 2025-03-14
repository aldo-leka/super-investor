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
        <div className="min-h-screen bg-[#3b2b1b]">
            <StonksContextProvider>
                <Navbar/>
                <main className="container mx-auto p-6">
                    {children}
                </main>
            </StonksContextProvider>
        </div>
        </body>
        </html>
    );
}
