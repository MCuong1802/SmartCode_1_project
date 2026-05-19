'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface CategoryItem {
  id: string;
  title: string;
  description: string;
  notesCount: number;
  icon: string;
  colorName: 'blue' | 'yellow' | 'green' | 'red' | 'gray';
  accentClass: string;
  iconBgClass: string;
  iconTextClass: string;
}

interface ActivityItem {
  id: string;
  category: string;
  lastNote: string;
  time: string;
  status: 'Đã đồng bộ' | 'Đang soạn';
  statusColor: string;
  bulletColor: string;
}

export default function CategoriesPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // States quản lý Danh mục và Ghi chú thực tế từ DB
  const [categories, setCategories] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // States quản lý Modal tạo Danh mục mới
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newIcon, setNewIcon] = useState('work');
  const [newColor, setNewColor] = useState<'blue' | 'yellow' | 'green' | 'red' | 'gray'>('blue');

  // Tìm kiếm danh mục
  const [searchQuery, setSearchQuery] = useState('');

  // States quản lý chỉnh sửa danh mục
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editIcon, setEditIcon] = useState('work');
  const [editColor, setEditColor] = useState<'blue' | 'yellow' | 'green' | 'red' | 'gray'>('blue');

  // States quản lý Thông báo (Toast) & Xác nhận (Confirmation Modal)
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

  // Kiểm tra đăng nhập và nạp dữ liệu thực tế từ database
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/login');
      return;
    }

    setIsAuthenticated(true);

    // Fetch categories
    fetch('http://localhost:3001/categories', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setCategories(data);
        }
      })
      .catch(err => console.error('Error fetching categories:', err));

    // Fetch notes và cấu hình hoạt động gần đây
    fetch('http://localhost:3001/notes', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setNotes(data);
          
          // Tạo danh sách hoạt động gần đây tự động
          const acts = data.slice(0, 5).map((note, index) => {
            const colorsMap: Record<string, string> = {
              blue: 'bg-primary',
              yellow: 'bg-yellow-500',
              green: 'bg-emerald-500',
              red: 'bg-error',
              gray: 'bg-outline'
            };
            const bulletColor = note.category ? colorsMap[note.category.colorName] || 'bg-primary' : 'bg-outline';
            return {
              id: note.id,
              category: note.category?.title || 'Chưa phân loại',
              lastNote: note.title,
              time: new Date(note.createdAt).toLocaleDateString('vi-VN'),
              status: 'Đã đồng bộ' as const,
              statusColor: 'bg-green-100 text-green-700',
              bulletColor: bulletColor
            };
          });
          setActivities(acts);
        }
      })
      .catch(err => console.error('Error fetching notes:', err));
  }, [router]);

  // Xử lý tạo mới Danh mục thực tế lưu vào database
  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const token = localStorage.getItem('access_token');
    if (!token) return;

    fetch('http://localhost:3001/categories', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        title: newTitle.trim(),
        description: newDesc.trim() || 'Tài liệu và lưu trữ các ghi chú liên quan.',
        icon: newIcon,
        colorName: newColor
      })
    })
      .then(async (res) => {
        if (res.ok) {
          showToast('Thêm danh mục mới thành công!', 'success');
          // Tải lại danh sách danh mục sau khi thêm mới thành công
          fetch('http://localhost:3001/categories', {
            headers: { 'Authorization': `Bearer ${token}` }
          })
            .then(res => res.json())
            .then(data => {
              if (Array.isArray(data)) {
                setCategories(data);
              }
            });
        } else {
          const errData = await res.json().catch(() => ({}));
          showToast(errData.message || 'Thêm danh mục thất bại!', 'error');
        }
      })
      .catch(err => {
        console.error('Error creating category:', err);
        showToast('Không thể kết nối đến máy chủ.', 'error');
      });

    // Reset Form
    setNewTitle('');
    setNewDesc('');
    setNewIcon('work');
    setNewColor('blue');
    setShowAddModal(false);
  };

  // Nạp thông tin danh mục chuẩn bị sửa
  const handleStartEdit = (cat: any) => {
    setEditingCategoryId(cat.id);
    setEditTitle(cat.title);
    setEditDesc(cat.description || '');
    setEditIcon(cat.icon || 'work');
    setEditColor(cat.colorName || 'blue');
    setShowEditModal(true);
  };

  // Xử lý cập nhật Danh mục vào database
  const handleUpdateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategoryId || !editTitle.trim()) return;

    const token = localStorage.getItem('access_token');
    if (!token) return;

    fetch(`http://localhost:3001/categories/${editingCategoryId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        title: editTitle.trim(),
        description: editDesc.trim(),
        icon: editIcon,
        colorName: editColor
      })
    })
      .then(async (res) => {
        if (res.ok) {
          showToast('Cập nhật danh mục thành công!', 'success');
          // Tải lại danh sách danh mục sau khi cập nhật thành công
          fetch('http://localhost:3001/categories', {
            headers: { 'Authorization': `Bearer ${token}` }
          })
            .then(res => res.json())
            .then(data => {
              if (Array.isArray(data)) {
                setCategories(data);
              }
            });
        } else {
          const errData = await res.json().catch(() => ({}));
          showToast(errData.message || 'Cập nhật danh mục thất bại!', 'error');
        }
      })
      .catch(err => {
        console.error('Error updating category:', err);
        showToast('Không thể kết nối đến máy chủ.', 'error');
      });

    setShowEditModal(false);
    setEditingCategoryId(null);
  };

  // Xử lý xóa danh mục thực tế khỏi database
  const handleDeleteCategory = (id: string) => {
    askConfirmation(
      'Xóa danh mục',
      'Bạn có chắc chắn muốn xóa danh mục này? Lưu ý: Mọi ghi chú liên kết sẽ không bị xóa mà chỉ được chuyển về trạng thái Chưa phân loại.',
      () => {
        const token = localStorage.getItem('access_token');
        if (!token) return;

        fetch(`http://localhost:3001/categories/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
          .then(async (res) => {
            if (res.ok) {
              setCategories(prev => prev.filter(c => c.id !== id));
              showToast('Đã xóa danh mục thành công!', 'success');
            } else {
              const errData = await res.json().catch(() => ({}));
              showToast(errData.message || 'Xóa danh mục thất bại!', 'error');
            }
          })
          .catch(err => {
            console.error('Error deleting category:', err);
            showToast('Không thể kết nối đến máy chủ.', 'error');
          });
      }
    );
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
      
      {/* SideNavBar - JSON Implementation */}
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
            className="flex items-center gap-md px-md py-sm text-on-surface-variant hover:bg-surface-container rounded-lg transition-colors transition-all duration-200 ease-in-out active:scale-95"
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
          {/* Categories - ACTIVE */}
          <Link
            href="/categories"
            className="flex items-center gap-md px-md py-sm bg-primary-fixed text-on-primary-fixed rounded-lg font-bold transition-all duration-200 ease-in-out active:scale-95"
          >
            <span className="material-symbols-outlined" data-icon="folder" style={{ fontVariationSettings: "'FILL' 1" }}>folder</span>
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
 
      {/* Main Canvas */}
      <main className="flex-grow flex flex-col h-screen overflow-hidden bg-background relative min-w-0">
        {/* Top Navigation Bar */}
        <header className="sticky top-0 z-50 flex justify-between items-center w-full px-lg py-sm bg-surface/80 backdrop-blur-md border-b border-outline-variant shadow-sm shrink-0">
          <div className="flex items-center gap-md flex-grow max-w-3xl">
            <div className="relative w-full">
              <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-on-surface-variant" data-icon="search">search</span>
              <input
                id="main-search-input"
                className="w-full bg-surface-container-low border border-outline-variant rounded-full py-sm pl-[44px] pr-[70px] text-body-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                placeholder="Tìm kiếm danh mục..."
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

        {/* Scrollable categories space */}
        <div className="flex-grow overflow-y-auto p-xl scroll-smooth custom-scrollbar">
          {/* Header Section */}
          <header className="flex flex-col md:flex-row md:items-end justify-between gap-md mb-xl">
          <div>
            <h2 className="font-bold text-primary text-[30px] leading-[38px] tracking-[-0.02em]">Danh mục</h2>
            <p className="text-on-surface-variant text-[16px] leading-[24px]">Quản lý và tổ chức các ghi chú của bạn</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center gap-sm px-lg py-md bg-primary text-on-primary rounded-lg font-bold transition-all duration-200 ease-in-out hover:shadow-md active:scale-95 whitespace-nowrap cursor-pointer"
          >
            <span className="material-symbols-outlined" data-icon="add_circle">add_circle</span>
            <span className="text-[16px]">Thêm danh mục mới</span>
          </button>
        </header>

        {/* Categories Grid (Asymmetric/Bento style influence) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-lg">
          
          {categories
            .filter((cat) => {
              const query = searchQuery.trim().toLowerCase();
              if (!query) return true;
              return (
                cat.title.toLowerCase().includes(query) ||
                (cat.description && cat.description.toLowerCase().includes(query))
              );
            })
            .map((cat) => {
              const accentClass = {
                blue: 'bg-primary-container',
                yellow: 'bg-surface-tint',
                green: 'bg-tertiary',
                red: 'bg-error',
                gray: 'bg-secondary'
              }[cat.colorName as string] || 'bg-primary-container';

              const iconBgClass = {
                blue: 'bg-primary-fixed',
                yellow: 'bg-primary-fixed-dim',
                green: 'bg-tertiary-fixed',
                red: 'bg-error-container',
                gray: 'bg-secondary-container'
              }[cat.colorName as string] || 'bg-primary-fixed';

              const iconTextClass = {
                blue: 'text-on-primary-fixed',
                yellow: 'text-on-primary-fixed-variant',
                green: 'text-on-tertiary-fixed',
                red: 'text-on-error-container',
                gray: 'text-on-secondary-container'
              }[cat.colorName as string] || 'text-on-primary-fixed';

              // Tính số ghi chú thực tế trong danh mục này
              const notesCount = notes.filter((n) => n.category?.id === cat.id).length;

              return (
                <div
                  key={cat.id}
                  className="group bg-surface-container-lowest border border-outline-variant rounded-xl p-lg flex flex-col transition-all duration-200 hover:shadow-lg hover:border-primary-container relative overflow-hidden"
                >
                  <div className={`absolute top-0 left-0 w-1 h-full ${accentClass}`} />
                  <div className="flex justify-between items-start mb-md">
                    <div className={`p-sm rounded-lg ${iconBgClass} ${iconTextClass} flex justify-center items-center`}>
                      <span className="material-symbols-outlined">{cat.icon || 'folder'}</span>
                    </div>
                    <span className="text-[12px] font-medium bg-surface-container-high px-sm py-xs rounded-full text-on-surface-variant">
                      {notesCount} ghi chú
                    </span>
                  </div>
                  <h3 className="font-bold text-[18px] text-on-surface mb-sm">{cat.title}</h3>
                  <p className="text-[14px] text-on-surface-variant mb-xl line-clamp-2">{cat.description}</p>
                  
                  <div className="flex items-center gap-sm mt-auto">
                    <button
                      onClick={() => router.push('/all-notes')}
                      className={`flex-1 py-sm px-md text-[14px] font-bold rounded-lg transition-colors cursor-pointer text-center ${
                        cat.colorName === 'blue'
                          ? 'text-primary bg-primary-fixed/30 hover:bg-primary-fixed/50'
                          : cat.colorName === 'gray'
                          ? 'text-secondary bg-secondary-container hover:bg-secondary-fixed-dim'
                          : cat.colorName === 'yellow'
                          ? 'text-primary bg-primary-fixed hover:bg-primary-fixed-dim'
                          : cat.colorName === 'green'
                          ? 'text-tertiary bg-tertiary-fixed hover:bg-tertiary-fixed-dim'
                          : 'text-error bg-error-container/30 hover:bg-error-container/50'
                      }`}
                    >
                      Xem
                    </button>
                    <button 
                      onClick={() => handleStartEdit(cat)}
                      className="p-sm text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
                      title="Chỉnh sửa danh mục"
                    >
                      <span className="material-symbols-outlined" data-icon="edit_note">edit_note</span>
                    </button>
                    <button 
                      onClick={() => handleDeleteCategory(cat.id)}
                      className="p-sm text-on-surface-variant hover:text-error transition-colors cursor-pointer"
                      title="Xóa danh mục"
                    >
                      <span className="material-symbols-outlined" data-icon="delete">delete</span>
                    </button>
                  </div>
                </div>
              );
            })}

          {/* Empty State / Add New Placeholder */}
          <button
            onClick={() => setShowAddModal(true)}
            className="group border-2 border-dashed border-outline-variant rounded-xl p-lg flex flex-col items-center justify-center min-h-[220px] transition-all duration-200 hover:border-primary hover:bg-surface-container-low cursor-pointer w-full text-left"
          >
            <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant group-hover:bg-primary-fixed group-hover:text-primary mb-md transition-colors">
              <span className="material-symbols-outlined" data-icon="add">add</span>
            </div>
            <p className="font-bold text-[16px] text-on-surface-variant group-hover:text-primary text-center w-full">Thêm mới</p>
            <p className="text-[12px] text-outline text-center mt-xs w-full">Tạo danh mục mới để bắt đầu tổ chức</p>
          </button>
        </div>

        {/* Recent Activity Section (Secondary Content) */}
        <section className="mt-2xl mb-2xl">
          <div className="flex items-center justify-between mb-lg">
            <h4 className="font-bold text-[20px] text-on-surface">Hoạt động gần đây</h4>
            <button className="text-[14px] font-medium text-primary hover:underline cursor-pointer">Xem tất cả</button>
          </div>
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant">
                  <th className="px-lg py-md text-[12px] font-bold text-on-surface-variant uppercase tracking-wider">Danh mục</th>
                  <th className="px-lg py-md text-[12px] font-bold text-on-surface-variant uppercase tracking-wider">Ghi chú cuối</th>
                  <th className="px-lg py-md text-[12px] font-bold text-on-surface-variant uppercase tracking-wider">Thời gian</th>
                  <th className="px-lg py-md text-[12px] font-bold text-on-surface-variant uppercase tracking-wider">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {activities.map((act) => (
                  <tr key={act.id} className="hover:bg-surface-container-lowest transition-colors">
                    <td className="px-lg py-md">
                      <div className="flex items-center gap-sm">
                        <div className={`w-2 h-2 rounded-full ${act.bulletColor}`} />
                        <span className="text-[14px] font-medium">{act.category}</span>
                      </div>
                    </td>
                    <td className="px-lg py-md text-[14px]">{act.lastNote}</td>
                    <td className="px-lg py-md text-[14px] text-on-surface-variant">{act.time}</td>
                    <td className="px-lg py-md">
                      <span className={`text-[12px] px-sm py-1 rounded-full font-medium ${act.statusColor}`}>
                        {act.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>

      {/* Modal tạo danh mục mới (Add New Category Modal) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-inverse-surface/40 backdrop-blur-sm p-md">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg max-w-[480px] w-full shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-md border-b border-outline-variant pb-sm">
              <h3 className="font-headline-sm text-headline-sm font-bold text-primary">Tạo danh mục mới</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-on-surface-variant hover:text-error transition-colors p-xs rounded-full hover:bg-surface-container"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form onSubmit={handleCreateCategory} className="flex flex-col gap-md">
              <div>
                <label className="block text-label-md font-bold text-on-surface mb-xs">Tên danh mục *</label>
                <input
                  type="text"
                  required
                  className="w-full px-md py-sm bg-surface border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-body-md"
                  placeholder="Ví dụ: Công việc, Học tập, Ý tưởng..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-label-md font-bold text-on-surface mb-xs">Mô tả ngắn</label>
                <textarea
                  className="w-full px-md py-sm bg-surface border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-body-md h-20 resize-none"
                  placeholder="Mô tả tóm tắt về loại ghi chú trong danh mục này..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-md">
                <div>
                  <label className="block text-label-md font-bold text-on-surface mb-xs">Biểu tượng</label>
                  <select
                    className="w-full px-md py-sm bg-surface border border-outline-variant rounded-lg outline-none text-body-md"
                    value={newIcon}
                    onChange={(e) => setNewIcon(e.target.value)}
                  >
                    <option value="work">💼 Công việc</option>
                    <option value="person">👤 Cá nhân</option>
                    <option value="lightbulb">💡 Ý tưởng</option>
                    <option value="school">🎓 Học tập</option>
                    <option value="shopping_cart">🛒 Mua sắm</option>
                    <option value="flight">✈️ Du lịch</option>
                  </select>
                </div>

                <div>
                  <label className="block text-label-md font-bold text-on-surface mb-xs">Màu chủ đạo</label>
                  <select
                    className="w-full px-md py-sm bg-surface border border-outline-variant rounded-lg outline-none text-body-md"
                    value={newColor}
                    onChange={(e) => setNewColor(e.target.value as any)}
                  >
                    <option value="blue">🔵 Xanh dương</option>
                    <option value="yellow">🟡 Vàng</option>
                    <option value="green">🟢 Xanh lá</option>
                    <option value="red">🔴 Đỏ</option>
                    <option value="gray">⚫ Xám</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-sm justify-end pt-sm border-t border-outline-variant mt-sm">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-md py-sm font-bold text-on-surface-variant hover:bg-surface-container rounded-lg transition-colors cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-md py-sm bg-primary text-on-primary font-bold rounded-lg hover:bg-primary/95 active:scale-95 transition-all cursor-pointer"
                >
                  Xác nhận tạo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal chỉnh sửa danh mục (Edit Category Modal) */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-inverse-surface/40 backdrop-blur-sm p-md">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg max-w-[480px] w-full shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-md border-b border-outline-variant pb-sm">
              <h3 className="font-headline-sm text-headline-sm font-bold text-primary">Chỉnh sửa danh mục</h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingCategoryId(null);
                }}
                className="text-on-surface-variant hover:text-error transition-colors p-xs rounded-full hover:bg-surface-container"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form onSubmit={handleUpdateCategory} className="flex flex-col gap-md">
              <div>
                <label className="block text-label-md font-bold text-on-surface mb-xs">Tên danh mục *</label>
                <input
                  type="text"
                  required
                  className="w-full px-md py-sm bg-surface border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-body-md"
                  placeholder="Ví dụ: Công việc, Học tập, Ý tưởng..."
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-label-md font-bold text-on-surface mb-xs">Mô tả ngắn</label>
                <textarea
                  className="w-full px-md py-sm bg-surface border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-body-md h-20 resize-none"
                  placeholder="Mô tả tóm tắt về loại ghi chú trong danh mục này..."
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-md">
                <div>
                  <label className="block text-label-md font-bold text-on-surface mb-xs">Biểu tượng</label>
                  <select
                    className="w-full px-md py-sm bg-surface border border-outline-variant rounded-lg outline-none text-body-md"
                    value={editIcon}
                    onChange={(e) => setEditIcon(e.target.value)}
                  >
                    <option value="work">💼 Công việc</option>
                    <option value="person">👤 Cá nhân</option>
                    <option value="lightbulb">💡 Ý tưởng</option>
                    <option value="school">🎓 Học tập</option>
                    <option value="shopping_cart">🛒 Mua sắm</option>
                    <option value="flight">✈️ Du lịch</option>
                  </select>
                </div>

                <div>
                  <label className="block text-label-md font-bold text-on-surface mb-xs">Màu chủ đạo</label>
                  <select
                    className="w-full px-md py-sm bg-surface border border-outline-variant rounded-lg outline-none text-body-md"
                    value={editColor}
                    onChange={(e) => setEditColor(e.target.value as any)}
                  >
                    <option value="blue">🔵 Xanh dương</option>
                    <option value="yellow">🟡 Vàng</option>
                    <option value="green">🟢 Xanh lá</option>
                    <option value="red">🔴 Đỏ</option>
                    <option value="gray">⚫ Xám</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-sm justify-end pt-sm border-t border-outline-variant mt-sm">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingCategoryId(null);
                  }}
                  className="px-md py-sm font-bold text-on-surface-variant hover:bg-surface-container rounded-lg transition-colors cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-md py-sm bg-primary text-on-primary font-bold rounded-lg hover:bg-primary/95 active:scale-95 transition-all cursor-pointer"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mobile Navigation (Floating for mobile) */}
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
        <Link href="/categories" className="p-sm text-primary flex flex-col items-center">
          <span className="material-symbols-outlined" data-icon="folder" style={{ fontVariationSettings: "'FILL' 1" }}>folder</span>
        </Link>
        <button
          onClick={() => setShowLogoutConfirm(true)}
          className="p-sm text-error flex flex-col items-center cursor-pointer"
        >
          <span className="material-symbols-outlined" data-icon="logout">logout</span>
        </button>
      </div>
      {/* Toast Notification */}
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
                onClick={() => {
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
