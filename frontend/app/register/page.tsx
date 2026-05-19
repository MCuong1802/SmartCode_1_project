'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link'; // Dùng Link của Next.js thay cho thẻ <a>

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (password !== confirmPassword) {
      setError('Mật khẩu nhập lại không khớp!');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('http://localhost:3001/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Đăng ký thất bại');
      } else {
        setMessage('Đăng ký thành công! Đang chuyển hướng...');
        setTimeout(() => router.push('/login'), 2000);
      }
    } catch (err) {
      setError('Không thể kết nối đến server');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-background text-on-background font-body-md text-body-md antialiased min-h-screen flex flex-col">
      {/* Content Canvas */}
      <main className="flex-grow flex items-center justify-center px-margin-mobile py-2xl">
        <div className="w-full max-w-[440px] flex flex-col gap-xl">
          {/* Branding Header (Suppressed Nav, but maintained Identity) */}
          <div className="text-center flex flex-col items-center gap-sm">
            <span className="font-headline-md text-headline-md font-bold text-primary">NotesApp</span>
            <h1 className="font-headline-sm text-headline-sm text-on-surface">Tạo tài khoản của bạn</h1>
          </div>

          {/* Sign Up Card */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg auth-card-shadow">

            {/* Vùng hiển thị thông báo lỗi hoặc thành công */}
            {error && (
              <div className="mb-4 p-3 bg-error-container text-error rounded-lg text-center font-body-sm">
                {error}
              </div>
            )}
            {message && (
              <div className="mb-4 p-3 bg-secondary-container text-primary rounded-lg text-center font-body-sm">
                {message}
              </div>
            )}

            <form onSubmit={handleRegister} className="flex flex-col gap-lg">
              {/* Full Name Field */}
              <div className="flex flex-col gap-xs">
                <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="full_name">Họ và tên</label>
                <div className="relative">
                  <input
                    className="w-full px-md py-sm bg-surface rounded-lg border border-outline-variant focus:border-primary focus:ring-0 transition-all outline-none text-on-surface placeholder:text-outline font-body-md text-body-md"
                    id="full_name"
                    placeholder="Nguyễn Văn A"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Email Field */}
              <div className="flex flex-col gap-xs">
                <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="email">Email</label>
                <div className="relative">
                  <input
                    className="w-full px-md py-sm bg-surface rounded-lg border border-outline-variant focus:border-primary focus:ring-0 transition-all outline-none text-on-surface placeholder:text-outline font-body-md text-body-md"
                    id="email"
                    placeholder="ten@congty.com"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="flex flex-col gap-xs">
                <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="password">Mật khẩu</label>
                <div className="relative">
                  <input
                    className="w-full px-md py-sm pr-10 bg-surface rounded-lg border border-outline-variant focus:border-primary focus:ring-0 transition-all outline-none text-on-surface placeholder:text-outline font-body-md text-body-md"
                    id="password"
                    placeholder="••••••••"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors"
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password Field */}
              <div className="flex flex-col gap-xs">
                <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="confirmPassword">Nhập lại mật khẩu</label>
                <div className="relative">
                  <input
                    className="w-full px-md py-sm pr-10 bg-surface rounded-lg border border-outline-variant focus:border-primary focus:ring-0 transition-all outline-none text-on-surface placeholder:text-outline font-body-md text-body-md"
                    id="confirmPassword"
                    placeholder="••••••••"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors"
                  >
                    {showConfirmPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Terms of Service Checkbox */}
              <div className="flex items-start gap-md py-xs">
                <div className="flex items-center h-5">
                  <input
                    className="h-4 w-4 rounded border-outline-variant text-primary focus:ring-primary cursor-pointer"
                    id="terms"
                    name="terms"
                    type="checkbox"
                    required
                  />
                </div>
                <label className="font-body-sm text-body-sm text-secondary cursor-pointer" htmlFor="terms">
                  Tôi đồng ý với <a className="text-primary hover:underline" href="#">Điều khoản dịch vụ</a> và <a className="text-primary hover:underline" href="#">Chính sách bảo mật</a>
                </label>
              </div>

              {/* Submit Button */}
              <button
                disabled={isLoading}
                className={`w-full bg-primary-container text-on-primary hover:bg-primary transition-colors py-md rounded-lg font-headline-sm text-headline-sm flex justify-center items-center gap-sm active:scale-95 transition-transform ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                type="submit"
              >
                {isLoading ? 'Đang xử lý...' : 'Tạo tài khoản'}
              </button>
            </form>
          </div>

          {/* Secondary Action */}
          <div className="text-center">
            <p className="font-body-md text-body-md text-secondary">
              Bạn đã có tài khoản?
              <Link className="text-primary font-bold hover:underline ml-xs" href="/login">
                Đăng nhập
              </Link>
            </p>
          </div>

          {/* Aesthetic Illustration/Abstract */}
          <div className="w-full h-1 bg-surface-container rounded-full overflow-hidden opacity-50">
            <div className="w-1/3 h-full bg-primary"></div>
          </div>
        </div>
      </main>

      {/* Footer - Suppressed Nav, but consistent with Shared Components Logic */}
      <footer className="w-full py-lg px-margin-mobile md:px-margin-desktop flex flex-col md:flex-row justify-between items-center gap-md border-t border-outline-variant bg-surface-bright mt-auto">
        <div className="flex flex-col md:flex-row items-center gap-lg">
          <span className="font-headline-sm text-headline-sm font-bold text-primary">NotesApp</span>
          <span className="font-body-sm text-body-sm text-secondary">© 2024 NotesApp. All rights reserved.</span>
        </div>
        <div className="flex gap-lg">
          <a className="font-body-sm text-body-sm text-secondary hover:text-primary transition-colors" href="#">Terms</a>
          <a className="font-body-sm text-body-sm text-secondary hover:text-primary transition-colors" href="#">Privacy</a>
          <a className="font-body-sm text-body-sm text-secondary hover:text-primary transition-colors" href="#">Support</a>
        </div>
      </footer>
    </div>
  );
}