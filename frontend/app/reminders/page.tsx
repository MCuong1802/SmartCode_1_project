'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../components/Sidebar';
import TopBarActions from '../components/TopBarActions';
import { useLanguage } from '../contexts/LanguageContext';

interface NoteOption {
    id: string;
    title: string;
}

interface Reminder {
    id: string;
    title: string;
    note: string;
    datetime: string;
    done: boolean;
    linkedNoteId?: string;
    linkedNoteTitle?: string;
}

export default function RemindersPage() {
    const router = useRouter();
    const { t } = useLanguage();
    const [reminders, setReminders] = useState<Reminder[]>([]);
    const [notes, setNotes] = useState<NoteOption[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [title, setTitle] = useState('');
    const [note, setNote] = useState('');
    const [datetime, setDatetime] = useState('');
    const [linkedNoteId, setLinkedNoteId] = useState('');
    const [editId, setEditId] = useState<string | null>(null);
    const [notifPermission, setNotifPermission] = useState<NotificationPermission>('default');
    // Toast notification state
    const [toast, setToast] = useState<{ title: string; noteTitle?: string } | null>(null);
    const notifiedRef = useRef<Set<string>>(new Set());
    // Keep a ref to reminders so the interval can read current value
    const remindersRef = useRef<Reminder[]>([]);

    // Load reminders + fetch notes + request notification permission
    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (!token) { router.push('/login'); return; }

        const saved = localStorage.getItem('app-reminders');
        if (saved) {
            const parsed = JSON.parse(saved);
            setReminders(parsed);
            remindersRef.current = parsed;
        }

        // Fetch notes for linking
        fetch('http://localhost:3001/notes', {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((r) => r.json())
            .then((data) => { if (Array.isArray(data)) setNotes(data.map((n: any) => ({ id: n.id, title: n.title }))); })
            .catch(() => { });

        // Request browser notification permission
        if ('Notification' in window) {
            setNotifPermission(Notification.permission);
            if (Notification.permission === 'default') {
                Notification.requestPermission().then((p) => setNotifPermission(p));
            }
        }
    }, [router]);

    // Interval: check every 30s if any reminder is due
    useEffect(() => {
        const check = () => {
            const now = new Date();
            remindersRef.current
                .filter((r) => !r.done)
                .forEach((r) => {
                    if (!r.datetime) return;
                    const due = new Date(r.datetime);
                    const diff = Math.abs(now.getTime() - due.getTime());
                    if (diff <= 60_000 && !notifiedRef.current.has(r.id)) {
                        notifiedRef.current.add(r.id);
                        if ('Notification' in window && Notification.permission === 'granted') {
                            new Notification(`⏰ Lời nhắc: ${r.title}`, {
                                body: r.linkedNoteTitle
                                    ? `Ghi chú: ${r.linkedNoteTitle}${r.note ? '\n' + r.note : ''}`
                                    : r.note || 'Đã đến giờ!',
                                icon: '/favicon.ico',
                            });
                        }
                        setToast({ title: r.title, noteTitle: r.linkedNoteTitle });
                        setTimeout(() => setToast(null), 6000);
                    }
                });
        };

        const id = setInterval(check, 30_000);
        check();
        return () => clearInterval(id);
    }, []);

    const saveList = (list: Reminder[]) => {
        remindersRef.current = list;
        setReminders(list);
        localStorage.setItem('app-reminders', JSON.stringify(list));
    };

    const resetForm = () => {
        setTitle(''); setNote(''); setDatetime(''); setLinkedNoteId(''); setEditId(null); setShowForm(false);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const linked = notes.find((n) => n.id === linkedNoteId);
        if (editId) {
            saveList(reminders.map((r) =>
                r.id === editId
                    ? { ...r, title, note, datetime, linkedNoteId: linked?.id, linkedNoteTitle: linked?.title }
                    : r
            ));
        } else {
            saveList([...reminders, {
                id: Date.now().toString(), title, note, datetime, done: false,
                linkedNoteId: linked?.id, linkedNoteTitle: linked?.title,
            }]);
        }
        resetForm();
    };

    const toggleDone = (id: string) => saveList(reminders.map((r) => r.id === id ? { ...r, done: !r.done } : r));
    const deleteReminder = (id: string) => saveList(reminders.filter((r) => r.id !== id));

    const startEdit = (r: Reminder) => {
        setEditId(r.id);
        setTitle(r.title);
        setNote(r.note);
        setDatetime(r.datetime);
        setLinkedNoteId(r.linkedNoteId || '');
        setShowForm(true);
    };

    const now = new Date();
    const upcoming = reminders.filter((r) => !r.done).sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime());
    const done = reminders.filter((r) => r.done);
    const isOverdue = (dt: string) => dt && new Date(dt) < new Date();
    // Reminders due within the next 60 minutes (and not overdue yet)
    const dueSoon = upcoming.filter((r) => {
        if (!r.datetime) return false;
        const due = new Date(r.datetime);
        const diff = due.getTime() - now.getTime();
        return diff > 0 && diff <= 60 * 60 * 1000;
    });

    return (
        <div className="bg-background text-on-surface flex h-screen overflow-hidden font-body-md antialiased w-full">
            <Sidebar />

            <main className="flex-grow flex flex-col h-screen overflow-y-auto bg-background">
                <header className="sticky top-0 z-50 flex justify-between items-center w-full px-lg py-sm bg-surface/80 backdrop-blur-md border-b border-outline-variant shadow-sm">
                    <div className="flex items-center gap-sm">
                        <span className="material-symbols-outlined text-on-surface-variant">notifications</span>
                        <h1 className="font-headline-sm text-headline-sm text-on-surface">{t('titleReminders')}</h1>
                        {notifPermission === 'denied' && (
                            <span className="ml-sm text-label-md text-error bg-error-container px-sm py-xs rounded-full">{t('notifBlocked')}</span>
                        )}
                    </div>
                    <div className="flex items-center gap-md">
                        {notifPermission === 'default' && (
                            <button
                                onClick={() => Notification.requestPermission().then((p) => setNotifPermission(p))}
                                className="flex items-center gap-xs px-md py-sm bg-surface-container border border-outline-variant rounded-lg text-body-sm text-on-surface transition active:scale-95"
                            >
                                <span className="material-symbols-outlined text-[18px]">notifications_active</span>
                                {t('enableNotif')}
                            </button>
                        )}
                        <button
                            onClick={() => { resetForm(); setShowForm(true); }}
                            className="flex items-center gap-xs px-md py-sm bg-primary text-on-primary rounded-lg text-body-sm font-bold transition active:scale-95"
                        >
                            <span className="material-symbols-outlined text-[18px]">add</span>
                            {t('addReminder')}
                        </button>
                        <TopBarActions />
                    </div>
                </header>

                {/* In-app toast */}
                {toast && (
                    <div className="fixed top-4 right-4 z-[100] bg-primary text-on-primary rounded-xl shadow-lg px-lg py-md flex items-start gap-md max-w-sm">
                        <span className="material-symbols-outlined text-[24px] shrink-0">alarm</span>
                        <div>
                            <p className="font-bold">⏰ Đến giờ rồi!</p>
                            <p className="text-body-sm">{toast.title}</p>
                            {toast.noteTitle && <p className="text-label-md opacity-80 mt-xs">📝 {toast.noteTitle}</p>}
                        </div>
                        <button onClick={() => setToast(null)} className="ml-auto opacity-70 hover:opacity-100">
                            <span className="material-symbols-outlined text-[18px]">close</span>
                        </button>
                    </div>
                )}

                <div className="p-lg max-w-2xl mx-auto w-full flex flex-col gap-xl">

                    {/* Due Soon Banner */}
                    {dueSoon.length > 0 && (
                        <div className="bg-error-container border border-error rounded-xl p-md flex flex-col gap-sm">
                            <div className="flex items-center gap-sm">
                                <span className="material-symbols-outlined text-error text-[22px]">alarm</span>
                                <p className="font-bold text-error text-body-md">
                                    {dueSoon.length === 1
                                        ? 'Gần đến thời gian nhắc hẹn!'
                                        : `${dueSoon.length} lời nhắc sắp đến hạn!`}
                                </p>
                            </div>
                            <div className="flex flex-col gap-xs pl-[30px]">
                                {dueSoon.map((r) => {
                                    const minsLeft = Math.round((new Date(r.datetime).getTime() - now.getTime()) / 60_000);
                                    return (
                                        <div key={r.id} className="flex items-center justify-between">
                                            <div>
                                                <p className="text-body-sm font-bold text-on-error-container">{r.title}</p>
                                                {r.linkedNoteTitle && (
                                                    <p className="text-label-md text-error flex items-center gap-xs">
                                                        <span className="material-symbols-outlined text-[12px]">description</span>
                                                        {r.linkedNoteTitle}
                                                    </p>
                                                )}
                                            </div>
                                            <span className="text-label-md font-bold text-error whitespace-nowrap ml-md">
                                                {minsLeft <= 1 ? 'Dưới 1 phút' : `${minsLeft} phút nữa`}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Form */}
                    {showForm && (
                        <div className="bg-surface-container-lowest border border-primary rounded-xl p-lg">
                            <h2 className="font-headline-sm text-on-surface mb-lg">{editId ? 'Chỉnh sửa lời nhắc' : 'Thêm lời nhắc'}</h2>
                            <form onSubmit={handleSubmit} className="flex flex-col gap-md">
                                <div className="flex flex-col gap-xs">
                                    <label className="text-label-md text-on-surface-variant">Tiêu đề *</label>
                                    <input
                                        className="w-full px-md py-sm bg-surface border border-outline-variant rounded-lg outline-none focus:border-primary text-on-surface"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="Nhập tiêu đề lời nhắc..."
                                        required
                                    />
                                </div>
                                <div className="flex flex-col gap-xs">
                                    <label className="text-label-md text-on-surface-variant">Thời gian nhắc *</label>
                                    <input
                                        type="datetime-local"
                                        className="w-full px-md py-sm bg-surface border border-outline-variant rounded-lg outline-none focus:border-primary text-on-surface"
                                        value={datetime}
                                        onChange={(e) => setDatetime(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="flex flex-col gap-xs">
                                    <label className="text-label-md text-on-surface-variant">Liên kết ghi chú</label>
                                    <select
                                        className="w-full px-md py-sm bg-surface border border-outline-variant rounded-lg outline-none focus:border-primary text-on-surface"
                                        value={linkedNoteId}
                                        onChange={(e) => setLinkedNoteId(e.target.value)}
                                    >
                                        <option value="">-- Không liên kết --</option>
                                        {notes.map((n) => (
                                            <option key={n.id} value={n.id}>{n.title}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex flex-col gap-xs">
                                    <label className="text-label-md text-on-surface-variant">Ghi chú thêm</label>
                                    <textarea
                                        className="w-full px-md py-sm bg-surface border border-outline-variant rounded-lg outline-none focus:border-primary text-on-surface resize-none"
                                        rows={2}
                                        value={note}
                                        onChange={(e) => setNote(e.target.value)}
                                        placeholder="Thêm mô tả..."
                                    />
                                </div>
                                <div className="flex gap-md">
                                    <button type="submit" className="flex-1 bg-primary text-on-primary py-sm rounded-lg font-bold active:scale-95 transition">
                                        {editId ? 'Cập nhật' : 'Thêm'}
                                    </button>
                                    <button type="button" onClick={resetForm} className="flex-1 bg-surface-container text-on-surface py-sm rounded-lg font-bold active:scale-95 transition">
                                        Huỷ
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Upcoming */}
                    <section>
                        <h2 className="font-bold text-on-surface-variant text-label-md uppercase tracking-wide mb-md">Sắp tới ({upcoming.length})</h2>
                        {upcoming.length === 0 ? (
                            <div className="flex flex-col items-center py-xl text-on-surface-variant gap-sm">
                                <span className="material-symbols-outlined text-[48px] opacity-30">notifications_none</span>
                                <p className="text-body-sm">Chưa có lời nhắc nào</p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-md">
                                {upcoming.map((r) => (
                                    <div key={r.id} className={`bg-surface-container-lowest border rounded-xl p-md flex items-start gap-md transition ${isOverdue(r.datetime) ? 'border-error bg-error-container/10' : 'border-outline-variant'}`}>
                                        <button onClick={() => toggleDone(r.id)} className="mt-xs shrink-0" title="Đánh dấu hoàn thành">
                                            <span className="material-symbols-outlined text-outline hover:text-primary transition">circle</span>
                                        </button>
                                        <div className="flex-grow min-w-0">
                                            <p className="font-bold text-on-surface">{r.title}</p>
                                            {r.note && <p className="text-body-sm text-on-surface-variant mt-xs">{r.note}</p>}
                                            {/* Linked note chip */}
                                            {r.linkedNoteId && r.linkedNoteTitle && (
                                                <button
                                                    onClick={() => router.push('/all-notes')}
                                                    className="mt-sm flex items-center gap-xs px-sm py-xs bg-primary-container/30 text-primary rounded-full text-label-md hover:bg-primary-container/60 transition"
                                                >
                                                    <span className="material-symbols-outlined text-[14px]">description</span>
                                                    {r.linkedNoteTitle}
                                                </button>
                                            )}
                                            <p className={`text-label-md mt-sm flex items-center gap-xs ${isOverdue(r.datetime) ? 'text-error font-bold' : 'text-outline'}`}>
                                                <span className="material-symbols-outlined text-[14px]">{isOverdue(r.datetime) ? 'warning' : 'schedule'}</span>
                                                {r.datetime ? new Date(r.datetime).toLocaleString('vi-VN') : ''}
                                                {isOverdue(r.datetime) && ' · Đã quá hạn!'}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-xs shrink-0">
                                            <button onClick={() => startEdit(r)} className="p-xs text-on-surface-variant hover:text-primary transition" title="Chỉnh sửa">
                                                <span className="material-symbols-outlined text-[18px]">edit</span>
                                            </button>
                                            <button onClick={() => deleteReminder(r.id)} className="p-xs text-on-surface-variant hover:text-error transition" title="Xoá">
                                                <span className="material-symbols-outlined text-[18px]">delete</span>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Done */}
                    {done.length > 0 && (
                        <section>
                            <h2 className="font-bold text-on-surface-variant text-label-md uppercase tracking-wide mb-md">Đã hoàn thành ({done.length})</h2>
                            <div className="flex flex-col gap-sm">
                                {done.map((r) => (
                                    <div key={r.id} className="bg-surface-container border border-outline-variant rounded-xl p-md flex items-center gap-md opacity-60">
                                        <button onClick={() => toggleDone(r.id)} className="shrink-0" title="Bỏ hoàn thành">
                                            <span className="material-symbols-outlined text-primary">check_circle</span>
                                        </button>
                                        <div className="flex-grow min-w-0">
                                            <p className="line-through text-on-surface-variant">{r.title}</p>
                                            {r.linkedNoteTitle && (
                                                <p className="text-label-md text-outline flex items-center gap-xs">
                                                    <span className="material-symbols-outlined text-[12px]">description</span>
                                                    {r.linkedNoteTitle}
                                                </p>
                                            )}
                                        </div>
                                        <button onClick={() => deleteReminder(r.id)} className="p-xs text-on-surface-variant hover:text-error transition">
                                            <span className="material-symbols-outlined text-[18px]">delete</span>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            </main>
        </div >
    );
}
