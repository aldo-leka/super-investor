import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Logo } from '@/components/Logo';
import UserMenu from '@/components/UserMenu';

export function Header() {
    return (
        <header className="border-b">
            <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                    <Logo />
                    <div className="flex items-center gap-4">
                        <Link href="/pricing">
                            <Button>
                                <Sparkles className="mr-2 h-4 w-4" />
                                Upgrade to Pro
                            </Button>
                        </Link>
                        <UserMenu />
                    </div>
                </div>
            </div>
        </header>
    );
}

export default Header; 