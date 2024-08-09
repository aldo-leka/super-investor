export type User = {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    email_verified: boolean;
    password: string;
    verification_token: string | null;
};

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

export type Ticker = {
    label: string;
    value: string;
    cik: string;
}