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
        <div className="h-[500px] overflow-y-auto border p-4 bg-[#3b2b1b] text-[#f1c27d]">
            {content ? (
                <div dangerouslySetInnerHTML={{__html: content}}/>
            ) : (
                <p>Loading filing...</p>
            )}
        </div>
    );
}
