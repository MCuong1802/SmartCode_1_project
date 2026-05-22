import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="bg-background text-on-surface">
      {/* Header / TopAppBar */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-background/80 backdrop-blur-md shadow-sm border-b border-outline-variant/20' : 'bg-transparent'}`}>
        <nav className="flex justify-between items-center w-full px-margin-mobile md:px-margin-desktop py-4 max-w-[1280px] mx-auto">
          <div className="flex items-center gap-2">
            <span className="font-headline-md text-[24px] font-bold text-primary">NotesApp</span>
          </div>
          <div className="hidden md:flex items-center gap-xl">
            <a className="text-primary font-bold border-b-2 border-primary py-1 font-body-md" href="#">Trang chủ</a>
            <a className="text-secondary hover:bg-surface-container-low transition-colors px-2 py-1 rounded font-body-md" href="#">Tính năng</a>
            <a className="text-secondary hover:bg-surface-container-low transition-colors px-2 py-1 rounded font-body-md" href="#">Giá cả</a>
          </div>
          <div className="flex items-center gap-md">
            <button className="material-symbols-outlined text-secondary hover:bg-surface-container-low p-2 rounded-full transition-colors">help</button>
            <button className="material-symbols-outlined text-secondary hover:bg-surface-container-low p-2 rounded-full transition-colors">info</button>
            <Link href="/login" className="hidden md:block bg-primary text-on-primary px-lg py-sm rounded-lg font-label-md text-[14px] active:opacity-80 transition-opacity duration-200">
              Bắt đầu
            </Link>
          </div>
        </nav>
      </header>

      <main>
        {/* Hero Section */}
        <section className="bg-[radial-gradient(circle_at_50%_50%,_#eff4ff_0%,_#f8f9ff_100%)] pt-32 pb-20 px-margin-mobile md:px-margin-desktop min-h-[819px] flex flex-col items-center justify-center text-center">
          <div className="max-w-[896px] w-full mx-auto">
            <h1 className="font-headline-lg md:text-[56px] md:leading-[1.1] mb-lg text-on-background tracking-tight">
              Ghi chú thông minh, <br /><span className="text-primary">Làm việc hiệu quả</span>
            </h1>
            <p className="font-body-lg text-on-surface-variant mb-xl max-w-[672px] mx-auto w-full px-4">
              Giải pháp tối ưu để lưu trữ ý tưởng, quản lý công việc và nâng cao năng suất cá nhân hàng ngày. Trải nghiệm không gian làm việc tối giản và chuyên nghiệp.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-md">
              <Link href="/register" className="bg-primary text-on-primary px-xl py-lg rounded-xl font-headline-sm hover:shadow-lg active:scale-95 transition-all w-full sm:w-auto">
                Trải nghiệm ngay
              </Link>
              <button className="bg-white border border-outline-variant text-secondary px-xl py-lg rounded-xl font-headline-sm hover:bg-surface-container-low transition-all w-full sm:w-auto">
                Tìm hiểu thêm
              </button>
            </div>
          </div>
          <div className="mt-2xl w-full max-w-[1024px] mx-auto rounded-2xl overflow-hidden shadow-2xl border border-outline-variant">
            <img 
              alt="NotesApp Interface" 
              className="w-full h-auto object-cover" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCYBjPHuFliZ1Q-p29JB4COQPSggBX6cXO9nXlNXpaxCfTruPqcuVL_wbjHMDTaE2P5fRIaCUqa0CyDjj_Vm9PVCgQjEyySxIV59opTp6so7__O2zmrdQTvAHix6WYN4ktgSvbRtMTYmfC4mDa8I--OXY9GOoZe3-2yUo8cR5rJf0OubK5A-A6vsp4Wgc3cgKaMuzmiS9pGN-DdlnmI4OnFEV68TUbwxiIEPgI2sO7x09aY3pv17wZLXWk1tmJgUodXFvSzWJ1NNZNf" 
            />
          </div>
        </section>

        {/* Social Proof Section */}
        <section className="py-xl bg-surface-container-lowest border-y border-outline-variant/30 w-full">
          <div className="max-w-[1280px] w-full mx-auto px-margin-mobile md:px-margin-desktop text-center">
            <p className="font-label-md text-secondary uppercase tracking-widest mb-lg">Được tin dùng bởi hơn 10.000 người dùng toàn cầu</p>
            <div className="flex flex-wrap justify-center items-center gap-xl opacity-60 grayscale hover:grayscale-0 transition-all">
              <div className="flex items-center gap-2"><span className="material-symbols-outlined text-primary">auto_awesome</span><span className="font-bold">TECHFLOW</span></div>
              <div className="flex items-center gap-2"><span className="material-symbols-outlined text-primary">bubble_chart</span><span className="font-bold">CREATIVO</span></div>
              <div className="flex items-center gap-2"><span className="material-symbols-outlined text-primary">polyline</span><span className="font-bold">NEXUS</span></div>
              <div className="flex items-center gap-2"><span className="material-symbols-outlined text-primary">deployed_code</span><span className="font-bold">CODEBASE</span></div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-2xl px-margin-mobile md:px-margin-desktop bg-background w-full">
          <div className="max-w-[1280px] w-full mx-auto">
            <div className="text-center mb-2xl">
              <h2 className="font-headline-lg text-on-background mb-md">Tại sao nên chọn NotesApp?</h2>
              <div className="w-20 h-1 bg-primary mx-auto rounded-full"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
              {/* Feature 1 */}
              <div className="bg-white/70 backdrop-blur-md border border-outline-variant/80 p-xl rounded-2xl group hover:border-primary/50 transition-all duration-300">
                <div className="w-12 h-12 bg-primary-fixed rounded-lg flex items-center justify-center mb-lg text-primary group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[32px]">folder_managed</span>
                </div>
                <h3 className="font-headline-sm text-on-background mb-md">Tổ chức khoa học</h3>
                <p className="font-body-md text-on-surface-variant">
                  Phân loại ghi chú theo danh mục và thẻ thông minh. Tìm kiếm tức thì mọi thông tin bạn cần chỉ với vài thao tác đơn giản.
                </p>
              </div>
              {/* Feature 2 */}
              <div className="bg-white/70 backdrop-blur-md border border-outline-variant/80 p-xl rounded-2xl group hover:border-primary/50 transition-all duration-300">
                <div className="w-12 h-12 bg-primary-fixed rounded-lg flex items-center justify-center mb-lg text-primary group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[32px]">edit_note</span>
                </div>
                <h3 className="font-headline-sm text-on-background mb-md">Soạn thảo mạnh mẽ</h3>
                <p className="font-body-md text-on-surface-variant">
                  Trình soạn thảo giàu tính năng, hỗ trợ Markdown đầy đủ, chèn hình ảnh, bảng biểu và khối mã nguồn chuyên nghiệp.
                </p>
              </div>
              {/* Feature 3 */}
              <div className="bg-white/70 backdrop-blur-md border border-outline-variant/80 p-xl rounded-2xl group hover:border-primary/50 transition-all duration-300">
                <div className="w-12 h-12 bg-primary-fixed rounded-lg flex items-center justify-center mb-lg text-primary group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[32px]">sync</span>
                </div>
                <h3 className="font-headline-sm text-on-background mb-md">Truy cập mọi nơi</h3>
                <p className="font-body-md text-on-surface-variant">
                  Đồng bộ hóa dữ liệu tức thì trên mọi thiết bị. Ghi chú của bạn luôn sẵn sàng dù bạn đang ở văn phòng hay đang di chuyển.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Bento Layout Content Preview */}
        <section className="py-2xl px-margin-mobile md:px-margin-desktop bg-surface-container-low w-full">
          <div className="max-w-[1280px] w-full mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
              <div className="md:col-span-8 h-full">
                <div className="bg-white p-lg rounded-2xl h-full border border-outline-variant shadow-sm flex flex-col justify-center">
                  <h4 className="font-headline-md mb-md">Trình soạn thảo tập trung</h4>
                  <p className="font-body-md text-secondary mb-xl">Giao diện frameless giúp bạn loại bỏ mọi xao nhãng và tập trung hoàn toàn vào luồng suy nghĩ của mình.</p>
                  <img 
                    alt="Editor view" 
                    className="rounded-xl object-cover w-full h-[300px]" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDZJHqi-9upqhiY-s-CrwIBT-4gh9d8m1GMPotq3CV7FPAbHUUAdHYwHqCWwdMky01_lPgp-SbzSy9oSQswoFzOJgEWO1eUz_fmvpGAfppljjyJb0Gruo0gZIsdp-licD2cbWWatK70UDkEJ2XMQl3ZqlwWq8euhTY9AaWtZExtJSzT0bOvf4y3ozCMIsDOJTTRjnWu20ofosX7vZh6UPVnqTeJvqKJs67RK_2wibU_mD6owNvM_EZlzOVVczaMl4tzL8dT7zxrQNom" 
                  />
                </div>
              </div>
              <div className="md:col-span-4 space-y-gutter">
                <div className="bg-primary p-lg rounded-2xl text-on-primary h-[calc(50%-8px)]">
                  <span className="material-symbols-outlined text-[40px] mb-md">security</span>
                  <h4 className="font-headline-sm mb-sm">Bảo mật tuyệt đối</h4>
                  <p className="font-body-sm opacity-90">Mã hóa đầu cuối giúp dữ liệu của bạn luôn an toàn và riêng tư.</p>
                </div>
                <div className="bg-white p-lg rounded-2xl border border-outline-variant shadow-sm h-[calc(50%-8px)] mt-4">
                  <span className="material-symbols-outlined text-primary text-[40px] mb-md">lightbulb</span>
                  <h4 className="font-headline-sm mb-sm">Gợi ý thông minh</h4>
                  <p className="font-body-sm text-secondary">Hệ thống AI tự động gợi ý thẻ và liên kết ghi chú liên quan.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-2xl px-margin-mobile md:px-margin-desktop text-center w-full">
          <div className="max-w-[768px] w-full mx-auto bg-primary-container p-2xl rounded-[32px] text-on-primary-container shadow-xl">
            <h2 className="font-headline-lg mb-lg">Sẵn sàng để thay đổi cách bạn làm việc?</h2>
            <p className="font-body-lg mb-xl opacity-90">Bắt đầu miễn phí ngay hôm nay. Không cần thẻ tín dụng.</p>
            <Link href="/register" className="inline-block bg-white text-primary px-xl py-lg rounded-xl font-headline-sm hover:bg-surface-container-low transition-all active:scale-95">
              Đăng ký miễn phí
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full py-lg px-margin-mobile md:px-margin-desktop flex flex-col md:flex-row justify-between items-center gap-md bg-surface-bright border-t border-outline-variant">
        <div className="flex flex-col items-center md:items-start gap-xs">
          <span className="font-headline-sm font-bold text-primary">NotesApp</span>
          <p className="font-body-sm text-secondary">© 2024 NotesApp. All rights reserved.</p>
        </div>
        <div className="flex gap-xl">
          <a className="text-secondary font-body-sm hover:text-primary transition-colors" href="#">Terms</a>
          <a className="text-secondary font-body-sm hover:text-primary transition-colors" href="#">Privacy</a>
          <a className="text-secondary font-body-sm hover:text-primary transition-colors" href="#">Support</a>
        </div>
        <div className="flex gap-md">
          <button className="material-symbols-outlined text-secondary hover:text-primary transition-colors">public</button>
          <button className="material-symbols-outlined text-secondary hover:text-primary transition-colors">mail</button>
        </div>
      </footer>
    </div>
  );
}
