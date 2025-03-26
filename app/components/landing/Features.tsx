'use client';

import { FileText, Table, Bell, BookOpen, Search, Download } from 'lucide-react';

const features = [
    {
        title: "Clean, Readable Filings",
        description: "View SEC filings in a modern, easy-to-read format. No more eye strain from EDGAR's raw text.",
        icon: FileText
    },
    {
        title: "Smart Table Extraction",
        description: "Automatically extract and download financial tables in CSV format for further analysis.",
        icon: Table
    },
    {
        title: "Filing Alerts",
        description: "Get notified instantly when companies you follow file new documents with the SEC.",
        icon: Bell
    },
    {
        title: "Research Notes",
        description: "Take notes directly on filings and organize your research in one place.",
        icon: BookOpen
    },
    {
        title: "Advanced Search",
        description: "Search across multiple filings and companies to find exactly what you need.",
        icon: Search
    },
    {
        title: "Offline Access",
        description: "Download filings as EPUBs for comfortable reading anywhere, anytime.",
        icon: Download
    }
];

export function Features() {
    return (
        <section id="features" className="py-20 bg-muted/50">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold mb-4">Everything you need for efficient research</h2>
                    <p className="text-xl text-muted-foreground">Powerful features designed for serious investors</p>
                </div>
                <div className="grid md:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <div key={index} className="bg-background p-6 rounded-lg border hover:border-primary/50 transition-colors">
                            <feature.icon className="h-12 w-12 text-primary mb-4"/>
                            <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                            <p className="text-muted-foreground">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}