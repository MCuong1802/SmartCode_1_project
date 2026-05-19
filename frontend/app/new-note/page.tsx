'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '../components/Sidebar';
import TopBarActions from '../components/TopBarActions';

export default function NewNotePage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('Đã lưu tự động');

  // Trạng thái quản lý Tiêu đề & Nội dung
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  // Quản lý thẻ nhãn (Tags)
  const [tags, setTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState('');
  const [showAddTag, setShowAddTag] = useState(false);

  // States quản lý danh mục lấy từ database
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [relatedNotes, setRelatedNotes] = useState<any[]>([]);

  // Kiểm tra đăng nhập và nạp danh sách danh mục thực tế
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/login');
      return;
    }

    setIsAuthenticated(true);

    fetch('http://localhost:3001/categories', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setCategories(data);
          if (data.length > 0) {
            setSelectedCategoryId(data[0].id);
          }
        }
      })
      .catch(err => console.error('Error fetching categories:', err));

    fetch('http://localhost:3001/notes', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setRelatedNotes(data.slice(0, 2));
        }
      })
      .catch(err => console.error('Error fetching related notes:', err));
  }, [router]);

  // Tự động thay đổi trạng thái khi chỉnh sửa
  const handleContentChange = (val: string) => {
    setContent(val);
    setSaveStatus('Chưa lưu...');
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    setSaveStatus('Chưa lưu...');
  };

  // Hàm xử lý Lưu thủ công vào database
  const handleSaveNote = async () => {
    if (!title.trim()) {
      alert('Vui lòng nhập tiêu đề ghi chú!');
      return;
    }

    const token = localStorage.getItem('access_token');
    if (!token) return;

    setIsSaving(true);
    setSaveStatus('Đang lưu...');

    try {
      const res = await fetch('http://localhost:3001/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          categoryId: selectedCategoryId || undefined,
        }),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        const msg = errBody?.message || `Lỗi ${res.status}`;
        throw new Error(msg);
      }

      setIsSaving(false);
      setSaveStatus('Đã lưu thành công!');
      setTimeout(() => router.push('/'), 1000);
    } catch (err: any) {
      console.error('Error saving note:', err);
      setIsSaving(false);
      setSaveStatus(`Lỗi: ${err.message}`);
      alert(`Không thể lưu ghi chú: ${err.message}`);
    }
  };

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTagInput.trim() && !tags.includes(newTagInput.trim())) {
      setTags([...tags, newTagInput.trim()]);
      setNewTagInput('');
      setShowAddTag(false);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
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
      <Sidebar />

      {/* Main Workspace */}
      <main className="flex-grow flex flex-col h-screen overflow-hidden bg-background relative min-w-0">
        {/* Header/Top Nav */}
        <header className="flex justify-between items-center w-full px-lg py-sm sticky top-0 z-50 bg-surface/80 backdrop-blur-md border-b border-outline-variant">
          <div className="flex items-center gap-md">
            <button className="p-sm hover:bg-surface-container rounded-full transition-colors md:hidden">
              <span className="material-symbols-outlined">menu</span>
            </button>
            <div className="flex items-center gap-sm text-on-surface-variant">
              <span className="material-symbols-outlined text-[18px]">
                {saveStatus.includes('Đang lưu') ? 'sync' : 'cloud_done'}
              </span>
              <span className="font-label-md text-label-md transition-all duration-200">{saveStatus}</span>
            </div>
          </div>
          <div className="flex items-center gap-md">
            <button
              onClick={handleSaveNote}
              disabled={isSaving}
              className={`flex items-center gap-xs px-md py-1.5 bg-primary text-on-primary font-bold text-label-md rounded-full shadow-sm hover:bg-primary/95 active:scale-95 transition-all ${isSaving ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              <span className="material-symbols-outlined text-[14px]">save</span>
              <span>{isSaving ? 'Đang lưu...' : 'Lưu ghi chú'}</span>
            </button>
            <button className="text-on-surface-variant hover:text-primary transition-colors">
              <span className="material-symbols-outlined">share</span>
            </button>
            <button className="text-on-surface-variant hover:text-primary transition-colors">
              <span className="material-symbols-outlined">more_vert</span>
            </button>
            <TopBarActions />
          </div>
        </header>

        {/* Editor Canvas */}
        <div className="flex-grow overflow-y-auto custom-scrollbar flex flex-col">
          <div className="max-w-[800px] w-full mx-auto px-lg py-2xl editor-container relative flex-grow flex flex-col">
            {/* Floating Toolbar */}
            <div className="toolbar sticky top-4 mb-xl z-20 flex justify-center opacity-40 hover:opacity-100 focus-within:opacity-100 transition-all duration-300 transform translate-y-2 hover:translate-y-0">
              <div className="bg-inverse-surface text-inverse-on-surface px-md py-xs rounded-xl shadow-xl flex items-center gap-sm border border-outline/20">
                <button className="p-xs hover:bg-white/10 rounded transition-colors">
                  <span className="material-symbols-outlined">format_bold</span>
                </button>
                <button className="p-xs hover:bg-white/10 rounded transition-colors">
                  <span className="material-symbols-outlined">format_italic</span>
                </button>
                <button className="p-xs hover:bg-white/10 rounded transition-colors">
                  <span className="material-symbols-outlined">format_underlined</span>
                </button>
                <div className="w-px h-4 bg-outline/30 mx-xs"></div>
                <button className="p-xs hover:bg-white/10 rounded transition-colors">
                  <span className="material-symbols-outlined">format_list_bulleted</span>
                </button>
                <button className="p-xs hover:bg-white/10 rounded transition-colors">
                  <span className="material-symbols-outlined">format_list_numbered</span>
                </button>
                <div className="w-px h-4 bg-outline/30 mx-xs"></div>
                <button className="p-xs hover:bg-white/10 rounded transition-colors">
                  <span className="material-symbols-outlined">link</span>
                </button>
                <button className="p-xs hover:bg-white/10 rounded transition-colors">
                  <span className="material-symbols-outlined">image</span>
                </button>
                <button className="p-xs hover:bg-white/10 rounded transition-colors">
                  <span className="material-symbols-outlined">code</span>
                </button>
              </div>
            </div>

            {/* Title Area */}
            <input
              type="text"
              className="w-full bg-transparent border-none focus:ring-0 font-headline-lg text-headline-lg p-0 mb-md placeholder:text-outline-variant outline-none focus:outline-none"
              placeholder="Tiêu đề ghi chú..."
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
            />

            {/* Metadata Row */}
            <div className="flex items-center gap-lg mb-xl text-on-surface-variant font-label-md text-label-md flex-wrap">
              <div className="flex items-center gap-xs">
                <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                <span>{new Date().toLocaleDateString('vi-VN')}</span>
              </div>
              <div className="flex items-center gap-xs">
                <span className="material-symbols-outlined text-[18px]">folder</span>
                <span className="font-bold">Danh mục:</span>
                {categories.length === 0 ? (
                  <Link href="/categories" className="text-primary hover:underline font-bold">Tạo danh mục trước</Link>
                ) : (
                  <select
                    value={selectedCategoryId}
                    onChange={(e) => setSelectedCategoryId(e.target.value)}
                    className="bg-surface-container border border-outline-variant rounded-lg px-md py-xs font-bold text-primary outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition-all cursor-pointer"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.title}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            {/* Editor Content (Fully Editable Textarea) */}
            <div className="flex-grow flex flex-col">
              <textarea
                className="w-full bg-transparent border-none focus:ring-0 font-body-lg text-body-lg text-on-surface/90 flex-grow min-h-[450px] outline-none resize-none placeholder:text-outline-variant/60"
                placeholder="Bắt đầu viết ghi chú của bạn tại đây..."
                value={content}
                onChange={(e) => handleContentChange(e.target.value)}
              />
            </div>

            {/* Tag Manager */}
            <div className="mt-2xl pt-lg border-t border-outline-variant flex flex-wrap items-center gap-sm">
              <span className="font-label-md text-label-md text-on-surface-variant mr-xs">Nhãn:</span>

              {tags.map((tag) => (
                <div
                  key={tag}
                  className="flex items-center gap-xs bg-secondary-container text-on-secondary-container px-sm py-1 rounded-full font-label-md"
                >
                  <span>{tag}</span>
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-error transition-colors flex items-center justify-center"
                  >
                    <span className="material-symbols-outlined text-[14px]">close</span>
                  </button>
                </div>
              ))}

              {showAddTag ? (
                <form onSubmit={handleAddTag} className="flex items-center gap-xs">
                  <input
                    type="text"
                    className="bg-surface border border-outline-variant rounded-full px-sm py-0.5 text-label-md focus:outline-none focus:border-primary w-24"
                    placeholder="Nhãn mới..."
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    autoFocus
                    onBlur={() => {
                      setTimeout(() => setShowAddTag(false), 200);
                    }}
                  />
                </form>
              ) : (
                <button
                  onClick={() => setShowAddTag(true)}
                  className="flex items-center gap-xs text-primary font-label-md hover:bg-primary-fixed px-sm py-1 rounded-full transition-colors"
                >
                  <span className="material-symbols-outlined text-[14px]">add</span>
                  Thêm nhãn
                </button>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Side Panel (Related Content) */}
      <aside className="w-[300px] h-screen bg-surface border-l border-outline-variant hidden lg:flex flex-col overflow-y-auto custom-scrollbar">
        <div className="p-lg flex flex-col gap-xl">
          <div>
            <h3 className="font-headline-sm text-headline-sm mb-md">Mục lục</h3>
            <nav className="space-y-sm">
              {content.split('\n')
                .filter(line => line.trim().startsWith('-') || line.trim().match(/^\d+\./) || line.trim().startsWith('#'))
                .slice(0, 6)
                .map((line, idx) => {
                  const cleaned = line.replace(/^[-#]|\d+\.\s*/, '').trim();
                  if (!cleaned) return null;
                  return (
                    <a
                      key={idx}
                      className={`block font-body-md border-l-2 pl-md transition-colors ${idx === 0 ? 'text-primary border-primary' : 'text-on-surface-variant hover:text-primary border-transparent'}`}
                      href="#"
                    >
                      {idx + 1}. {cleaned}
                    </a>
                  );
                })}
              {content.split('\n').filter(line => line.trim().startsWith('-') || line.trim().match(/^\d+\./) || line.trim().startsWith('#')).length === 0 && (
                <p className="text-[12px] text-outline italic">Hãy bắt đầu viết ghi chú bằng các đề mục hoặc gạch đầu dòng để tạo mục lục tự động.</p>
              )}
            </nav>
          </div>

          <div>
            <h3 className="font-headline-sm text-headline-sm mb-md">Ghi chú liên quan</h3>
            <div className="space-y-md">
              {relatedNotes.length === 0 ? (
                <p className="text-on-surface-variant text-label-md">Chưa có ghi chú nào khác.</p>
              ) : (
                relatedNotes.map((note) => (
                  <div
                    key={note.id}
                    onClick={() => {
                      setTitle(note.title);
                      setContent(note.content);
                      if (note.category) {
                        setSelectedCategoryId(note.category.id);
                      }
                    }}
                    className="group p-md bg-surface-container-low hover:bg-surface-container transition-all cursor-pointer rounded-lg border border-outline-variant/30"
                  >
                    <h4 className="font-body-md font-bold mb-xs group-hover:text-primary transition-colors line-clamp-1">
                      {note.title}
                    </h4>
                    <p className="text-label-md text-on-surface-variant line-clamp-2">
                      {note.content}
                    </p>
                    <div className="mt-sm flex items-center gap-xs text-label-md text-outline">
                      <span className="material-symbols-outlined text-[12px]">calendar_today</span>
                      <span>{new Date(note.createdAt).toLocaleDateString('vi-VN')}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Bento Grid Ad/Promo Area */}
          <div className="p-lg bg-primary-container rounded-xl text-on-primary-container relative overflow-hidden shadow-sm">
            <div className="relative z-10">
              <span className="font-headline-sm font-bold block mb-xs text-white">Nâng cấp Pro</span>
              <p className="text-label-md text-white/90 mb-md">
                Mở khóa dung lượng không giới hạn và tính năng AI.
              </p>
              <button className="bg-surface text-primary px-md py-xs rounded-lg font-bold text-label-md active:scale-95 transition-all">
                Tìm hiểu thêm
              </button>
            </div>
            <div className="absolute -right-4 -bottom-4 text-white/10">
              <span
                className="material-symbols-outlined text-[80px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                workspace_premium
              </span>
            </div>
          </div>
        </div>
      </aside>

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
