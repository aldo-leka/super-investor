"use client";

import * as React from "react";
import {Check, ChevronsUpDown} from "lucide-react";

import {cn} from "@/lib/utils";
import {Button} from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {useEffect, useState} from "react";
import {useStonks} from "@/store/StonksContext";
import {Ticker, TickerApi} from "@/lib/types";

const toTitleCase = (str: string) => {
    return str
        .toLowerCase()
        .split(" ")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
};

export function TickerSearch() {
    const [tickers, setTickers] = useState<Ticker[]>([]);
    const [allTickers, setAllTickers] = useState<Ticker[]>([]);
    const [open, setOpen] = useState(false);
    const {selectedTicker, setSelectedTicker} = useStonks();
    const [isLoading, setIsLoading] = useState(true);
    const placeholder = isLoading
        ? "Loading tickers..."
        : "Select ticker...";

    useEffect(() => {
        const fetchTickers = async () => {
            try {
                const res = await fetch("/api/tickers");
                const data = await res.json();

                const tickers = Object.values(data as Record<string, TickerApi>).map(item => ({
                    cik: String(item.cik_str),
                    ticker: item.ticker,
                    title: toTitleCase(item.title)
                }));

                setAllTickers(tickers);
            } catch (error) {
                console.error("Error fetching tickers:", error);
            }

            setIsLoading(false);
        };

        fetchTickers();
    }, []);

    const filterTickers = (e: string) => {
        const value = e.trim().toLowerCase();
        if (value) {
            setTickers(
                allTickers.filter(
                    (ticker) =>
                        ticker.ticker.toLowerCase().includes(value) ||
                        ticker.title.toLowerCase().includes(value)
                ).sort((a, b) => {
                    const input = value.toUpperCase(); // Ensure case-insensitivity

                    const aTicker = a.ticker.toUpperCase();
                    const bTicker = b.ticker.toUpperCase();
                    const aTitle = a.title.toUpperCase();
                    const bTitle = b.title.toUpperCase();

                    // Exact match on ticker
                    if (aTicker === input) return -1;
                    if (bTicker === input) return 1;

                    // Ticker starts with input
                    const aTickerStarts = aTicker.startsWith(input);
                    const bTickerStarts = bTicker.startsWith(input);

                    if (aTickerStarts && !bTickerStarts) return -1;
                    if (!aTickerStarts && bTickerStarts) return 1;

                    // Title starts with input
                    const aTitleStarts = aTitle.startsWith(input);
                    const bTitleStarts = bTitle.startsWith(input);

                    if (aTitleStarts && !bTitleStarts) return -1;
                    if (!aTitleStarts && bTitleStarts) return 1;

                    // Ticker contains input anywhere
                    const aTickerContains = aTicker.includes(input);
                    const bTickerContains = bTicker.includes(input);

                    if (aTickerContains && !bTickerContains) return -1;
                    if (!aTickerContains && bTickerContains) return 1;

                    // Title contains input anywhere
                    const aTitleContains = aTitle.includes(input);
                    const bTitleContains = bTitle.includes(input);

                    if (aTitleContains && !bTitleContains) return -1;
                    if (!aTitleContains && bTitleContains) return 1;

                    // Final fallback: Sort alphabetically by ticker
                    if (aTicker < bTicker) return -1;
                    if (aTicker > bTicker) return 1;

                    // If tickers are the same, sort by company title alphabetically
                    return aTitle.localeCompare(bTitle);
                }).slice(0, 5)
            )
        } else {
            setTickers([]);
        }
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild disabled={isLoading}>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full md:w-[300px] justify-between"
                >
                    {selectedTicker ? `${selectedTicker.ticker} (${selectedTicker.title})` : placeholder}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50"/>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full md:w-[300px] p-0">
                <Command>
                    <CommandInput
                        placeholder={placeholder}
                        onValueChange={filterTickers}/>
                    <CommandList>
                        <CommandEmpty>No stocks found.</CommandEmpty>
                        <CommandGroup>
                            {tickers.map((ticker) => (
                                <CommandItem
                                    key={ticker.ticker}
                                    value={`${ticker.ticker} ${ticker.title}`}
                                    onSelect={(currentValue) => {
                                        setSelectedTicker(
                                            selectedTicker && currentValue.includes(selectedTicker.ticker)
                                                ? null
                                                : ticker);
                                        setOpen(false);
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            selectedTicker.ticker === ticker.ticker ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {`${ticker.ticker} (${ticker.title})`}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
