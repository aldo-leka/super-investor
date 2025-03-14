"use client";

import {FilingViewer} from "@/components/FilingViewer";
import {useEffect, useState} from "react";
import {useStonks} from "@/store/StonksContext";
import {Filing, SubmissionApi} from "@/lib/types";
import FilingsButtons from "@/components/FilingsButtons";
import {categorizeFilings} from "@/lib/categorizeFilings";

export default function FilingsContainer() {
    const [selectedFiling, setSelectedFiling] = useState<Filing | null>(null);
    const [filings, setFilings] = useState<Filing[]>([]);
    const {selectedTicker} = useStonks();

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
    const CATEGORY_ORDER = ["Annual Reports", "Quarterly Reports", "Other Reports"];

    return (
        <>
            {CATEGORY_ORDER.map((category) => {
                const filings = categorizedFilings[category];
                if (!filings || filings.length === 0) return null; // Skip empty categories

                return (
                    <div key={category}>
                        {/*<h2 className="text-lg font-bold">{category}</h2>*/}
                        <FilingsButtons filings={filings} onFilingSelected={(filing) => console.log(filing)}/>
                    </div>
                );
            })}

            <div className="bg-[#2b1a0d] p-6 rounded-lg shadow-lg text-[#f1c27d]">
                {selectedFiling ? (
                    <FilingViewer filing={selectedFiling}/>
                ) : (
                    <p className="text-center text-lg">Select a filing to view</p>
                )}
            </div>
        </>
    );
}