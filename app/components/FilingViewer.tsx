"use client";

import {useEffect, useState} from "react";

interface FilingViewerProps {
    filing: string;
}

export function FilingViewer({filing}: FilingViewerProps) {
    const [content, setContent] = useState<string | null>(null);

    useEffect(() => {
        const fetchFiling = async () => {
            try {
                const res = await fetch(filing);
                const text = await res.text();
                setContent(text);
            } catch (error) {
                console.error("Error fetching filing:", error);
            }
        };

        // fetchFiling();
    }, []);

    return (
        <div className="p-4">
            {content ? (
                <div dangerouslySetInnerHTML={{__html: content}}/>
            ) : (
                <p>Loading filing...</p>
            )}
        </div>
    );
}
