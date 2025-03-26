import { Filing, FilingApi, Stock } from "@/types";
import { getFilingCategory } from "@/lib/filingUtils";

export async function fetchFilingsByStock(stock: Stock): Promise<Filing[]> {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/filings/by-cik/${stock.cik}`);
    const rawData: FilingApi[] = await res.json();

    return rawData.map(item => ({
        id: item.id,
        symbol: stock.symbol,
        companyName: stock.companyName,
        formType: item.form_type === '8-K' && item.date_filed > '2004-08-23' ? '8-K'
            : item.form_type === '8-K' ? '8-K-OBSOLETE' : item.form_type,
        filingDate: item.date_filed,
        fileName: item.txt_filename,
        category: getFilingCategory(item.form_type)
    }));
}
