"use client";

import {createContext, ReactNode, useContext, useState} from "react";
import {Filing, Ticker} from "@/lib/types";

interface StonksContextType {
    selectedTicker: Ticker | null | undefined;
    setSelectedTicker: (ticker: Ticker | null | undefined) => void;
    selectedFiling: Filing | null | undefined;
    setSelectedFiling: (filing: Filing | null | undefined) => void;
}

export const StonksContext = createContext<StonksContextType | undefined>(undefined);

export const useStonks = () => {
    const context = useContext(StonksContext);
    if (!context) {
        throw new Error("useStonks must be used within a StonksContextProvider");
    }
    return context;
};

export function StonksContextProvider({children}: { children: ReactNode }) {
    const [selectedTicker, setSelectedTicker] = useState<Ticker | null>();
    const [selectedFiling, setSelectedFiling] = useState<Filing | null>();

    return (
        <StonksContext value={{
            selectedTicker,
            setSelectedTicker,
            selectedFiling,
            setSelectedFiling
        }}
        >
            {children}
        </StonksContext>
    );
}