'use client'

import { useState, useEffect, useRef } from "react";
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
import { Ticker } from "@/app/lib/definitions";

export default function AppBar({ tickers }: { tickers: Ticker[] }) {
    const { data: session } = useSession();
    const user = session?.user;
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<{ label: string, value: string }[]>([]);
    const router = useRouter();
    const menuRef = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsUserMenuOpen(false);
            }
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setSearchResults([]);
            }
        }

        function handleSearchFocus() {
            if (searchTerm.length > 0) {
                const filtered = tickers.filter(ticker =>
                    ticker.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    ticker.value.toLowerCase().includes(searchTerm.toLowerCase())
                );
                setSearchResults(filtered);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        const searchInput = searchRef.current?.querySelector('input');
        if (searchInput) {
            searchInput.addEventListener("focus", handleSearchFocus);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            if (searchInput) {
                searchInput.removeEventListener("focus", handleSearchFocus);
            }
        };
    }, [searchTerm, tickers]);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);

        if (term.length > 0) {
            const filtered = tickers.filter(ticker =>
                ticker.label.toLowerCase().includes(term) ||
                ticker.value.toLowerCase().includes(term)
            );
            setSearchResults(filtered);
        } else {
            setSearchResults([]);
        }
    };

    const handleSelectOption = (value: string) => {
        setSearchTerm('');
        setSearchResults([]);
        router.push(`/companies/${value}`);
    };

    const getInitials = (firstName: string | null | undefined, lastName: string | null | undefined) => {
        const first = firstName ? firstName[0] : '';
        const last = lastName ? lastName[0] : '';
        return (first + last).toUpperCase();
    };

    const userInitials = user ? getInitials(user.firstName, user.lastName) : 'G'; // G for Guest User

    return (
        <nav className="bg-blue-600 p-4">
            <div className="container mx-auto flex items-center justify-between">
                <Link href="/" className="text-white text-xl font-bold">
                    Super Investor
                </Link>

                <div className="flex-grow mx-4 relative" ref={searchRef}>
                    <input
                        type="text"
                        placeholder="Ticker or company name"
                        className="w-full p-2 bg-blue-500 text-white placeholder-blue-200 border border-blue-400 rounded focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400"
                        value={searchTerm}
                        onChange={handleSearch}
                    />
                    {searchResults.length > 0 && (
                        <ul className="absolute z-10 w-full bg-white mt-1 rounded-md shadow-lg max-h-60 overflow-auto">
                            {searchResults.map((result) => (
                                <li
                                    key={result.value}
                                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                    onClick={() => handleSelectOption(result.value)}
                                >
                                    {result.label} ({result.value})
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="relative" ref={menuRef}>
                    {user ? (
                        <div className="relative ml-3">
                            <div>
                                <button
                                    type="button"
                                    className="flex rounded-full bg-blue-700 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600"
                                    id="user-menu-button"
                                    aria-expanded="false"
                                    aria-haspopup="true"
                                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                >
                                    <span className="sr-only">Open user menu</span>
                                    <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center text-blue-600 font-bold text-lg shadow-lg border-2 border-blue-300 transition-all duration-200 hover:scale-110">
                                        {userInitials}
                                    </div>
                                </button>
                            </div>
                            {isUserMenuOpen && (
                                <div className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none" role="menu" aria-orientation="vertical" aria-labelledby="user-menu-button" tabIndex={-1}>
                                    <div className="px-4 py-2 text-sm text-gray-500 border-b border-gray-200">
                                        {user?.firstName} {user?.lastName}
                                    </div>
                                    <Link href="/settings/account" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem" tabIndex={-1}>
                                        Account
                                    </Link>
                                    <Link href="/settings/security" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem" tabIndex={-1}>
                                        Password & Security
                                    </Link>
                                    <Link href="/settings/billing" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem" tabIndex={-1}>
                                        Subscription & Billing
                                    </Link>
                                    <div className="border-t border-gray-200 my-1"></div>
                                    <button
                                        onClick={async () => await signOut()}
                                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        role="menuitem"
                                        tabIndex={-1}
                                    >
                                        Sign Out
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link href="/login" className="text-white hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium">
                            Sign In
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
}