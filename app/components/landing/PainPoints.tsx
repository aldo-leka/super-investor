'use client';

import { Eye, Clock, Table2, DollarSign, Search, BookOpen } from 'lucide-react';

const painPoints = [
    {
        icon: Eye,
        title: "Eye-straining EDGAR format",
        description: "Raw text files with poor formatting make reading filings unnecessarily difficult and time-consuming"
    },
    {
        icon: Table2,
        title: "Manual data extraction",
        description: "Copying and pasting tables into spreadsheets is tedious and error-prone"
    },
    {
        icon: Clock,
        title: "Missing important filings",
        description: "Constantly checking for new filings means you either waste time or miss critical updates"
    },
    {
        icon: Search,
        title: "Scattered research",
        description: "Jumping between different tools and websites makes organizing your research a nightmare"
    },
    {
        icon: DollarSign,
        title: "Overpriced alternatives",
        description: "Professional platforms cost thousands per month - way too expensive for individual investors"
    },
    {
        icon: BookOpen,
        title: "Information overload",
        description: "Dense legal documents make it hard to find the information that actually matters to you"
    }
];

export function PainPoints() {
    return (
        <section className="py-20">
            <div className="container mx-auto px-4">
                <div className="max-w-3xl mx-auto text-center mb-16">
                    <h2 className="text-4xl font-bold mb-4">
                        SEC research shouldn&apos;t be this <span className="text-red-500">painful</span>
                    </h2>
                    <p className="text-xl text-muted-foreground">
                        Stop wrestling with these common frustrations
                    </p>
                </div>
                <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {painPoints.map((point, index) => (
                        <div key={index} className="bg-muted/30 p-6 rounded-lg">
                            <div className="flex items-start gap-4">
                                <point.icon className="h-6 w-6 text-red-500 mt-1" />
                                <div>
                                    <h3 className="text-xl font-semibold mb-2">{point.title}</h3>
                                    <p className="text-muted-foreground">{point.description}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}