'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/utils/api';
import Link from 'next/link';

export default function TrashPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [notes, setNotes] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  
  // Custom Toasts and Confirm Modals
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    show: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({ show: false, title: '', message: '', onConfirm: () => {} });

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
  };

  const askConfirmation = (title: string, message: string, onConfirm: () => void) => {
    setConfirmModal({ show: true, title, message, onConfirm });
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

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

  // Load Trash Notes
  const fetchTrashNotes = () => {
    apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/notes/trash`)
      .then((res) => {
        if (!res.ok) throw new Error('Không thể tải thùng rác');
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setNotes(data);
        }
      })
      .catch((err) => {
        console.error(err);
        showToast('Lỗi nạp danh sách thùng rác', 'error');
      });
  };

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/login');
      return;
    }
    setIsAuthenticated(true);
    fetchTrashNotes();
  }, [router]);

  // Restore Note
  const handleRestoreNote = (id: string) => {
    apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/notes/trash/${id}/restore`, {
      method: 'PUT'
    })
      .then((res) => {
        if (res.ok) {
          showToast('Đã khôi phục ghi chú thành công!', 'success');
          setNotes((prev) => prev.filter((n) => n.id !== id));
        } else {
          showToast('Khôi phục thất bại!', 'error');
        }
      })
      .catch((err) => {
        console.error(err);
        showToast('Lỗi kết nối máy chủ', 'error');
      });
  };

  // Force Delete Note
  const handleForceDeleteNote = (id: string) => {
    askConfirmation(
      'Xóa vĩnh viễn ghi chú',
      'Bạn có chắc chắn muốn xóa vĩnh viễn ghi chú này? Hành động này KHÔNG THỂ khôi phục lại.',
      () => {
        apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/notes/trash/${id}/force`, {
          method: 'DELETE'
        })
          .then((res) => {
            if (res.ok) {
              showToast('Đã xóa vĩnh viễn ghi chú!', 'success');
              setNotes((prev) => prev.filter((n) => n.id !== id));
            } else {
              showToast('Xóa vĩnh viễn thất bại!', 'error');
            }
          })
          .catch((err) => {
            console.error(err);
            showToast('Lỗi kết nối máy chủ', 'error');
          });
      }
    );
  };

  // Helper calculating remaining deletion time
  const getRemainingDaysText = (deletedAtStr: string) => {
    const deletedAt = new Date(deletedAtStr);
    const now = new Date();
    
    // expiry date is 7 days after deletion date
    const expiryTime = deletedAt.getTime() + (7 * 24 * 60 * 60 * 1000);
    const msRemaining = expiryTime - now.getTime();
    
    if (msRemaining <= 0) {
      return 'Sẽ bị dọn dẹp ngay';
    }
    
    const days = Math.floor(msRemaining / (24 * 60 * 60 * 1000));
    const hours = Math.floor((msRemaining % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    
    if (days > 0) {
      return `Tự động xóa sau ${days} ngày ${hours} giờ`;
    } else if (hours > 0) {
      return `Tự động xóa sau ${hours} giờ`;
    } else {
      const minutes = Math.floor(msRemaining / (60 * 1000));
      return `Tự động xóa sau ${minutes} phút`;
    }
  };

  const filteredNotes = notes.filter((note) => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return true;
    return (
      note.title.toLowerCase().includes(query) ||
      note.content.toLowerCase().includes(query)
    );
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center font-body-md text-on-surface-variant">
        Đang tải dữ liệu...
      </div>
    );
  }

  return (
    <div className="bg-background text-on-surface flex h-screen overflow-hidden font-body-md antialiased w-full">
      {/* Sidebar Nav */}
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
          {/* Trash - ACTIVE */}
          <Link
            href="/trash"
            className="flex items-center gap-md px-md py-sm bg-primary-fixed text-on-primary-fixed rounded-lg font-bold transition-all duration-200 ease-in-out active:scale-95 cursor-pointer"
          >
            <span className="material-symbols-outlined" data-icon="delete" style={{ fontVariationSettings: "'FILL' 1" }}>delete</span>
            <span className="font-body-md text-body-md">Thùng rác</span>
          </Link>
        </nav>
        
        <div className="mt-auto flex flex-col gap-xs pt-md border-t border-outline-variant shrink-0">
          <Link
            href="/settings"
            className="flex items-center gap-md px-md py-sm text-on-surface-variant hover:bg-surface-container rounded-lg transition-colors transition-all duration-200 ease-in-out active:scale-95 cursor-pointer"
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
 
      {/* Main Container */}
      <main className="flex-grow flex flex-col h-screen overflow-hidden bg-background relative min-w-0">
        <header className="sticky top-0 z-50 flex justify-between items-center w-full px-lg py-sm bg-surface/80 backdrop-blur-md border-b border-outline-variant shadow-sm shrink-0">
          <div className="flex items-center gap-md flex-grow max-w-3xl">
            <div className="relative w-full">
              <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-on-surface-variant" data-icon="search">search</span>
              <input
                id="main-search-input"
                className="w-full bg-surface-container-low border border-outline-variant rounded-full py-sm pl-[44px] pr-[70px] text-body-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                placeholder="Tìm ghi chú trong thùng rác..."
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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
            <div className="w-10 h-10 rounded-full overflow-hidden border border-outline-variant bg-secondary-container flex justify-center items-center shadow-sm">
              <img 
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80" 
                alt="Ảnh hồ sơ" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </header>

        {/* Scrollable trash area */}
        <div className="flex-grow overflow-y-auto p-xl scroll-smooth custom-scrollbar">
          <header className="flex flex-col md:flex-row md:items-end justify-between gap-md mb-xl border-b border-outline-variant pb-md">
            <div>
              <h2 className="font-bold text-primary text-[30px] leading-[38px] tracking-[-0.02em]">Thùng rác</h2>
              <p className="text-on-surface-variant text-[16px] leading-[24px] mt-xs">
                Các ghi chú đã xóa sẽ được giữ lại ở đây tối đa 7 ngày trước khi bị xóa vĩnh viễn.
              </p>
            </div>
          </header>

          {filteredNotes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center w-full">
              <div className="w-24 h-24 rounded-full bg-primary/5 flex items-center justify-center text-primary/40 mb-lg border border-primary/10 shadow-sm animate-pulse">
                <span className="material-symbols-outlined text-[48px]" data-icon="auto_delete">auto_delete</span>
              </div>
              <h3 className="font-bold text-[20px] text-on-surface mb-xs">Thùng rác trống</h3>
              <p className="text-[15px] text-on-surface-variant max-w-[360px] mx-auto leading-relaxed">
                Không tìm thấy ghi chú nào đã xóa trong thùng rác của bạn. Các ghi chú khi bị xóa sẽ được tạm lưu tại đây.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
              {filteredNotes.map((note) => (
                <div
                  key={note.id}
                  className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg flex flex-col transition-all duration-200 hover:shadow-lg relative overflow-hidden"
                >
                  <div className="flex justify-between items-start mb-md">
                    <span className="text-[11px] font-bold text-error bg-error-container/30 px-sm py-xs rounded-full flex items-center gap-xs">
                      <span className="material-symbols-outlined text-[14px]">schedule</span>
                      {getRemainingDaysText(note.deletedAt)}
                    </span>
                    {note.category && (
                      <span className="text-[11px] font-bold px-sm py-xs bg-surface-container-high text-on-surface-variant rounded-full">
                        {note.category.title}
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-[18px] text-on-surface mb-sm line-clamp-1">{note.title || 'Không có tiêu đề'}</h3>
                  <p className="text-[14px] text-on-surface-variant mb-xl line-clamp-3 h-[60px] overflow-hidden whitespace-pre-wrap leading-[20px]">
                    {note.content || 'Không có nội dung.'}
                  </p>

                  <div className="flex items-center gap-sm mt-auto pt-sm border-t border-outline-variant">
                    <button
                      onClick={() => handleRestoreNote(note.id)}
                      className="flex-1 flex items-center justify-center gap-xs py-sm px-md text-[14px] font-bold text-primary bg-primary-fixed/30 hover:bg-primary-fixed/50 rounded-lg transition-colors cursor-pointer"
                      title="Khôi phục lại ghi chú này về bảng điều khiển"
                    >
                      <span className="material-symbols-outlined text-[18px]">restore</span>
                      <span>Khôi phục</span>
                    </button>
                    <button
                      onClick={() => handleForceDeleteNote(note.id)}
                      className="p-sm text-outline hover:text-error hover:bg-error-container/30 rounded-lg transition-colors cursor-pointer"
                      title="Xóa vĩnh viễn khỏi hệ thống"
                    >
                      <span className="material-symbols-outlined" data-icon="delete_forever">delete_forever</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Floating navigation on mobile screen sizes */}
      <div className="md:hidden fixed bottom-md left-md right-md h-16 bg-surface shadow-lg rounded-2xl flex items-center justify-around px-md border border-outline-variant z-50">
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
        <Link href="/trash" className="p-sm text-primary flex flex-col items-center">
          <span className="material-symbols-outlined" data-icon="delete" style={{ fontVariationSettings: "'FILL' 1" }}>delete</span>
        </Link>
      </div>

      {/* Beautiful Custom Toast Notification */}
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-top duration-300">
          <div className={`flex items-center gap-md px-lg py-md rounded-2xl shadow-xl border backdrop-blur-md transition-all ${
            toast.type === 'success' 
              ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' 
              : toast.type === 'error'
              ? 'bg-rose-500/10 text-rose-600 border-rose-500/20'
              : 'bg-primary/10 text-primary border-primary/20'
          }`}>
            <span className="material-symbols-outlined font-bold">
              {toast.type === 'success' ? 'check_circle' : toast.type === 'error' ? 'error' : 'info'}
            </span>
            <span className="font-bold text-[15px]">{toast.message}</span>
            <button 
              onClick={() => setToast(null)}
              className="ml-md hover:opacity-70 transition-opacity"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        </div>
      )}

      {/* Custom Confirmation Modal */}
      {confirmModal.show && (
        <div className="fixed inset-0 z-[99] flex items-center justify-center bg-inverse-surface/40 backdrop-blur-sm p-md animate-in fade-in duration-200">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-lg max-w-[420px] w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-md text-error mb-md">
              <span className="material-symbols-outlined text-[32px]">warning</span>
              <h3 className="font-bold text-[20px] text-on-surface">{confirmModal.title}</h3>
            </div>
            <p className="text-[15px] text-on-surface-variant leading-[24px] mb-lg">
              {confirmModal.message}
            </p>
            <div className="flex gap-sm justify-end">
              <button
                type="button"
                onClick={() => setConfirmModal(prev => ({ ...prev, show: false }))}
                className="px-md py-sm font-bold text-on-surface-variant hover:bg-surface-container rounded-xl transition-colors cursor-pointer text-[14px]"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={() => {
                  setConfirmModal(prev => ({ ...prev, show: false }));
                  confirmModal.onConfirm();
                }}
                className="px-md py-sm bg-error text-on-error font-bold rounded-xl hover:bg-error/95 active:scale-95 transition-all cursor-pointer text-[14px]"
              >
                Đồng ý xóa
              </button>
            </div>
          </div>
        </div>
      )}

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
