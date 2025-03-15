"use client";

import {useEffect, useState} from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import {
    Card,
    CardContent
} from "@/components/ui/card";
import {useStonks} from "@/store/StonksContext";
import {Filing, SubmissionApi} from "@/lib/types";
import {Button} from "@/components/ui/button";

export function FilingViewer() {
    const {selectedTicker} = useStonks();
    const [filings, setFilings] = useState<Filing[]>([]);
    const [selectedFilings, setSelectedFilings] = useState<Filing[]>([]);
    const [content, setContent] = useState("");

    useEffect(() => {
        const fetchFilings = async () => {
            try {
                const cik = selectedTicker ? selectedTicker.cik : "";
                const res = await fetch(`/api/submissions?cik=${cik}`);
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
                setSelectedFilings(filings.filter(filing => filing.form === "10-K"));
            } catch (error) {
                console.error("Error fetching filings:", error);
            }
        }

        fetchFilings();
    }, [selectedTicker]);

    const handleTypeSelect = (value: string) => {
        if (value === "annual-reports") {
            setSelectedFilings(filings.filter(filing => filing.form === "10-K"));
        } else if (value === "quarterly-reports") {
            setSelectedFilings(filings.filter(filing => filing.form === "10-Q"));
        } else {
            setSelectedFilings(filings.filter(filing =>
                filing.form !== "10-K"
                && filing.form !== "10-Q"));
        }
    };

    const handleFilingSelect = async (filing: Filing) => {
        try {
            const cik = selectedTicker ? selectedTicker.cik : "";
            const res = await fetch(`/api/filings?cik=${cik}&accessionNumber=${filing.accessionNumber}&document=${filing.primaryDocument}`);
            const data = await res.text();
            setContent(data);
        } catch (error) {
            console.error("Error fetching filing content:", error);
        }
    };

    return (
        <div className="flex gap-4 min-h-screen">
            <Card className="w-1/3">
                <CardContent>
                    <Select defaultValue="annual-reports" onValueChange={handleTypeSelect}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Report Type"/>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="annual-reports">Annual Reports</SelectItem>
                            <SelectItem value="quarterly-reports">Quarterly Reports</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                    </Select>
                    {
                        selectedFilings.map(
                            filing => <Button
                                onClick={() => handleFilingSelect(filing)}
                                className="m-1"
                                key={filing.accessionNumber}>{filing.form} {filing.filingDate}
                            </Button>
                        )
                    }
                </CardContent>
            </Card>
            <Card className="w-2/3">
                <CardContent
                    dangerouslySetInnerHTML={{__html: content}}>
                </CardContent>
            </Card>
        </div>
    );
}
