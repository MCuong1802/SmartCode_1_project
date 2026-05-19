'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link'; // Dùng Link của Next.js thay cho thẻ <a>

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [errors, setErrors] = useState<{ fullName?: string; email?: string; password?: string; terms?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const newErrors: { fullName?: string; email?: string; password?: string; terms?: string } = {};
    
    if (!fullName.trim()) {
      newErrors.fullName = 'Họ và tên không được để trống';
    } else if (fullName.trim().length < 2) {
      newErrors.fullName = 'Họ và tên phải chứa ít nhất 2 ký tự';
    }

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

    const termsCheckbox = document.getElementById('terms') as HTMLInputElement | null;
    if (termsCheckbox && !termsCheckbox.checked) {
      newErrors.terms = 'Bạn phải đồng ý với điều khoản dịch vụ';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    
    if (!validate()) return;
    
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

            <form onSubmit={handleRegister} className="flex flex-col gap-lg" noValidate>
              {/* Full Name Field */}
              <div className="flex flex-col gap-xs">
                <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="full_name">Họ và tên</label>
                <div className="relative">
                  <input 
                    className={`w-full px-md py-sm bg-surface rounded-lg border focus:outline-none transition-all text-on-surface placeholder:text-outline font-body-md text-body-md ${
                      errors.fullName 
                        ? 'border-error focus:ring-1 focus:ring-error focus:border-error' 
                        : 'border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary'
                    }`} 
                    id="full_name" 
                    placeholder="Nguyễn Văn A" 
                    type="text"
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      if (errors.fullName) {
                        setErrors(prev => ({ ...prev, fullName: undefined }));
                      }
                    }}
                  />
                </div>
                {errors.fullName && (
                  <span className="text-error text-[12px] font-medium mt-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">error</span>
                    {errors.fullName}
                  </span>
                )}
              </div>
              
              {/* Email Field */}
              <div className="flex flex-col gap-xs">
                <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="email">Email</label>
                <div className="relative">
                  <input 
                    className={`w-full px-md py-sm bg-surface rounded-lg border focus:outline-none transition-all text-on-surface placeholder:text-outline font-body-md text-body-md ${
                      errors.email 
                        ? 'border-error focus:ring-1 focus:ring-error focus:border-error' 
                        : 'border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary'
                    }`} 
                    id="email" 
                    placeholder="ten@congty.com" 
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
                <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="password">Mật khẩu</label>
                <div className="relative">
                  <input 
                    className={`w-full px-md py-sm bg-surface rounded-lg border focus:outline-none transition-all text-on-surface placeholder:text-outline font-body-md text-body-md ${
                      errors.password 
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
              
              {/* Terms of Service Checkbox */}
              <div className="flex flex-col gap-xs">
                <div className="flex items-start gap-md py-xs">
                  <div className="flex items-center h-5">
                    <input 
                      className={`h-4 w-4 rounded text-primary focus:ring-primary cursor-pointer ${
                        errors.terms ? 'border-error' : 'border-outline-variant'
                      }`} 
                      id="terms" 
                      name="terms" 
                      type="checkbox"
                      onChange={(e) => {
                        if (e.target.checked && errors.terms) {
                          setErrors(prev => ({ ...prev, terms: undefined }));
                        }
                      }}
                    />
                  </div>
                  <label className="font-body-sm text-body-sm text-secondary cursor-pointer" htmlFor="terms">
                    Tôi đồng ý với <a className="text-primary hover:underline" href="#">Điều khoản dịch vụ</a> và <a className="text-primary hover:underline" href="#">Chính sách bảo mật</a>
                  </label>
                </div>
                {errors.terms && (
                  <span className="text-error text-[12px] font-medium mt-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">error</span>
                    {errors.terms}
                  </span>
                )}
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