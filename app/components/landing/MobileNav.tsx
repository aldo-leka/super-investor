'use client';

import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import Link from "next/link";
import { useState } from "react";
import { Separator } from "@/components/ui/separator";

const links = [
    { href: '/#features', label: 'Features' },
    { href: '/#pricing', label: 'Pricing' },
    { href: '/#faq', label: 'FAQ' },
];

export function MobileNav() {
    const [open, setOpen] = useState(false);

    return (
        <Sheet modal={false} open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Toggle menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full max-w-[300px] sm:max-w-[300px] p-6">
                <SheetHeader>
                    <SheetTitle></SheetTitle>
                    <SheetDescription>
                    </SheetDescription>
                </SheetHeader>
                <nav className="flex flex-col space-y-4">
                    {links.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="py-2 text-base font-medium transition-colors hover:text-primary"
                        >
                            {link.label}
                        </Link>
                    ))}
                    <Separator className="my-6" />
                    <Link 
                        href="/dashboard" 
                        onClick={() => setOpen(false)}
                        className="w-full"
                    >
                        <Button variant="default" size="lg" className="w-full">
                            Login
                        </Button>
                    </Link>
                </nav>
            </SheetContent>
        </Sheet>
    );
}