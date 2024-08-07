import { getTickers } from "@/app/lib/tickers";
import HTMLViewer from "@/app/ui/html-viewer";
import dynamic from 'next/dynamic';
import PDFViewer from "@/app/ui/pdf-viewer";
import PlainTextViewer from "@/app/ui/plain-text-viewer";
import XMLViewer from "@/app/ui/xml-viewer";

export default async function Page({ params }: { params: { ticker: string, 'accession-number': string } }) {
    const tickers = await getTickers();
    const cik = tickers.find((ticker: { value: string }) => ticker.value === params.ticker)?.cik;
    const padded_cik = cik ? cik.toString().padStart(10, '0') : null;
    const res = await fetch(`https://data.sec.gov/submissions/CIK${padded_cik}.json`);
    const json = await res.json();
    
    const accessionIndex = json.filings.recent.accessionNumber.findIndex(
        (accession: string) => accession === params['accession-number']
    );
    
    const document = accessionIndex !== -1 
        ? json.filings.recent.primaryDocument[accessionIndex] 
        : null;

    const filing_res = await fetch(`https://www.sec.gov/Archives/edgar/data/${padded_cik}/${params['accession-number'].replace(/-/g, '')}/${document}`);
    const content_type = filing_res.headers.get('Content-Type');
    const filing_content = await filing_res.text();

    // Determine the file type based on the Content-Type header
    let fileType = 'unknown';
    if (content_type) {
        if (content_type.includes('text/html')) fileType = 'html';
        else if (content_type.includes('application/xml')) fileType = 'xml';
        else if (content_type.includes('application/pdf')) fileType = 'pdf';
        else if (content_type.includes('text/plain')) fileType = 'txt';
        // Add more content type checks as needed
    }

    const renderContent = () => {
        switch (fileType) {
            case 'html':
                return <HTMLViewer content={filing_content} />;
            case 'xml':
                return <XMLViewer content={filing_content} />;
            case 'pdf':
                return <PDFViewer url={filing_res.url} />;
            default:
                return <PlainTextViewer content={filing_content} />;
        }
    };

    return (
        <main>
            {document ? (
                <>
                    <p>Primary document: {document}</p>
                    <p>File type: {fileType}</p>
                    <p>{filing_res.url}</p>
                    {renderContent()}
                </>
            ) : (
                <p>Document not found</p>
            )}
        </main>
    );
}