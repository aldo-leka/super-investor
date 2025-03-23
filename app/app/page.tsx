'use client';

import React, {useState, useRef} from 'react';
import {Search, FileText, Download, MessageSquare, Sparkles} from 'lucide-react';
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {Badge} from "@/components/ui/badge";
import Link from 'next/link';
import {useVirtualizer} from '@tanstack/react-virtual';
import {Stock, StockApi, Filing, FilingApi} from "@/types";
import {FILING_CATEGORIES, getFilingCategory} from "@/lib/getFilingCategory";

export default function Home() {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Stock[]>([]);
    const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
    const [filings, setFilings] = useState<Filing[]>([]);
    const [selectedFiling, setSelectedFiling] = useState<Filing | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    const parentRef = useRef<HTMLDivElement>(null);

    const rowVirtualizer = useVirtualizer({
        count: filings.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 72, // Estimated height of each filing row
        overscan: 5,
    });

    const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setSearchQuery(query);

        if (query.length >= 1) {
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
        }
    };

    const handleStockSelect = async (stock: Stock) => {
        setSelectedStock(stock);
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
                fileName: item.txt_filename,
                category: getFilingCategory(item.form_type)
            }));

            setFilings(data);
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

            <main className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    {/* Search Section */}
                    <div className="md:col-span-4 space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Search Stocks</CardTitle>
                                <CardDescription>
                                    Enter a stock symbol or company name
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="relative">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground"/>
                                    <Input
                                        type="search"
                                        placeholder="Search stocks..."
                                        className="pl-8"
                                        value={searchQuery}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                {searchResults.length > 0 && (
                                    <div className="mt-4 space-y-2">
                                        {searchResults.map((stock) => (
                                            <Button
                                                key={stock.cik}
                                                variant={selectedStock === stock ? "default" : "ghost"}
                                                className="w-full justify-start"
                                                onClick={() => handleStockSelect(stock)}
                                            >
                                                <div className="flex items-center gap-2 w-full">
                                                    <span className="font-mono whitespace-nowrap">{stock.symbol}</span>
                                                    <span className="text-muted-foreground truncate">
                                                      {stock.companyName}
                                                    </span>
                                                </div>
                                            </Button>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {selectedStock && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Available Filings ({filings.length})</CardTitle>
                                    <CardDescription>
                                        Filter and select filings to view
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Filter by category"/>
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Categories</SelectItem>
                                                {FILING_CATEGORIES.map((category) => (
                                                    <SelectItem key={category} value={category}>
                                                        {category}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>

                                        <div
                                            ref={parentRef}
                                            className="h-[400px] overflow-auto"
                                        >
                                            <div
                                                style={{
                                                    height: `${rowVirtualizer.getTotalSize()}px`,
                                                    width: '100%',
                                                    position: 'relative',
                                                }}
                                            >
                                                {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                                                    const filing = filings[virtualRow.index];
                                                    return (
                                                        <div
                                                            key={filing.id}
                                                            style={{
                                                                position: 'absolute',
                                                                top: 0,
                                                                left: 0,
                                                                width: '100%',
                                                                height: `${virtualRow.size}px`,
                                                                transform: `translateY(${virtualRow.start}px)`,
                                                            }}
                                                        >
                                                            <Button
                                                                variant={selectedFiling?.id === filing.id ? "default" : "ghost"}
                                                                className="w-full justify-start h-[68px] my-1"
                                                                onClick={() => setSelectedFiling(filing)}
                                                            >
                                                                <div className="flex flex-col items-start">
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="font-mono">{filing.formType}</span>
                                                                        <span className="text-muted-foreground">
                                      {filing.filingDate}
                                    </span>
                                                                    </div>
                                                                    <span
                                                                        className="text-xs text-muted-foreground truncate max-w-full">
                                    {filing.category}
                                  </span>
                                                                </div>
                                                            </Button>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Filing Content Section */}
                    <div className="md:col-span-8">
                        {selectedFiling ? (
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <div>
                                        <CardTitle>4 - Current Report</CardTitle>
                                        <CardDescription>
                                            {selectedFiling.formType} - {selectedFiling.filingDate}
                                        </CardDescription>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="icon">
                                            <Download className="h-4 w-4"/>
                                        </Button>
                                        <Button variant="outline" size="icon" asChild>
                                            <Link href="/pricing">
                                                <MessageSquare className="h-4 w-4"/>
                                            </Link>
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="mb-4">
                                        <Badge variant="secondary">{selectedFiling.category}</Badge>
                                    </div>
                                    <div className="prose prose-sm max-w-none">
                    <pre className="whitespace-pre-wrap font-mono text-sm">
                      {/*{selectedFiling.content}*/} TEST
                    </pre>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="h-full flex items-center justify-center text-muted-foreground">
                                <p>Select a filing to view its contents</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}