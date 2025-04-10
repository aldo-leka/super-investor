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
import { toast } from 'sonner';

const plans = [
    {
        name: 'Starter',
        label: 'Perfect for individual investors',
        monthlyPrice: 9,
        yearlyPrice: 64,
        yearlyDiscount: 44,
        features: [
            'Access to all public filings',
            'Enhanced filing viewer',
            'Email support'
        ],
        popular: false,
        priceId: 'price_basic'
    },
    {
        name: 'Intermediate',
        label: 'For serious investors',
        monthlyPrice: 18,
        yearlyPrice: 129,
        yearlyDiscount: 87,
        features: [
            'All Starter features',
            'Filing alerts',
            'Download tables as CSV',
            'Download as epub'
        ],
        popular: true,
        priceId: 'price_pro'
    },
    {
        name: 'Advanced',
        label: 'For professional investors',
        monthlyPrice: 27,
        yearlyPrice: 194,
        yearlyDiscount: 130,
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
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
    const [isFreeTrial, setIsFreeTrial] = useState(true);
    const [loading, setLoading] = useState(false);

    const handleSubscribe = async (plan: typeof plans[0]) => {
        if (plan.disabled) return;

        try {
            setLoading(true);

            // Create checkout session
            const response = await fetch('/api/subscription/create-checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    priceId: plan.priceId,
                    billingCycle,
                    trialDays: isFreeTrial ? 7 : 0,
                    successUrl: `${window.location.origin}/subscription/success`,
                    cancelUrl: `${window.location.origin}/subscription/canceled`,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to create checkout session');
            }

            const { url } = await response.json();
            window.location.href = url;
        } catch (error) {
            console.error('Subscription error:', error);
            toast.error('Failed to start subscription process. Please try again.');
        } finally {
            setLoading(false);
        }
    };

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
                            40% OFF
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
                                {billingCycle === 'yearly' && (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                        40% OFF
                                    </span>
                                )}
                            </div>
                            <div className="mt-4">
                                <div className="flex items-baseline">
                                    <span className="text-3xl font-bold">$</span>
                                    <span className="text-5xl font-bold">{billingCycle === 'monthly' ? plan.monthlyPrice : (plan.yearlyPrice / 12).toFixed(2)}</span>
                                    <span className="text-muted-foreground">/month</span>
                                </div>
                                {billingCycle === 'yearly' && (
                                    <>
                                        <div className="mt-1 text-sm text-muted-foreground">
                                            Billed as ${plan.yearlyPrice}/year
                                        </div>
                                        <div className="mt-1 text-sm text-green-600">
                                            Save ${plan.yearlyDiscount} with yearly pricing (40% off)
                                        </div>
                                    </>
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
                                disabled={plan.disabled || loading}
                                onClick={() => handleSubscribe(plan)}
                            >
                                {plan.disabled 
                                    ? 'Coming Soon' 
                                    : loading 
                                        ? 'Processing...' 
                                        : isFreeTrial 
                                            ? 'Start 7 day free trial →'
                                            : 'Get started →'
                                }
                            </Button>
                            <div className="text-sm text-muted-foreground text-center flex items-center justify-center gap-1.5">
                                <Shield className="h-4 w-4" />
                                {plan.disabled 
                                    ? 'Register interest below' 
                                    : isFreeTrial 
                                        ? '$0.00 due today, cancel anytime'
                                        : '7 day money-back guarantee'
                                }
                            </div>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
}