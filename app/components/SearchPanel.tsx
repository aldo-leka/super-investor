import React from 'react';
import {Search} from 'lucide-react';
import {Input} from '@/components/ui/input';
import {Button} from '@/components/ui/button';
import {Card, CardHeader, CardTitle, CardContent, CardDescription} from '@/components/ui/card';
import {Stock} from '@/types';

interface Props {
    query: string;
    onQueryChange: (q: string) => void;
    results: Stock[];
    onSelect: (stock: Stock) => void;
    selectedStock: Stock | null;
}

export default function SearchPanel({query, onQueryChange, results, onSelect, selectedStock}: Props) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Search Stocks</CardTitle>
                <CardDescription>Enter a stock symbol or company name</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground"/>
                    <Input
                        type="search"
                        placeholder="Search stocks..."
                        className="pl-8"
                        value={query}
                        onChange={(e) => onQueryChange(e.target.value)}
                    />
                </div>
                {results.length > 0 && (
                    <div className="mt-4 space-y-2">
                        {results.map((stock) => (
                            <Button
                                key={stock.cik}
                                variant={selectedStock?.cik === stock.cik ? "default" : "ghost"}
                                className="w-full justify-start"
                                onClick={() => onSelect(stock)}
                            >
                                <div className="flex items-center gap-2 w-full">
                                    <span className="font-mono whitespace-nowrap">{stock.symbol}</span>
                                    <span className="text-muted-foreground truncate">{stock.companyName}</span>
                                </div>
                            </Button>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
