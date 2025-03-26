'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, Play } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const benefits = [
    "Access and analyze SEC filings in a clean, readable format",
    "Download financial tables and data in CSV format",
    "Get instant alerts for new filings from companies you follow",
    "Take notes and create custom research templates"
];

const userTypes = ["investors", "analysts", "researchers"];

const avatars = [
    { src: "https://i.pravatar.cc/150?img=1", fallback: "JB" },
    { src: "https://i.pravatar.cc/150?img=2", fallback: "MW" },
    { src: "https://i.pravatar.cc/150?img=3", fallback: "SB" },
    { src: "https://i.pravatar.cc/150?img=4", fallback: "RD" },
    { src: "https://i.pravatar.cc/150?img=5", fallback: "AK" },
];

export function Hero() {
    const [userTypeIndex, setUserTypeIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setUserTypeIndex((current) => (current + 1) % userTypes.length);
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    return (
        <section className="py-20">
            <div className="container mx-auto px-4">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div>
                        <h1 className="text-5xl font-bold mb-6">
                            SEC Filings,{' '}
                            <span className="text-green-600">Simplified</span>
                        </h1>
                        <p className="text-xl text-muted-foreground mb-8">
                            Stop struggling with EDGAR. Get a modern, intuitive platform that makes SEC filings easy to read, analyze, and track. Perfect for investors who value their time.
                        </p>

                        {/* Benefits List */}
                        <ul className="space-y-4 mb-8">
                            {benefits.map((benefit, index) => (
                                <li key={index} className="flex items-center gap-2">
                                    <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center">
                                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                                    </div>
                                    <span>{benefit}</span>
                                </li>
                            ))}
                        </ul>

                        <div className="flex items-center gap-4 mb-8">
                            <Link href="/#pricing">
                                <Button size="lg" className="gap-2">
                                    Start free trial <ArrowRight className="h-4 w-4" />
                                </Button>
                            </Link>
                            <Button variant="outline" size="lg" asChild className="gap-2">
                                <Link href="/#demo">
                                    <Play className="h-4 w-4" />
                                    See how it works
                                </Link>
                            </Button>
                        </div>

                        {/* Social Proof */}
                        <div>
                            <div className="flex -space-x-2 mb-2">
                                {avatars.map((avatar, i) => (
                                    <Avatar key={i} className="border-2 border-background">
                                        <AvatarImage src={avatar.src} />
                                        <AvatarFallback>{avatar.fallback}</AvatarFallback>
                                    </Avatar>
                                ))}
                            </div>
                            <div className="flex items-center gap-1">
                                <div className="flex items-center">
                                    {[...Array(5)].map((_, i) => (
                                        <svg
                                            key={i}
                                            className="h-5 w-5 text-yellow-400 fill-current"
                                            viewBox="0 0 20 20"
                                        >
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                    ))}
                                </div>
                                <span className="font-medium">Trusted by</span>{' '}
                                <span className="text-muted-foreground">{userTypes[userTypeIndex]}</span>
                            </div>
                        </div>
                    </div>

                    {/* Right side image */}
                    <div className="relative">
                        <img
                            src="/dashboard-preview.png"
                            alt="SEC filing analysis dashboard"
                            className="rounded-lg shadow-2xl"
                        />
                        <div className="absolute -bottom-4 -right-4 bg-white rounded-lg p-4 shadow-lg">
                            <div className="text-sm font-medium">Latest Filing Alert</div>
                            <div className="flex items-center gap-2 mt-2">
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                                <span className="text-sm text-muted-foreground">10-Q from AAPL processed</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}