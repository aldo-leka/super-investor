import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink
} from "@/components/ui/pagination";
import {ChevronLeftIcon, ChevronRightIcon} from "lucide-react";
import * as React from "react";
import {Button} from "@/components/ui/button";
import {Filing} from "@/lib/types";
import {useState} from "react";

interface FilingsButtonsProps {
    filings: Filing[];
    onFilingSelected: (filing: Filing) => void;
}

export default function FilingsButtons({filings, onFilingSelected}: FilingsButtonsProps) {
    const [startIndex, setStartIndex] = useState(0);
    const BUTTONS_PER_PAGE = 2;
    const visibleFilings = filings.slice(startIndex, startIndex + BUTTONS_PER_PAGE);

    const handleNext = () => {
        if (startIndex + BUTTONS_PER_PAGE < filings.length) {
            setStartIndex(startIndex + BUTTONS_PER_PAGE);
        }
    };

    const handlePrev = () => {
        if (startIndex - BUTTONS_PER_PAGE >= 0) {
            setStartIndex(startIndex - BUTTONS_PER_PAGE);
        }
    };

    return (
        <Pagination>
            <PaginationContent>
                <PaginationItem>
                    <PaginationLink
                        aria-label="Go to previous items"
                        size="default"
                        className="gap-1 px-2.5 sm:pl-2.5"
                        href="#"
                        onClick={(e) => {
                            e.preventDefault();
                            handlePrev();
                        }}
                    >
                        <ChevronLeftIcon/>
                    </PaginationLink>
                </PaginationItem>
                {visibleFilings.map((filing, index) => (
                    <PaginationItem key={index}>
                        <Button
                            className="bg-[#502d16] text-[#f1c27d] hover:bg-[#603720] whitespace-nowrap"
                            onClick={() => onFilingSelected(filing)}
                        >
                            {filing.form} '{filing.filingDate.slice(2, 4)}
                        </Button>
                    </PaginationItem>
                ))}
                <PaginationItem>
                    <PaginationLink
                        aria-label="Go to next items"
                        size="default"
                        className="gap-1 px-2.5 sm:pr-2.5"
                        href="#"
                        onClick={(e) => {
                            e.preventDefault();
                            handleNext();
                        }}
                    >
                        <ChevronRightIcon/>
                    </PaginationLink>
                </PaginationItem>
            </PaginationContent>
        </Pagination>
    );
}