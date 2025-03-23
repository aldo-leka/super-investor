'use client';

import { useState } from 'react';
import { SearchBar } from '@/components/SearchBar';
import { FilingList } from '@/components/FilingList';
import { FilingViewer } from '@/components/FilingViewer';
import { FormTypeFilter } from '@/components/FormTypeFilter';
import { WelcomeGuide } from '@/components/WelcomeGuide';
import { AuthModal } from '@/components/AuthModal';
import { UserMenu } from '@/components/UserMenu';
import { Filing, FormType, Note, Stock } from '@/types';
import { mockFilings, mockNotes } from '@/lib/mockData';

export default function Home() {
    const [searchResults, setSearchResults] = useState<Stock[]>([]);
    const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
    const [selectedFiling, setSelectedFiling] = useState<Filing | null>(null);
    const [selectedFormType, setSelectedFormType] = useState<FormType>('ALL');
    const [notes, setNotes] = useState<Note[]>(mockNotes);
    const [hasSearched, setHasSearched] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

    const handleSearch = async (query: string) => {
        setHasSearched(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/tickers/search?q=${encodeURIComponent(query)}`);
            const data: Stock[] = await res.json();

            const results = data.sort((a, b) => {
                const input = query.toLowerCase();
                const aTicker = (a.ticker ?? '').toLowerCase();
                const bTicker = (b.ticker ?? '').toLowerCase();
                const aName = a.company_name.toLowerCase();
                const bName = b.company_name.toLowerCase();

                if (aTicker === input) return -1;
                if (bTicker === input) return 1;

                if (aTicker.startsWith(input) && !bTicker.startsWith(input)) return -1;
                if (!aTicker.startsWith(input) && bTicker.startsWith(input)) return 1;

                if (aName.startsWith(input) && !bName.startsWith(input)) return -1;
                if (!aName.startsWith(input) && bName.startsWith(input)) return 1;

                if (aTicker.includes(input) && !bTicker.includes(input)) return -1;
                if (!aTicker.includes(input) && bTicker.includes(input)) return 1;

                if (aName.includes(input) && !bName.includes(input)) return -1;
                if (!aName.includes(input) && bName.includes(input)) return 1;

                return aName.localeCompare(bName);
            });

            setSearchResults(results);
        } catch (error) {
            console.error('Error fetching search results:', error);
            setSearchResults([]);
        }

        setSelectedStock(null);
        setSelectedFiling(null);
    };

    const handleStockSelect = (stock: Stock) => {
        setSelectedStock(stock);
        setSearchResults([]);
    };

    const handleAddNote = (noteData: Omit<Note, 'id' | 'timestamp'>) => {
        const newNote: Note = {
            ...noteData,
            id: Math.random().toString(36).substr(2, 9),
            timestamp: new Date().toISOString(),
        };
        setNotes(prev => [...prev, newNote]);
    };

    const stockFilings = selectedStock
        ? mockFilings.filter(filing => filing.symbol === selectedStock.ticker)
        : [];

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-12">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 inline-block text-transparent bg-clip-text">
                        Super Investor
                    </h1>
                    <UserMenu onAuthClick={() => setIsAuthModalOpen(true)} />
                </div>

                <div className="flex flex-col items-center mb-12">
                    <SearchBar
                        onSearch={handleSearch}
                        onStockSelect={handleStockSelect}
                        searchResults={searchResults}
                    />
                </div>

                {!hasSearched && <WelcomeGuide />}

                {selectedStock && !selectedFiling && (
                    <div className="space-y-8">
                        <div className="bg-white rounded-lg p-6 shadow-md">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedStock.company_name}</h2>
                            <p className="text-gray-600">What do i put in here?</p>
                        </div>
                        <FormTypeFilter
                            selectedType={selectedFormType}
                            onTypeSelect={setSelectedFormType}
                        />
                        <FilingList
                            filings={stockFilings}
                            selectedFormType={selectedFormType}
                            onFilingSelect={setSelectedFiling}
                        />
                    </div>
                )}

                {selectedFiling && (
                    <FilingViewer
                        filing={selectedFiling}
                        notes={notes}
                        onAddNote={handleAddNote}
                    />
                )}

                <AuthModal
                    isOpen={isAuthModalOpen}
                    onClose={() => setIsAuthModalOpen(false)}
                />
            </div>
        </div>
    );
}