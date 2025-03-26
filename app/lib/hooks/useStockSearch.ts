import { useState, useEffect } from 'react';
import { Stock, StockApi } from '@/types';

export function useStockSearch(query: string) {
    const [results, setResults] = useState<Stock[]>([]);

    useEffect(() => {
        if (query.length < 1) {
            setResults([]);
            return;
        }

        const timeoutId = setTimeout(async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/tickers/search?q=${encodeURIComponent(query)}&limit=1000`);
                const rawData: StockApi[] = await res.json();

                const data: Stock[] = rawData.map(item => ({
                    cik: item.cik,
                    symbol: item.ticker,
                    companyName: item.company_name
                }));

                const input = query.toLowerCase();

                const sorted = data.sort((a, b) => {
                    const aSymbol = (a.symbol ?? '').toLowerCase();
                    const bSymbol = (b.symbol ?? '').toLowerCase();
                    const aName = a.companyName.toLowerCase();
                    const bName = b.companyName.toLowerCase();

                    const aHas = !!a.symbol;
                    const bHas = !!b.symbol;

                    if (!aHas && bHas) return 1;
                    if (aHas && !bHas) return -1;
                    if (!aHas && !bHas) return aName.localeCompare(bName);

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
                }).slice(0, 5);

                setResults(sorted);
            } catch {
                setResults([]);
            }
        }, 200);

        return () => clearTimeout(timeoutId);
    }, [query]);

    return results;
}
