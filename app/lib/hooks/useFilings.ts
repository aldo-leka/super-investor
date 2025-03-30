import { Filing, FilingApi, Stock } from "@/types";
import { getFilingCategory } from "@/lib/filingUtils";

export async function fetchFilingsByStock(stock: Stock): Promise<Filing[]> {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/filings/by-cik/${stock.cik}`);
    const rawData: FilingApi[] = await res.json();

    return rawData.map(item => ({
        id: item.id,
        symbol: stock.symbol,
        companyName: stock.name,
        formType: item.filing_type === '8-K' && item.filing_date > '2004-08-23' ? '8-K'
            : item.filing_type === '8-K' ? '8-K-OBSOLETE' : item.filing_type,
        filingDate: item.filing_date,
        fileName: item.filing_url,
        category: getFilingCategory(item.filing_type)
    }));
}
