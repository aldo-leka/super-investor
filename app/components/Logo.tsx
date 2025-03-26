import Link from 'next/link';
import { TrendingUp } from 'lucide-react';

export function Logo() {
    return (
        <Link href="/" className="text-2xl font-bold flex items-center gap-2 hover:opacity-90 transition-opacity">
            <TrendingUp className="h-6 w-6 text-green-600" />
            Super Investor
        </Link>
    );
}