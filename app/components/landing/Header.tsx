'use client';

import Link from 'next/link';
import { User } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { MobileNav } from './MobileNav';
import { useAuth } from '@/lib/auth';
import { Logo } from '../Logo';

export function Header() {
    const { user, loading } = useAuth();

    return (
        <header className="border-b">
            <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                    <Logo />
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
                        {!loading && (
                            <>
                                {user ? (
                                    <Link href="/dashboard">
                                        <Button variant="ghost" className="flex items-center gap-2">
                                            <User className="h-4 w-4" />
                                            <span>{user.email}</span>
                                        </Button>
                                    </Link>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <Link href="/login">
                                            <Button variant="outline">Sign in</Button>
                                        </Link>
                                    </div>
                                )}
                            </>
                        )}
                        <MobileNav />
                    </div>
                </div>
            </div>
        </header>
    );
}