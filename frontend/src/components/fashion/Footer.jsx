/* Hallmark · macrostructure: Marquee Hero · section: Footer · tone: editorial */
import React, { memo } from 'react';
import { Facebook, Instagram, Twitter, Youtube, Phone, Mail, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const socialLinks = [
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Instagram, href: '#', label: 'Instagram' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Youtube, href: '#', label: 'Youtube' }
  ];

  const quickLinks = [
    { name: 'Về chúng tôi', href: '/about' },
    { name: 'Liên hệ', href: '/contact' },
    { name: 'Chính sách bảo mật', href: '#' },
    { name: 'Điều khoản sử dụng', href: '#' },
    { name: 'Chính sách đổi trả', href: '#' },
    { name: 'Hướng dẫn mua hàng', href: '#' }
  ];

  const categories = [
    'Thời trang nữ',
    'Thời trang nam',
    'Phụ kiện',
    'Giày dép',
    'Túi xách',
    'Đồng hồ'
  ];

  const paymentMethods = [
    'Visa', 'Mastercard', 'Momo', 'ZaloPay', 'VNPay', 'COD'
  ];

  return (
    <>
      <style>{`
        .ft-footer {
          background-color: oklch(14% 0.01 250);
          color: oklch(80% 0.01 60);
          font-family: var(--font-body, 'Inter', sans-serif);
          position: relative;
          overflow: hidden;
        }

        .ft-footer::before {
          content: '';
          display: block;
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: oklch(22% 0.01 250);
        }

        .ft-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 5rem 2rem 3rem;
        }

        .ft-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 3.5rem;
          margin-bottom: 4rem;
        }

        @media (min-width: 640px) {
          .ft-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (min-width: 1024px) {
          .ft-grid {
            grid-template-columns: 2fr 1fr 1fr 1.25fr;
            gap: 4rem;
          }
        }

        /* Brand Column */
        .ft-brand-wrap {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .ft-brand {
          font-family: var(--font-display, 'Playfair Display', serif);
          font-size: 1.75rem;
          font-weight: 900;
          letter-spacing: -0.01em;
          color: oklch(97% 0.01 60);
          margin: 0 0 1rem;
        }

        .ft-brand-desc {
          font-size: 0.875rem;
          line-height: 1.7;
          color: oklch(70% 0.01 60);
          max-width: 32ch;
          margin: 0;
        }

        .ft-contacts {
          display: flex;
          flex-direction: column;
          gap: 0.875rem;
        }

        .ft-contact-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.875rem;
          color: oklch(75% 0.01 60);
        }

        .ft-contact-icon {
          color: var(--color-accent, oklch(62% 0.12 18));
          flex-shrink: 0;
        }

        .ft-socials {
          display: flex;
          gap: 0.75rem;
        }

        .ft-social-link {
          width: 2.25rem;
          height: 2.25rem;
          background: oklch(22% 0.01 250);
          display: flex;
          align-items: center;
          justify-content: center;
          color: oklch(97% 0.01 60);
          transition: background 0.2s, color 0.2s, transform 0.2s;
        }

        .ft-social-link:hover {
          background: var(--color-accent, oklch(62% 0.12 18));
          color: white;
          transform: translateY(-2px);
        }

        /* Standard Columns */
        .ft-col-title {
          font-family: var(--font-body, 'Inter', sans-serif);
          font-size: 0.6875rem;
          font-weight: 600;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: oklch(97% 0.01 60);
          margin: 0 0 1.75rem;
        }

        .ft-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 0.875rem;
        }

        .ft-list-link {
          font-size: 0.875rem;
          color: oklch(70% 0.01 60);
          text-decoration: none;
          transition: color 0.2s, padding-left 0.2s;
          display: inline-block;
        }

        .ft-list-link:hover {
          color: var(--color-accent, oklch(62% 0.12 18));
          padding-left: 4px;
        }

        .ft-hours-card {
          background: oklch(22% 0.01 250);
          padding: 1.25rem;
          border: 1px solid oklch(28% 0.01 250);
          margin-bottom: 1.5rem;
        }

        .ft-hours-card p {
          margin: 0;
          font-size: 0.8125rem;
          line-height: 1.6;
        }

        .ft-hours-label {
          font-size: 0.6875rem;
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: oklch(55% 0.01 250);
          margin-bottom: 0.5rem !important;
        }

        .ft-payment-title {
          font-size: 0.6875rem;
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: oklch(55% 0.01 250);
          margin: 0 0 0.75rem;
        }

        .ft-payment-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.5rem;
        }

        .ft-payment-badge {
          background: oklch(22% 0.01 250);
          border: 1px solid oklch(28% 0.01 250);
          font-size: 0.6875rem;
          font-weight: 600;
          color: oklch(80% 0.01 60);
          text-align: center;
          padding: 0.4rem 0.25rem;
          transition: border-color 0.2s, color 0.2s;
        }

        .ft-payment-badge:hover {
          border-color: var(--color-accent, oklch(62% 0.12 18));
          color: white;
        }

        /* Bottom Bar */
        .ft-bottom {
          border-top: 1px solid oklch(22% 0.01 250);
          padding-top: 2.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
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
          color: oklch(50% 0.01 250);
          margin: 0;
        }

        .ft-bottom-nav {
          display: flex;
          gap: 1.5rem;
        }

        .ft-bottom-link {
          font-size: 0.75rem;
          color: oklch(50% 0.01 250);
          text-decoration: none;
          transition: color 0.2s;
        }

        .ft-bottom-link:hover {
          color: var(--color-accent, oklch(62% 0.12 18));
        }
      `}</style>

      <footer className="ft-footer">
        <div className="ft-container">
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
                {categories.map((category) => (
                  <li key={category}>
                    <a href="#" className="ft-list-link">
                      {category}
                    </a>
                  </li>
                ))}
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
