"use client";

import {createContext, ReactNode, useContext, useState} from "react";
import {Filing, TickerApi} from "@/lib/types";

interface StonksContextType {
    selectedTicker: Ticker;
    setSelectedTicker: (ticker: Ticker | null) => void;
    selectedFiling: Filing;
    setSelectedFiling: (filing: Filing | null) => void;
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