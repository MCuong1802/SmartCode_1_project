'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SettingsPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // States quản lý dữ liệu cá nhân thật từ database
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [originalName, setOriginalName] = useState('');
  const [originalEmail, setOriginalEmail] = useState('');

  // States quản lý giao diện/theme
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('light');

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
    fetch('http://localhost:3001/user/profile', {
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
      const res = await fetch('http://localhost:3001/user/profile', {
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
      <aside className="hidden md:flex flex-col h-screen sticky top-0 left-0 border-r border-outline-variant bg-surface w-[260px] p-md shrink-0">
        <div className="mb-xl px-md">
          <h1 className="font-headline-sm text-headline-sm font-bold text-primary">NotesApp</h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant">Không gian làm việc</p>
        </div>
        <nav className="flex-1 space-y-xs">
          <Link
            href="/"
            className="flex items-center gap-md px-md py-sm text-on-surface-variant hover:bg-surface-container rounded-lg transition-colors group"
          >
            <span className="material-symbols-outlined" data-icon="dashboard">dashboard</span>
            <span className="font-body-md text-body-md">Bảng điều khiển</span>
          </Link>
          <Link
            href="/all-notes"
            className="flex items-center gap-md px-md py-sm text-on-surface-variant hover:bg-surface-container rounded-lg transition-colors group"
          >
            <span className="material-symbols-outlined" data-icon="description">description</span>
            <span className="font-body-md text-body-md">Tất cả ghi chú</span>
          </Link>
          <Link
            href="/categories"
            className="flex items-center gap-md px-md py-sm text-on-surface-variant hover:bg-surface-container rounded-lg transition-colors group"
          >
            <span className="material-symbols-outlined" data-icon="folder">folder</span>
            <span className="font-body-md text-body-md">Danh mục</span>
          </Link>
          <Link
            href="#"
            className="flex items-center gap-md px-md py-sm text-on-surface-variant hover:bg-surface-container rounded-lg transition-colors group"
          >
            <span className="material-symbols-outlined" data-icon="delete">delete</span>
            <span className="font-body-md text-body-md">Thùng rác</span>
          </Link>
          <Link
            href="/settings"
            className="flex items-center gap-md px-md py-sm bg-primary-fixed text-on-primary-fixed rounded-lg font-bold"
          >
            <span className="material-symbols-outlined" data-icon="settings">settings</span>
            <span className="font-body-md text-body-md">Cài đặt</span>
          </Link>
        </nav>
        
        <div className="mt-auto flex flex-col gap-xs pt-md border-t border-outline-variant shrink-0">
          <button
            onClick={() => {
              localStorage.removeItem('access_token');
              router.push('/login');
            }}
            className="flex items-center gap-md px-md py-sm text-error hover:bg-error-container rounded-lg transition-colors transition-all duration-200 ease-in-out active:scale-95 text-left w-full"
          >
            <span className="material-symbols-outlined" data-icon="logout">logout</span>
            <span className="font-body-md text-body-md">Đăng xuất</span>
          </button>
          
          <div className="mt-sm flex items-center gap-md px-sm">
            <img
              alt="User profile"
              className="w-10 h-10 rounded-full border border-outline-variant object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCEuAQ09psFDlyycKDJi7JeDK4GvZ_85cEWo5-vKIXOdo7L1tRiFFAOufOPedpfP4qlSeQRMemYRguQ4_mEcwodm4PsCGu3qwAetvl7ec0wHuseNBLnPcR219p1wAAkcRgwofG9ARpR4nUN4PkbvxD1tsvDtepdAKRCiSKWeYLygyCcJkQlhnp2_MTwFnboCJOS6f6QEbxvEbrSq77JTI5bh3vu527RmyxKH6qj6pToU1wPQS24tVVC2LhYxRsDyUBp07lNY19j-CUv"
            />
            <div>
              <p className="font-label-md text-label-md font-bold text-on-surface line-clamp-1">{originalName || 'Minh Nguyễn'}</p>
              <p className="font-label-md text-label-md text-on-surface-variant">Gói Pro</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Top NavBar (Mobile) */}
      <header className="md:hidden flex justify-between items-center w-full px-lg py-sm sticky top-0 z-50 bg-surface/80 backdrop-blur-md border-b border-outline-variant shadow-sm absolute top-0 left-0 right-0">
        <h1 className="font-headline-md text-headline-md font-black text-primary">NotesApp</h1>
        <div className="flex items-center gap-md">
          <span className="material-symbols-outlined text-primary" data-icon="notifications">notifications</span>
          <img
            alt="User profile"
            className="w-8 h-8 rounded-full border border-outline-variant object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCEuAQ09psFDlyycKDJi7JeDK4GvZ_85cEWo5-vKIXOdo7L1tRiFFAOufOPedpfP4qlSeQRMemYRguQ4_mEcwodm4PsCGu3qwAetvl7ec0wHuseNBLnPcR219p1wAAkcRgwofG9ARpR4nUN4PkbvxD1tsvDtepdAKRCiSKWeYLygyCcJkQlhnp2_MTwFnboCJOS6f6QEbxvEbrSq77JTI5bh3vu527RmyxKH6qj6pToU1wPQS24tVVC2LhYxRsDyUBp07lNY19j-CUv"
          />
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-[800px] mx-auto px-margin-mobile md:px-margin-desktop py-xl overflow-y-auto custom-scrollbar h-screen">
        <div className="mb-2xl mt-12 md:mt-0">
          <h2 className="font-headline-lg text-headline-lg text-on-surface mb-xs font-bold">Cài đặt</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">Quản lý tài khoản và tùy chỉnh trải nghiệm ứng dụng của bạn.</p>
        </div>

        {saveStatus && (
          <div className="mb-lg p-md bg-primary-container text-white font-bold rounded-xl shadow-md flex items-center gap-sm animate-in fade-in slide-in-from-top-4 duration-300">
            <span className="material-symbols-outlined">info</span>
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
      </main>

      {/* Bottom NavBar (Mobile) */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-surface border-t border-outline-variant flex justify-around py-sm z-50">
        <Link href="/" className="flex flex-col items-center gap-xs text-on-surface-variant">
          <span className="material-symbols-outlined" data-icon="dashboard">dashboard</span>
          <span className="text-[10px] font-medium">Bảng</span>
        </Link>
        <Link href="/all-notes" className="flex flex-col items-center gap-xs text-on-surface-variant">
          <span className="material-symbols-outlined" data-icon="description">description</span>
          <span className="text-[10px] font-medium">Ghi chú</span>
        </Link>
        <Link href="/new-note" className="w-12 h-12 -mt-6 bg-primary text-on-primary rounded-full shadow-lg flex items-center justify-center active:scale-95 transition-all">
          <span className="material-symbols-outlined" data-icon="add">add</span>
        </Link>
        <Link href="/categories" className="flex flex-col items-center gap-xs text-on-surface-variant">
          <span className="material-symbols-outlined" data-icon="folder">folder</span>
          <span className="text-[10px] font-medium">Kho</span>
        </Link>
        <Link href="/settings" className="flex flex-col items-center gap-xs text-primary font-bold">
          <span className="material-symbols-outlined" data-icon="settings">settings</span>
          <span className="text-[10px] font-medium">Cài đặt</span>
        </Link>
      </nav>
    </div>
  );
}
