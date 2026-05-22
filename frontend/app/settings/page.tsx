'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '../utils/api';
import Link from 'next/link';

export default function SettingsPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // States quản lý dữ liệu cá nhân thật từ database
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [originalName, setOriginalName] = useState('');
  const [originalEmail, setOriginalEmail] = useState('');

  // States quản lý giao diện/theme
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('light');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('main-search-input');
        if (searchInput) {
          searchInput.focus();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Kiểm tra xác thực & Tải thông tin cá nhân thực tế
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/login');
      return;
    }

    setIsAuthenticated(true);

    // Tải cấu hình theme đã lưu
    const savedTheme = localStorage.getItem('app-theme') as 'light' | 'dark' | 'system';
    if (savedTheme) {
      setTheme(savedTheme);
    }

    // Gọi API lấy thông tin Profile thực tế
    apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/user/profile`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error('Không thể tải hồ sơ');
        return res.json();
      })
      .then(data => {
        setFullName(data.fullName || '');
        setEmail(data.email || '');
        setOriginalName(data.fullName || '');
        setOriginalEmail(data.email || '');
      })
      .catch(err => {
        console.error('Error fetching profile:', err);
      });
  }, [router]);

  // Áp dụng theme lên thẻ html
  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    localStorage.setItem('app-theme', newTheme);

    const root = document.documentElement;
    if (newTheme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else if (newTheme === 'light') {
      root.classList.add('light');
      root.classList.remove('dark');
    } else {
      // System mode
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (systemPrefersDark) {
        root.classList.add('dark');
        root.classList.remove('light');
      } else {
        root.classList.add('light');
        root.classList.remove('dark');
      }
    }
  };

  // Hàm cập nhật Profile cá nhân
  const handleSaveChanges = async () => {
    if (!fullName.trim() || !email.trim()) {
      alert('Vui lòng điền đầy đủ Họ tên và Email!');
      return;
    }

    const token = localStorage.getItem('access_token');
    if (!token) return;

    setIsSaving(true);
    setSaveStatus('Đang lưu...');

    try {
      const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/user/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim(),
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Lỗi khi cập nhật hồ sơ');
      }

      setOriginalName(fullName);
      setOriginalEmail(email);
      setSaveStatus('Lưu thành công!');
      setTimeout(() => setSaveStatus(null), 2500);
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Có lỗi xảy ra khi lưu thay đổi!');
      setSaveStatus(null);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center font-body-md">
        Đang tải dữ liệu...
      </div>
    );
  }

  return (
    <div className="bg-background text-on-surface flex h-screen overflow-hidden font-body-md antialiased w-full">
      {/* Sidebar Navigation (Desktop) */}
      <aside className="w-[260px] h-screen sticky top-0 left-0 border-r border-outline-variant bg-surface hidden md:flex flex-col p-md shrink-0">
        <div className="mb-xl px-sm">
          <h1 className="font-bold text-primary text-[20px] leading-[28px]">NotesApp</h1>
          <p className="text-[14px] leading-[20px] text-on-surface-variant">Không gian làm việc</p>
        </div>
 
        <Link
          href="/new-note"
          className="mb-lg flex items-center justify-center gap-sm px-md py-sm bg-primary text-on-primary rounded-lg font-bold transition-all duration-200 ease-in-out active:scale-95 shadow-sm text-center cursor-pointer"
        >
          <span className="material-symbols-outlined" data-icon="add">add</span>
          <span className="text-[14px]">Viết ghi chú mới</span>
        </Link>
 
        <nav className="flex flex-col gap-base flex-grow">
          {/* Dashboard */}
          <Link
            href="/"
            className="flex items-center gap-md px-md py-sm text-on-surface-variant hover:bg-surface-container rounded-lg transition-colors transition-all duration-200 ease-in-out active:scale-95 cursor-pointer"
          >
            <span className="material-symbols-outlined" data-icon="grid_view">grid_view</span>
            <span className="font-body-md text-body-md">Bảng điều khiển</span>
          </Link>
          {/* All Notes */}
          <Link
            href="/all-notes"
            className="flex items-center gap-md px-md py-sm text-on-surface-variant hover:bg-surface-container rounded-lg transition-colors transition-all duration-200 ease-in-out active:scale-95 cursor-pointer"
          >
            <span className="material-symbols-outlined" data-icon="description">description</span>
            <span className="font-body-md text-body-md">Tất cả ghi chú</span>
          </Link>
          {/* Categories */}
          <Link
            href="/categories"
            className="flex items-center gap-md px-md py-sm text-on-surface-variant hover:bg-surface-container rounded-lg transition-colors transition-all duration-200 ease-in-out active:scale-95 cursor-pointer"
          >
            <span className="material-symbols-outlined" data-icon="folder">folder</span>
            <span className="font-body-md text-body-md">Danh mục</span>
          </Link>
          {/* Trash */}
          <Link
            href="/trash"
            className="flex items-center gap-md px-md py-sm text-on-surface-variant hover:bg-surface-container rounded-lg transition-colors transition-all duration-200 ease-in-out active:scale-95 cursor-pointer"
          >
            <span className="material-symbols-outlined" data-icon="delete">delete</span>
            <span className="font-body-md text-body-md">Thùng rác</span>
          </Link>
        </nav>
 
        <div className="mt-auto flex flex-col gap-xs pt-md border-t border-outline-variant shrink-0">
          <Link
            href="/settings"
            className="flex items-center gap-md px-md py-sm bg-primary-fixed text-on-primary-fixed rounded-lg font-bold transition-all duration-200 ease-in-out active:scale-95 cursor-pointer"
          >
            <span className="material-symbols-outlined" data-icon="settings" style={{ fontVariationSettings: "'FILL' 1" }}>settings</span>
            <span className="font-body-md text-body-md">Cài đặt</span>
          </Link>
 
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="flex items-center gap-md px-md py-sm text-error hover:bg-error-container rounded-lg transition-colors transition-all duration-200 ease-in-out active:scale-95 text-left w-full cursor-pointer"
          >
            <span className="material-symbols-outlined" data-icon="logout">logout</span>
            <span className="font-body-md text-body-md">Đăng xuất</span>
          </button>
 
          <div className="mt-sm flex items-center gap-md px-sm">
            <img
              alt="Ảnh hồ sơ"
              className="w-10 h-10 rounded-full border border-outline-variant object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCEuAQ09psFDlyycKDJi7JeDK4GvZ_85cEWo5-vKIXOdo7L1tRiFFAOufOPedpfP4qlSeQRMemYRguQ4_mEcwodm4PsCGu3qwAetvl7ec0wHuseNBLnPcR219p1wAAkcRgwofG9ARpR4nUN4PkbvxD1tsvDtepdAKRCiSKWeYLygyCcJkQlhnp2_MTwFnboCJOS6f6QEbxvEbrSq77JTI5bh3vu527RmyxKH6qj6pToU1wPQS24tVVC2LhYxRsDyUBp07lNY19j-CUv"
            />
            <div>
              <p className="font-bold text-[14px]">{originalName || 'Minh Quân'}</p>
              <p className="text-[12px] text-on-surface-variant">Gói Pro</p>
            </div>
          </div>
        </div>
      </aside>
 
      {/* Main Workspace */}
      <main className="flex-grow flex flex-col h-screen overflow-hidden bg-background relative min-w-0">
        {/* Top Navigation Bar */}
        <header className="sticky top-0 z-50 flex justify-between items-center w-full px-lg py-sm bg-surface/80 backdrop-blur-md border-b border-outline-variant shadow-sm shrink-0">
          <div className="flex items-center gap-md flex-grow max-w-3xl">
            <div className="relative w-full">
              <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-on-surface-variant" data-icon="search">search</span>
              <input
                id="main-search-input"
                className="w-full bg-surface-container-low border border-outline-variant rounded-full py-sm pl-[44px] pr-[70px] text-body-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                placeholder="Tìm kiếm ghi chú..."
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchQuery.trim()) {
                    router.push(`/all-notes?q=${encodeURIComponent(searchQuery.trim())}`);
                  }
                }}
              />
              <kbd className="absolute right-md top-1/2 -translate-y-1/2 hidden sm:inline-flex items-center gap-xs px-2 py-0.5 text-[10px] font-bold text-outline border border-outline-variant/60 bg-surface rounded shadow-sm select-none pointer-events-none">
                <span>Ctrl</span>
                <span>K</span>
              </kbd>
            </div>
          </div>
          <div className="flex items-center gap-md ml-lg">
            <button className="p-sm text-on-surface-variant hover:text-primary transition-colors">
              <span className="material-symbols-outlined" data-icon="notifications">notifications</span>
            </button>
            <button className="p-sm text-on-surface-variant hover:text-primary transition-colors">
              <span className="material-symbols-outlined" data-icon="help">help</span>
            </button>
            <div className="w-10 h-10 rounded-full overflow-hidden border border-outline-variant bg-secondary-container flex justify-center items-center shadow-sm">
              <img 
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80" 
                alt="Ảnh hồ sơ" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </header>

        {/* Scrollable content */}
        <div className="flex-grow overflow-y-auto p-xl scroll-smooth custom-scrollbar">
          <div className="max-w-[800px] mx-auto w-full">
            <header className="flex flex-col gap-xs mb-xl">
              <h2 className="font-bold text-primary text-[30px] leading-[38px] tracking-[-0.02em]">Cài đặt</h2>
              <p className="text-on-surface-variant text-[16px] leading-[24px]">Quản lý tài khoản và tùy chỉnh trải nghiệm ứng dụng của bạn.</p>
            </header>

            {saveStatus && (
              <div className="mb-lg p-md bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 font-bold rounded-xl shadow-sm flex items-center gap-sm animate-in fade-in slide-in-from-top-4 duration-300">
                <span className="material-symbols-outlined text-[20px]">check_circle</span>
                <span>{saveStatus}</span>
              </div>
            )}

            <div className="space-y-xl pb-24">
          {/* Profile Section */}
          <section className="bg-surface-container-lowest p-lg rounded-xl border border-outline-variant transition-all hover:shadow-sm">
            <div className="flex items-center gap-lg mb-lg">
              <div className="relative group">
                <img
                  alt="User Avatar"
                  className="w-20 h-20 rounded-full border-2 border-primary-fixed object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCEuAQ09psFDlyycKDJi7JeDK4GvZ_85cEWo5-vKIXOdo7L1tRiFFAOufOPedpfP4qlSeQRMemYRguQ4_mEcwodm4PsCGu3qwAetvl7ec0wHuseNBLnPcR219p1wAAkcRgwofG9ARpR4nUN4PkbvxD1tsvDtepdAKRCiSKWeYLygyCcJkQlhnp2_MTwFnboCJOS6f6QEbxvEbrSq77JTI5bh3vu527RmyxKH6qj6pToU1wPQS24tVVC2LhYxRsDyUBp07lNY19j-CUv"
                />
                <button className="absolute bottom-0 right-0 bg-primary text-on-primary p-xs rounded-full shadow-md hover:scale-105 transition-transform flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]" data-icon="edit">edit</span>
                </button>
              </div>
              <div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">{originalName || 'Minh Nguyễn'}</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">{originalEmail || 'minh.nguyen@congty.vn'}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
              <div className="space-y-xs">
                <label className="font-label-md text-label-md text-on-surface-variant px-xs">Họ và tên</label>
                <input
                  className="w-full px-md py-sm bg-surface rounded-lg border border-outline-variant focus:border-primary outline-none focus:ring-1 focus:ring-primary transition-all font-body-md"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
              <div className="space-y-xs">
                <label className="font-label-md text-label-md text-on-surface-variant px-xs">Email</label>
                <input
                  className="w-full px-md py-sm bg-surface rounded-lg border border-outline-variant focus:border-primary outline-none focus:ring-1 focus:ring-primary transition-all font-body-md"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
          </section>

          {/* Appearance Section */}
          <section className="bg-surface-container-lowest p-lg rounded-xl border border-outline-variant">
            <div className="flex items-center gap-sm mb-lg">
              <span className="material-symbols-outlined text-primary" data-icon="palette">palette</span>
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">Giao diện</h3>
            </div>
            <div className="grid grid-cols-3 gap-md">
              <button
                onClick={() => handleThemeChange('light')}
                className={`flex flex-col items-center gap-sm p-md rounded-lg border-2 transition-all ${theme === 'light' ? 'border-primary bg-primary-fixed/30 text-primary font-bold' : 'border-outline-variant hover:bg-surface-container'}`}
              >
                <span className="material-symbols-outlined" data-icon="light_mode">light_mode</span>
                <span className="font-label-md text-label-md">Sáng</span>
              </button>
              <button
                onClick={() => handleThemeChange('dark')}
                className={`flex flex-col items-center gap-sm p-md rounded-lg border-2 transition-all ${theme === 'dark' ? 'border-primary bg-primary-fixed/30 text-primary font-bold' : 'border-outline-variant hover:bg-surface-container'}`}
              >
                <span className="material-symbols-outlined" data-icon="dark_mode">dark_mode</span>
                <span className="font-label-md text-label-md">Tối</span>
              </button>
              <button
                onClick={() => handleThemeChange('system')}
                className={`flex flex-col items-center gap-sm p-md rounded-lg border-2 transition-all ${theme === 'system' ? 'border-primary bg-primary-fixed/30 text-primary font-bold' : 'border-outline-variant hover:bg-surface-container'}`}
              >
                <span className="material-symbols-outlined" data-icon="settings_brightness">settings_brightness</span>
                <span className="font-label-md text-label-md">Hệ thống</span>
              </button>
            </div>
          </section>

          {/* Security Section */}
          <section className="bg-surface-container-lowest p-lg rounded-xl border border-outline-variant">
            <div className="flex items-center justify-between mb-lg">
              <div className="flex items-center gap-sm">
                <span className="material-symbols-outlined text-primary" data-icon="security">security</span>
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">Bảo mật</h3>
              </div>
              <button className="text-primary font-label-md text-label-md font-bold hover:underline">Thay đổi mật khẩu</button>
            </div>
            <div className="space-y-md">
              <div className="flex items-center justify-between py-sm border-b border-outline-variant/30">
                <div>
                  <p className="font-body-md text-body-md text-on-surface">Xác thực hai yếu tố</p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">Tăng cường bảo mật cho tài khoản của bạn</p>
                </div>
                <div className="w-12 h-6 bg-surface-container-highest rounded-full relative cursor-pointer active:scale-95 transition-all">
                  <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                </div>
              </div>
              <div className="flex items-center justify-between py-sm">
                <div>
                  <p className="font-body-md text-body-md text-on-surface">Thiết bị đã đăng nhập</p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">Quản lý các thiết bị đang truy cập</p>
                </div>
                <span className="material-symbols-outlined text-on-surface-variant" data-icon="chevron_right">chevron_right</span>
              </div>
            </div>
          </section>

          {/* Data & Privacy Section */}
          <section className="bg-surface-container-lowest p-lg rounded-xl border border-outline-variant">
            <div className="flex items-center gap-sm mb-lg">
              <span className="material-symbols-outlined text-primary" data-icon="database">database</span>
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">Dữ liệu &amp; Quyền riêng tư</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
              <button className="flex items-center gap-md p-md rounded-lg border border-outline-variant hover:bg-surface-container transition-all text-left">
                <span className="material-symbols-outlined text-on-surface-variant" data-icon="download">download</span>
                <div>
                  <p className="font-body-md text-body-md font-bold text-on-surface">Xuất dữ liệu</p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">Tải bản sao các ghi chú</p>
                </div>
              </button>
              <button className="flex items-center gap-md p-md rounded-lg border border-error/20 hover:bg-error-container/20 transition-all text-left group">
                <span className="material-symbols-outlined text-error" data-icon="delete_forever">delete_forever</span>
                <div>
                  <p className="font-body-md text-body-md font-bold text-error">Xóa tài khoản</p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">Tác vụ này không thể hoàn tác</p>
                </div>
              </button>
            </div>
          </section>
        </div>

        <div className="mt-2xl pt-xl border-t border-outline-variant flex justify-end gap-md pb-12">
          <Link
            href="/"
            className="px-lg py-sm font-body-md text-body-md text-on-surface-variant hover:bg-surface-container rounded-lg transition-colors flex items-center justify-center"
          >
            Hủy
          </Link>
          <button
            onClick={handleSaveChanges}
            disabled={isSaving}
            className={`px-lg py-sm font-body-md text-body-md bg-primary text-on-primary rounded-lg font-bold shadow-sm active:scale-95 transition-all flex items-center justify-center ${isSaving ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </div>
      </div>
      </div>
    </main>

      {/* Floating navigation on mobile screen sizes */}
      <div className="md:hidden fixed bottom-md left-md right-md h-16 bg-surface shadow-lg rounded-2xl flex items-center justify-around px-md border border-outline-variant z-50 animate-in slide-in-from-bottom duration-300">
        <Link href="/" className="p-sm text-on-surface-variant flex flex-col items-center">
          <span className="material-symbols-outlined" data-icon="grid_view">grid_view</span>
        </Link>
        <Link href="/all-notes" className="p-sm text-on-surface-variant flex flex-col items-center">
          <span className="material-symbols-outlined" data-icon="description">description</span>
        </Link>
        <Link
          href="/new-note"
          className="p-md bg-primary text-on-primary rounded-full -mt-12 shadow-lg ring-4 ring-background flex items-center justify-center active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined" data-icon="add">add</span>
        </Link>
        <Link href="/categories" className="p-sm text-on-surface-variant flex flex-col items-center">
          <span className="material-symbols-outlined" data-icon="folder">folder</span>
        </Link>
        <Link href="/settings" className="p-sm text-primary flex flex-col items-center">
          <span className="material-symbols-outlined" data-icon="settings" style={{ fontVariationSettings: "'FILL' 1" }}>settings</span>
        </Link>
      </div>

      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[99] flex items-center justify-center bg-inverse-surface/40 backdrop-blur-sm p-md animate-in fade-in duration-200">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-lg max-w-[400px] w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-md text-error mb-md">
              <span className="material-symbols-outlined text-[32px]">logout</span>
              <h3 className="font-bold text-[20px] text-on-surface">Đăng xuất tài khoản</h3>
            </div>
            <p className="text-[15px] text-on-surface-variant leading-[24px] mb-lg">
              Bạn có chắc chắn muốn đăng xuất khỏi ứng dụng ghi chú? Bạn sẽ cần đăng nhập lại để truy cập lần sau.
            </p>
            <div className="flex gap-sm justify-end">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="px-md py-sm font-bold text-on-surface-variant hover:bg-surface-container rounded-xl transition-colors cursor-pointer text-[14px]"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={async () => {
                  try {
                    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
                      method: 'POST',
                      credentials: 'include',
                    });
                  } catch (e) {
                    console.error('Logout error', e);
                  }
                  localStorage.removeItem('access_token');
                  router.push('/login');
                }}
                className="px-md py-sm bg-error text-on-error font-bold rounded-xl hover:bg-error/95 active:scale-95 transition-all cursor-pointer text-[14px]"
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
