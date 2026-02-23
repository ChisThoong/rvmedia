"use client";

import Script from "next/script";
import type { ChangeEvent } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { FnbItem } from "../types/fnb";

type ContactForm = {
  name: string;
  businessName: string;
  phone: string;
  serviceType: string;
};

const translations = {
  en: {
    meta_title: "RV Media | Premium 360° Virtual Tours",
    nav_commercial: "Commercial",
    nav_hospitality: "Hospitality",
    nav_contact: "Contact",
    nav_admin: "Admin",
    hero_title: "Experience Spaces <br> Before You Arrive.",
    hero_desc:
      "Expert 360° Virtual Tours for Real Estate & Hospitality in Vietnam.",
    hero_btn: "Book a Free Survey",
    fnb_title: "F&B & Commercial Spaces",
    fnb_desc: "Showcasing the atmosphere of premium dining & business locations.",
    hosp_title: "Hotels & Residences",
    hosp_desc: "Immersive experiences for high-end hospitality.",
    landmarks_title: "Landmarks",
    landmarks_desc: "Signature destinations and cultural highlights.",
    desc_maihouse: "Sophisticated luxury in the heart of the city.",
    desc_oakwood: "Modern serviced apartment layouts.",
    desc_honghome: "Boutique residential design.",
    feat_title: "Why Choose 360° Tours?",
    feat_desc: "More than just images. A powerful marketing tool for your business.",
    feat_1_title: "Boost Google Visibility",
    feat_1_desc:
      "Upload directly to Google Maps / Street View. Profiles with virtual tours generate 2x more interest.",
    feat_2_title: "Increase Trust",
    feat_2_desc:
      "Customers book with confidence when they can see exactly what the space looks like.",
    feat_3_title: "24/7 Open House",
    feat_3_desc:
      "Your doors are always open. Let clients explore your facilities anytime, from anywhere.",
    proc_title: "How It Works",
    proc_desc: "Simple, transparent, and high-quality.",
    step_1_title: "Free Consultation",
    step_1_desc:
      "We discuss your goals and provide a clear, transparent quote. No commitment required.",
    step_2_title: "Premium Photography",
    step_2_desc:
      "We capture your space using high-end DSLR equipment for maximum clarity and detail.",
    step_3_title: "Delivery",
    step_3_desc:
      "Within 5 business days, you receive a ready-to-use link and files for Google Maps upload.",
    about_title: "The Realview Media Story",
    about_text_1:
      "Based in Ho Chi Minh City, we bridge the gap between physical locations and digital discovery. We provide 24/7 open houses for Real Estate and build immediate trust for Hospitality businesses.",
    about_text_2: "Professional Photography & 360 Solutions.",
    contact_email_label: "Email Us",
    contact_call_label: "Call / Zalo",
    contact_zalo_btn: "Chat on Zalo",
    modal_title: "Schedule a Site Visit",
    modal_desc:
      "To give you an accurate price, we need to see the space. Leave your details and we will call to schedule a survey.",
    label_name: "Your Name",
    label_business: "Business / Property Name",
    label_phone: "Phone / Zalo Number",
    label_service: "Service Interested In",
    option_default: "Select an option...",
    btn_submit: "Request Callback",
    success_title: "Request Received",
    success_desc:
      "Thank you. We have received your details and will call you shortly to arrange the survey.",
    btn_thanks: "Great, thanks!",
    opt_real_estate_apt: "Real Estate (Apartment / Condo)",
    opt_real_estate_villa: "Real Estate (Villa / Townhouse)",
    opt_hotel: "Hotel / Resort",
    opt_fnb: "Restaurant / Cafe / Bar (F&B)",
    opt_showroom: "Showroom / Retail Shop",
    opt_factory: "Factory / Industrial",
    opt_office: "Office / Coworking Space",
    opt_school: "School / Education",
    opt_medical: "Medical / Clinic",
    opt_other: "Other"
  },
  vi: {
    meta_title: "RV Media | Tour 360° Cao Cấp",
    nav_commercial: "Thương Mại",
    nav_hospitality: "Khách Sạn",
    nav_contact: "Liên Hệ",
    nav_admin: "Quản trị",
    hero_title: "Trải Nghiệm Không Gian <br> Trước Khi Bạn Đến.",
    hero_desc:
      "Chuyên gia Tour Thực Tế Ảo 360° cho Bất Động Sản & Khách Sạn tại Việt Nam.",
    hero_btn: "Đặt Lịch Khảo Sát",
    fnb_title: "F&B & Không Gian Thương Mại",
    fnb_desc: "Thể hiện không gian của các địa điểm kinh doanh & ẩm thực cao cấp.",
    hosp_title: "Khách Sạn & Căn Hộ",
    hosp_desc: "Trải nghiệm sống động cho ngành dịch vụ cao cấp.",
    landmarks_title: "Danh lam thắng cảnh",
    landmarks_desc: "Những điểm đến tiêu biểu và giàu trải nghiệm.",
    desc_maihouse: "Sự sang trọng tinh tế ngay giữa trung tâm thành phố.",
    desc_oakwood: "Thiết kế căn hộ dịch vụ hiện đại.",
    desc_honghome: "Thiết kế nhà ở boutique độc đáo.",
    feat_title: "Tại Sao Chọn Tour 360°?",
    feat_desc: "Không chỉ là hình ảnh. Một công cụ marketing mạnh mẽ cho doanh nghiệp.",
    feat_1_title: "Tăng Hiển Thị Google",
    feat_1_desc:
      "Tải trực tiếp lên Google Maps. Hồ sơ có tour ảo thu hút sự quan tâm gấp 2 lần.",
    feat_2_title: "Tăng Niềm Tin",
    feat_2_desc:
      "Khách hàng dễ dàng đặt chỗ hơn khi họ có thể thấy chính xác không gian thực tế trước khi đến.",
    feat_3_title: "Mở Cửa 24/7",
    feat_3_desc:
      "Không gian của bạn luôn mở cửa. Khách hàng có thể tham quan mọi lúc, mọi nơi.",
    proc_title: "Quy Trình Làm Việc",
    proc_desc: "Minh bạch, chuyên nghiệp và chất lượng.",
    step_1_title: "Tư Vấn Miễn Phí",
    step_1_desc:
      "Chúng tôi lắng nghe nhu cầu và gửi báo giá minh bạch. Hoàn toàn không ràng buộc.",
    step_2_title: "Nhiếp Ảnh Cao Cấp",
    step_2_desc:
      "Sử dụng thiết bị DSLR chuyên nghiệp để đảm bảo hình ảnh sắc nét và chi tiết nhất.",
    step_3_title: "Bàn Giao",
    step_3_desc:
      "Trong vòng 5 ngày làm việc, bạn sẽ nhận được đường link hoàn chỉnh và file chuẩn Google.",
    about_title: "Câu Chuyện Của Realview Media",
    about_text_1:
      "Có trụ sở tại TP.HCM, chúng tôi nối liền khoảng cách giữa địa điểm thực tế và khám phá kỹ thuật số. Chúng tôi cung cấp giải pháp mở cửa 24/7 cho Bất Động Sản và xây dựng niềm tin tức thì cho doanh nghiệp Khách Sạn.",
    about_text_2: "Nhiếp Ảnh Chuyên Nghiệp & Giải Pháp 360.",
    contact_email_label: "Gửi Email",
    contact_call_label: "Gọi / Zalo",
    contact_zalo_btn: "Chat qua Zalo",
    modal_title: "Đặt Lịch Khảo Sát",
    modal_desc:
      "Để báo giá chính xác, chúng tôi cần xem qua địa điểm. Vui lòng để lại thông tin, chúng tôi sẽ gọi lại để sắp xếp lịch khảo sát.",
    label_name: "Tên Của Bạn",
    label_business: "Tên Doanh Nghiệp / Dự Án",
    label_phone: "Số Điện Thoại / Zalo",
    label_service: "Dịch Vụ Quan Tâm",
    option_default: "Chọn một tùy chọn...",
    btn_submit: "Yêu Cầu Gọi Lại",
    success_title: "Đã Nhận Yêu Cầu",
    success_desc:
      "Cảm ơn bạn. Chúng tôi đã nhận được thông tin và sẽ sớm liên hệ lại để sắp xếp khảo sát.",
    btn_thanks: "Tuyệt vời, cảm ơn!",
    opt_real_estate_apt: "Bất Động Sản (Căn Hộ / Chung Cư)",
    opt_real_estate_villa: "Bất Động Sản (Biệt Thự / Nhà Phố)",
    opt_hotel: "Khách Sạn / Khu Nghỉ Dưỡng",
    opt_fnb: "Nhà Hàng / Cafe / Bar (F&B)",
    opt_showroom: "Showroom / Cửa Hàng Bán Lẻ",
    opt_factory: "Nhà Máy / Công Nghiệp",
    opt_office: "Văn Phòng / Coworking Space",
    opt_school: "Trường Học / Giáo Dục",
    opt_medical: "Y Tế / Phòng Khám",
    opt_other: "Khác"
  }
};

