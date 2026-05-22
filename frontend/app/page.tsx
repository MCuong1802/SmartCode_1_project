'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from './utils/api';
import Link from 'next/link';

import LandingPage from './LandingPage';

export default function HomePage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [notes, setNotes] = useState<any[]>([]);
  const [categoriesCount, setCategoriesCount] = useState(0);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Kiểm tra đăng nhập khi trang vừa load và fetch dữ liệu thật
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setIsAuthenticated(false);
      return;
    }

    setIsAuthenticated(true);

    // Fetch toàn bộ ghi chú thực tế của User
    apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/notes`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setNotes(data);
        }
      })
      .catch(err => console.error('Error fetching notes:', err));

    // Fetch toàn bộ danh mục thực tế của User
    apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setCategoriesCount(data.length);
        }
      })
      .catch(err => console.error('Error fetching categories:', err));
  }, [router]);

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

  // Trong lúc đang kiểm tra token, hiển thị màn hình trống hoặc loading để tránh nháy giao diện
  if (isAuthenticated === null) {
    return <div className="min-h-screen bg-background flex items-center justify-center font-body-md">Đang tải dữ liệu...</div>;
  }

  // Nếu không đăng nhập, hiển thị Landing Page
  if (isAuthenticated === false) {
    return <LandingPage />;
  }

  return (
    <div className="bg-background text-on-surface flex h-screen overflow-hidden font-body-md antialiased w-full">
      {/* Sidebar Navigation */}
      <aside className="w-[260px] h-screen sticky top-0 left-0 border-r border-outline-variant bg-surface hidden md:flex flex-col p-md shrink-0">
        <div className="mb-xl px-sm">
          <h1 className="font-bold text-primary text-[20px] leading-[28px]">NotesApp</h1>
          <p className="text-[14px] leading-[20px] text-on-surface-variant">Không gian làm việc</p>
        </div>
        
        <Link
          href="/new-note"
          className="mb-lg flex items-center justify-center gap-sm px-md py-sm bg-primary text-on-primary rounded-lg font-bold transition-all duration-200 ease-in-out active:scale-95 shadow-sm text-center"
        >
          <span className="material-symbols-outlined" data-icon="add">add</span>
          <span className="text-[14px]">Viết ghi chú mới</span>
        </Link>
        
        <nav className="flex flex-col gap-base flex-grow">
          {/* Dashboard */}
          <Link
            href="/"
            className="flex items-center gap-md px-md py-sm bg-primary-fixed text-on-primary-fixed rounded-lg font-bold transition-all duration-200 ease-in-out active:scale-95"
          >
            <span className="material-symbols-outlined" data-icon="grid_view">grid_view</span>
            <span className="font-body-md text-body-md">Bảng điều khiển</span>
          </Link>
          {/* All Notes */}
          <Link
            href="/all-notes"
            className="flex items-center gap-md px-md py-sm text-on-surface-variant hover:bg-surface-container rounded-lg transition-colors transition-all duration-200 ease-in-out active:scale-95"
          >
            <span className="material-symbols-outlined" data-icon="description">description</span>
            <span className="font-body-md text-body-md">Tất cả ghi chú</span>
          </Link>
          {/* Categories */}
          <Link
            href="/categories"
            className="flex items-center gap-md px-md py-sm text-on-surface-variant hover:bg-surface-container rounded-lg transition-colors transition-all duration-200 ease-in-out active:scale-95"
          >
            <span className="material-symbols-outlined" data-icon="folder">folder</span>
            <span className="font-body-md text-body-md">Danh mục</span>
          </Link>
          {/* Trash */}
          <Link
            href="/trash"
            className="flex items-center gap-md px-md py-sm text-on-surface-variant hover:bg-surface-container rounded-lg transition-colors transition-all duration-200 ease-in-out active:scale-95"
          >
            <span className="material-symbols-outlined" data-icon="delete">delete</span>
            <span className="font-body-md text-body-md">Thùng rác</span>
          </Link>
        </nav>
        
        <div className="mt-auto flex flex-col gap-xs pt-md border-t border-outline-variant shrink-0">
          <Link
            href="/settings"
            className="flex items-center gap-md px-md py-sm text-on-surface-variant hover:bg-surface-container rounded-lg transition-colors transition-all duration-200 ease-in-out active:scale-95"
          >
            <span className="material-symbols-outlined" data-icon="settings">settings</span>
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
              <p className="font-bold text-[14px]">Minh Quân</p>
              <p className="text-[12px] text-on-surface-variant">Gói Pro</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-grow flex flex-col h-screen overflow-hidden bg-background relative min-w-0">
        {/* Top Navigation Bar */}
        <header className="sticky top-0 z-50 flex justify-between items-center w-full px-lg py-sm bg-surface/80 backdrop-blur-md border-b border-outline-variant shadow-sm">
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

        {/* Dashboard Content */}
        <div className="p-lg max-w-5xl mx-auto w-full overflow-y-auto custom-scrollbar flex-grow">
          {/* Welcome Section */}
          <section className="mb-xl">
            <h2 className="font-headline-lg text-headline-lg text-on-surface mb-xs">Chào mừng trở lại!</h2>
            <p className="font-body-md text-on-surface-variant">Hôm nay là một ngày tuyệt vời. Hãy xem và quản lý các ghi chú của bạn.</p>
          </section>

          {/* Stats Grid */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-lg mb-2xl">
            <div className="bg-surface-container-lowest border border-outline-variant p-lg rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-md mb-sm">
                <span className="material-symbols-outlined text-primary bg-primary-fixed p-sm rounded-lg" data-icon="description">description</span>
                <span className="font-label-md text-on-surface-variant">Tổng số ghi chú</span>
              </div>
              <div className="font-headline-md text-headline-md text-on-surface">{notes.length}</div>
              <div className="text-label-md text-primary mt-xs">Ghi chú lưu trữ thực tế</div>
            </div>

            <div className="bg-surface-container-lowest border border-outline-variant p-lg rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-md mb-sm">
                <span className="material-symbols-outlined text-secondary bg-secondary-fixed p-sm rounded-lg" data-icon="category">category</span>
                <span className="font-label-md text-on-surface-variant">Danh mục</span>
              </div>
              <div className="font-headline-md text-headline-md text-on-surface">{categoriesCount}</div>
              <div className="text-label-md text-on-surface-variant mt-xs">Nhóm phân loại đã tạo</div>
            </div>

            <div className="bg-surface-container-lowest border border-outline-variant p-lg rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-md mb-sm">
                <span className="material-symbols-outlined text-tertiary bg-tertiary-fixed p-sm rounded-lg" data-icon="task_alt">task_alt</span>
                <span className="font-label-md text-on-surface-variant">Đồng bộ đám mây</span>
              </div>
              <div className="font-headline-md text-headline-md text-on-surface">100%</div>
              <div className="text-label-md text-on-tertiary-fixed-variant mt-xs">Tất cả dữ liệu được bảo vệ</div>
            </div>
          </section>

          {notes.length === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center p-2xl border border-dashed border-outline-variant rounded-xl bg-surface-container-lowest mt-md text-center shadow-sm w-full">
              <span className="material-symbols-outlined text-[64px] text-primary mb-md animate-bounce" data-icon="note_stack">note_stack</span>
              <h4 className="font-bold text-[20px] text-on-surface mb-xs">Bạn chưa có ghi chú nào</h4>
              <p className="text-on-surface-variant text-[15px] mb-lg max-w-[450px] w-full mx-auto">
                Hãy bắt đầu tổ chức suy nghĩ của bạn bằng cách tạo và lưu giữ ghi chú đầu tiên trên database!
              </p>
              <Link href="/new-note" className="px-xl py-md bg-primary text-on-primary rounded-lg font-bold hover:shadow-lg hover:bg-primary/95 active:scale-95 transition-all cursor-pointer">
                Tạo ghi chú mới
              </Link>
            </div>
          ) : (
            <>
              {/* Pinned Notes */}
              <section className="mb-2xl">
                <div className="flex items-center justify-between mb-lg">
                  <h3 className="font-headline-sm text-headline-sm flex items-center gap-sm">
                    <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>push_pin</span>
                    Ghi chú đã ghim
                  </h3>
                  <Link className="text-primary font-label-md hover:underline" href="/all-notes">Xem tất cả</Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
                  {notes.slice(0, 2).map((note) => (
                    <div 
                      key={note.id}
                      onClick={() => router.push('/all-notes')}
                      className="bg-surface-container-lowest border-l-4 border-l-primary border border-outline-variant p-lg rounded-lg shadow-sm hover:translate-y-[-2px] hover:shadow-md transition-all cursor-pointer flex flex-col min-h-[140px]"
                    >
                      <div className="flex justify-between items-start mb-xs">
                        <h4 className="font-bold text-[16px] text-on-surface line-clamp-1">{note.title}</h4>
                        <span className="material-symbols-outlined text-on-surface-variant text-[18px]">push_pin</span>
                      </div>
                      <p className="font-body-md text-on-surface-variant line-clamp-2 mb-md flex-grow">{note.content}</p>
                      <div className="flex gap-sm items-center justify-between text-[11px] text-outline pt-sm border-t border-outline-variant/10">
                        {note.category && (
                          <span className="bg-primary-container/20 text-primary px-sm py-0.5 rounded-full font-bold">
                            {note.category.title}
                          </span>
                        )}
                        <span>{new Date(note.createdAt).toLocaleDateString('vi-VN')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Recent Notes */}
              <section className="mb-2xl">
                <div className="flex items-center justify-between mb-lg">
                  <h3 className="font-headline-sm text-headline-sm flex items-center gap-sm">
                    Ghi chú gần đây
                  </h3>
                  <div className="flex items-center gap-sm">
                    <button className="p-xs text-primary bg-primary-container/20 rounded-md">
                      <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>grid_view</span>
                    </button>
                    <button className="p-xs text-on-surface-variant hover:text-primary rounded-md" onClick={() => router.push('/all-notes')}>
                      <span className="material-symbols-outlined">view_list</span>
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
                  {notes.slice(0, 3).map((note) => (
                    <div 
                      key={note.id}
                      onClick={() => router.push('/all-notes')}
                      className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:translate-y-[-2px] transition-all cursor-pointer flex flex-col p-lg min-h-[160px]"
                    >
                      <div className="flex justify-between items-start mb-sm">
                        <h4 className="font-bold text-[16px] text-on-surface line-clamp-1">{note.title}</h4>
                        {note.category && (
                          <span className="text-[11px] font-bold px-sm py-0.5 rounded-full bg-secondary-container text-on-secondary-container">
                            {note.category.title}
                          </span>
                        )}
                      </div>
                      <p className="font-body-sm text-on-surface-variant line-clamp-3 mb-md flex-grow">
                        {note.content}
                      </p>
                      <div className="flex justify-between items-center mt-auto pt-sm border-t border-outline-variant/30 text-label-md text-on-surface-variant">
                        <span>{new Date(note.createdAt).toLocaleDateString('vi-VN')}</span>
                        <button className="text-on-surface-variant hover:text-primary">
                          <span className="material-symbols-outlined text-[18px]">star_border</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}
        </div>
      </main>

      {/* Mobile Navigation (Floating for mobile) */}
      <div className="md:hidden fixed bottom-md left-md right-md h-16 bg-surface shadow-lg rounded-2xl flex items-center justify-around px-md border border-outline-variant z-50 animate-in slide-in-from-bottom duration-300">
        <Link href="/" className="p-sm text-primary flex flex-col items-center">
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
        <button
          onClick={() => setShowLogoutConfirm(true)}
          className="p-sm text-error flex flex-col items-center cursor-pointer"
        >
          <span className="material-symbols-outlined" data-icon="logout">logout</span>
        </button>
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