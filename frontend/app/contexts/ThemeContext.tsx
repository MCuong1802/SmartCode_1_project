'use client';

import { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'theme-default' | 'theme-ocean' | 'theme-forest' | 'theme-dark';

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
    theme: 'theme-default',
    setTheme: () => { },
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setThemeState] = useState<Theme>('theme-default');

    useEffect(() => {
        const saved = localStorage.getItem('app-theme') as Theme | null;
        const initial = saved || 'theme-default';
        setThemeState(initial);
        applyTheme(initial);
    }, []);

    const applyTheme = (t: Theme) => {
        const html = document.documentElement;
        html.classList.remove('theme-default', 'theme-ocean', 'theme-forest', 'theme-dark');
        html.classList.add(t);
    };

    const setTheme = (t: Theme) => {
        setThemeState(t);
        localStorage.setItem('app-theme', t);
        applyTheme(t);
    };

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export const useTheme = () => useContext(ThemeContext);
