export interface Filing {
    id: string;
    symbol: string;
    companyName: string;
    formType: '10-K' | '10-Q' | '8-K';
    filingDate: string;
    content: string;
    sections: {
        title: string;
        content: string;
    }[];
}

export interface Note {
    id: string;
    filingId: string;
    textSelection: string;
    content: string;
    timestamp: string;
    sectionIndex: number;
    textPosition: {
        start: number;
        end: number;
    };
    userId?: string;
}

export interface User {
    id: string;
    email: string;
    name: string;
}

export interface Stock {
    cik: string;
    ticker: string | null;
    company_name: string;
}

export type FormType = '10-K' | '10-Q' | '8-K' | 'ALL';

export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, name: string) => Promise<void>;
    logout: () => void;
}