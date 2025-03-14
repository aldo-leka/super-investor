import { Filing } from "@/lib/types";

const ANNUAL_REPORTS = new Set(["10-K"]);
const QUARTERLY_REPORTS = new Set(["10-Q"]);

export function getFilingCategory(form: string): string {
    if (ANNUAL_REPORTS.has(form)) return "Annual Reports";
    if (QUARTERLY_REPORTS.has(form)) return "Quarterly Reports";
    return "Other Reports";
}

export function categorizeFilings(filings: Filing[]): Record<string, Filing[]> {
    return filings.reduce((acc, filing) => {
        const category = getFilingCategory(filing.form);
        if (!acc[category]) acc[category] = [];
        acc[category].push(filing);
        return acc;
    }, {} as Record<string, Filing[]>);
}
