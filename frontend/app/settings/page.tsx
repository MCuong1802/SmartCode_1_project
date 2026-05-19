'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../components/Sidebar';
import TopBarActions from '../components/TopBarActions';
import { useTheme, Theme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useFontSize } from '../contexts/FontSizeContext';

const THEMES: { id: Theme; label: string; primary: string; bg: string; descKey: string }[] = [
    { id: 'theme-default', label: 'Indigo', primary: '#3525cd', bg: '#f8f9ff', descKey: 'themeIndigo' },
    { id: 'theme-ocean', label: 'Ocean', primary: '#0369a1', bg: '#f0f9ff', descKey: 'themeOcean' },
    { id: 'theme-forest', label: 'Forest', primary: '#166534', bg: '#f0fdf4', descKey: 'themeForest' },
    { id: 'theme-dark', label: 'Dark', primary: '#818cf8', bg: '#0f172a', descKey: 'themeDark' },
];

export default function SettingsPage() {
    const router = useRouter();
    const { theme, setTheme } = useTheme();
    const { t, language, setLanguage } = useLanguage();
    const { fontSize, setFontSize } = useFontSize();
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (!token) router.push('/login');
    }, [router]);

    const handleSave = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <div className="bg-background text-on-surface flex h-screen overflow-hidden font-body-md antialiased w-full">
            <Sidebar />

            <main className="flex-grow flex flex-col h-screen overflow-y-auto bg-background">
                <header className="sticky top-0 z-50 flex justify-between items-center w-full px-lg py-sm bg-surface/80 backdrop-blur-md border-b border-outline-variant shadow-sm">
                    <h1 className="font-headline-sm text-headline-sm text-on-surface">{t('titleSettings')}</h1>
                    <TopBarActions />
                </header>

                <div className="p-lg max-w-2xl mx-auto w-full flex flex-col gap-xl">

                    {/* Theme Section */}
                    <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg">
                        <h2 className="font-headline-sm text-headline-sm text-on-surface mb-xs">{t('appearance')}</h2>
                        <p className="text-body-sm text-on-surface-variant mb-lg">{t('appearanceDesc')}</p>
                        <div className="grid grid-cols-2 gap-md">
                            {THEMES.map((th) => (
                                <button
                                    key={th.id}
                                    onClick={() => setTheme(th.id)}
                                    className={`flex items-center gap-md p-md rounded-xl border-2 transition-all text-left ${theme === th.id
                                        ? 'border-primary bg-primary-fixed'
                                        : 'border-outline-variant hover:border-outline bg-surface'
                                        }`}
                                >
                                    <div
                                        className="w-10 h-10 rounded-lg shrink-0 flex items-center justify-center"
                                        style={{ backgroundColor: th.bg, border: `3px solid ${th.primary}` }}
                                    >
                                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: th.primary }} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-on-surface text-body-sm">{th.label}</p>
                                        <p className="text-on-surface-variant text-label-md">{t(th.descKey as any)}</p>
                                    </div>
                                    {theme === th.id && (
                                        <span className="material-symbols-outlined text-primary ml-auto">check_circle</span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* Display Section */}
                    <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg">
                        <h2 className="font-headline-sm text-headline-sm text-on-surface mb-xs">{t('display')}</h2>
                        <p className="text-body-sm text-on-surface-variant mb-lg">{t('displayDesc')}</p>

                        <div className="flex flex-col gap-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-bold text-on-surface text-body-md">{t('fontSize')}</p>
                                    <p className="text-on-surface-variant text-body-sm">{t('fontSizeDesc')}</p>
                                </div>
                                <select
                                    value={fontSize}
                                    onChange={(e) => setFontSize(e.target.value as 'small' | 'medium' | 'large')}
                                    className="bg-surface border border-outline-variant rounded-lg px-md py-sm text-on-surface outline-none focus:border-primary"
                                >
                                    <option value="small">{t('fontSmall')}</option>
                                    <option value="medium">{t('fontMedium')}</option>
                                    <option value="large">{t('fontLarge')}</option>
                                </select>
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-bold text-on-surface text-body-md">{t('language')}</p>
                                    <p className="text-on-surface-variant text-body-sm">{t('languageDesc')}</p>
                                </div>
                                <select
                                    value={language}
                                    onChange={(e) => setLanguage(e.target.value as 'vi' | 'en')}
                                    className="bg-surface border border-outline-variant rounded-lg px-md py-sm text-on-surface outline-none focus:border-primary"
                                >
                                    <option value="vi">Tiếng Việt</option>
                                    <option value="en">English</option>
                                </select>
                            </div>
                        </div>
                    </section>

                    {/* About Section */}
                    <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg">
                        <h2 className="font-headline-sm text-headline-sm text-on-surface mb-lg">{t('about')}</h2>
                        <div className="flex flex-col gap-sm text-body-sm text-on-surface-variant">
                            <div className="flex justify-between"><span>{t('version')}</span><span className="text-on-surface font-bold">1.0.0</span></div>
                            <div className="flex justify-between"><span>{t('author')}</span><span className="text-on-surface font-bold">SmartCode Team</span></div>
                        </div>
                    </section>

                    <button
                        onClick={handleSave}
                        className="w-full bg-primary text-on-primary py-md rounded-lg font-bold transition-all active:scale-95 flex items-center justify-center gap-sm"
                    >
                        {saved ? (
                            <><span className="material-symbols-outlined">check</span>{t('savedSettings')}</>
                        ) : (
                            <><span className="material-symbols-outlined">save</span>{t('saveSettings')}</>
                        )}
                    </button>
                </div>
            </main>
        </div>
    );
}
