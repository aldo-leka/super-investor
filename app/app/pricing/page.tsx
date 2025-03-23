'use client';

import { Check, Sparkles } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

const plans = [
    {
        name: 'Free',
        price: '$0',
        description: 'Basic access to filings',
        features: [
            'View SEC filings',
            'Basic search functionality',
            'Download filings as EPUB',
            'Mobile-friendly interface'
        ]
    },
    {
        name: 'Pro',
        price: '$29',
        description: 'Advanced features with AI assistance',
        features: [
            'Everything in Free',
            'AI-powered filing analysis',
            'Chat with filings using AI',
            'Advanced filtering options',
            'Customizable alerts',
            'Priority support'
        ]
    }
];

export default function PricingPage() {
    // const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

    const handleSubscribe = async (planName: string) => {
        // TODO: Implement Stripe checkout
        // setSelectedPlan(planName);
        console.log(planName);
    };

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-16">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold mb-4">Upgrade Your Investment Research</h1>
                    <p className="text-xl text-muted-foreground">
                        Get AI-powered insights and advanced features
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                    {plans.map((plan) => (
                        <Card key={plan.name} className={plan.name === 'Pro' ? 'border-primary' : ''}>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    {plan.name}
                                    {plan.name === 'Pro' && <Sparkles className="h-5 w-5 text-yellow-500" />}
                                </CardTitle>
                                <CardDescription>
                                    <span className="text-3xl font-bold">{plan.price}</span>
                                    {plan.price !== '$0' && <span className="text-muted-foreground">/month</span>}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2">
                                    {plan.features.map((feature) => (
                                        <li key={feature} className="flex items-center gap-2">
                                            <Check className="h-4 w-4 text-green-500" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                            <CardFooter>
                                <Button
                                    className="w-full"
                                    variant={plan.name === 'Pro' ? 'default' : 'outline'}
                                    onClick={() => handleSubscribe(plan.name)}
                                >
                                    {plan.name === 'Free' ? 'Get Started' : 'Subscribe Now'}
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>

                <div className="mt-16 text-center">
                    <h2 className="text-2xl font-bold mb-4">Why Choose Pro?</h2>
                    <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                        <div>
                            <h3 className="text-lg font-semibold mb-2">AI-Powered Analysis</h3>
                            <p className="text-muted-foreground">
                                Get instant insights and summaries from complex filings using advanced AI
                            </p>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold mb-2">Chat with Documents</h3>
                            <p className="text-muted-foreground">
                                Ask questions and get answers directly from filing contents
                            </p>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold mb-2">Advanced Features</h3>
                            <p className="text-muted-foreground">
                                Access premium tools and customization options
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}