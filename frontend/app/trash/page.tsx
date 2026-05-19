'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../components/Sidebar';
import TopBarActions from '../components/TopBarActions';
import { useLanguage } from '../contexts/LanguageContext';

interface TrashedNote {
    id: string;
    title: string;
    content: string;
    deletedAt: string;
}

export default function TrashPage() {
    const router = useRouter();
    const { t } = useLanguage();
    const [notes, setNotes] = useState<TrashedNote[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [actionMsg, setActionMsg] = useState('');

    const token = () => localStorage.getItem('access_token') || '';

    const fetchTrash = () => {
        setIsLoading(true);
        fetch('http://localhost:3001/notes/trash', {
            headers: { Authorization: `Bearer ${token()}` },
        })
            .then((r) => r.json())
            .then((data) => { if (Array.isArray(data)) setNotes(data); })
            .finally(() => setIsLoading(false));
    };

    useEffect(() => {
        if (!localStorage.getItem('access_token')) { router.push('/login'); return; }
        fetchTrash();
    }, [router]);

    const notify = (msg: string) => { setActionMsg(msg); setTimeout(() => setActionMsg(''), 2500); };

    const restore = async (id: string) => {
        await fetch(`http://localhost:3001/notes/${id}/restore`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token()}` },
        });
        notify('Đã khôi phục ghi chú!');
        fetchTrash();
    };

    const deletePermanent = async (id: string) => {
        if (!confirm('Xóa vĩnh viễn? Không thể khôi phục!')) return;
        await fetch(`http://localhost:3001/notes/${id}/permanent`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token()}` },
        });
        notify('Đã xóa vĩnh viễn!');
        fetchTrash();
    };

    const emptyTrash = async () => {
        if (!confirm('Xóa tất cả ghi chú trong thùng rác? Không thể khôi phục!')) return;
        await Promise.all(notes.map((n) =>
            fetch(`http://localhost:3001/notes/${n.id}/permanent`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token()}` },
            })
        ));
        notify('Đã dọn sạch thùng rác!');
        setNotes([]);
    };

    return (
        <div className="bg-background text-on-surface flex h-screen overflow-hidden font-body-md antialiased w-full">
            <Sidebar />

            <main className="flex-grow flex flex-col h-screen overflow-y-auto bg-background">
                <header className="sticky top-0 z-50 flex justify-between items-center w-full px-lg py-sm bg-surface/80 backdrop-blur-md border-b border-outline-variant shadow-sm">
                    <div className="flex items-center gap-sm">
                        <span className="material-symbols-outlined text-on-surface-variant">delete</span>
                        <h1 className="font-headline-sm text-headline-sm text-on-surface">{t('titleTrash')}</h1>
                    </div>
                    <div className="flex items-center gap-md">
                        {notes.length > 0 && (
                            <button
                                onClick={emptyTrash}
                                className="flex items-center gap-xs px-md py-sm bg-error-container text-on-error-container rounded-lg text-body-sm font-bold hover:opacity-80 transition active:scale-95"
                            >
                                <span className="material-symbols-outlined text-[18px]">delete_forever</span>
                                {t('emptyTrash')}
                            </button>
                        )}
                        <TopBarActions />
                    </div>
                </header>

                {actionMsg && (
                    <div className="mx-lg mt-md p-sm bg-surface-container text-primary rounded-lg text-body-sm text-center">{actionMsg}</div>
                )}

                <div className="p-lg max-w-3xl mx-auto w-full">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-2xl text-on-surface-variant">Đang tải...</div>
                    ) : notes.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-2xl text-on-surface-variant gap-md">
                            <span className="material-symbols-outlined text-[64px] opacity-30">delete</span>
                            <p className="text-body-lg">Thùng rác trống</p>
                            <p className="text-body-sm">Các ghi chú đã xóa sẽ xuất hiện tại đây</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-md">
                            <p className="text-body-sm text-on-surface-variant mb-sm">{notes.length} ghi chú trong thùng rác</p>
                            {notes.map((note) => (
                                <div
                                    key={note.id}
                                    className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md flex items-start justify-between gap-md"
                                >
                                    <div className="flex-grow min-w-0">
                                        <p className="font-bold text-on-surface line-clamp-1">{note.title || 'Không có tiêu đề'}</p>
                                        <p className="text-on-surface-variant text-body-sm line-clamp-2 mt-xs">{note.content}</p>
                                        <p className="text-label-md text-outline mt-sm">
                                            Đã xóa {new Date(note.deletedAt).toLocaleDateString('vi-VN')}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-xs shrink-0">
                                        <button
                                            onClick={() => restore(note.id)}
                                            title="Khôi phục"
                                            className="p-sm text-primary hover:bg-primary-fixed rounded-lg transition"
                                        >
                                            <span className="material-symbols-outlined text-[20px]">restore</span>
                                        </button>
                                        <button
                                            onClick={() => deletePermanent(note.id)}
                                            title="Xóa vĩnh viễn"
                                            className="p-sm text-error hover:bg-error-container rounded-lg transition"
                                        >
                                            <span className="material-symbols-outlined text-[20px]">delete_forever</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
