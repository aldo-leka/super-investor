import Link from 'next/link';
import Image from 'next/image';

export function Logo() {
    return (
        <Link href="/" className="text-2xl font-bold flex items-center gap-2 hover:opacity-90 transition-opacity">
            <Image src="/favicon.svg" alt="Super Investor Logo" width={48} height={48} className="dark:invert" />
            Super Investor
        </Link>
    );
}