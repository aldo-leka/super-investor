export interface FilingApi {
    id: number;
    filing_type: string;
    filing_date: string;
    filing_url: string;
}

export interface Filing {
    id: number;
    symbol: string | null;
    companyName: string;
    formType: string;
    filingDate: string;
    fileName: string;
    category: string;
}

export interface Stock {
    cik: string;
    symbol: string | null;
    name: string;
}
