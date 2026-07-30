import React, { memo, useState, useEffect } from 'react';
import { Facebook, Instagram, Twitter, Youtube, Phone, Mail, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import apiUser from '@/service/api';

const Footer = () => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await apiUser.get('/categories');
        const data = res.data?.data || res.data || [];
        setCategories(data);
      } catch (error) {
        console.error('Lỗi khi lấy danh mục footer:', error);
      }
    };
    fetchCategories();
  }, []);

  const socialLinks = [
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Instagram, href: '#', label: 'Instagram' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Youtube, href: '#', label: 'Youtube' }
  ];

  const quickLinks = [
    { name: 'Về chúng tôi', href: '/about' },
    { name: 'Liên hệ', href: '/contact' },
    { name: 'Chính sách bảo mật', href: '/privacy' },
    { name: 'Điều khoản sử dụng', href: '/terms' },
    { name: 'Chính sách đổi trả', href: '/returns' },
    { name: 'Hướng dẫn mua hàng', href: '/guide' }
  ];

  const paymentMethods = [
    'Visa', 'Mastercard', 'Momo', 'ZaloPay', 'VNPay', 'COD'
  ];

  return (
    <>
      <style>{`
        .ft-footer {
          background: #111827;
          color: #d1d5db;
          position: relative;
          overflow: hidden;
        }

        .ft-footer::before {
          content: '';
          display: block;
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 3px;
          background: linear-gradient(90deg, #ec4899, #db2777, #be185d);
        }

        .ft-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 3rem;
          margin-bottom: 3rem;
        }

        @media (min-width: 640px) {
          .ft-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (min-width: 1024px) {
          .ft-grid {
            grid-template-columns: 2fr 1fr 1fr 1.25fr;
            gap: 3.5rem;
          }
        }

        /* Brand Column */
        .ft-brand-wrap {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .ft-brand {
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 1.5rem;
          font-weight: 900;
          letter-spacing: -0.01em;
          color: #ffffff;
          margin: 0 0 0.75rem;
        }

        .ft-brand-desc {
          font-size: 0.875rem;
          line-height: 1.7;
          color: #9ca3af;
          max-width: 32ch;
          margin: 0;
        }

        .ft-contacts {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .ft-contact-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.875rem;
          color: #d1d5db;
        }

        .ft-contact-icon {
          color: #ec4899;
          flex-shrink: 0;
        }

        .ft-socials {
          display: flex;
          gap: 0.625rem;
        }

        .ft-social-link {
          width: 2.25rem;
          height: 2.25rem;
          background: rgba(255,255,255,0.08);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #d1d5db;
          transition: background 0.2s, color 0.2s, transform 0.2s;
        }

        .ft-social-link:hover {
          background: #ec4899;
          color: white;
          transform: translateY(-2px);
        }

        /* Standard Columns */
        .ft-col-title {
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #ffffff;
          margin: 0 0 1.5rem;
        }

        .ft-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .ft-list-link {
          font-size: 0.875rem;
          color: #9ca3af;
          text-decoration: none;
          transition: color 0.2s, padding-left 0.2s;
          display: inline-block;
        }

        .ft-list-link:hover {
          color: #ec4899;
          padding-left: 4px;
        }

        .ft-hours-card {
          background: rgba(255,255,255,0.05);
          padding: 1.25rem;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          margin-bottom: 1.5rem;
        }

        .ft-hours-card p {
          margin: 0;
          font-size: 0.8125rem;
          line-height: 1.6;
        }

        .ft-hours-label {
          font-size: 0.6875rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #6b7280;
          margin-bottom: 0.5rem !important;
        }

        .ft-payment-title {
          font-size: 0.6875rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #6b7280;
          margin: 0 0 0.75rem;
        }

        .ft-payment-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.5rem;
        }

        .ft-payment-badge {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 6px;
          font-size: 0.6875rem;
          font-weight: 600;
          color: #d1d5db;
          text-align: center;
          padding: 0.4rem 0.25rem;
          transition: border-color 0.2s, color 0.2s;
        }

        .ft-payment-badge:hover {
          border-color: #ec4899;
          color: white;
        }

        /* Bottom Bar */
        .ft-bottom {
          border-top: 1px solid rgba(255,255,255,0.1);
          padding-top: 2rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        @media (min-width: 768px) {
          .ft-bottom {
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
          }
        }

        .ft-copyright {
          font-size: 0.75rem;
          color: #6b7280;
          margin: 0;
        }

        .ft-bottom-nav {
          display: flex;
          gap: 1.5rem;
        }

        .ft-bottom-link {
          font-size: 0.75rem;
          color: #6b7280;
          text-decoration: none;
          transition: color 0.2s;
        }

        .ft-bottom-link:hover {
          color: #ec4899;
        }
      `}</style>

      <footer className="ft-footer">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="ft-grid">
            {/* Info */}
            <div className="ft-brand-wrap">
              <div>
                <h3 className="ft-brand">FASHIONSTORE</h3>
                <p className="ft-brand-desc">
                  Thương hiệu thời trang hàng đầu Việt Nam, mang đến thiết kế hiện đại, tinh tế và phong cách.
                </p>
              </div>

              <div className="ft-contacts">
                <div className="ft-contact-item">
                  <Phone size={14} className="ft-contact-icon" />
                  <span>Hotline: 1900 1234</span>
                </div>
                <div className="ft-contact-item">
                  <Mail size={14} className="ft-contact-icon" />
                  <span>contact@fashionstore.vn</span>
                </div>
                <div className="ft-contact-item">
                  <MapPin size={14} className="ft-contact-icon" />
                  <span>123 Nguyễn Huệ, Q1, TP.HCM</span>
                </div>
              </div>

              <div className="ft-socials">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    className="ft-social-link"
                    aria-label={social.label}
                  >
                    <social.icon size={16} />
                  </a>
                ))}
              </div>
            </div>

            {/* Links */}
            <div>
              <h4 className="ft-col-title">Liên kết nhanh</h4>
              <ul className="ft-list">
                {quickLinks.map((link) => (
                  <li key={link.name}>
                    <Link to={link.href} className="ft-list-link">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Categories */}
            <div>
              <h4 className="ft-col-title">Danh mục</h4>
              <ul className="ft-list">
                {categories.length > 0 ? (
                  categories.slice(0, 6).map((cat) => {
                    const catId = cat._id || cat.id;
                    const catSlug = cat.slug || cat.name?.toLowerCase().replace(/\s+/g, '-');
                    return (
                      <li key={catId || cat.name}>
                        <Link
                          to={`/category/${catSlug}`}
                          state={{ id: catId }}
                          className="ft-list-link"
                        >
                          {cat.name}
                        </Link>
                      </li>
                    );
                  })
                ) : (
                  <li className="text-gray-400 text-xs italic">Đang tải danh mục...</li>
                )}
              </ul>
            </div>

            {/* Customer Service */}
            <div>
              <h4 className="ft-col-title">Hỗ trợ khách hàng</h4>
              <div className="ft-hours-card">
                <p className="ft-hours-label">Giờ làm việc:</p>
                <p style={{ color: 'white', fontWeight: 500 }}>T2 - T6: 8:00 - 22:00</p>
                <p style={{ color: 'white', fontWeight: 500 }}>T7 - CN: 9:00 - 21:00</p>
              </div>

              <div>
                <p className="ft-payment-title">Phương thức thanh toán:</p>
                <div className="ft-payment-grid">
                  {paymentMethods.map((method) => (
                    <div key={method} className="ft-payment-badge">
                      {method}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="ft-bottom">
            <p className="ft-copyright">
              © 2026 FashionStore. All rights reserved.
            </p>

            <nav className="ft-bottom-nav">
              {['Chính sách bảo mật', 'Điều khoản', 'Sitemap'].map((text) => (
                <a key={text} href="#" className="ft-bottom-link">
                  {text}
                </a>
              ))}
            </nav>
          </div>
        </div>
      </footer>
    </>
  );
};

export default memo(Footer);
