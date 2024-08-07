let cachedData: any = null;
let lastFetchTime: number = 0;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export async function getTickers() {
    if (cachedData && Date.now() - lastFetchTime < CACHE_DURATION) {
        return cachedData;
    }

    const response = await fetch('https://www.sec.gov/files/company_tickers.json', {
        headers: {
            'User-Agent': 'Lekasoft aldo@lekasoft.com'
        }
    });

    const json: Record<string, { ticker: string; title: string, cik_str: string }> = await response.json();
    const options = Object.values(json).map(({ ticker, title, cik_str }) => ({
        label: `${ticker} (${title})`,
        value: ticker,
        cik: cik_str
    }));

    cachedData = options;
    lastFetchTime = Date.now();

    return options;
}