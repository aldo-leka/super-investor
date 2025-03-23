"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Search, TrendingUp } from 'lucide-react';
import { Stock } from "@/types";

interface SearchBarProps {
    onSearch: (query: string) => void;
    onStockSelect: (stock: Stock) => void;
    searchResults: Stock[];
}

export function SearchBar({ onSearch, onStockSelect, searchResults }: SearchBarProps) {
    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setQuery(value);

        if (value.length >= 1) {
            onSearch(value);
            setIsOpen(true);
        } else {
            setIsOpen(false);
        }
    };

    const handleStockSelect = (stock: Stock) => {
        setQuery(stock.symbol ? `${stock.symbol} - ${stock.companyName}` : stock.companyName);
        setIsOpen(false);
        onStockSelect(stock);
    };

    return (
        <div ref={searchRef} className="w-full max-w-2xl relative group">
            <div className="relative">
                <input
                    type="text"
                    value={query}
                    onChange={handleInputChange}
                    placeholder="Search for stocks (e.g., AAPL, Apple Inc.)"
                    className="w-full px-5 py-4 pl-12 pr-36 text-gray-900 border-2 border-gray-200 rounded-xl
                   focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300
                   group-hover:border-gray-300 text-lg"
                />
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400" />
            </div>

            {/* Search suggestions dropdown */}
            {isOpen && searchResults.length > 0 && (
                <div className="absolute w-full mt-2 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                    {searchResults.map((stock) => (
                        <button
                            key={`${stock.cik}-${stock.symbol ?? stock.companyName}`}
                            onClick={() => handleStockSelect(stock)}
                            className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 group"
                        >
                            <TrendingUp className="h-5 w-5 text-gray-400 group-hover:text-blue-500" />
                            <div>
                                <div className="font-medium text-gray-900">{stock.symbol ?? '—'}</div>
                                <div className="text-sm text-gray-500">{stock.companyName}</div>
                            </div>
                        </button>
                    ))}
                </div>
            )}

            <div className="absolute -bottom-6 left-4 text-sm text-gray-500">
                Try searching by company name or stock symbol
            </div>
        </div>
    );
}
