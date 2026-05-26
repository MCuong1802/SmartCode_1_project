'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/utils/api';
import Link from 'next/link';

interface NoteCard {
  id: string;
  title: string;
  type: string; // 'priority' | 'idea' | 'code' | 'shopping' | 'emergency' | 'book'
  icon: string;
  iconColor: string;
  iconFill?: boolean;
  content: string;
  snippet?: string;
  tags: string[];
  date: string;
  rawDate: string; // for sorting
  colorClass: string; // border top class
  colorName: 'blue' | 'yellow' | 'green' | 'red' | 'gray';
  category: 'Công việc' | 'Cá nhân' | 'Sáng tạo' | 'Kế hoạch';
}

export default function AllNotesPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // States Quản lý Lọc và Sắp xếp
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<'blue' | 'yellow' | 'green' | 'red' | 'gray' | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'title'>('date');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [isListView, setIsListView] = useState(false); // Toggle Grid/List
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const [notes, setNotes] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  // States cho Modal Xem, Sửa, Xóa ghi chú
  const [activeViewNote, setActiveViewNote] = useState<any | null>(null);
  const [activeEditNote, setActiveEditNote] = useState<any | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editCategoryId, setEditCategoryId] = useState('');
  const [activeDeleteId, setActiveDeleteId] = useState<string | null>(null);

  // Mở modal Xem
  const handleViewNote = (note: any) => {
    setActiveViewNote(note);
  };

  // Mở modal Sửa
  const handleEditNote = (note: any) => {
    setActiveEditNote(note);
    setEditTitle(note.title);
    setEditContent(note.content);
    setEditCategoryId(note.category?.id || '');
  };

  // Lưu Ghi chú đã chỉnh sửa
  const handleSaveEdit = async () => {
    if (!editTitle.trim()) {
      alert('Tiêu đề không được để trống!');
      return;
    }
    try {
      const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/notes/${activeEditNote.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: editTitle.trim(),
          content: editContent.trim(),
          categoryId: editCategoryId || undefined
        })
      });
      const data = await res.json();
      if (res.ok) {
        setNotes(prev => prev.map(n => n.id === activeEditNote.id ? data.note : n));
        setActiveEditNote(null);
      } else {
        alert(data.message || 'Cập nhật thất bại');
      }
    } catch (err) {
      console.error(err);
      alert('Không thể kết nối đến máy chủ.');
    }
  };

  // Mở modal Xóa (Xác nhận)
  const handleDeleteNote = (id: string) => {
    setActiveDeleteId(id);
  };

  // Xác nhận Xóa Ghi chú
  const handleConfirmDelete = async () => {
    if (!activeDeleteId) return;
    const token = localStorage.getItem('access_token');
    try {
      const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/notes/${activeDeleteId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        setNotes(prev => prev.filter(n => n.id !== activeDeleteId));
        setActiveDeleteId(null);
      } else {
        alert('Xóa thất bại');
      }
    } catch (err) {
      console.error(err);
      alert('Không thể kết nối đến máy chủ.');
    }
  };

  // Kiểm tra đăng nhập và nạp dữ liệu thực từ database
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/login');
      return;
    }

    setIsAuthenticated(true);

    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const q = searchParams.get('q');
      if (q) {
        setSearchQuery(q);
      }
    }

    // Tải danh sách ghi chú
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

    // Tải danh sách danh mục
    apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setCategories(data);
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

  // Xử lý Checkbox Category
  const handleCategoryChange = (category: string) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter(c => c !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  // Reset toàn bộ bộ lọc
  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategories([]);
    setSelectedTag(null);
    setSelectedColor(null);
  };

  // Logic lọc và sắp xếp ghi chú
  const filteredNotes = notes
    .filter((note) => {
      // Lọc theo thanh tìm kiếm
      const matchesSearch = 
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase());

      // Lọc theo Category Checkboxes
      const matchesCategory = 
        selectedCategories.length === 0 || 
        (note.category && selectedCategories.includes(note.category.title));

      // Lọc theo Tag Cloud (Nếu có tag được chọn, đối chiếu với tên danh mục)
      const matchesTag = 
        !selectedTag || 
        (note.category && note.category.title.toLowerCase() === selectedTag.toLowerCase());

      // Lọc theo Mã màu
      const matchesColor = 
        !selectedColor || 
        (note.category && note.category.colorName === selectedColor);

      return matchesSearch && matchesCategory && matchesTag && matchesColor;
    })
    .sort((a, b) => {
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      } else {
        // Sắp xếp theo ngày tạo (ngày mới lên trước)
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center font-body-md">
        Đang tải dữ liệu...
      </div>
    );
  }

  return (
    <div className="bg-background text-on-surface flex h-screen overflow-hidden font-body-md antialiased w-full">
      
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
            className="flex items-center gap-md px-md py-sm bg-primary-fixed text-on-primary-fixed rounded-lg font-bold transition-all duration-200 ease-in-out active:scale-95"
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
 
      {/* Main Content Canvas */}
      <main className="flex-grow flex flex-col h-full bg-background overflow-hidden relative">
        {/* TopNavBar Component */}
        <header className="flex justify-between items-center w-full px-lg py-sm bg-surface/80 backdrop-blur-md border-b border-outline-variant sticky top-0 z-50">
          <div className="flex items-center gap-lg flex-grow max-w-3xl">
            <div className="relative w-full">
              <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-on-surface-variant" data-icon="search">search</span>
              <input
                id="main-search-input"
                className="w-full bg-surface-container-low border border-outline-variant rounded-full py-sm pl-[44px] pr-[70px] text-body-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                placeholder="Tìm kiếm ghi chú..."
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
          <div className="flex items-center gap-md">
            <button className="p-sm text-on-surface-variant hover:bg-surface-container rounded-full transition-colors">
              <span className="material-symbols-outlined" data-icon="notifications">notifications</span>
            </button>
            <button className="p-sm text-on-surface-variant hover:bg-surface-container rounded-full transition-colors">
              <span className="material-symbols-outlined" data-icon="help">help</span>
            </button>
            <div className="h-8 w-8 rounded-full bg-secondary-container overflow-hidden border border-outline-variant">
              <img
                alt="Ảnh hồ sơ"
                className="h-full w-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCj6bCBrdj3qPR2KE01j1nTZJLMtuduuc5l5dR9zV-3yQEXf4wWmpC8JYCLM9lc1AVB2pr-fJlkOzPvOwYz_Jhz1CADK6sW16ihyL7opr-WV9oCHnbzat7ltQjoL2cGP1zjjLJZpcHoeWbCsyXIcznxKJWbaLml6CG6bXSeh9ZLRtZ0WDa87lRkPMfE-G9PDKnV8RSDn5wDCU7928TJGF6mKxYelB94yUNwyhgSntM8UZ2FiDHq7sUscDdO9giSqHNpW7Ut8kU4MVn1"
              />
            </div>
          </div>
        </header>

        {/* Grid Header Actions */}
        <div className="px-xl py-lg flex justify-between items-end border-b border-outline-variant bg-surface-bright">
          <div>
            <h2 className="font-headline-lg text-headline-lg text-on-surface">Tất cả ghi chú</h2>
            <p className="text-on-surface-variant font-body-sm text-body-sm">
              Bạn có {filteredNotes.length} ghi chú trong kho lưu trữ
            </p>
          </div>
          <div className="flex items-center gap-md">
            {/* Sorting & View Toggles */}
            <div className="flex bg-surface-container-low rounded-lg p-xs border border-outline-variant">
              <button
                onClick={() => setIsListView(false)}
                className={`p-xs rounded-md ${!isListView ? 'bg-surface-container-highest shadow-sm text-primary' : 'text-on-surface-variant hover:text-primary'}`}
              >
                <span className="material-symbols-outlined" data-icon="grid_view">grid_view</span>
              </button>
              <button
                onClick={() => setIsListView(true)}
                className={`p-xs rounded-md ${isListView ? 'bg-surface-container-highest shadow-sm text-primary' : 'text-on-surface-variant hover:text-primary'}`}
              >
                <span className="material-symbols-outlined" data-icon="view_list">view_list</span>
              </button>
            </div>
            
            {/* Sorting Trigger */}
            <div className="relative">
              <button
                onClick={() => setShowSortMenu(!showSortMenu)}
                className="flex items-center gap-sm px-md py-sm border border-outline-variant rounded-lg bg-surface hover:bg-surface-container transition-colors"
              >
                <span className="font-label-md text-label-md text-on-surface-variant">Sắp xếp theo:</span>
                <span className="font-label-md text-label-md font-bold text-on-surface">
                  {sortBy === 'date' ? 'Ngày tạo' : 'Tiêu đề'}
                </span>
                <span className="material-symbols-outlined text-sm" data-icon="expand_more">expand_more</span>
              </button>

              {showSortMenu && (
                <div className="absolute right-0 mt-sm w-44 bg-surface border border-outline-variant rounded-lg shadow-lg z-30">
                  <button
                    onClick={() => {
                      setSortBy('date');
                      setShowSortMenu(false);
                    }}
                    className={`w-full text-left px-md py-sm font-label-md text-label-md hover:bg-surface-container transition-colors ${sortBy === 'date' ? 'text-primary font-bold' : 'text-on-surface'}`}
                  >
                    Ngày tạo
                  </button>
                  <button
                    onClick={() => {
                      setSortBy('title');
                      setShowSortMenu(false);
                    }}
                    className={`w-full text-left px-md py-sm font-label-md text-label-md hover:bg-surface-container transition-colors ${sortBy === 'title' ? 'text-primary font-bold' : 'text-on-surface'}`}
                  >
                    Tiêu đề (A-Z)
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Scrollable Note Grid Container */}
        <div className="flex-grow overflow-y-auto p-xl scroll-smooth custom-scrollbar">
          <div className={isListView ? "flex flex-col gap-lg" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg"}>
            {filteredNotes.length === 0 ? (
              <div className="col-span-full py-2xl text-center text-on-surface-variant">
                Không tìm thấy ghi chú nào khớp với các bộ lọc của bạn.
              </div>
            ) : (
              filteredNotes.map((note) => {
                const colorMap: Record<string, string> = {
                  blue: 'border-t-primary',
                  yellow: 'border-t-yellow-500',
                  green: 'border-t-emerald-500',
                  red: 'border-t-error',
                  gray: 'border-t-outline',
                };
                const colorClass = note.category ? colorMap[note.category.colorName] || 'border-t-primary' : 'border-t-outline-variant';
                const icon = note.category?.icon || 'description';
                return (
                  <div
                    key={note.id}
                    onClick={() => handleViewNote(note)}
                    className={`bg-surface-container-lowest border-t-4 ${colorClass} rounded-xl p-md shadow-sm border border-outline-variant hover:shadow-md transition-all group cursor-pointer flex flex-col`}
                  >
                    <div className="flex justify-between items-start mb-sm">
                      <h3 className="font-headline-sm text-headline-sm text-on-surface line-clamp-1">{note.title}</h3>
                      <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors">
                        {icon}
                      </span>
                    </div>

                    <p className="text-on-surface-variant font-body-sm text-body-sm mb-md line-clamp-3 whitespace-pre-line flex-grow">
                      {note.content}
                    </p>

                    <div className="flex flex-wrap gap-xs mb-md mt-auto">
                      {note.category && (
                        <span className="px-sm py-xs font-label-md text-label-md rounded-full bg-primary-container/20 text-primary font-bold">
                          {note.category.title}
                        </span>
                      )}
                    </div>

                    <div className="flex justify-between items-center text-outline text-label-md pt-sm border-t border-outline-variant/10">
                      <span>{new Date(note.createdAt).toLocaleDateString('vi-VN')}</span>
                      
                      <div className="flex items-center gap-xs">
                        {/* Xem */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewNote(note);
                          }}
                          title="Xem chi tiết"
                          className="p-1.5 rounded-full hover:bg-surface-container text-outline hover:text-primary transition-all active:scale-90"
                        >
                          <span className="material-symbols-outlined text-[18px]">visibility</span>
                        </button>
                        
                        {/* Sửa */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditNote(note);
                          }}
                          title="Chỉnh sửa"
                          className="p-1.5 rounded-full hover:bg-surface-container text-outline hover:text-primary transition-all active:scale-90"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        
                        {/* Xóa */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteNote(note.id);
                          }}
                          title="Xóa ghi chú"
                          className="p-1.5 rounded-full hover:bg-error-container/20 text-outline hover:text-error transition-all active:scale-90"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </main>

      {/* Right Filtering Sidebar */}
      <aside className="hidden xl:flex flex-col w-[300px] h-screen bg-surface border-l border-outline-variant p-lg overflow-y-auto custom-scrollbar shrink-0">
        <div className="flex items-center justify-between mb-lg shrink-0 pb-sm border-b border-outline-variant/60">
          <div className="flex items-center gap-sm">
            <span className="material-symbols-outlined text-primary text-[20px]" data-icon="tune">tune</span>
            <h3 className="font-bold text-[18px] text-on-surface tracking-tight">Bộ lọc</h3>
          </div>
          <button
            onClick={handleClearFilters}
            className="text-primary font-bold text-xs bg-primary-fixed hover:bg-primary-fixed-dim px-md py-sm rounded-full transition-all active:scale-95 cursor-pointer"
          >
            Xóa tất cả
          </button>
        </div>

        {/* Categories Filter */}
        <div className="mb-xl shrink-0">
          <p className="font-label-md text-label-md font-bold text-outline uppercase tracking-wider mb-md">
            Danh mục
          </p>
          <div className="flex flex-col gap-sm">
            {categories.map((cat) => {
              const isChecked = selectedCategories.includes(cat.title);
              // Đếm số ghi chú thực tế trong danh mục này
              const count = notes.filter((n) => n.category?.id === cat.id).length;
              const displayCount = count < 10 ? `0${count}` : `${count}`;
              const icon = cat.icon || 'folder';
              return (
                <label 
                  key={cat.id} 
                  className={`flex items-center justify-between px-md py-sm rounded-xl cursor-pointer transition-all duration-200 group border ${isChecked ? 'bg-primary-fixed border-primary text-on-primary-fixed font-bold shadow-sm' : 'bg-surface-container-lowest border-outline-variant/30 text-on-surface-variant hover:bg-surface-container-low hover:border-outline-variant'}`}
                >
                  <input
                    className="sr-only"
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleCategoryChange(cat.title)}
                  />
                  <div className="flex items-center gap-md min-w-0">
                    <span className={`material-symbols-outlined text-[18px] shrink-0 ${isChecked ? 'text-primary' : 'text-outline group-hover:text-primary transition-colors'}`} data-icon={icon}>
                      {icon}
                    </span>
                    <span className="truncate text-body-md whitespace-nowrap">
                      {cat.title}
                    </span>
                  </div>
                  <span className={`text-[12px] font-bold px-sm py-0.5 rounded-full ${isChecked ? 'bg-primary/20 text-primary' : 'bg-surface-container-high text-on-surface-variant'}`}>
                    {displayCount}
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Tags Cloud */}
        <div className="mb-xl shrink-0">
          <p className="font-label-md text-label-md font-bold text-outline uppercase tracking-wider mb-md">
            Thẻ phổ biến
          </p>
          <div className="flex flex-wrap gap-xs">
            {(['design', 'priority', 'meeting', 'dev', 'book', 'health'] as const).map((tag) => {
              const isSelected = selectedTag?.toLowerCase() === tag.toLowerCase();
              const tagMap = {
                design: 'Sáng tạo',
                priority: 'Quan trọng',
                meeting: 'Cuộc họp',
                dev: 'Code',
                book: 'Học tập',
                health: 'Cá nhân'
              };
              return (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(isSelected ? null : tagMap[tag])}
                  className={`px-md py-sm border rounded-full transition-all text-xs font-semibold cursor-pointer flex items-center gap-xs hover:scale-105 active:scale-95 duration-150 ${isSelected ? 'bg-primary border-primary text-on-primary font-bold shadow-sm' : 'bg-surface-container-lowest border-outline-variant/40 text-on-surface-variant hover:border-primary hover:text-primary'}`}
                >
                  <span>#</span>
                  <span>{tag}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Color Coding Filter */}
        <div className="mb-xl shrink-0">
          <p className="font-label-md text-label-md font-bold text-outline uppercase tracking-wider mb-md">
            Mã màu
          </p>
          <div className="grid grid-cols-5 gap-sm">
            {(['blue', 'yellow', 'green', 'red', 'gray'] as const).map((color) => {
              const bgClass = {
                blue: 'bg-primary',
                yellow: 'bg-yellow-500',
                green: 'bg-emerald-500',
                red: 'bg-error',
                gray: 'bg-outline'
              }[color];
              const isSelected = selectedColor === color;
              return (
                <button
                  key={color}
                  onClick={() => setSelectedColor(isSelected ? null : color)}
                  className={`relative w-9 h-9 rounded-full ${bgClass} hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer shadow-sm border border-black/10 flex items-center justify-center`}
                >
                  {isSelected && (
                    <span className="material-symbols-outlined text-[18px] text-white font-bold" data-icon="check">
                      check
                    </span>
                  )}
                  <span className={`absolute inset-0 rounded-full border-2 border-white opacity-0 transition-opacity ${isSelected ? 'opacity-100' : ''}`} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Date Range Filter */}
        <div className="mb-xl shrink-0">
          <p className="font-label-md text-label-md font-bold text-outline uppercase tracking-wider mb-md">
            Thời gian
          </p>
          <div className="flex flex-col gap-sm">
            {[
              { label: 'Hôm nay', icon: 'today', isSelected: true },
              { label: '7 ngày qua', icon: 'date_range', isSelected: false },
              { label: '30 ngày qua', icon: 'calendar_month', isSelected: false }
            ].map((item) => {
              return (
                <button 
                  key={item.label} 
                  className={`w-full flex items-center gap-md px-md py-sm rounded-xl transition-all duration-200 text-left cursor-pointer border ${item.isSelected ? 'bg-primary-container/20 text-primary font-bold border-primary pl-[12px]' : 'bg-surface-container-lowest border-outline-variant/30 text-on-surface-variant hover:bg-surface-container-low hover:border-outline-variant'}`}
                >
                  <span className={`material-symbols-outlined text-[18px] ${item.isSelected ? 'text-primary' : 'text-outline'}`} data-icon={item.icon}>
                    {item.icon}
                  </span>
                  <span className="text-body-md whitespace-nowrap">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick Promotion/Workspace Health */}
        <div className="mt-auto pt-xl shrink-0">
          <div className="p-md bg-gradient-to-br from-primary to-primary-container rounded-xl text-on-primary-container relative overflow-hidden shadow-md border border-white/10">
            <div className="relative z-10">
              <p className="font-bold text-label-md mb-xs text-white">Nâng cấp không gian</p>
              <p className="text-xs mb-md opacity-80 text-white/90">
                Mở khóa bộ nhớ không giới hạn và cộng tác nhóm.
              </p>
              <button className="bg-surface text-primary px-md py-xs rounded-lg font-bold text-xs active:scale-95 transition-all shadow-sm">
                Nâng cấp ngay
              </button>
            </div>
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white rounded-full opacity-10 blur-xl"></div>
          </div>
        </div>
      </aside>

      {/* Mobile Navigation (Floating for mobile) */}
      <div className="md:hidden fixed bottom-md left-md right-md h-16 bg-surface shadow-lg rounded-2xl flex items-center justify-around px-md border border-outline-variant z-50 animate-in slide-in-from-bottom duration-300">
        <Link href="/" className="p-sm text-on-surface-variant flex flex-col items-center">
          <span className="material-symbols-outlined" data-icon="grid_view">grid_view</span>
        </Link>
        <Link href="/all-notes" className="p-sm text-primary flex flex-col items-center">
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
          onClick={() => {
            localStorage.removeItem('access_token');
            router.push('/login');
          }}
          className="p-sm text-error flex flex-col items-center"
        >
          <span className="material-symbols-outlined" data-icon="logout">logout</span>
        </button>
      </div>

      {/* Modal Xem Chi Tiết Ghi Chú */}
      {activeViewNote && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-md animate-in fade-in duration-200">
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant max-w-[600px] w-full p-xl shadow-2xl flex flex-col gap-lg animate-in zoom-in-95 duration-200 max-h-[85vh]">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-headline-md text-headline-md text-on-surface font-bold leading-tight">{activeViewNote.title}</h3>
                <div className="flex flex-wrap items-center gap-md mt-sm text-outline font-label-md text-label-md">
                  <div className="flex items-center gap-xs">
                    <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                    <span className="font-bold">Ngày tạo:</span>
                    <span>{new Date(activeViewNote.createdAt).toLocaleString('vi-VN')}</span>
                  </div>
                  {activeViewNote.updatedAt && (
                    <div className="flex items-center gap-xs">
                      <span className="material-symbols-outlined text-[16px]">update</span>
                      <span className="font-bold">Cập nhật:</span>
                      <span>{new Date(activeViewNote.updatedAt).toLocaleString('vi-VN')}</span>
                    </div>
                  )}
                  {activeViewNote.category && (
                    <span className="px-sm py-0.5 rounded-full bg-primary-container/20 text-primary font-bold text-[11px]">
                      {activeViewNote.category.title}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setActiveViewNote(null)}
                className="p-1.5 rounded-full hover:bg-surface-container text-outline hover:text-on-surface transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            
            <div className="overflow-y-auto pr-xs font-body-md text-body-md text-on-surface-variant whitespace-pre-wrap leading-relaxed max-h-[50vh] scrollbar-thin">
              {activeViewNote.content}
            </div>
            
            <div className="flex justify-end gap-md pt-md border-t border-outline-variant/10 mt-auto">
              <button
                onClick={() => setActiveViewNote(null)}
                className="px-xl py-sm bg-surface-container-high hover:bg-surface-container-highest text-on-surface rounded-xl font-bold transition-all active:scale-95 text-[14px]"
              >
                Đóng
              </button>
              <button
                onClick={() => {
                  const note = activeViewNote;
                  setActiveViewNote(null);
                  handleEditNote(note);
                }}
                className="px-xl py-sm bg-primary text-on-primary rounded-xl font-bold transition-all active:scale-95 flex items-center gap-xs text-[14px]"
              >
                <span className="material-symbols-outlined text-[16px]">edit</span>
                Chỉnh sửa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Chỉnh Sửa Ghi Chú */}
      {activeEditNote && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-md animate-in fade-in duration-200">
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant max-w-[600px] w-full p-xl shadow-2xl flex flex-col gap-lg animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center pb-sm border-b border-outline-variant/35">
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">Chỉnh sửa ghi chú</h3>
              <button
                onClick={() => setActiveEditNote(null)}
                className="p-1.5 rounded-full hover:bg-surface-container text-outline hover:text-on-surface transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            
            <div className="flex flex-col gap-md">
              <div className="flex flex-col gap-xs">
                <label className="font-label-md text-label-md text-on-surface-variant">Tiêu đề</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Nhập tiêu đề..."
                  className="w-full px-md py-sm bg-surface border border-outline-variant rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-on-surface font-body-md"
                />
              </div>

              <div className="flex flex-col gap-xs">
                <label className="font-label-md text-label-md text-on-surface-variant">Danh mục</label>
                <select
                  value={editCategoryId}
                  onChange={(e) => setEditCategoryId(e.target.value)}
                  className="w-full px-md py-sm bg-surface border border-outline-variant rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-on-surface font-body-md cursor-pointer"
                >
                  <option value="">Không có danh mục</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-xs">
                <label className="font-label-md text-label-md text-on-surface-variant">Nội dung</label>
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  placeholder="Nhập nội dung ghi chú..."
                  rows={8}
                  className="w-full px-md py-sm bg-surface border border-outline-variant rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-on-surface font-body-md resize-none"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-md pt-sm border-t border-outline-variant/10">
              <button
                onClick={() => setActiveEditNote(null)}
                className="px-xl py-sm bg-surface-container-high hover:bg-surface-container-highest text-on-surface rounded-xl font-bold transition-all active:scale-95 text-[14px]"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-xl py-sm bg-primary text-on-primary rounded-xl font-bold transition-all active:scale-95 text-[14px]"
              >
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Xác Nhận Xóa */}
      {activeDeleteId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-md animate-in fade-in duration-200">
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant max-w-[400px] w-full p-xl shadow-2xl flex flex-col gap-lg animate-in zoom-in-95 duration-200">
            <div className="flex gap-md items-start">
              <div className="p-sm bg-error-container text-error rounded-full shrink-0">
                <span className="material-symbols-outlined text-[24px]">warning</span>
              </div>
              <div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">Xóa ghi chú?</h3>
                <p className="text-on-surface-variant font-body-md text-body-md mt-xs leading-normal">
                  Bạn có chắc chắn muốn xóa ghi chú này? Hành động này không thể hoàn tác.
                </p>
              </div>
            </div>
            
            <div className="flex justify-end gap-md pt-xs">
              <button
                onClick={() => setActiveDeleteId(null)}
                className="px-xl py-sm bg-surface-container-high hover:bg-surface-container-highest text-on-surface rounded-xl font-bold transition-all active:scale-95 text-[14px]"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-xl py-sm bg-error text-white hover:bg-error/90 rounded-xl font-bold transition-all active:scale-95 text-[14px]"
              >
                Xóa ngay
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
