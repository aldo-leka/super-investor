export interface FilingApi {
    id: number;
    form_type: string;
    date_filed: string;
    txt_filename: string;
    quarter: string;
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

export interface StockApi {
    cik: string;
    ticker: string | null;
    company_name: string;
}

export interface Stock {
    cik: string;
    symbol: string | null;
    companyName: string;
}
