'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '../components/Sidebar';
import TopBarActions from '../components/TopBarActions';

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

  const [notes, setNotes] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  // Kiểm tra đăng nhập và nạp dữ liệu thực từ database
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/login');
      return;
    }

    setIsAuthenticated(true);

    // Tải danh sách ghi chú
    fetch('http://localhost:3001/notes', {
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
  }, [router]);

  // Xử lý Checkbox Category
  const handleCategoryChange = (category: string) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter(c => c !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  // Xóa ghi chú (chuyển vào thùng rác)
  const handleDelete = async (id: string) => {
    if (!confirm('Chuyển ghi chú này vào thùng rác?')) return;
    const token = localStorage.getItem('access_token');
    if (!token) return;
    try {
      const res = await fetch(`http://localhost:3001/notes/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        setNotes((prev) => prev.filter((n) => n.id !== id));
      }
    } catch (err) {
      console.error('Error deleting note:', err);
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

      <Sidebar />

      {/* Main Content Canvas */}
      <main className="flex-grow flex flex-col h-full bg-background overflow-hidden relative">
        {/* TopNavBar Component */}
        <header className="flex justify-between items-center w-full px-lg py-sm bg-surface/80 backdrop-blur-md border-b border-outline-variant sticky top-0 z-50">
          <div className="flex items-center gap-lg flex-1">
            <div className="relative w-full max-w-md">
              <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-outline" data-icon="search">search</span>
              <input
                className="w-full bg-surface-container-low border border-outline-variant rounded-lg pl-xl pr-md py-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                placeholder="Tìm kiếm ghi chú (⌘K)..."
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <TopBarActions />
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
                    onClick={() => router.push('/new-note')}
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
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(note.id); }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-xs rounded-lg hover:bg-error-container text-outline hover:text-error"
                          title="Xóa ghi chú"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                        <span className="material-symbols-outlined opacity-0 group-hover:opacity-100 transition-opacity text-[18px] text-primary" data-icon="arrow_forward">
                          arrow_forward
                        </span>
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
    </div>
  );
}
