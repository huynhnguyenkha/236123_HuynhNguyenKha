import { useCallback, useEffect, useState } from 'react';
import { getFoods, getFood, createFood, updateFood, deleteFood } from './api';
import './App.css';

const money = (n) => Number(n).toLocaleString('vi-VN') + ' đ';

const REGION_CHIPS = [
  { label: 'Tất cả', value: '' },
  { label: 'Miền Bắc', value: 'Bắc' },
  { label: 'Miền Trung', value: 'Trung' },
  { label: 'Miền Nam', value: 'Nam' },
];

function toneOf(cuisine = '') {
  const c = cuisine.toLowerCase();
  if (c.includes('bắc')) return 'north';
  if (c.includes('trung')) return 'central';
  if (/miền nam|nam bộ|sài gòn/.test(c)) return 'south';
  return 'other';
}

function stockOf(q) {
  if (q <= 0) return { text: 'Hết hàng', cls: 'out' };
  if (q <= 5) return { text: `Sắp hết (${q})`, cls: 'low' };
  return { text: `Còn ${q}`, cls: 'ok' };
}

const emptyFood = {
  foodId: '', name: '', category: '', cuisine: '',
  ingredients: '', price: '', quantity: '', description: '', imageUrl: '',
};

function Overlay({ onClose, drawer, children }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className={`overlay ${drawer ? 'is-drawer' : ''}`} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={drawer ? 'panel drawer' : 'panel dialog'} role="dialog" aria-modal="true">
        {children}
      </div>
    </div>
  );
}

function FoodImage({ food, className = '' }) {
  const [broken, setBroken] = useState(false);
  if (food.imageUrl && !broken) {
    return (
      <div className={`thumb ${className}`}>
        <img src={food.imageUrl} alt={food.name} onError={() => setBroken(true)} loading="lazy" />
      </div>
    );
  }
  return (
    <div className={`thumb placeholder tone-${toneOf(food.cuisine)} ${className}`} aria-hidden="true">
      <span>{food.name?.trim().charAt(0).toUpperCase()}</span>
    </div>
  );
}

function FoodCard({ food, onView, onEdit, onDelete }) {
  const stock = stockOf(food.quantity);
  return (
    <article className="card">
      <FoodImage food={food} />
      <div className="card-body">
        <div className="card-meta">
          <span className="pill">{food.category}</span>
          <span className={`stock ${stock.cls}`}>{stock.text}</span>
        </div>
        <h3>{food.name}</h3>
        <p className="muted">{food.cuisine} · {food.foodId}</p>
        <p className="price">{money(food.price)}</p>
      </div>
      <div className="card-actions">
        <button className="btn ghost" onClick={() => onView(food.foodId)}>Xem</button>
        <button className="btn ghost" onClick={() => onEdit(food)}>Sửa</button>
        <button className="btn ghost danger" onClick={() => onDelete(food)}>Xóa</button>
      </div>
    </article>
  );
}

function SkeletonCard() {
  return (
    <div className="card skeleton" aria-hidden="true">
      <div className="thumb" />
      <div className="card-body">
        <div className="bar w40" /><div className="bar w80" /><div className="bar w60" />
      </div>
    </div>
  );
}

function FoodDetail({ food, onClose, onEdit }) {
  const stock = stockOf(food.quantity);
  return (
    <Overlay onClose={onClose} drawer>
      <FoodImage food={food} className="tall" />
      <div className="drawer-body">
        <div className="card-meta">
          <span className="pill">{food.category}</span>
          <span className={`stock ${stock.cls}`}>{stock.text}</span>
        </div>
        <h2>{food.name}</h2>
        <p className="muted">{food.cuisine} · Mã {food.foodId}</p>
        <p className="price big">{money(food.price)}</p>
        <h4>Mô tả</h4>
        <p>{food.description || 'Chưa có mô tả cho món này.'}</p>
        <h4>Nguyên liệu</h4>
        <ul className="chips">
          {food.ingredients.map((i) => <li key={i}>{i}</li>)}
        </ul>
      </div>
      <div className="panel-actions">
        <button className="btn" onClick={onClose}>Đóng</button>
        <button className="btn primary" onClick={() => onEdit(food)}>Sửa món này</button>
      </div>
    </Overlay>
  );
}

