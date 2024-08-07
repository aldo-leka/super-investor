'use client';

import { useState, useEffect } from 'react';
import { pdfjs, Document, Page } from 'react-pdf';
import "react-pdf/dist/esm/Page/TextLayer.css";
import "react-pdf/dist/esm/Page/AnnotationLayer.css"

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function PDFViewer({ url }: { url: string }) {
    const [content, setContent] = useState<string | null>(null);
    const [contentType, setContentType] = useState<string | null>(null);
    const [numPages, setNumPages] = useState<number | null>(null);

    useEffect(() => {
        const fetchContent = async () => {
            console.log('Fetching pdf from url', url);
            try {
                const response = await fetch('/api/generate-pdf', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ url }),
                });

                setContentType(response.headers.get('Content-Type'));

                if (response.headers.get('Content-Type')?.includes('application/pdf')) {
                    const blob = await response.blob();
                    setContent(URL.createObjectURL(blob));
                } else {
                    setContent(await response.text());
                }
            } catch (error) {
                console.error('Error fetching content:', error);
            }
        };

        fetchContent();
    }, [url]);

    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        setNumPages(numPages);
    }

    if (!content) {
        return <div>Loading content...</div>;
    }

    if (contentType?.includes('application/pdf')) {
        return (
            <div className="pdf-viewer">
                <Document 
                    file={content}
                    onLoadSuccess={onDocumentLoadSuccess}
                >
                    {Array.from(new Array(numPages), (el, index) => (
                        <Page key={`page_${index + 1}`} pageNumber={index + 1} />
                    ))}
                </Document>
            </div>
        );
    } else {
        return <div dangerouslySetInnerHTML={{ __html: content }} />;
    }
}