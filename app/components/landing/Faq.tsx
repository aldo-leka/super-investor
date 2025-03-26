import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
    {
        question: 'What types of filings can I access?',
        answer: 'You can access all SEC filings including 10-K, 10-Q, 8-K, S-1, and more. Our platform makes it easy to read and analyze annual reports, quarterly reports, material events, and registration statements from publicly traded companies.'
    },
    {
        question: 'How current is your filing data?',
        answer: 'Our platform syncs with the SEC EDGAR database in real-time. New filings are typically available within minutes of being published on the SEC website.'
    },
    {
        question: 'Can I download financial data from filings?',
        answer: 'Yes! You can download tables and financial data in CSV format. The Intermediate plan also allows you to download entire filings as epub for offline reading and includes advanced features like custom notes and alerts.'
    },
    {
        question: 'Do you offer filing alerts?',
        answer: 'Yes, with our Intermediate plan you can set up custom alerts for specific companies, filing types, or keywords. Get notified immediately when companies you follow file important documents.'
    },
    {
        question: 'How does the free trial work?',
        answer: 'You can try any plan free for 7 days. During the trial, you\'ll have full access to all features of your chosen plan. You can cancel anytime during the trial period and won\'t be charged.'
    },
    {
        question: 'Can I cancel my subscription anytime?',
        answer: 'Yes, there\'s no lock-in period and you can cancel your subscription at any time. When cancelling, you\'ll maintain access to your plan\'s features until the end of your current billing period.'
    },
    {
        question: 'Do you offer refunds?',
        answer: 'Yes! We offer a 7-day money-back guarantee. If you\'re not satisfied with your subscription, you can request a refund within 7 days of being charged.'
    },
    {
        question: 'I have another question',
        answer: 'We\'re here to help! Contact us at support@superinvestor.com and we\'ll get back to you as soon as possible. 👋'
    }
];

export function Faq() {
    return (
        <div id="faq" className="container mx-auto px-4 py-16">
            <div className="max-w-3xl mx-auto">
                <h2 className="text-3xl font-bold mb-8">Frequently Asked Questions</h2>
                <Accordion type="single" collapsible>
                    {faqs.map((faq, index) => (
                        <AccordionItem key={index} value={`item-${index}`}>
                            <AccordionTrigger>{faq.question}</AccordionTrigger>
                            <AccordionContent>{faq.answer}</AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </div>
    );
}