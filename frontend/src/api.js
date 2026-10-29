const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');

async function request(path, options = {}) {
  let res;
  try {
    res = await fetch(`${API_URL}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
  } catch {
    throw new Error('Không kết nối được máy chủ');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const detail = data.errors ? ': ' + data.errors.join(', ') : '';
    throw new Error((data.message || 'Có lỗi xảy ra') + detail);
  }
  return data;
}

export const getFoods = (search = '') =>
  request(`/api/foods${search ? `?search=${encodeURIComponent(search)}` : ''}`);
export const getFood = (id) => request(`/api/foods/${encodeURIComponent(id)}`);
export const createFood = (food) =>
  request('/api/foods', { method: 'POST', body: JSON.stringify(food) });
export const updateFood = (id, food) =>
  request(`/api/foods/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(food) });
export const deleteFood = (id) =>
  request(`/api/foods/${encodeURIComponent(id)}`, { method: 'DELETE' });