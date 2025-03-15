export interface TickerApi {
    cik_str: number;
    ticker: string;
    title: string;
}

export interface SubmissionApi {
    cik: string;
    name: string;
    tickers: string[];
    exchanges: string[];
    filings: FilingsApi;
}

export interface FilingsApi {
    recent: FilingApi;
}

export interface FilingApi {
    accessionNumber: string[];
    filingDate: string[];
    form: string[];
    primaryDocument: string[];
}

export interface Ticker {
    cik: string;
    ticker: string;
    title: string;
}

export interface Filing {
    cik: string;
    accessionNumber: string;
    filingDate: string;
    form: string;
    primaryDocument: string;
}