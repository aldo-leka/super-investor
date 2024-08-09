import { getTickers } from '@/app/lib/tickers';
import { Filing, CategorizedFilings } from '@/app/lib/definitions';
import FilingCard from '@/app/ui/filing-card';
import yahooFinance from 'yahoo-finance2';

export default async function Page({ params }: { params: { ticker: string } }) {
    function categorizeFilings(forms: Filing[]): CategorizedFilings {
        const categories: CategorizedFilings = {
            financials: [],
            prospectuses: [],
            ownership: [],
            news: [],
            proxies: [],
            other: [],
            byExtension: []
        };

        const extensionSet = new Set<string>();

        forms.forEach(filing => {
            switch (filing.form) {
                case "10-Q":
                case "10-Q/A":
                case "10-K":
                case "10-K/A":
                case "10-K405":
                case "20-F":
                case "20-F/A":
                    categories.financials.push(filing);
                    break;
                case "S-8":
                case "S-8 POS":
                case "F-6EF":
                case "FWP":
                case "424B2":
                case "424B3":
                case "424B5":
                case "F-3ASR":
                case "F-4":
                case "F-4/A":
                case "8-A12B":
                case "F-1/A":
                case "F-6":
                case "DRS":
                case "F-1":
                case "S-3ASR":
                case "SC TO-I/A":
                case "20FR12B/A":
                case "20FR12B":
                case "DRSLTR":
                case "DRS/A":
                case "CB/A":
                case "CB":
                    categories.prospectuses.push(filing);
                    break;
                case "3":
                case "4":
                case "4/A":
                case "SC 13G/A":
                case "13F-HR":
                case "144":
                case "SC 13G":
                case "SC 13D":
                case "SC 13D/A":
                    categories.ownership.push(filing);
                    break;
                case "6-K":
                case "8-K":
                case "8-K/A":
                    categories.news.push(filing);
                    break;
                case "DEF 14A":
                case "DEFA14A":
                case "PRE 14A":
                    categories.proxies.push(filing);
                    break;
                default:
                    categories.other.push(filing);
                    break;
            }

            // Add to byExtension category if it's a new extension
            const extension = filing.primaryDocument.split('.').pop()?.toLowerCase() || '';
            if (!extensionSet.has(extension)) {
                extensionSet.add(extension);
                categories.byExtension.push(filing);
            }
        });

        return categories;
    }

    async function getYahooQuote(ticker: string, retries = 1) {
        try {
            return await yahooFinance.quote(ticker);
        } catch (error) {
            if (retries > 0) {
                console.log(`Retrying Yahoo Finance API call for ${ticker}...`);
                return getYahooQuote(ticker, retries - 1);
            }
            console.error('Yahoo Finance API error:', error);
            return null;
        }
    }

    const ticker = params.ticker;
    const quote = await getYahooQuote(ticker, 1);
    const tickers = await getTickers();
    const cik = tickers.find((ticker: { value: string }) => ticker.value === params.ticker)?.cik;
    const padded_cik = cik ? cik.toString().padStart(10, '0') : null;
    const res = await fetch(`https://data.sec.gov/submissions/CIK${padded_cik}.json`);
    const json = await res.json();
    const exchange = json.exchanges[0];

    // Collect Filing[] array from the complex recent object
    const filings: Filing[] = json.filings.recent.accessionNumber.map((accessionNumber: string, index: number) => ({
        ticker: ticker,
        accessionNumber,
        primaryDocument: json.filings.recent.primaryDocument[index],
        form: json.filings.recent.form[index],
        filingDate: json.filings.recent.filingDate[index],
    }));

    const categorizedFilings = categorizeFilings(filings);
    const name = json.name;

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mt-4 mb-2">
                {name}
            </h1>
            <p className="text-sm mb-4">
                {exchange}: {ticker}&nbsp;&nbsp;&nbsp;&nbsp;
                {quote && quote.regularMarketPrice && (
                    <>
                        Share price: <strong>${quote.regularMarketPrice.toFixed(2)}</strong>&nbsp;&nbsp;&nbsp;&nbsp;
                    </>
                )}
                {quote && quote.marketCap && (
                    <>
                        Market cap: <strong>${(quote.marketCap / 1e9).toFixed(1)} billion</strong>
                    </>
                )}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries(categorizedFilings).map(([category, filings]) => (
                    <div key={category}>
                        <FilingCard category={category} filings={filings} />
                    </div>
                ))}
            </div>
        </div>
    );
}