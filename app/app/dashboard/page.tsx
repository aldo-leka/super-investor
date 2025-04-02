'use client';

import { useState } from 'react';
import { Stock, Filing } from '@/types';
import { useStockSearch } from '@/lib/hooks/useStockSearch';
import { fetchFilingsByStock } from '@/lib/hooks/useFilings';
import SearchPanel from '@/components/dashboard/SearchPanel';
import FilingListPanel from '@/components/dashboard/FilingListPanel';
import FilingViewer from '@/components/dashboard/FilingViewer';
import Header from '@/components/dashboard/Header';
import { FILING_CATEGORIES } from "@/lib/filingUtils";
import ProtectedRoute from '@/components/ProtectedRoute';

export default function DashboardPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
    const [filings, setFilings] = useState<Filing[]>([]);
    const [selectedFiling, setSelectedFiling] = useState<Filing | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string>(FILING_CATEGORIES[0]);

    const searchResults = useStockSearch(searchQuery);

    const handleStockSelect = async (stock: Stock) => {
        setSelectedStock(stock);
        setSelectedFiling(null);
        const data = await fetchFilingsByStock(stock);
        setFilings(data);
    };

    const handleFilingSelect = (filing: Filing) => {
        setSelectedFiling(filing);
    };

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-background">
                <Header />
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
                                category={selectedFiling?.category || ''}
                            />
                        </div>
                    </div>
                </main>
            </div>
        </ProtectedRoute>
    );
}