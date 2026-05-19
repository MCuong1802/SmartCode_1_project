'use client';

import { createContext, useContext, useEffect, useState } from 'react';

export type Lang = 'vi' | 'en';

const translations = {
    vi: {
        // Sidebar
        newNote: 'Ghi chú mới',
        dashboard: 'Dashboard',
        allNotes: 'Tất cả ghi chú',
        categories: 'Danh mục',
        reminders: 'Lời nhắc',
        trash: 'Thùng rác',
        settings: 'Cài đặt',
        profile: 'Hồ sơ',
        logout: 'Đăng xuất',
        personalWorkspace: 'Không gian cá nhân',
        // Page titles
        titleAllNotes: 'Tất cả ghi chú',
        titleCategories: 'Danh mục',
        titleReminders: 'Lời nhắc',
        titleTrash: 'Thùng rác',
        titleSettings: 'Cài đặt',
        titleProfile: 'Hồ sơ của tôi',
        // Settings
        appearance: 'Giao diện',
        appearanceDesc: 'Chọn màu chủ đạo cho ứng dụng',
        display: 'Hiển thị',
        displayDesc: 'Tuỳ chỉnh cách hiển thị nội dung',
        fontSize: 'Cỡ chữ',
        fontSizeDesc: 'Điều chỉnh kích thước chữ',
        fontSmall: 'Nhỏ',
        fontMedium: 'Trung bình',
        fontLarge: 'Lớn',
        language: 'Ngôn ngữ',
        languageDesc: 'Ngôn ngữ giao diện',
        about: 'Thông tin ứng dụng',
        version: 'Phiên bản',
        author: 'Tác giả',
        saveSettings: 'Lưu cài đặt',
        savedSettings: 'Đã lưu!',
        // Themes
        themeIndigo: 'Mặc định - Xanh chàm',
        themeOcean: 'Đại dương - Xanh biển',
        themeForest: 'Rừng xanh - Xanh lá',
        themeDark: 'Tối - Nền đen',
        // Reminders page
        notifBlocked: 'Thông báo bị chặn',
        enableNotif: 'Bật thông báo',
        addReminder: 'Thêm lời nhắc',
        // Trash page
        emptyTrash: 'Dọn sạch thùng rác',
    },
    en: {
        // Sidebar
        newNote: 'New Note',
        dashboard: 'Dashboard',
        allNotes: 'All Notes',
        categories: 'Categories',
        reminders: 'Reminders',
        trash: 'Trash',
        settings: 'Settings',
        profile: 'Profile',
        logout: 'Logout',
        personalWorkspace: 'Personal Workspace',
        // Page titles
        titleAllNotes: 'All Notes',
        titleCategories: 'Categories',
        titleReminders: 'Reminders',
        titleTrash: 'Trash',
        titleSettings: 'Settings',
        titleProfile: 'My Profile',
        // Settings
        appearance: 'Appearance',
        appearanceDesc: 'Choose a color theme for the app',
        display: 'Display',
        displayDesc: 'Customize how content is displayed',
        fontSize: 'Font Size',
        fontSizeDesc: 'Adjust the text size',
        fontSmall: 'Small',
        fontMedium: 'Medium',
        fontLarge: 'Large',
        language: 'Language',
        languageDesc: 'Interface language',
        about: 'About',
        version: 'Version',
        author: 'Author',
        saveSettings: 'Save Settings',
        savedSettings: 'Saved!',
        // Themes
        themeIndigo: 'Default - Indigo',
        themeOcean: 'Ocean - Blue',
        themeForest: 'Forest - Green',
        themeDark: 'Dark mode',
        // Reminders page
        notifBlocked: 'Notifications blocked',
        enableNotif: 'Enable notifications',
        addReminder: 'Add reminder',
        // Trash page
        emptyTrash: 'Empty trash',
    },
} as const;

export type TranslationKey = keyof typeof translations.vi;

interface LanguageContextType {
    language: Lang;
    setLanguage: (lang: Lang) => void;
    t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType>({
    language: 'vi',
    setLanguage: () => { },
    t: (key) => translations.vi[key],
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguageState] = useState<Lang>('vi');

    useEffect(() => {
        const saved = (localStorage.getItem('app-language') as Lang) || 'vi';
        setLanguageState(saved);
        document.documentElement.lang = saved;
    }, []);

    const setLanguage = (lang: Lang) => {
        setLanguageState(lang);
        localStorage.setItem('app-language', lang);
        document.documentElement.lang = lang;
    };

    const t = (key: TranslationKey): string => translations[language][key];

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export const useLanguage = () => useContext(LanguageContext);
