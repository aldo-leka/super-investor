import React from 'react';
import { FormType } from '../types';

interface FormTypeFilterProps {
    selectedType: FormType;
    onTypeSelect: (type: FormType) => void;
}

export function FormTypeFilter({ selectedType, onTypeSelect }: FormTypeFilterProps) {
    const formTypes: FormType[] = ['ALL', '10-K', '10-Q', '8-K'];

    return (
        <div className="flex space-x-2">
            {formTypes.map(type => (
                <button
                    key={type}
                    onClick={() => onTypeSelect(type)}
                    className={`px-4 py-2 rounded-md ${
                        selectedType === type
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                    {type}
                </button>
            ))}
        </div>
    );
}