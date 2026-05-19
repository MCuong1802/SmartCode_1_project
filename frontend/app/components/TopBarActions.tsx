'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

export default function TopBarActions() {
    const [dueSoonCount, setDueSoonCount] = useState(0);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        const check = () => {
            const saved = localStorage.getItem('app-reminders');
            if (!saved) { setDueSoonCount(0); return; }
            const now = new Date();
            const reminders: any[] = JSON.parse(saved);
            const count = reminders.filter((r) => {
                if (r.done || !r.datetime) return false;
                const diff = new Date(r.datetime).getTime() - now.getTime();
                return diff > 0 && diff <= 60 * 60 * 1000;
            }).length;
            setDueSoonCount(count);
        };
        check();
        intervalRef.current = setInterval(check, 30_000);
        return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    }, []);

    return (
        <div className="flex items-center gap-md">
            {/* Bell */}
            <Link href="/reminders" className="relative p-sm text-on-surface-variant hover:text-primary transition-colors">
                <span
                    className={`material-symbols-outlined${dueSoonCount > 0 ? ' animate-bell-ring text-error' : ''}`}
                    data-icon="notifications"
                >
                    notifications
                </span>
                {dueSoonCount > 0 && (
                    <span className="absolute top-0 right-0 w-[18px] h-[18px] bg-error text-on-primary text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                        {dueSoonCount > 9 ? '9+' : dueSoonCount}
                    </span>
                )}
            </Link>

            {/* Help */}
            <button className="p-sm text-on-surface-variant hover:text-primary transition-colors">
                <span className="material-symbols-outlined" data-icon="help">help</span>
            </button>

            {/* Avatar → Profile */}
            <Link href="/profile">
                <div className="w-10 h-10 rounded-full overflow-hidden border border-outline-variant bg-secondary-container flex justify-center items-center shadow-sm">
                    <img
                        src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80"
                        alt="User profile"
                        className="w-full h-full object-cover"
                    />
                </div>
            </Link>
        </div>
    );
}
