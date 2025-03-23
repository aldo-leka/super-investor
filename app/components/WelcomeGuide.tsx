import React from 'react';
import { Search, FileText, PenTool, UserPlus, ChevronRight } from 'lucide-react';

export function WelcomeGuide() {
    return (
        <div className="max-w-5xl mx-auto space-y-12">
            <div className="text-center">
                <h2 className="text-4xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 inline-block text-transparent bg-clip-text">
                    Welcome to StockFiling Analysis
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    Your intelligent companion for analyzing SEC filings. Follow these simple steps to get started.
                </p>
            </div>

            <div className="space-y-8">
                {[
                    {
                        step: 1,
                        icon: Search,
                        title: "Search for Stocks",
                        description: "Enter any stock symbol (e.g., AAPL, MSFT) in the search bar above to find company filings.",
                        tip: "Pro tip: You can also search by company name",
                        bgColor: "bg-blue-50",
                        iconColor: "text-blue-600"
                    },
                    {
                        step: 2,
                        icon: FileText,
                        title: "Browse & Filter Filings",
                        description: "View all available filings and use the filters to find specific document types (10-K, 10-Q, 8-K).",
                        tip: "Pro tip: 10-K reports provide the most comprehensive company information",
                        bgColor: "bg-indigo-50",
                        iconColor: "text-indigo-600"
                    },
                    {
                        step: 3,
                        icon: PenTool,
                        title: "Take Smart Notes",
                        description: "Select any text in a filing to create notes. Your notes are automatically linked to the specific text you've selected.",
                        tip: "Pro tip: Notes help you track key insights and important disclosures",
                        bgColor: "bg-violet-50",
                        iconColor: "text-violet-600"
                    },
                    {
                        step: 4,
                        icon: UserPlus,
                        title: "Save Your Research",
                        description: "Create an account to save your notes and access them from anywhere. Don't worry - notes taken while logged out are preserved and transferred when you sign in.",
                        tip: "Pro tip: Your notes are private and only visible to you",
                        bgColor: "bg-purple-50",
                        iconColor: "text-purple-600"
                    }
                ].map((step, index) => (
                    <div
                        key={step.step}
                        className={`${step.bgColor} rounded-2xl p-6 transform transition-all duration-300 hover:scale-[1.02] hover:shadow-lg`}
                    >
                        <div className="flex items-start gap-6">
                            <div className={`${step.iconColor} bg-white p-3 rounded-xl shadow-sm`}>
                                <step.icon className="w-8 h-8" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className={`${step.iconColor} font-mono text-sm font-bold`}>STEP {step.step}</span>
                                    <ChevronRight className={`w-4 h-4 ${step.iconColor}`} />
                                    <h3 className="font-bold text-xl text-gray-900">{step.title}</h3>
                                </div>
                                <p className="text-gray-600 mb-3">{step.description}</p>
                                <div className="flex items-center gap-2 text-sm font-medium">
                                    <span className={`${step.iconColor}`}>💡</span>
                                    <span className="text-gray-700">{step.tip}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white">
                <div className="max-w-3xl mx-auto text-center">
                    <h3 className="text-2xl font-bold mb-4">Ready to dive deeper?</h3>
                    <p className="mb-6">
                        Start by searching for a company above, or create an account to unlock all features.
                    </p>
                    <div className="flex justify-center gap-4">
                        <button
                            onClick={() => document.querySelector('input[type="text"]')?.focus()}
                            className="bg-white text-blue-600 px-6 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors"
                        >
                            Start Searching
                        </button>
                        <button
                            className="bg-blue-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-400 transition-colors"
                        >
                            Create Account
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}