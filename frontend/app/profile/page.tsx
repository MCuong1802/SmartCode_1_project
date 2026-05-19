'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../components/Sidebar';
import TopBarActions from '../components/TopBarActions';
import { useLanguage } from '../contexts/LanguageContext';

export default function ProfilePage() {
    const router = useRouter();
    const { t } = useLanguage();
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [createdAt, setCreatedAt] = useState('');
    const [newName, setNewName] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (!token) { router.push('/login'); return; }

        fetch('http://localhost:3001/auth/profile', {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((r) => r.json())
            .then((data) => {
                setFullName(data.fullName || '');
                setNewName(data.fullName || '');
                setEmail(data.email || '');
                setCreatedAt(data.createdAt ? new Date(data.createdAt).toLocaleDateString('vi-VN') : '');
                setIsLoading(false);
            })
            .catch(() => { setError('Không thể tải thông tin hồ sơ'); setIsLoading(false); });
    }, [router]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName.trim()) { setError('Tên không được để trống'); return; }
        setError(''); setMessage(''); setIsSaving(true);
        const token = localStorage.getItem('access_token');
        try {
            const res = await fetch('http://localhost:3001/auth/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ fullName: newName.trim() }),
            });
            const data = await res.json();
            if (!res.ok) { setError(data.message || 'Cập nhật thất bại'); }
            else { setFullName(data.fullName); setMessage('Cập nhật hồ sơ thành công!'); }
        } catch {
            setError('Không thể kết nối đến server');
        } finally {
            setIsSaving(false);
        }
    };

    const initials = fullName ? fullName.split(' ').map((n) => n[0]).slice(-2).join('').toUpperCase() : '?';

    return (
        <div className="bg-background text-on-surface flex h-screen overflow-hidden font-body-md antialiased w-full">
            <Sidebar />

            <main className="flex-grow flex flex-col h-screen overflow-y-auto bg-background">
                <header className="sticky top-0 z-50 flex justify-between items-center w-full px-lg py-sm bg-surface/80 backdrop-blur-md border-b border-outline-variant shadow-sm">
                    <h1 className="font-headline-sm text-headline-sm text-on-surface">{t('titleProfile')}</h1>
                    <TopBarActions />
                </header>

                {isLoading ? (
                    <div className="flex-grow flex items-center justify-center text-on-surface-variant">Đang tải...</div>
                ) : (
                    <div className="p-lg max-w-xl mx-auto w-full flex flex-col gap-xl">

                        {/* Avatar card */}
                        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg flex items-center gap-lg">
                            <div className="w-20 h-20 rounded-full bg-primary-fixed flex items-center justify-center shrink-0">
                                <span className="text-primary font-bold text-[28px]">{initials}</span>
                            </div>
                            <div>
                                <p className="font-headline-sm text-headline-sm text-on-surface">{fullName}</p>
                                <p className="text-on-surface-variant text-body-sm">{email}</p>
                                {createdAt && <p className="text-on-surface-variant text-label-md mt-xs">Tham gia từ {createdAt}</p>}
                            </div>
                        </div>

                        {/* Edit form */}
                        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg">
                            <h2 className="font-headline-sm text-headline-sm text-on-surface mb-lg">Chỉnh sửa thông tin</h2>

                            {error && <div className="mb-md p-sm bg-error-container text-on-error-container rounded-lg text-body-sm">{error}</div>}
                            {message && <div className="mb-md p-sm bg-surface-container text-primary rounded-lg text-body-sm">{message}</div>}

                            <form onSubmit={handleSave} className="flex flex-col gap-lg">
                                <div className="flex flex-col gap-xs">
                                    <label className="font-label-md text-label-md text-on-surface-variant">Họ và tên</label>
                                    <input
                                        className="w-full px-md py-sm bg-surface border border-outline-variant rounded-lg outline-none focus:border-primary text-on-surface"
                                        value={newName}
                                        onChange={(e) => setNewName(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="flex flex-col gap-xs">
                                    <label className="font-label-md text-label-md text-on-surface-variant">Email</label>
                                    <input
                                        className="w-full px-md py-sm bg-surface-container border border-outline-variant rounded-lg text-on-surface-variant cursor-not-allowed"
                                        value={email}
                                        disabled
                                    />
                                    <p className="text-label-md text-on-surface-variant">Email không thể thay đổi</p>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="bg-primary text-on-primary py-md rounded-lg font-bold transition-all active:scale-95 flex items-center justify-center gap-sm disabled:opacity-60"
                                >
                                    <span className="material-symbols-outlined">save</span>
                                    {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
                                </button>
                            </form>
                        </div>

                    </div>
                )}
            </main>
        </div>
    );
}
