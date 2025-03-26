'use client';

import {Play} from 'lucide-react';
import {Button} from "@/components/ui/button";

export function FoundersStory() {
    return (
        <section className="py-20">
            <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <div className="rounded-xl overflow-hidden mb-6">
                                <img
                                    src="https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80"
                                    alt="Founder"
                                    className="w-full h-auto"
                                />
                            </div>
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold mb-2">
                                heyo! It's Aldo
                                <span className="text-muted-foreground font-normal text-lg"> (the guy who made Super Investor)</span>
                            </h2>
                            <div className="space-y-4 text-lg">
                                <p>
                                    For a long time, I have been using SEC filings to find investment opportunities.
                                    Unfortunately they fall short of intuitiveness and ease of use.
                                    I needed a better way to do my investment research.
                                </p>
                                <p>
                                    I wanted to use existing tools but they all charged ridiculous prices and were
                                    incredibly complex. Most tools wanted $70+ per month for basic features!
                                </p>
                                <p>
                                    So I built Super Investor for myself, but it turns out many others had the same
                                    problem. That's how Super Investor was born.
                                </p>
                                <p>
                                    I've since used Super Investor daily to analyze hundreds of companies - which has
                                    helped me and other investors make better investment decisions at an <span className="underline">unbeatable price</span>.
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="mt-12 text-center">
                        <h3 className="text-2xl font-semibold mb-6">
                            Want to see how I use Super Investor daily? Check out this video
                        </h3>
                        <div id="demo"
                            className="aspect-video max-w-3xl mx-auto rounded-xl overflow-hidden bg-muted/30 flex items-center justify-center">
                            <Button size="lg" className="gap-2">
                                <Play className="h-6 w-6"/>
                                Watch the demo
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}