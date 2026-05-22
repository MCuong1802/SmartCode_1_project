export const apiFetch = async (url: string, options: RequestInit = {}) => {
  let token = localStorage.getItem('access_token');
  
  const opts: RequestInit = {
    ...options,
    cache: options.cache || 'no-store', // Tắt cache mặc định để tránh dữ liệu cũ giữa các user
    headers: {
      ...options.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  };

  let res = await fetch(url, opts);

  // Nếu trả về 401 (Unauthorized), thử refresh token
  if (res.status === 401) {
    const refreshRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include', // Bắt buộc để gửi HttpOnly cookie (refresh_token)
    });

    if (refreshRes.ok) {
      const { access_token } = await refreshRes.json();
      localStorage.setItem('access_token', access_token);
      
      // Gọi lại request ban đầu với token mới
      const retryOpts = {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${access_token}`,
        },
      };
      res = await fetch(url, retryOpts);
    } else {
      // Refresh token cũng hết hạn hoặc không hợp lệ -> yêu cầu đăng nhập lại
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
  }

  return res;
};
