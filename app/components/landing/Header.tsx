import Link from 'next/link';
import { TrendingUp } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { MobileNav } from './MobileNav';

export function Header() {
    return (
        <header className="border-b">
            <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                    <Link href="/" className="text-2xl font-bold flex items-center gap-2 hover:opacity-90 transition-opacity">
                        <TrendingUp className="h-6 w-6 text-green-600" />
                        Super Investor
                    </Link>
                    <div className="flex items-center gap-4">
                        <nav className="hidden md:flex items-center gap-6">
                            <Link href="/#features" className="text-muted-foreground hover:text-foreground transition-colors">
                                Features
                            </Link>
                            <Link href="/#pricing" className="text-muted-foreground hover:text-foreground transition-colors">
                                Pricing
                            </Link>
                            <Link href="/#faq" className="text-muted-foreground hover:text-foreground transition-colors">
                                FAQ
                            </Link>
                        </nav>
                        <div className="hidden md:flex items-center gap-2">
                            <Link href="/dashboard">
                                <Button variant="outline">Sign in</Button>
                            </Link>
                        </div>
                        <MobileNav />
                    </div>
                </div>
            </div>
        </header>
    );
}