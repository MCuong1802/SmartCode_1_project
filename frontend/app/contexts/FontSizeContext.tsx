'use client';

import { createContext, useContext, useEffect, useState } from 'react';

export type FontSize = 'small' | 'medium' | 'large';

interface FontSizeContextType {
    fontSize: FontSize;
    setFontSize: (size: FontSize) => void;
}

const FontSizeContext = createContext<FontSizeContextType>({
    fontSize: 'medium',
    setFontSize: () => { },
});

const applyFontSize = (size: FontSize) => {
    if (size === 'medium') {
        document.documentElement.removeAttribute('data-font-size');
    } else {
        document.documentElement.setAttribute('data-font-size', size);
    }
};

export function FontSizeProvider({ children }: { children: React.ReactNode }) {
    const [fontSize, setFontSizeState] = useState<FontSize>('medium');

    useEffect(() => {
        const saved = (localStorage.getItem('app-font-size') as FontSize) || 'medium';
        setFontSizeState(saved);
        applyFontSize(saved);
    }, []);

    const setFontSize = (size: FontSize) => {
        setFontSizeState(size);
        localStorage.setItem('app-font-size', size);
        applyFontSize(size);
    };

    return (
        <FontSizeContext.Provider value={{ fontSize, setFontSize }}>
            {children}
        </FontSizeContext.Provider>
    );
}

export const useFontSize = () => useContext(FontSizeContext);
