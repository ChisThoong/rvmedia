"use client";

import type { ChangeEvent, FormEvent } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { FnbItem } from "../../types/fnb";

type AdminUser = {
  username: string;
};

type FormState = {
  nameEn: string;
  nameVi: string;
  descEn: string;
  descVi: string;
  embed: string;
  categories: string;
};

const emptyForm: FormState = {
  nameEn: "",
  nameVi: "",
  descEn: "",
  descVi: "",
  embed: "",
  categories: ""
};

export default function AdminPage() {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [checking, setChecking] = useState(true);
  const [items, setItems] = useState<FnbItem[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [status, setStatus] = useState({ type: "idle", message: "" });
  const [saving, setSaving] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [loginError, setLoginError] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(8);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [types, setTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const hasItems = items.length > 0;
  const totalPages = Math.max(Math.ceil(total / limit), 1);

  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit)
      });
      if (search) params.set("search", search);
      if (typeFilter) params.set("type", typeFilter);

      const response = await fetch(`/api/fnb?${params.toString()}`, {
        cache: "no-store",
        credentials: "include"
      });
      const data = await response.json();
      if (Array.isArray(data)) {
        setItems(data);
        setTotal(data.length);
      } else {
        setItems(data.items || []);
        setTotal(data.total || 0);
        if (Array.isArray(data.types)) {
          setTypes(data.types);
        }
      }
    } catch (error) {
      setStatus({
        type: "error",
        message: "Không tải được dữ liệu. Vui lòng thử lại."
      });
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, typeFilter]);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch("/api/auth/me", {
          cache: "no-store",
          credentials: "include"
        });
        if (!response.ok) {
          setUser(null);
        } else {
          const data = await response.json();
          setUser(data.user);
        }
      } catch (error) {
        setUser(null);
      } finally {
        setChecking(false);
      }
    };

    checkSession();
  }, []);

  useEffect(() => {
    if (!user) return;
    const timer = window.setTimeout(() => {
      loadItems();
    }, 250);
    return () => window.clearTimeout(timer);
  }, [user, loadItems]);

  useEffect(() => {
    setPage(1);
  }, [search, typeFilter]);

  const updateField =
    (field: keyof FormState) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  const startEdit = (item: FnbItem) => {
    setEditingId(item._id || null);
    setForm({
      nameEn: item.title?.en || "",
      nameVi: item.title?.vi || "",
      descEn: item.description?.en || "",
      descVi: item.description?.vi || "",
      embed: item.embed || "",
      categories: item.categories?.join(", ") || ""
    });
    setStatus({ type: "idle", message: "" });
    setShowForm(true);
  };

  const submitItem = async (event: FormEvent) => {
    event.preventDefault();
    if (
      !form.nameEn ||
      !form.nameVi ||
      !form.descEn ||
      !form.descVi ||
      !form.embed
    ) {
      setStatus({
        type: "error",
        message: "Vui lòng nhập đầy đủ thông tin."
      });
      return;
    }

    setSaving(true);
    setStatus({ type: "idle", message: "" });
    try {
      const categories = form.categories
        .split(",")
        .map((value) => value.trim())
        .filter((value) => value.length > 0);

      const payload = {
        embed: form.embed.trim(),
        title: {
          en: form.nameEn.trim(),
          vi: form.nameVi.trim()
        },
        description: {
          en: form.descEn.trim(),
          vi: form.descVi.trim()
        },
        categories
      };

      const response = await fetch(
        editingId ? `/api/fnb/${editingId}` : "/api/fnb",
        {
          method: editingId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          credentials: "include"
        }
      );

      if (!response.ok) {
        throw new Error("Save failed");
      }

      if (!editingId) {
        setPage(1);
      }
      await loadItems();
      resetForm();
      setStatus({
        type: "success",
        message: editingId ? "Đã cập nhật mục." : "Đã thêm mục mới."
      });
    } catch (error) {
      setStatus({
        type: "error",
        message: "Không lưu được dữ liệu."
      });
    } finally {
      setSaving(false);
    }
  };

  const removeItem = async (id?: string) => {
    if (!id) return;
    try {
      const response = await fetch(`/api/fnb/${id}`, {
        method: "DELETE",
        credentials: "include"
      });
      if (!response.ok) {
        throw new Error("Delete failed");
      }
      await loadItems();
      if (editingId === id) {
        resetForm();
      }
    } catch (error) {
      setStatus({
        type: "error",
        message: "Không xóa được mục."
      });
    }
  };

  const handleLogin = async (event: FormEvent) => {
    event.preventDefault();
    setLoginError("");
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginForm),
        credentials: "include"
      });

      if (!response.ok) {
        throw new Error("Login failed");
      }

      const data = await response.json();
      setUser(data.user);
    } catch (error) {
      setLoginError("Sai tài khoản hoặc mật khẩu.");
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include"
    });
    setUser(null);
  };

  const statusColor = useMemo(() => {
    if (status.type === "error") return "#ffbcbc";
    if (status.type === "success") return "#c8f7c5";
    return "inherit";
  }, [status.type]);

  if (checking) {
    return (
      <section className="section">
        <div className="section-title">
          <h1>Đang kiểm tra đăng nhập...</h1>
        </div>
      </section>
    );
  }

  if (!user) {
    return (
      <>
        <nav>
          <a href="/" className="logo">
            RV MEDIA
          </a>
          <div className="nav-links">
            <a href="/">Trang chủ</a>
          </div>
        </nav>
        <section className="section">
          <div className="section-title">
            <h1>Đăng nhập quản trị</h1>
            <p>Vui lòng đăng nhập để quản lý F&B.</p>
          </div>
          <div className="form-wrapper" style={{ maxWidth: "520px" }}>
            <form onSubmit={handleLogin}>
              <div className="form-row">
                <div className="form-group">
                  <label>Tài khoản</label>
                  <input
                    type="text"
                    value={loginForm.username}
                    onChange={(event) =>
                      setLoginForm((prev) => ({
                        ...prev,
                        username: event.target.value
                      }))
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Mật khẩu</label>
                  <input
                    type="password"
                    value={loginForm.password}
                    onChange={(event) =>
                      setLoginForm((prev) => ({
                        ...prev,
                        password: event.target.value
                      }))
                    }
                    required
                  />
                </div>
              </div>
              <div className="admin-actions">
                <button type="submit" className="btn btn-filled">
                  Đăng nhập
                </button>
              </div>
              {loginError ? (
                <p className="status-text" style={{ color: "#ffbcbc" }}>
                  {loginError}
                </p>
              ) : null}
            </form>
          </div>
        </section>
      </>
    );
  }

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-top">
          <div className="admin-brand">RV MEDIA</div>
          <div className="admin-user">Xin chào, {user.username}</div>
          <nav className="admin-menu">
            <a className="active">F&B</a>
            <a href="/admin/hospitality">Hotels & Residences</a>
            <a href="/admin/landmarks">Danh lam thắng cảnh</a>
          </nav>
        </div>
        <div className="admin-spacer" />
        <div className="admin-sidebar-bottom">
          <button type="button" className="btn btn-small" onClick={handleLogout}>
            Đăng xuất
          </button>
        </div>
      </aside>

      <main className="admin-content">
        <div className="admin-header">
          <div>
            <h1>F&B</h1>
            <p>Danh sách địa điểm, phân trang và lọc nhanh.</p>
          </div>
          <div className="admin-header-actions">
            <div className="admin-filters">
              <input
                type="text"
                className="admin-input"
                placeholder="Tìm theo tên..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
              <select
                className="admin-input"
                value={typeFilter}
                onChange={(event) => setTypeFilter(event.target.value)}
              >
                <option value="">Tất cả loại</option>
                {types.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              className="btn btn-filled"
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
            >
              Thêm mới
            </button>
          </div>
        </div>

        <div className="admin-card">
          <div className="admin-table-header">
            <div>
              <h2>Danh sách địa điểm</h2>
              <p>
                {loading
                  ? "Đang tải..."
                  : hasItems
                    ? `Tổng: ${total} mục.`
                    : "Chưa có dữ liệu."}
              </p>
            </div>
            <div className="admin-pagination">
              <button
                type="button"
                className="btn btn-small"
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={page <= 1}
              >
                Trước
              </button>
              <span>
                Trang {page}/{totalPages}
              </span>
              <button
                type="button"
                className="btn btn-small"
                onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={page >= totalPages}
              >
                Sau
              </button>
            </div>
          </div>

          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Tên</th>
                  <th>Mô tả</th>
                  <th>Phân loại</th>
                  <th>Embed</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item._id || item.embed}>
                    <td>
                      <div className="admin-title">{item.title?.vi}</div>
                      <div className="admin-subtitle">{item.title?.en}</div>
                    </td>
                    <td>
                      <div className="admin-subtitle">
                        {item.description?.vi}
                      </div>
                    </td>
                    <td>
                      <div className="admin-tags">
                        {item.categories?.length
                          ? item.categories.map((cat) => (
                              <span key={cat} className="admin-tag">
                                {cat}
                              </span>
                            ))
                          : "—"}
                      </div>
                    </td>
                    <td>
                      <a
                        href={item.embed}
                        target="_blank"
                        rel="noreferrer"
                        className="admin-link"
                      >
                        Mở
                      </a>
                    </td>
                    <td>
                      <div className="admin-actions-row">
                        <button
                          type="button"
                          className="btn btn-small"
                          onClick={() => startEdit(item)}
                        >
                          Sửa
                        </button>
                        <button
                          type="button"
                          className="btn btn-danger btn-small"
                          onClick={() => removeItem(item._id)}
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!items.length && !loading ? (
                  <tr>
                    <td colSpan={5} className="admin-empty">
                      Chưa có mục nào.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>

        {showForm ? (
          <div className="admin-modal" onClick={resetForm}>
            <div
              className="admin-modal-content"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="admin-modal-header">
                <div>
                  <h2>{editingId ? "Cập nhật F&B" : "Thêm F&B mới"}</h2>
                  <p className="form-help">
                    Dán link iframe src của Google Maps hoặc tour 360°.
                  </p>
                </div>
                <button
                  type="button"
                  className="admin-icon-btn"
                  onClick={resetForm}
                  aria-label="Close"
                >
                  ×
                </button>
              </div>
              <form onSubmit={submitItem}>
                <div className="admin-form-grid">
                  <div className="form-group">
                    <label>Tên (EN)</label>
                    <input
                      type="text"
                      value={form.nameEn}
                      onChange={updateField("nameEn")}
                      placeholder="La Villa French Restaurant"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Tên (VI)</label>
                    <input
                      type="text"
                      value={form.nameVi}
                      onChange={updateField("nameVi")}
                      placeholder="Nhà hàng Pháp La Villa"
                      required
                    />
                  </div>
                  <div className="form-group admin-col-span">
                    <label>Embed URL</label>
                    <input
                      type="url"
                      value={form.embed}
                      onChange={updateField("embed")}
                      placeholder="https://www.google.com/maps/embed?..."
                      required
                    />
                  </div>
                  <div className="form-group admin-col-span">
                    <label>Phân loại (cách nhau bằng dấu phẩy)</label>
                    <input
                      type="text"
                      value={form.categories}
                      onChange={updateField("categories")}
                      placeholder="Restaurant, Cafe, Showroom"
                    />
                  </div>
                  <div className="form-group admin-col-span">
                    <label>Mô tả (EN)</label>
                    <textarea
                      value={form.descEn}
                      onChange={updateField("descEn")}
                      placeholder="Elegant outdoor dining and pool-side atmosphere."
                      required
                    />
                  </div>
                  <div className="form-group admin-col-span">
                    <label>Mô tả (VI)</label>
                    <textarea
                      value={form.descVi}
                      onChange={updateField("descVi")}
                      placeholder="Không gian ăn uống ngoài trời thanh lịch..."
                      required
                    />
                  </div>
                </div>
                <div className="admin-actions admin-actions-right">
                  <button type="button" className="btn" onClick={resetForm}>
                    Hủy
                  </button>
                  <button type="submit" className="btn btn-filled" disabled={saving}>
                    {saving
                      ? "Đang lưu..."
                      : editingId
                        ? "Cập nhật"
                        : "Thêm mới"}
                  </button>
                </div>
              </form>
              {status.message ? (
                <p className="status-text" style={{ color: statusColor }}>
                  {status.message}
                </p>
              ) : null}
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}