const hospitalityItems = [
  {
    id: "mai-house",
    title: "Mai House Saigon",
    descKey: "desc_maihouse",
    embed: "https://mai-house-website.pages.dev/"
  },
  {
    id: "oakwood",
    title: "Oakwood Richlane",
    descKey: "desc_oakwood",
    embed: "https://oakwood-richlane-residence.pages.dev/"
  },
  {
    id: "hong-home",
    title: "Hong Home",
    descKey: "desc_honghome",
    embed: "https://honghome.pages.dev/"
  }
];

export default function HomePage() {
  const [lang, setLang] = useState<"en" | "vi">("en");
  const [fnbItems, setFnbItems] = useState<FnbItem[]>([]);
  const [landmarkItems, setLandmarkItems] = useState<FnbItem[]>([]);
  const [navOpen, setNavOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [contactForm, setContactForm] = useState<ContactForm>({
    name: "",
    businessName: "",
    phone: "",
    serviceType: ""
  });
  const [sending, setSending] = useState(false);
  const panoramaInitialized = useRef(false);

  useEffect(() => {
    const saved = window.localStorage.getItem("lang");
    const browserLang = (navigator.language || "").toLowerCase();
    const defaultLang = saved || (browserLang.startsWith("vi") ? "vi" : "en");
    setLang(defaultLang as "en" | "vi");
  }, []);

  useEffect(() => {
    const loadItems = async () => {
      try {
        const response = await fetch("/api/fnb", { cache: "no-store" });
        const data = await response.json();
        setFnbItems(Array.isArray(data) ? data : data.items || []);
      } catch (error) {
        setFnbItems([]);
      }
    };

    loadItems();
  }, []);

  useEffect(() => {
    const loadLandmarks = async () => {
      try {
        const response = await fetch("/api/landmarks", { cache: "no-store" });
        const data = await response.json();
        setLandmarkItems(Array.isArray(data) ? data : data.items || []);
      } catch (error) {
        setLandmarkItems([]);
      }
    };

    loadLandmarks();
  }, []);

  useEffect(() => {
    window.localStorage.setItem("lang", lang);
    document.documentElement.lang = lang;
    document.title = translations[lang].meta_title;
  }, [lang]);

  const t = useMemo(() => translations[lang], [lang]);

  const updateZaloLinks = useCallback(() => {
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    const zaloUrl = isMobile
      ? "https://zalo.me/0966888782"
      : "zalo://conversation?phone=0966888782";
    const link = document.getElementById("zalo-link") as HTMLAnchorElement | null;
    const link3 = document.getElementById(
      "zalo-link-3"
    ) as HTMLAnchorElement | null;
    if (link) link.href = zaloUrl;
    if (link3) link3.href = zaloUrl;
  }, []);

  const handleReveal = useCallback(() => {
    const revealElements = document.querySelectorAll(".reveal");
    const windowHeight = window.innerHeight;
    revealElements.forEach((element) => {
      const top = element.getBoundingClientRect().top;
      if (top < windowHeight - 100) {
        element.classList.add("active");
      }
    });
    setShowScrollTop(window.scrollY > 300);
  }, []);

  useEffect(() => {
    updateZaloLinks();
    handleReveal();
    window.addEventListener("scroll", handleReveal);
    return () => window.removeEventListener("scroll", handleReveal);
  }, [handleReveal, updateZaloLinks]);

  const initPanorama = useCallback(() => {
    if (panoramaInitialized.current) return;
    const element = document.getElementById("panorama");
    const pannellum = (window as any).pannellum;
    if (!element || !pannellum) return;
    pannellum.viewer("panorama", {
      type: "equirectangular",
      panorama: "/images/header.jpg",
      autoLoad: true,
      autoRotate: -2,
      showControls: false,
      mouseZoom: false,
      keyboardZoom: false,
      draggable: true,
      yaw: -30,
      hfov: 120,
      minHfov: 90,
      maxHfov: 120
    });
    panoramaInitialized.current = true;
  }, []);

  const handleEmailJsLoad = useCallback(() => {
    const emailjs = (window as any).emailjs;
    if (emailjs?.init) {
      emailjs.init("6a4Zpqa8h2StG76ys");
    }
  }, []);

  const handlePannellumLoad = useCallback(() => {
    initPanorama();
  }, [initPanorama]);

  const toggleMenu = () => setNavOpen(false);
  const toggleMobileMenu = () => setNavOpen((prev) => !prev);

  const updateContactField =
    (field: keyof ContactForm) =>
    (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setContactForm((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const sendMail = async () => {
    if (!contactForm.name || !contactForm.phone) {
      alert(
        lang === "vi"
          ? "Vui lòng nhập tên và số điện thoại."
          : "Please fill in your Name and Phone Number."
      );
      return;
    }
    const emailjs = (window as any).emailjs;
    if (!emailjs?.send) {
      alert("Email service not ready. Please try again.");
      return;
    }

    try {
      setSending(true);
      await emailjs.send("service_0pd1bdj", "template_934596a", {
        name: contactForm.name,
        business_name: contactForm.businessName,
        phone: contactForm.phone,
        service_type: contactForm.serviceType
      });
      setIsModalOpen(false);
      setIsSuccessOpen(true);
      setContactForm({ name: "", businessName: "", phone: "", serviceType: "" });
    } catch (error) {
      alert(
        lang === "vi"
          ? "Gửi thất bại. Vui lòng gọi trực tiếp."
          : "Failed to send. Please try calling us directly."
      );
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    if (isModalOpen) {
      const handler = (event: KeyboardEvent) => {
        if (event.key === "Escape") setIsModalOpen(false);
      };
      window.addEventListener("keydown", handler);
      return () => window.removeEventListener("keydown", handler);
    }
  }, [isModalOpen]);

  return (
    <>
      <Script
        src="https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js"
        strategy="afterInteractive"
        onLoad={handleEmailJsLoad}
      />
      <Script
        src="https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.js"
        strategy="afterInteractive"
        onLoad={handlePannellumLoad}
      />

      <svg style={{ width: 0, height: 0, position: "absolute" }} aria-hidden="true">
        <linearGradient id="goldGradient" x2="1" y2="1">
          <stop offset="0%" stopColor="#e0b462" />
          <stop offset="100%" stopColor="#c5a059" />
        </linearGradient>
      </svg>

      {showScrollTop ? (
        <button
          type="button"
          className="scroll-top"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          ↑
        </button>
      ) : null}

      <div className="floating-chat">
        <a
          href="https://zalo.me/0966888782"
          id="zalo-link"
          target="_blank"
          rel="noreferrer"
          className="chat-icon zalo"
          title="Chat on Zalo"
        >
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/9/91/Icon_of_Zalo.svg"
            alt="Zalo Chat"
          />
        </a>
        <a
          href="https://m.me/RealviewMediaVN"
          target="_blank"
          rel="noreferrer"
          className="chat-icon messenger"
          title="Chat on Messenger"
        >
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/b/be/Facebook_Messenger_logo_2020.svg"
            alt="Messenger Chat"
          />
        </a>
      </div>

      <nav>
        <a href="/" className="logo">
          <img src="/images/Logo.png" alt="RV Media" />
        </a>

        <div className="lang-switch">
          <div
            className={`lang-option ${lang === "en" ? "active" : ""}`}
            onClick={() => setLang("en")}
          >
            <span className="lang-text">EN</span>
            <img
              src="https://upload.wikimedia.org/wikipedia/en/a/a4/Flag_of_the_United_States.svg"
              className="lang-flag"
              alt="English"
            />
          </div>
          <div className="lang-divider">|</div>
          <div
            className={`lang-option ${lang === "vi" ? "active" : ""}`}
            onClick={() => setLang("vi")}
          >
            <span className="lang-text">VI</span>
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/2/21/Flag_of_Vietnam.svg"
              className="lang-flag"
              alt="Tiếng Việt"
            />
          </div>
        </div>

        <div className="nav-right">
          <div className={`nav-links ${navOpen ? "active" : ""}`} id="navLinks">
            <a href="#tours-fnb" onClick={toggleMenu}>
              {t.nav_commercial}
            </a>
            <a href="#tours-hospitality" onClick={toggleMenu}>
              {t.nav_hospitality}
            </a>
            <a href="#about" onClick={toggleMenu}>
              {t.nav_contact}
            </a>
          </div>
          <div className="mobile-menu-btn" onClick={toggleMobileMenu}>
            <span>☰</span> MENU
          </div>
        </div>
      </nav>

      <header className="hero">
        <div id="panorama" />
        <div className="hero-content">
          <h1
            className="reveal"
            dangerouslySetInnerHTML={{ __html: t.hero_title }}
          />
          <p className="reveal" style={{ transitionDelay: "0.2s" }}>
            {t.hero_desc}
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn reveal"
            style={{ transitionDelay: "0.4s" }}
          >
            {t.hero_btn}
          </button>
        </div>
      </header>

      <section className="section">
        <div className="section-title reveal">
          <h2>{t.feat_title}</h2>
          <p>{t.feat_desc}</p>
        </div>
        <div className="grid-container reveal">
          <div className="benefit-card">
            <div className="benefit-icon">
              <svg viewBox="0 0 24 24">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
              </svg>
            </div>
            <h3 style={{ fontSize: "1.2rem", marginBottom: "10px" }}>
              {t.feat_1_title}
            </h3>
            <p style={{ fontSize: "0.95rem", opacity: 0.7, fontWeight: 300 }}>
              {t.feat_1_desc}
            </p>
          </div>
          <div className="benefit-card">
            <div className="benefit-icon">
              <svg viewBox="0 0 24 24">
                <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
              </svg>
            </div>
            <h3 style={{ fontSize: "1.2rem", marginBottom: "10px" }}>
              {t.feat_2_title}
            </h3>
            <p style={{ fontSize: "0.95rem", opacity: 0.7, fontWeight: 300 }}>
              {t.feat_2_desc}
            </p>
          </div>
          <div className="benefit-card">
            <div className="benefit-icon">
              <svg viewBox="0 0 24 24">
                <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
              </svg>
            </div>
            <h3 style={{ fontSize: "1.2rem", marginBottom: "10px" }}>
              {t.feat_3_title}
            </h3>
            <p style={{ fontSize: "0.95rem", opacity: 0.7, fontWeight: 300 }}>
              {t.feat_3_desc}
            </p>
          </div>
        </div>
      </section>

      <section id="tours-fnb" className="section">
        <div className="section-title reveal">
          <h2>{t.fnb_title}</h2>
          <p>{t.fnb_desc}</p>
        </div>
        <div className="grid-container reveal">
          {fnbItems.map((item) => (
            <div className="card" key={item._id || item.embed}>
              <iframe
                src={item.embed}
                allowFullScreen
                loading="lazy"
                allow="fullscreen; xr-spatial-tracking"
              />
              <div className="card-body">
                <h3>{item.title?.[lang] || item.title?.en}</h3>
                <p>{item.description?.[lang] || item.description?.en}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="tours-hospitality" className="section">
        <div className="section-title reveal">
          <h2>{t.hosp_title}</h2>
          <p>{t.hosp_desc}</p>
        </div>
        <div className="grid-container reveal">
          {hospitalityItems.map((item) => (
            <div className="card" key={item.id}>
              <iframe
                src={item.embed}
                allowFullScreen
                loading="lazy"
                allow="fullscreen; xr-spatial-tracking"
              />
              <div className="card-body">
                <h3>{item.title}</h3>
                <p>{t[item.descKey as keyof typeof t]}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="tours-landmarks" className="section">
        <div className="section-title reveal">
          <h2>{t.landmarks_title}</h2>
          <p>{t.landmarks_desc}</p>
        </div>
        <div className="grid-container reveal">
          {landmarkItems.map((item) => (
            <div className="card" key={item._id || item.embed}>
              <iframe
                src={item.embed}
                allowFullScreen
                loading="lazy"
                allow="fullscreen; xr-spatial-tracking"
              />
              <div className="card-body">
                <h3>{item.title?.[lang] || item.title?.en}</h3>
                <p>{item.description?.[lang] || item.description?.en}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-title reveal">
          <h2>{t.proc_title}</h2>
          <p>{t.proc_desc}</p>
        </div>
        <div className="grid-container reveal">
          <div className="benefit-card">
            <h1 className="process-number">01</h1>
            <h3 style={{ marginBottom: "10px" }}>{t.step_1_title}</h3>
            <p style={{ fontSize: "0.9rem", opacity: 0.7 }}>{t.step_1_desc}</p>
          </div>
          <div className="benefit-card">
            <h1 className="process-number">02</h1>
            <h3 style={{ marginBottom: "10px" }}>{t.step_2_title}</h3>
            <p style={{ fontSize: "0.9rem", opacity: 0.7 }}>{t.step_2_desc}</p>
          </div>
          <div className="benefit-card">
            <h1 className="process-number">03</h1>
            <h3 style={{ marginBottom: "10px" }}>{t.step_3_title}</h3>
            <p style={{ fontSize: "0.9rem", opacity: 0.7 }}>{t.step_3_desc}</p>
          </div>
        </div>
      </section>

      <section id="about" className="section">
        <div className="unified-contact-card reveal">
          <div className="contact-col-left">
            <h2 style={{ color: "white", marginBottom: "20px" }}>
              {t.about_title}
            </h2>
            <p
              style={{
                fontSize: "0.95rem",
                color: "#ccc",
                marginBottom: "20px",
                lineHeight: 1.8
              }}
            >
              {t.about_text_1}
            </p>
            <p style={{ color: "var(--gold)", fontWeight: "bold" }}>
              {t.about_text_2}
            </p>
          </div>

          <div className="contact-col-right">
            <div className="contact-row">
              <div className="contact-icon">
                <svg viewBox="0 0 24 24">
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                </svg>
              </div>
              <div>
                <span className="contact-label">{t.contact_email_label}</span>
                <a href="mailto:contact@rvmedia.vn" className="contact-value">
                  contact@rvmedia.vn
                </a>
              </div>
            </div>

            <div className="contact-row">
              <div className="contact-icon">
                <svg viewBox="0 0 24 24">
                  <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
                </svg>
              </div>
              <div>
                <span className="contact-label">{t.contact_call_label}</span>
                <a href="tel:0966888782" className="contact-value">
                  0966 888 782
                </a>
                <br />
                <a
                  href="https://zalo.me/0966888782"
                  id="zalo-link-3"
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    fontSize: "0.75rem",
                    background: "var(--gold)",
                    color: "black",
                    padding: "2px 8px",
                    borderRadius: "3px",
                    fontWeight: "bold",
                    textDecoration: "none",
                    marginTop: "5px",
                    display: "inline-block"
                  }}
                >
                  {t.contact_zalo_btn}
                </a>
              </div>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="btn btn-filled"
              style={{ width: "100%", marginTop: "15px", border: "none" }}
            >
              {t.hero_btn}
            </button>
          </div>
        </div>
      </section>

      {isModalOpen ? (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(event) => event.stopPropagation()}>
            <span className="close-btn" onClick={() => setIsModalOpen(false)}>
              ×
            </span>
            <h2 style={{ marginBottom: "10px" }}>{t.modal_title}</h2>
            <p style={{ fontSize: "0.9rem", marginBottom: "25px" }}>
              {t.modal_desc}
            </p>
            <form>
              <div className="form-group">
                <label>{t.label_name}</label>
                <input
                  type="text"
                  value={contactForm.name}
                  onChange={updateContactField("name")}
                  placeholder={t.label_name}
                  required
                />
              </div>
              <div className="form-group">
                <label>{t.label_business}</label>
                <input
                  type="text"
                  value={contactForm.businessName}
                  onChange={updateContactField("businessName")}
                  placeholder="e.g. Mai House Hotel"
                  required
                />
              </div>
              <div className="form-group">
                <label>{t.label_phone}</label>
                <input
                  type="tel"
                  value={contactForm.phone}
                  onChange={updateContactField("phone")}
                  placeholder="0909..."
                  required
                />
              </div>
              <div className="form-group">
                <label>{t.label_service}</label>
                <select
                  value={contactForm.serviceType}
                  onChange={updateContactField("serviceType")}
                >
                  <option value="" disabled>
                    {t.option_default}
                  </option>
                  <option value="real_estate_apt">{t.opt_real_estate_apt}</option>
                  <option value="real_estate_villa">{t.opt_real_estate_villa}</option>
                  <option value="hotel">{t.opt_hotel}</option>
                  <option value="fnb">{t.opt_fnb}</option>
                  <option value="showroom">{t.opt_showroom}</option>
                  <option value="factory">{t.opt_factory}</option>
                  <option value="office">{t.opt_office}</option>
                  <option value="school">{t.opt_school}</option>
                  <option value="medical">{t.opt_medical}</option>
                  <option value="other">{t.opt_other}</option>
                </select>
              </div>
              <button
                type="button"
                onClick={sendMail}
                className="btn btn-filled"
                style={{ width: "100%", border: "none" }}
                disabled={sending}
              >
                {sending ? "Sending..." : t.btn_submit}
              </button>
            </form>
          </div>
        </div>
      ) : null}

      {isSuccessOpen ? (
        <div className="modal-overlay" onClick={() => setIsSuccessOpen(false)}>
          <div
            className="modal-content"
            style={{ maxWidth: "400px", padding: "50px 30px" }}
            onClick={(event) => event.stopPropagation()}
          >
            <span className="close-btn" onClick={() => setIsSuccessOpen(false)}>
              ×
            </span>
            <div style={{ fontSize: "4rem", marginBottom: "20px" }}>✅</div>
            <h2 style={{ marginBottom: "15px", color: "var(--gold)" }}>
              {t.success_title}
            </h2>
            <p style={{ fontSize: "1rem", color: "#ddd", marginBottom: "20px" }}>
              {t.success_desc}
            </p>
            <button
              onClick={() => setIsSuccessOpen(false)}
              className="btn btn-filled"
              style={{ width: "100%", border: "none" }}
            >
              {t.btn_thanks}
            </button>
          </div>
        </div>
      ) : null}

      <footer>
        <p>© 2024–2026 RV Media. All rights reserved.</p>
      </footer>
    </>
  );
}
