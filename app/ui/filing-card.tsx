'use client';

import { useState } from "react";
import { Filing } from "../lib/definitions";
import { useRouter } from 'next/navigation';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

export default function FilingCard({ category, filings }: { category: string, filings: Filing[] }) {
    const [showMore, setShowMore] = useState(false);
    const displayFilings = showMore ? filings : filings.slice(0, 5);
    const router = useRouter();

    const handleRowClick = (ticker: string, accessionNumber: string) => {
        router.push(`${ticker}/${accessionNumber}`);
    };

    return (
        <div className="bg-white rounded-lg shadow-md">
            <div className="p-4">
                <h2 className="text-xl font-semibold mb-4 capitalize">{category}</h2>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <tbody>
                            {displayFilings.map((filing, index) => (
                                <tr
                                    key={index}
                                    className="hover:bg-gray-100 cursor-pointer"
                                    onClick={() => handleRowClick(filing.ticker, filing.accessionNumber)}
                                >
                                    <td className="py-2 px-4 border-b">{filing.form}</td>
                                    <td className="py-2 px-4 border-b">{filing.filingDate}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {filings.length > 5 && (
                    <button
                        onClick={() => setShowMore(!showMore)}
                        className="w-full mt-4 py-2 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded"
                    >
                        <ChevronDownIcon className="h-5 w-5 mr-1" />
                    </button>
                )}
            </div>
        </div>
    );
}