function FoodForm({ mode, initial, onSubmit, onCancel, saving }) {
  const [form, setForm] = useState(
    initial ? { ...emptyFood, ...initial, ingredients: (initial.ingredients || []).join(', ') } : emptyFood
  );
  const [errors, setErrors] = useState([]);
  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = (e) => {
    e.preventDefault();
    const food = {
      foodId: form.foodId.trim(),
      name: form.name.trim(),
      category: form.category.trim(),
      cuisine: form.cuisine.trim(),
      ingredients: form.ingredients.split(',').map((s) => s.trim()).filter(Boolean),
      price: Number(form.price),
      quantity: Number(form.quantity),
      description: form.description.trim(),
      imageUrl: form.imageUrl.trim(),
    };
    const errs = [];
    if (!food.foodId) errs.push('Nhập mã món ăn');
    if (!food.name) errs.push('Nhập tên món ăn');
    if (!food.category) errs.push('Nhập loại món ăn');
    if (!food.cuisine) errs.push('Nhập vùng miền');
    if (food.ingredients.length === 0) errs.push('Nhập ít nhất 1 nguyên liệu');
    if (form.price === '' || Number.isNaN(food.price) || food.price < 0) errs.push('Giá phải là số từ 0 trở lên');
    if (form.quantity === '' || Number.isNaN(food.quantity) || food.quantity < 0) errs.push('Số lượng phải là số từ 0 trở lên');
    setErrors(errs);
    if (errs.length === 0) onSubmit(food);
  };

  return (
    <Overlay onClose={saving ? () => {} : onCancel}>
      <form onSubmit={submit} noValidate>
        <div className="panel-head">
          <h2>{mode === 'add' ? 'Thêm món ăn' : 'Sửa món ăn'}</h2>
        </div>
        <div className="form-grid">
          <label>Mã món ăn
            <input name="foodId" value={form.foodId} onChange={change} disabled={mode === 'edit'} placeholder="F004" autoFocus={mode === 'add'} />
          </label>
          <label>Tên món ăn
            <input name="name" value={form.name} onChange={change} placeholder="Cơm tấm sườn" autoFocus={mode === 'edit'} />
          </label>
          <label>Loại món ăn
            <input name="category" value={form.category} onChange={change} placeholder="Món chính" />
          </label>
          <label>Vùng miền
            <input name="cuisine" value={form.cuisine} onChange={change} placeholder="Miền Nam" />
          </label>
          <label>Giá (đ)
            <input name="price" type="number" min="0" value={form.price} onChange={change} />
          </label>
          <label>Số lượng
            <input name="quantity" type="number" min="0" value={form.quantity} onChange={change} />
          </label>
          <label className="full">Nguyên liệu (cách nhau bằng dấu phẩy)
            <input name="ingredients" value={form.ingredients} onChange={change} placeholder="gạo tấm, sườn nướng, trứng" />
          </label>
          <label className="full">Mô tả
            <textarea name="description" rows="3" value={form.description} onChange={change} />
          </label>
          <label className="full">Đường dẫn hình ảnh (không bắt buộc)
            <input name="imageUrl" value={form.imageUrl} onChange={change} placeholder="https://..." />
          </label>
        </div>
        {errors.length > 0 && (
          <ul className="form-errors" role="alert">{errors.map((er) => <li key={er}>{er}</li>)}</ul>
        )}
        <div className="panel-actions">
          <button type="button" className="btn" onClick={onCancel} disabled={saving}>Hủy</button>
          <button type="submit" className="btn primary" disabled={saving}>
            {saving ? 'Đang lưu...' : mode === 'add' ? 'Thêm món' : 'Lưu thay đổi'}
          </button>
        </div>
      </form>
    </Overlay>
  );
}

function ConfirmDelete({ food, onConfirm, onCancel, busy }) {
  return (
    <Overlay onClose={busy ? () => {} : onCancel}>
      <div className="panel-head"><h2>Xóa món ăn?</h2></div>
      <p className="confirm-text">
        Món <b>{food.name}</b> ({food.foodId}) sẽ bị xóa khỏi cơ sở dữ liệu và không thể khôi phục.
      </p>
      <div className="panel-actions">
        <button className="btn" onClick={onCancel} disabled={busy}>Giữ lại</button>
        <button className="btn danger-solid" onClick={onConfirm} disabled={busy}>
          {busy ? 'Đang xóa...' : 'Xóa món'}
        </button>
      </div>
    </Overlay>
  );
}

