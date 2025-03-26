'use client';

import Link from 'next/link';
import {FileText} from 'lucide-react';

const footerLinks = {
    links: [
        {title: 'Support', href: 'mailto:aldo.leka@live.com'},
        {title: 'Pricing', href: '/pricing'},
        {title: 'Blog', href: '/blog'},
        {title: 'Affiliates', href: '/affiliates'}
    ],
    platforms: [
        {title: 'SEC EDGAR', href: '#'},
        {title: '10-K Reports', href: '#'},
        {title: '10-Q Reports', href: '#'},
        {title: '8-K Reports', href: '#'},
        {title: 'Form 4 Filings', href: '#'},
        {title: 'Form 13F Filings', href: '#'},
        {title: 'Proxy Statements', href: '#'}
    ],
    legal: [
        {title: 'Terms of service', href: '/terms'},
        {title: 'Privacy policy', href: '/privacy'}
    ]
};

export function Footer() {
    return (
        <footer className="py-16 border-t">
            <div className="container mx-auto px-4">
                <div className="grid md:grid-cols-4 gap-12">
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <FileText className="h-6 w-6"/>
                            <span className="font-bold">Super Investor</span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">
                            Analyze SEC filings and track companies at the same time, all-in-one place. Research made
                            easy.
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Copyright © 2025 - All rights reserved
                        </p>
                    </div>
                    <div>
                        <h3 className="font-semibold mb-4">Links</h3>
                        <ul className="space-y-2">
                            {footerLinks.links.map((link) => (
                                <li key={link.title}>
                                    <Link href={link.href}
                                          className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                                        {link.title}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-semibold mb-4">Platforms</h3>
                        <ul className="space-y-2">
                            {footerLinks.platforms.map((platform) => (
                                <li key={platform.title}>
                                    <Link href={platform.href}
                                          className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                                        {platform.title}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-semibold mb-4">Legal</h3>
                        <ul className="space-y-2">
                            {footerLinks.legal.map((item) => (
                                <li key={item.title}>
                                    <Link href={item.href}
                                          className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                                        {item.title}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </footer>
    );
}