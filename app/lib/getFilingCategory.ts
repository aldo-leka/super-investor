// lib/getFilingCategory.ts

export const FILING_CATEGORIES = [
    'All annual, quarterly, and current reports',
    'Registration statements and prospectuses',
    'Insider equity awards, transactions, and ownership',
    'Beneficial ownership reports',
    'Exempt offerings',
    'Filing review correspondence',
    'SEC orders and notices',
    'Proxy materials',
    'Tender offers and going private transactions',
    'Trust indenture filings'
];

// You can expand this as needed; here are some common examples:
export function getFilingCategory(formType: string): string {
    const normalized = formType.toUpperCase();

    if (
        ['10-K', '10-K/A', '10-Q', '10-Q/A', '8-K', '8-K/A', '20-F', '20-F/A', '6-K'].includes(normalized)
    ) {
        return 'All annual, quarterly, and current reports';
    }

    if (
        normalized.startsWith('S-') || normalized.startsWith('F-') ||
        normalized.startsWith('424') || normalized === '485BPOS'
    ) {
        return 'Registration statements and prospectuses';
    }

    if (['3', '3/A', '4', '4/A', '5', '5/A'].includes(normalized)) {
        return 'Insider equity awards, transactions, and ownership';
    }

    if (
        ['SC 13D', 'SC 13D/A', 'SC 13G', 'SC 13G/A'].includes(normalized)
    ) {
        return 'Beneficial ownership reports';
    }

    if (['144', '144/A'].includes(normalized)) {
        return 'Exempt offerings';
    }

    if (['CORRESP', 'UPLOAD'].includes(normalized)) {
        return 'Filing review correspondence';
    }

    if (normalized.startsWith('NT ') || normalized === 'NT-NSAR') {
        return 'SEC orders and notices';
    }

    if (
        normalized.includes('DEF') || normalized.includes('PRE') || normalized.includes('PRER') ||
        normalized.includes('DEFM') || normalized.includes('DFAN')
    ) {
        return 'Proxy materials';
    }

    if (
        normalized.startsWith('SC TO') || normalized.startsWith('SC 13E') ||
        normalized.startsWith('SC14D') || normalized === 'CB'
    ) {
        return 'Tender offers and going private transactions';
    }

    if (
        normalized === '305B2' || normalized === 'T-3' || normalized === 'T-6'
    ) {
        return 'Trust indenture filings';
    }

    return 'Other';
}
