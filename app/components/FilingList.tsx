import React from 'react';
import {FileText} from 'lucide-react';
import {Filing, FormType} from '@/types';

interface FilingListProps {
    filings: Filing[];
    selectedFormType: FormType;
    onFilingSelect: (filing: Filing) => void;
}

export function FilingList({filings, selectedFormType, onFilingSelect}: FilingListProps) {
    const filteredFilings = selectedFormType === 'ALL'
        ? filings
        : filings.filter(filing => filing.formType === selectedFormType);

    return (
        <div className="space-y-4">
            {filteredFilings.map(filing => (
                <div
                    key={filing.id}
                    onClick={() => onFilingSelect(filing)}
                    className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer border border-gray-200"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <FileText className="h-5 w-5 text-blue-600"/>
                            <div>
                                <h3 className="font-semibold text-gray-900">{filing.companyName} ({filing.symbol})</h3>
                                <p className="text-sm text-gray-600">Form {filing.formType} • {filing.filingDate}</p>
                            </div>
                        </div>
                        <button
                            className="px-3 py-1 text-sm text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50">
                            View
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}