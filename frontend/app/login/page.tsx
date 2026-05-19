'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};
    if (!email.trim()) {
      newErrors.email = 'Email không được để trống';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Định dạng email không hợp lệ';
    }

    if (!password) {
      newErrors.password = 'Mật khẩu không được để trống';
    } else if (password.length < 6) {
      newErrors.password = 'Mật khẩu phải chứa ít nhất 6 ký tự';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validate()) return;

    setIsLoading(true);

    try {
      const res = await fetch('http://localhost:3001/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại!');
      } else {
        // Lưu Access Token vào Local Storage của trình duyệt
        localStorage.setItem('access_token', data.access_token);

        // Chuyển hướng người dùng về trang chủ (hoặc trang danh sách ghi chú)
        router.push('/');
      }
    } catch (err) {
      setError('Không thể kết nối đến máy chủ.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col font-body-md antialiased">
      {/* TopAppBar */}
      <header className="bg-background fixed top-0 w-full z-50">
        <div className="flex justify-between items-center w-full px-margin-mobile md:px-margin-desktop py-4 max-w-7xl mx-auto">
          <div className="font-headline-md text-headline-md font-bold text-primary">
            NotesApp
          </div>
          <div className="flex gap-4 items-center">
            <button className="text-secondary hover:bg-surface-container-low transition-colors p-2 rounded-full">
              <span className="material-symbols-outlined">help</span>
            </button>
            <button className="text-secondary hover:bg-surface-container-low transition-colors p-2 rounded-full">
              <span className="material-symbols-outlined">info</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content: Login Screen */}
      <main className="flex-grow flex items-center justify-center px-margin-mobile pt-24 pb-12">
        <div className="w-full max-w-[440px]">
          <div className="auth-card-shadow bg-surface-container-lowest border border-outline-variant rounded-xl p-xl md:p-2xl flex flex-col items-center">

            {/* Brand Anchor */}


            {/* Header */}
            <div className="text-center mb-xl">
              <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface mb-xs">Chào mừng trở lại</h1>
              <p className="font-body-md text-body-md text-secondary">Đăng nhập để tiếp tục ghi chú của bạn</p>
            </div>

            {/* Hiển thị lỗi nếu đăng nhập sai */}
            {error && (
              <div className="w-full mb-4 p-3 bg-error-container text-error rounded-lg text-center font-body-sm">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleLogin} className="w-full space-y-lg" noValidate>
              {/* Email Field */}
              <div className="flex flex-col gap-xs">
                <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="email">Email</label>
                <div className="relative">
                  <input
                    className={`w-full px-md py-3 rounded-lg border focus:outline-none transition-all bg-white font-body-md text-body-md ${errors.email
                      ? 'border-error focus:ring-1 focus:ring-error focus:border-error'
                      : 'border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary'
                      }`}
                    id="email"
                    placeholder="example@gmail.com"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) {
                        setErrors(prev => ({ ...prev, email: undefined }));
                      }
                    }}
                  />
                </div>
                {errors.email && (
                  <span className="text-error text-[12px] font-medium mt-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">error</span>
                    {errors.email}
                  </span>
                )}
              </div>

              {/* Password Field */}
              <div className="flex flex-col gap-xs">
                <div className="flex justify-between items-center">
                  <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="password">Mật khẩu</label>
                  <a className="font-label-md text-label-md text-primary hover:underline" href="#">Quên mật khẩu?</a>
                </div>
                <div className="relative">
                  <input
                    className={`w-full px-md py-3 rounded-lg border focus:outline-none transition-all bg-white font-body-md text-body-md ${errors.password
                      ? 'border-error focus:ring-1 focus:ring-error focus:border-error'
                      : 'border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary'
                      }`}
                    id="password"
                    placeholder="••••••••"
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) {
                        setErrors(prev => ({ ...prev, password: undefined }));
                      }
                    }}
                  />
                </div>
                {errors.password && (
                  <span className="text-error text-[12px] font-medium mt-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">error</span>
                    {errors.password}
                  </span>
                )}
              </div>

              {/* Submit Button */}
              <button
                disabled={isLoading}
                className={`w-full text-on-primary text-body-md font-bold py-3 px-lg rounded-lg transition-all flex justify-center items-center gap-sm shadow-md ${isLoading ? 'bg-primary-fixed-dim cursor-not-allowed' : 'bg-primary-container hover:opacity-90 active:scale-[0.98]'}`}
                type="submit"
              >
                {isLoading ? 'Đang xác thực...' : 'Đăng nhập'}
              </button>
            </form>

            {/* Divider */}
            <div className="w-full flex items-center gap-md my-xl">
              <div className="flex-grow h-[1px] bg-outline-variant"></div>
              <span className="font-label-md text-label-md text-outline">HOẶC</span>
              <div className="flex-grow h-[1px] bg-outline-variant"></div>
            </div>

            {/* Secondary Action */}
            <div className="w-full text-center">
              <p className="font-body-sm text-body-sm text-secondary">
                Bạn chưa có tài khoản?
                <Link className="text-primary font-bold hover:underline ml-1" href="/register">
                  Đăng ký ngay
                </Link>
              </p>
            </div>
          </div>

          {/* Contextual Illustration */}
          <div className="mt-xl flex justify-center opacity-20 grayscale pointer-events-none">
            <img
              alt="Minimalist workspace"
              className="w-32 h-auto object-contain rounded-lg"
              src="https://cdn-icons-png.flaticon.com/512/3209/3209265.png"
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-surface-bright border-t border-outline-variant mt-auto">
        <div className="w-full py-lg px-margin-mobile md:px-margin-desktop flex flex-col md:flex-row justify-between items-center gap-md max-w-7xl mx-auto">
          <div className="font-headline-sm text-headline-sm font-bold text-primary">
            NotesApp
          </div>
          <div className="flex gap-lg font-body-sm text-body-sm text-secondary">
            <a className="hover:text-primary transition-colors" href="#">Terms</a>
            <a className="hover:text-primary transition-colors" href="#">Privacy</a>
            <a className="hover:text-primary transition-colors" href="#">Support</a>
          </div>
          <div className="font-body-sm text-body-sm text-secondary">
            © 2024 NotesApp. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}