export default function App() {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState('');
  const [detail, setDetail] = useState(null);
  const [form, setForm] = useState(null); // { mode: 'add' | 'edit', food }
  const [toDelete, setToDelete] = useState(null);
  const [saving, setSaving] = useState(false);

  const notify = (type, text) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 3500);
  };

  const load = useCallback(async (keyword) => {
    setLoading(true);
    setError('');
    try {
      setFoods(await getFoods(keyword));
    } catch (e) {
      setError(e.message);
      setFoods([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Tự tìm kiếm sau khi ngừng gõ 400ms
  useEffect(() => {
    const t = setTimeout(() => load(search.trim()), 400);
    return () => clearTimeout(t);
  }, [search, load]);

  const reload = () => load(search.trim());

  const openDetail = async (id) => {
    try {
      setDetail(await getFood(id));
    } catch (e) {
      notify('error', e.message);
    }
  };

  const handleSave = async (food) => {
    setSaving(true);
    try {
      if (form.mode === 'add') {
        await createFood(food);
        notify('success', `Đã thêm món "${food.name}"`);
      } else {
        await updateFood(form.food.foodId, food);
        notify('success', `Đã cập nhật món "${food.name}"`);
      }
      setForm(null);
      reload();
    } catch (e) {
      notify('error', e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await deleteFood(toDelete.foodId);
      notify('success', `Đã xóa món "${toDelete.name}"`);
      setToDelete(null);
      reload();
    } catch (e) {
      notify('error', e.message);
    } finally {
      setSaving(false);
    }
  };

  const totalStock = foods.reduce((s, f) => s + (Number(f.quantity) || 0), 0);
  const avgPrice = foods.length ? foods.reduce((s, f) => s + Number(f.price), 0) / foods.length : 0;

  return (
    <>
      <header className="topbar">
        <div className="topbar-in">
          <div className="brand"><span className="brand-mark">🍜</span>Thực đơn</div>
          <div className="search-wrap">
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
              <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <input
              type="search"
              placeholder="Tìm theo tên, loại món hoặc vùng miền"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Tìm món ăn"
            />
          </div>
          <button className="btn primary" onClick={() => setForm({ mode: 'add', food: null })}>+ Thêm món</button>
        </div>
      </header>

      <main className="page">
        <section className="hero">
          <div>
            <h1>Quản lý món ăn</h1>
            <p className="muted">Theo dõi giá bán và tồn kho từng món, dữ liệu lấy trực tiếp từ MongoDB Atlas.</p>
          </div>
          <dl className="stats">
            <div><dt>Món đang hiển thị</dt><dd>{foods.length}</dd></div>
            <div><dt>Tổng tồn kho</dt><dd>{totalStock}</dd></div>
            <div><dt>Giá trung bình</dt><dd>{foods.length ? money(Math.round(avgPrice)) : '-'}</dd></div>
          </dl>
        </section>

        <div className="chips-row" role="group" aria-label="Lọc theo vùng miền">
          {REGION_CHIPS.map((c) => (
            <button
              key={c.label}
              className={`chip ${search.trim() === c.value ? 'active' : ''}`}
              onClick={() => setSearch(c.value)}
            >
              {c.label}
            </button>
          ))}
        </div>

        {error && (
          <div className="state error-state" role="alert">
            <h3>Không tải được danh sách món</h3>
            <p>{error}. Kiểm tra backend đang chạy và địa chỉ VITE_API_URL, rồi thử lại.</p>
            <button className="btn primary" onClick={reload}>Thử lại</button>
          </div>
        )}

        {loading && (
          <div className="grid" aria-busy="true" aria-label="Đang tải">
            {Array.from({ length: 6 }, (_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {!loading && !error && foods.length === 0 && (
          <div className="state">
            <h3>{search.trim() ? `Không có món nào khớp "${search.trim()}"` : 'Chưa có món ăn nào'}</h3>
            <p>{search.trim() ? 'Thử từ khóa khác hoặc xóa bộ lọc.' : 'Thêm món đầu tiên để bắt đầu.'}</p>
            {search.trim()
              ? <button className="btn" onClick={() => setSearch('')}>Xóa bộ lọc</button>
              : <button className="btn primary" onClick={() => setForm({ mode: 'add', food: null })}>+ Thêm món</button>}
          </div>
        )}

        {!loading && foods.length > 0 && (
          <div className="grid">
            {foods.map((f) => (
              <FoodCard
                key={f.foodId}
                food={f}
                onView={openDetail}
                onEdit={(food) => setForm({ mode: 'edit', food })}
                onDelete={setToDelete}
              />
            ))}
          </div>
        )}
      </main>

      {toast && <div className={`toast ${toast.type}`} role="status">{toast.text}</div>}

      {detail && (
        <FoodDetail
          food={detail}
          onClose={() => setDetail(null)}
          onEdit={(food) => { setDetail(null); setForm({ mode: 'edit', food }); }}
        />
      )}
      {form && (
        <FoodForm mode={form.mode} initial={form.food} saving={saving} onSubmit={handleSave} onCancel={() => setForm(null)} />
      )}
      {toDelete && (
        <ConfirmDelete food={toDelete} busy={saving} onConfirm={handleDelete} onCancel={() => setToDelete(null)} />
      )}
    </>
  );
}