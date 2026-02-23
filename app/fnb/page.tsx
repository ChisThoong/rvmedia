"use client";

import { useEffect, useMemo, useState } from "react";
import type { FnbItem } from "../../types/fnb";

const translations = {
  en: {
    "meta.title": "RV Media | F&B Gallery",
    "lang.en": "English",
    "lang.vi": "Vietnamese",
    "nav.back": "Back to Home",
    "page.title": "F&B Gallery",
    "page.subtitle":
      "Browse the current F&B tours. Updates are managed in the admin page."
  },
  vi: {
    "meta.title": "RV Media | Thư viện F&B",
    "lang.en": "English",
    "lang.vi": "Tiếng Việt",
    "nav.back": "Về trang chủ",
    "page.title": "Thư viện F&B",
    "page.subtitle":
      "Xem danh sách tour F&B hiện tại. Cập nhật nội dung ở trang quản trị."
  }
};

export default function FnbPage() {
  const [lang, setLang] = useState("en");
  const [items, setItems] = useState<FnbItem[]>([]);

  useEffect(() => {
    const saved = window.localStorage.getItem("lang");
    const browserLang = (navigator.language || "").toLowerCase();
    const defaultLang = saved || (browserLang.startsWith("vi") ? "vi" : "en");
    setLang(defaultLang);
  }, []);

  useEffect(() => {
    const loadItems = async () => {
      try {
        const response = await fetch("/api/fnb", { cache: "no-store" });
        const data = await response.json();
        setItems(Array.isArray(data) ? data : data.items || []);
      } catch (error) {
        setItems([]);
      }
    };

    loadItems();
  }, []);

  useEffect(() => {
    window.localStorage.setItem("lang", lang);
    document.documentElement.lang = lang;
    document.title =
      translations[lang]?.["meta.title"] || translations.en["meta.title"];
  }, [lang]);

  const t = useMemo(() => translations[lang] || translations.en, [lang]);

  return (
    <>
      <nav>
        <a href="/" className="logo">
          RV MEDIA
        </a>
        <div className="nav-links">
          <a href="/">{t["nav.back"]}</a>
          <a href="/admin">Admin</a>
        </div>
        <div className="lang-switch">
          <select
            className="lang-select"
            aria-label="Language"
            value={lang}
            onChange={(event) => setLang(event.target.value)}
          >
            <option value="en">{t["lang.en"]}</option>
            <option value="vi">{t["lang.vi"]}</option>
          </select>
        </div>
      </nav>

      <section className="section">
        <div className="section-title">
          <h1>{t["page.title"]}</h1>
          <p>{t["page.subtitle"]}</p>
        </div>

        <div className="grid-container">
          {items.map((item) => (
            <div className="card" key={item._id || item.embed}>
              <iframe src={item.embed} allowFullScreen loading="lazy" />
              <div className="card-body">
                <h3>{item.title?.[lang] || item.title?.en}</h3>
                <p>{item.description?.[lang] || item.description?.en}</p>
                {item.categories?.length ? (
                  <p className="form-help">
                    {item.categories.map((cat) => `#${cat}`).join(" ")}
                  </p>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
