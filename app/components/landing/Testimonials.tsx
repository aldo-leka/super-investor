'use client';

import { Star } from 'lucide-react';

const testimonials = [
    {
        name: "Michael Chen",
        role: "Investment Analyst",
        content: "Super Investor has transformed how I analyze company filings. The AI insights are incredibly valuable.",
        rating: 5
    },
    {
        name: "Sarah Johnson",
        role: "Portfolio Manager",
        content: "Best investment research platform I've used. It's simple, fast, and exactly what I was looking for.",
        rating: 5
    },
    {
        name: "David Miller",
        role: "Financial Advisor",
        content: "This platform saves me hours of work every week. The real-time alerts are a game-changer.",
        rating: 5
    }
];

export function Testimonials() {
    return (
        <section className="py-20 bg-muted/50">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl font-bold text-center mb-12">Loved by investors</h2>
                <div className="grid md:grid-cols-3 gap-8">
                    {testimonials.map((testimonial, index) => (
                        <div key={index} className="bg-background p-6 rounded-lg border">
                            <div className="flex items-center gap-1 mb-4">
                                {[...Array(testimonial.rating)].map((_, i) => (
                                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                ))}
                            </div>
                            <p className="mb-4">{testimonial.content}</p>
                            <div>
                                <div className="font-semibold">{testimonial.name}</div>
                                <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}