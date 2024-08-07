export type Filing = {
    ticker: string;
    accessionNumber: string;
    primaryDocument: string;
    form: string;
    filingDate: string;
}

export type CategorizedFilings = {
    byExtension: Filing[];
    financials: Filing[];
    prospectuses: Filing[];
    ownership: Filing[];
    news: Filing[];
    proxies: Filing[];
    other: Filing[];
}