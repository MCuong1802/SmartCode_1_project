'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useLanguage } from '../contexts/LanguageContext';

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { t } = useLanguage();

    const navItem = (href: string, icon: string, label: string) => {
        const active = pathname === href;
        return (
            <Link
                href={href}
                className={`flex items-center gap-md px-md py-sm rounded-lg font-body-md text-body-md transition-all duration-200 ease-in-out active:scale-95 ${active
                    ? 'bg-primary-fixed text-on-primary-fixed font-bold'
                    : 'text-on-surface-variant hover:bg-surface-container'
                    }`}
            >
                <span className="material-symbols-outlined">{icon}</span>
                <span>{label}</span>
            </Link>
        );
    };

    return (
        <aside className="w-[260px] h-screen sticky top-0 left-0 border-r border-outline-variant bg-surface hidden md:flex flex-col p-md shrink-0">
            <div className="mb-xl px-sm">
                <h1 className="font-bold text-primary text-[20px] leading-[28px]">NotesApp</h1>
                <p className="text-[14px] leading-[20px] text-on-surface-variant">{t('personalWorkspace')}</p>
            </div>

            <Link
                href="/new-note"
                className="mb-lg flex items-center justify-center gap-sm px-md py-sm bg-primary text-on-primary rounded-lg font-bold transition-all duration-200 ease-in-out active:scale-95 shadow-sm text-center"
            >
                <span className="material-symbols-outlined">add</span>
                <span className="text-[14px]">{t('newNote')}</span>
            </Link>

            <nav className="flex flex-col gap-base flex-grow">
                {navItem('/', 'grid_view', t('dashboard'))}
                {navItem('/all-notes', 'description', t('allNotes'))}
                {navItem('/categories', 'folder', t('categories'))}
                {navItem('/reminders', 'notifications', t('reminders'))}
                {navItem('/trash', 'delete', t('trash'))}
            </nav>

            <div className="mt-auto flex flex-col gap-xs pt-md border-t border-outline-variant shrink-0">
                {navItem('/settings', 'settings', t('settings'))}
                {navItem('/profile', 'account_circle', t('profile'))}
                <button
                    onClick={() => {
                        localStorage.removeItem('access_token');
                        router.push('/login');
                    }}
                    className="flex items-center gap-md px-md py-sm text-error hover:bg-error-container rounded-lg transition-colors duration-200 active:scale-95 text-left w-full font-body-md text-body-md"
                >
                    <span className="material-symbols-outlined">logout</span>
                    <span>{t('logout')}</span>
                </button>
            </div>
        </aside>
    );
}
