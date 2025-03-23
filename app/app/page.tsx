'use client';

import {useState} from 'react';
import {SearchBar} from '@/components/SearchBar';
import {FilingList} from '@/components/FilingList';
import {FilingViewer} from '@/components/FilingViewer';
import {FormTypeFilter} from '@/components/FormTypeFilter';
import {WelcomeGuide} from '@/components/WelcomeGuide';
import {AuthModal} from '@/components/AuthModal';
import {UserMenu} from '@/components/UserMenu';
import {FilingApi, Filing, FormType, Note, StockApi, Stock} from '@/types';
import {mockNotes} from '@/lib/mockData';
import {BookOpen} from "lucide-react";

export default function Home() {
    const [searchResults, setSearchResults] = useState<Stock[]>([]);
    const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
    const [filings, setFilings] = useState<Filing[]>([]);
    const [selectedFiling, setSelectedFiling] = useState<Filing | null>(null);
    const [selectedFormType, setSelectedFormType] = useState<FormType>('ALL');
    const [notes, setNotes] = useState<Note[]>(mockNotes);
    const [hasSearched, setHasSearched] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

    const handleSearch = async (query: string) => {
        setHasSearched(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/tickers/search?q=${encodeURIComponent(query)}`);
            const rawData: StockApi[] = await res.json();
            const data: Stock[] = rawData.map(item => ({
                cik: item.cik,
                symbol: item.ticker,
                companyName: item.company_name
            }));

            const results = data.sort((a, b) => {
                const input = query.toLowerCase();
                const aSymbol = (a.symbol ?? '').toLowerCase();
                const bSymbol = (b.symbol ?? '').toLowerCase();
                const aName = a.companyName.toLowerCase();
                const bName = b.companyName.toLowerCase();

                if (aSymbol === input) return -1;
                if (bSymbol === input) return 1;

                if (aSymbol.startsWith(input) && !bSymbol.startsWith(input)) return -1;
                if (!aSymbol.startsWith(input) && bSymbol.startsWith(input)) return 1;

                if (aName.startsWith(input) && !bName.startsWith(input)) return -1;
                if (!aName.startsWith(input) && bName.startsWith(input)) return 1;

                if (aSymbol.includes(input) && !bSymbol.includes(input)) return -1;
                if (!aSymbol.includes(input) && bSymbol.includes(input)) return 1;

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

    const handleStockSelect = async (stock: Stock) => {
        setSelectedStock(stock);
        setSearchResults([]);
        setSelectedFiling(null);

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/filings/by-cik/${stock.cik}`);
            const rawData: FilingApi[] = await res.json();

            const data: Filing[] = rawData.map(item => ({
                id: item.id,
                symbol: stock.symbol,
                companyName: stock.companyName,
                formType: item.form_type,
                filingDate: item.date_filed,
                fileName: item.txt_filename
            }));

            setFilings(data);
        } catch (error) {
            console.error('Error fetching filings:', error);
        }
    };

    const handleAddNote = (noteData: Omit<Note, 'id' | 'timestamp'>) => {
        const newNote: Note = {
            ...noteData,
            id: Math.random().toString(36).substr(2, 9),
            timestamp: new Date().toISOString(),
        };
        setNotes(prev => [...prev, newNote]);
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-12">

                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 inline-block text-transparent bg-clip-text">
                        Super Investor
                    </h1>
                    <UserMenu onAuthClick={() => setIsAuthModalOpen(true)}/>
                </div>

                <div className="flex flex-col items-center mb-12">
                    <SearchBar
                        onSearch={handleSearch}
                        onStockSelect={handleStockSelect}
                        searchResults={searchResults}
                    />
                </div>

                {!hasSearched && <WelcomeGuide/>}

                {selectedStock && !selectedFiling && (
                    <div className="space-y-8">
                        <div className="bg-white rounded-lg p-6 shadow-md">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedStock.companyName}</h2>
                            <p className="text-gray-600"></p>
                        </div>
                        <FormTypeFilter
                            selectedType={selectedFormType}
                            onTypeSelect={setSelectedFormType}
                        />
                        <FilingList
                            filings={filings}
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