import React, {useRef} from 'react';
import {useVirtualizer} from '@tanstack/react-virtual';
import {Card, CardHeader, CardTitle, CardDescription, CardContent} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import {FILING_CATEGORIES} from '@/lib/filingUtils';
import {Filing} from '@/types';

interface Props {
    filings: Filing[];
    selectedFiling: Filing | null;
    onSelectFiling: (filing: Filing) => void;
    selectedCategory: string;
    onCategoryChange: (cat: string) => void;
}

export default function FilingListPanel({
                                            filings,
                                            selectedFiling,
                                            onSelectFiling,
                                            selectedCategory,
                                            onCategoryChange
                                        }: Props) {
    const parentRef = useRef<HTMLDivElement>(null);
    const filtered = filings.filter(f => selectedCategory === 'all' || f.category === selectedCategory);

    const rowVirtualizer = useVirtualizer({
        count: filtered.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 72,
        overscan: 5,
    });

    return (
        <Card>
            <CardHeader>
                <CardTitle>Available Filings ({filtered.length})</CardTitle>
                <CardDescription>Filter and select filings to view</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <Select value={selectedCategory} onValueChange={onCategoryChange}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Filter by category"/>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            {FILING_CATEGORIES.map((cat) => (
                                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <div ref={parentRef} className="h-[400px] overflow-auto">
                        <div
                            style={{
                                height: `${rowVirtualizer.getTotalSize()}px`,
                                width: '100%',
                                position: 'relative',
                            }}
                        >
                            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                                const filing = filtered[virtualRow.index];
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
                                            onClick={() => onSelectFiling(filing)}
                                        >
                                            <div className="flex flex-col items-start">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono">{filing.formType}</span>
                                                    <span className="text-muted-foreground">{filing.filingDate}</span>
                                                </div>
                                                <span className="text-xs text-muted-foreground truncate max-w-full">
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
    );
}
