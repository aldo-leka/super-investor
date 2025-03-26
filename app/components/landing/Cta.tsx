'use client';

import Link from 'next/link';
import { Button } from "@/components/ui/button";

export function CTA() {
    return (
        <section className="py-32 relative">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1642543492481-44e81e3914a6?auto=format&fit=crop&q=80')] bg-cover bg-center">
                <div className="absolute inset-0 bg-black/60"></div>
            </div>
            <div className="container mx-auto px-4 relative">
                <div className="max-w-3xl mx-auto text-center text-white">
                    <h2 className="text-4xl font-bold mb-4">Get more views, with less effort</h2>
                    <p className="text-xl mb-8 text-white/80">
                        Analyze SEC filings in 30 seconds instead of 30 minutes.
                    </p>
                    <Link href="/dashboard">
                        <Button size="lg" variant="secondary" className="gap-2">
                            Try for free
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    );
}