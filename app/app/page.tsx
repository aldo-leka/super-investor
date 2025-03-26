'use client';

import React, {useState} from 'react';
import {Stock, Filing} from '@/types';
import {useStockSearch} from '@/lib/hooks/useStockSearch';
import {fetchFilingsByStock} from '@/lib/hooks/useFilings';
import SearchPanel from '@/components/SearchPanel';
import FilingListPanel from '@/components/FilingListPanel';
import FilingViewer from '@/components/FilingViewer';
import {FileText, Sparkles} from 'lucide-react';
import Link from 'next/link';
import {Button} from "@/components/ui/button";
import {FILING_CATEGORIES} from "@/lib/filingUtils";

export default function Home() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
    const [filings, setFilings] = useState<Filing[]>([]);
    const [selectedFiling, setSelectedFiling] = useState<Filing | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string>(FILING_CATEGORIES[0]); // 'all'
    const [filingContent, setFilingContent] = useState<Record<string, string>>({});

    const searchResults = useStockSearch(searchQuery);

    const handleStockSelect = async (stock: Stock) => {
        setSelectedStock(stock);
        setSelectedFiling(null);
        const data = await fetchFilingsByStock(stock);
        setFilings(data);
    };

    const handleFilingSelect = async (filing: Filing) => {
        setSelectedFiling(filing);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/filings/${filing.fileName}`);
            const rawData = await res.json();
            setFilingContent(rawData);
        } catch (error) {
            console.error('Error fetching filings:', error);
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <header className="border-b">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <FileText className="h-6 w-6"/>
                            Super Investor
                        </h1>
                        <Link href="/pricing">
                            <Button>
                                <Sparkles className="mr-2 h-4 w-4"/>
                                Upgrade to Pro
                            </Button>
                        </Link>
                    </div>
                </div>
            </header>
            <main className="container mx-auto px-4 py-6">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    <div className="md:col-span-4 space-y-4">
                        <SearchPanel
                            query={searchQuery}
                            onQueryChange={setSearchQuery}
                            results={searchResults}
                            onSelect={handleStockSelect}
                            selectedStock={selectedStock}
                        />
                        {selectedStock && (
                            <FilingListPanel
                                filings={filings}
                                selectedFiling={selectedFiling}
                                onSelectFiling={handleFilingSelect}
                                selectedCategory={selectedCategory}
                                onCategoryChange={setSelectedCategory}
                            />
                        )}
                    </div>

                    <div className="md:col-span-8">
                        <FilingViewer
                            filing={selectedFiling}
                            content={filingContent}
                            category={selectedFiling?.category || ''}
                        />
                    </div>
                </div>
            </main>
        </div>
    );
}