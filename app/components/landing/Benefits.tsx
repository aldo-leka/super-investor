'use client';

import { Clock, Target, Brain } from 'lucide-react';

const benefits = [
    {
        icon: Clock,
        title: "Save Hours of Time",
        description: "Stop wrestling with EDGAR. Our clean interface and smart features help you analyze filings in minutes, not hours."
    },
    {
        icon: Target,
        title: "Never Miss Key Information",
        description: "Custom alerts, powerful search, and organized notes ensure you catch every detail that matters to your investment thesis."
    },
    {
        icon: Brain,
        title: "Make Better Decisions",
        description: "With faster analysis and better organization, you can focus on what matters - making informed investment decisions."
    }
];

export function Benefits() {
    return (
        <section className="py-20 bg-muted/50">
            <div className="container mx-auto px-4">
                <div className="max-w-3xl mx-auto text-center mb-16">
                    <h2 className="text-4xl font-bold mb-4">
                        Research smarter, <span className="text-green-500">invest better</span>
                    </h2>
                    <p className="text-xl text-muted-foreground">
                        Transform how you analyze SEC filings
                    </p>
                </div>
                <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    {benefits.map((benefit, index) => (
                        <div key={index} className="bg-background p-6 rounded-lg border hover:border-green-500/50 transition-colors">
                            <benefit.icon className="h-12 w-12 text-green-500 mb-4" />
                            <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                            <p className="text-muted-foreground">{benefit.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}