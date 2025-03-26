'use client';

import { useState } from 'react';
import { Check, HelpCircle, Shield, Clock } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

const plans = [
    {
        name: 'Starter',
        label: 'Perfect for individual investors',
        monthlyPrice: 9,
        yearlyPrice: 64,
        yearlyDiscount: 40,
        features: [
            'Access to all public filings',
            'Basic search functionality',
            'Download tables as CSV',
            'Simple filing viewer',
            'Email support'
        ],
        popular: false
    },
    {
        name: 'Intermediate',
        label: 'For serious investors',
        monthlyPrice: 19,
        yearlyPrice: 190,
        yearlyDiscount: 40,
        features: [
            'All Starter features',
            'Take notes on filings',
            'Download as epub',
            'Filing alerts',
            'Customizable watchlists'
        ],
        popular: true
    },
    {
        name: 'Advanced',
        label: 'For professional investors',
        monthlyPrice: 99.99,
        yearlyPrice: 999,
        yearlyDiscount: 200,
        features: [
            'All Intermediate features',
            'AI-powered filing analysis',
            'Custom filing templates',
            'Priority support',
            'API access',
            'Bulk data export',
            'Team collaboration'
        ],
        popular: false,
        disabled: true
    }
];

export function Pricing() {
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
    const [isFreeTrial, setIsFreeTrial] = useState(true);

    return (
        <div id="pricing" className="container mx-auto px-4 py-16">
            <div className="text-center mb-12">
                <h2 className="text-4xl font-bold mb-4">Supercharge your investment research</h2>
                <p className="text-xl text-muted-foreground">Choose the plan that matches your investment needs</p>
            </div>

            {/* Billing Toggle */}
            <div className="flex flex-col items-center gap-6 mb-12">
                <div className="inline-flex items-center rounded-full border p-1 bg-background">
                    <button
                        className={`px-4 py-2 rounded-full text-sm ${billingCycle === 'monthly' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
                            }`}
                        onClick={() => setBillingCycle('monthly')}
                    >
                        Monthly
                    </button>
                    <button
                        className={`px-4 py-2 rounded-full text-sm flex items-center gap-2 ${billingCycle === 'yearly' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
                            }`}
                        onClick={() => setBillingCycle('yearly')}
                    >
                        Yearly
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            20% OFF
                        </span>
                    </button>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Free trial</span>
                    <Switch
                        checked={isFreeTrial}
                        onCheckedChange={setIsFreeTrial}
                    />
                </div>
            </div>

            {/* Pricing Cards */}
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
                {plans.map((plan) => (
                    <Card
                        key={plan.name}
                        className={`flex flex-col relative ${plan.popular ? 'border-2 border-green-500' : ''
                            } ${plan.disabled ? 'opacity-75' : ''
                            }`}
                    >
                        {plan.disabled && (
                            <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px] rounded-lg z-10 flex items-center justify-center">
                                <div className="bg-muted/90 px-4 py-2 rounded-full flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    <span className="font-medium">Coming Soon</span>
                                </div>
                            </div>
                        )}
                        <CardHeader>
                            <div className="flex items-start justify-between mb-2">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        {plan.name}
                                        {plan.popular && (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                Most popular
                                            </span>
                                        )}
                                    </CardTitle>
                                    <CardDescription>{plan.label}</CardDescription>
                                </div>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                    20% OFF
                                </span>
                            </div>
                            <div className="mt-4">
                                <div className="flex items-baseline">
                                    <span className="text-3xl font-bold">$</span>
                                    <span className="text-5xl font-bold">{billingCycle === 'monthly' ? plan.monthlyPrice : (plan.yearlyPrice / 12).toFixed(2)}</span>
                                    <span className="text-muted-foreground">/month</span>
                                </div>
                                <div className="mt-1 text-sm text-muted-foreground">
                                    Billed as ${billingCycle === 'monthly' ? (plan.monthlyPrice * 12).toFixed(2) : plan.yearlyPrice}/year
                                </div>
                                {billingCycle === 'yearly' && (
                                    <div className="mt-1 text-sm text-green-600">
                                        Save ${plan.yearlyDiscount} with yearly pricing (20% off)
                                    </div>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="flex-grow">
                            <ul className="space-y-3">
                                {plan.features.map((feature, index) => (
                                    <li key={index} className="flex items-center gap-2">
                                        <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                                        <span>{feature}</span>
                                        {(feature.includes('API access') || feature.includes('AI-powered')) && (
                                            <HelpCircle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                        <CardFooter className="mt-auto flex flex-col gap-4">
                            <Button
                                className="w-full"
                                variant={plan.popular ? 'default' : 'outline'}
                                disabled={plan.disabled}
                            >
                                {plan.disabled ? 'Coming Soon' : 'Start 7 day free trial →'}
                            </Button>
                            <div className="text-sm text-muted-foreground text-center flex items-center justify-center gap-1.5">
                                <Shield className="h-4 w-4" />
                                {plan.disabled ? 'Register interest below' : '$0.00 due today, cancel anytime'}
                            </div>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
}