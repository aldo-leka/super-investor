"use client";

import {
    Sheet,
    SheetContent,
    SheetDescription, SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import {Menu} from "lucide-react";
import {useStonks} from "@/store/StonksContext";
import {useEffect, useState} from "react";
import {Filing, SubmissionApi} from "@/lib/types";
import {categorizeFilings} from "@/lib/categorizeFilings";

export default function FilingPanel() {
    const [open, setOpen] = useState();
    const {selectedTicker, selectedFiling, setSelectedFiling} = useStonks();
    const [filings, setFilings] = useState<Filing[]>([]);

    useEffect(() => {
        const fetchFilings = async () => {
            try {
                const cik = selectedTicker ? selectedTicker.cik_str : "";
                const res = await fetch(`/api/filings?cik=${cik}`);
                const data: SubmissionApi = await res.json();

                let filings: Filing[] = [];
                if (data.filings) {
                    filings = data.filings.recent.accessionNumber.map(
                        (accessionNumber, index) => ({
                            cik: data.cik,
                            accessionNumber: accessionNumber,
                            filingDate: data.filings.recent.filingDate[index],
                            form: data.filings.recent.form[index],
                            primaryDocument: data.filings.recent.primaryDocument[index]
                        })
                    );
                }

                setFilings(filings);
            } catch (error) {
                console.error("Error fetching filings:", error);
            }
        }

        fetchFilings();
    }, [selectedTicker]);

    const categorizedFilings = categorizeFilings(filings);
    const CATEGORY_ORDER = ["Annual Reports", "Quarterly Reports", "Other"];

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger><Menu/></SheetTrigger>
            <SheetContent className="w-[400px] sm:w-[540px]">
                <SheetHeader>
                    <SheetTitle>Filings</SheetTitle>
                    <SheetDescription>
                        Select the filing you want to read.
                    </SheetDescription>
                </SheetHeader>
                {CATEGORY_ORDER.map((category) => {
                    let filings = categorizedFilings[category];
                    if (!filings || filings.length === 0) return null; // Skip empty categories

                    filings = filings.slice(0, 3);

                    return (
                        <div key={category}>
                            <h2 className="text-lg font-semibold mb-2 text-[#ffcc99]">{category}</h2>
                            <div className="space-y-2">
                                {filings.map((filing, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setSelectedFiling(filing)}
                                        className={`w-full flex justify-between items-center p-3 rounded-lg 
                                                bg-[#502d16] hover:bg-[#603720] transition 
                                                text-[#f1c27d] hover:text-[#ffcc99]`}
                                    >
                                        <span>{filing.form} - {filing.filingDate}</span>
                                        <span className="text-sm opacity-75">View</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    );
                })}
                <SheetFooter>
                    Made with ❤️ from Aldo
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}