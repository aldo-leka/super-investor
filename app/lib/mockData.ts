import { Filing, Note, Stock } from '@/types';

export const mockStocks: Stock[] = [
    {
        symbol: 'AAPL',
        name: 'Apple Inc.',
        description: 'Apple Inc. designs, manufactures and markets smartphones, personal computers, tablets, wearables and accessories, and sells various related services.'
    },
    {
        symbol: 'MSFT',
        name: 'Microsoft Corporation',
        description: 'Microsoft Corporation develops, licenses, and supports software, services, devices, and solutions worldwide.'
    },
    {
        symbol: 'TSLA',
        name: 'Tesla, Inc.',
        description: 'Tesla, Inc. designs, develops, manufactures, leases, and sells electric vehicles, and energy generation and storage systems.'
    },
    {
        symbol: 'NVDA',
        name: 'NVIDIA Corporation',
        description: 'NVIDIA Corporation operates as a visual computing company worldwide, specializing in GPUs and AI technologies.'
    },
    {
        symbol: 'META',
        name: 'Meta Platforms, Inc.',
        description: 'Meta Platforms, Inc. builds technologies that help people connect, find communities, and grow businesses through social media platforms.'
    }
];

export const mockFilings: Filing[] = [
    {
        id: '1',
        symbol: 'AAPL',
        companyName: 'Apple Inc.',
        formType: '10-K',
        filingDate: '2024-02-15',
        content: '',
        sections: [
            {
                title: 'ITEM 1. BUSINESS',
                content: `Apple Inc. designs, manufactures and markets smartphones, personal computers, tablets, wearables and accessories, and sells a variety of related services. The Company's products include iPhone, Mac, iPad, AirPods, Apple TV, Apple Watch, Beats products, and accessories.

The Company operates various platforms, including the App Store, that allow customers to discover and download applications and digital content, such as books, music, video, games, and podcasts.

The Company's products and services include iPhone®, Mac®, iPad®, AirPods®, Apple TV®, Apple Watch®, Beats® products, HomePod™, iPod touch® and accessories. The Company also delivers digital content and applications through the iTunes Store®, App Store®, Mac App Store, TV App Store, Book Store and Apple Music® (collectively "Digital Content and Services").`
            },
            {
                title: 'ITEM 1A. RISK FACTORS',
                content: `The Company's business, financial condition and operating results can be affected by a number of factors, whether currently known or unknown, including but not limited to those described below, any one or more of which could, directly or indirectly, cause the Company's actual financial condition and operating results to vary materially from past, or from anticipated future, financial condition and operating results.

Because of the following factors, as well as other factors affecting the Company's financial condition and operating results, past financial performance should not be considered to be a reliable indicator of future performance, and investors should not use historical trends to anticipate results or trends in future periods.`
            }
        ]
    },
    // ... [Previous mock filings remain the same]
];

export const mockNotes: Note[] = [
    {
        id: '1',
        filingId: '1',
        textSelection: 'smartphones, personal computers, tablets, wearables and accessories',
        content: "Key product categories for Apple",
        timestamp: '2024-03-10T10:00:00Z',
        sectionIndex: 0,
        textPosition: {
            start: 0,
            end: 58
        }
    },
    // ... [Previous mock notes remain the same]
];