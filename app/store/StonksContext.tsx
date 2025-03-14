"use client";

import {createContext, ReactNode, useContext, useState} from "react";
import {TickerApi} from "@/lib/types";

interface StonksContextType {
    selectedTicker: TickerApi;
    setSelectedTicker: (ticker: TickerApi | null) => void;
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
    const [selectedTicker, setSelectedTicker] = useState<TickerApi | null>();

    return (
        <StonksContext value={{selectedTicker, setSelectedTicker}}>
            {children}
        </StonksContext>
    );
}