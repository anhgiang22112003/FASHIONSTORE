import React from 'react';
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
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-8">
          {/* Company Info */}
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-bold text-white mb-4">
                FASHION<span className="text-pink-500">STORE</span>
              </h3>
              <p className="text-gray-400 leading-relaxed">
                Thương hiệu thời trang hàng đầu Việt Nam, mang đến những sản phẩm 
                chất lượng cao với thiết kế hiện đại và phong cách.
              </p>
            </div>

            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-pink-500" />
                <span>Hotline: 1900 1234</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-pink-500" />
                <span>Email: contact@fashionstore.vn</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-pink-500" />
                <span>123 Nguyễn Huệ, Q1, TP.HCM</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-pink-500 transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-6">Liên kết nhanh</h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="hover:text-pink-500 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-6">Danh mục</h4>
            <ul className="space-y-3">
              {categories.map((category) => (
                <li key={category}>
                  <a
                    href="#"
                    className="hover:text-pink-500 transition-colors"
                  >
                    {category}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-6">Hỗ trợ khách hàng</h4>
            <div className="space-y-4">
              <div>
                <p className="text-sm mb-2">Giờ làm việc:</p>
                <p className="text-white">T2 - T6: 8:00 - 22:00</p>
                <p className="text-white">T7 - CN: 9:00 - 21:00</p>
              </div>
              
              <div>
                <p className="text-sm mb-3">Phương thức thanh toán:</p>
                <div className="grid grid-cols-3 gap-2">
                  {paymentMethods.map((method) => (
                    <div
                      key={method}
                      className="bg-gray-800 rounded px-2 py-1 text-xs text-center"
                    >
                      {method}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500">
              © 2025 FashionStore. All rights reserved.
            </p>
            
            <div className="flex items-center gap-6 text-sm">
              <a href="#" className="hover:text-pink-500 transition-colors">
                Chính sách bảo mật
              </a>
              <a href="#" className="hover:text-pink-500 transition-colors">
                Điều khoản
              </a>
              <a href="#" className="hover:text-pink-500 transition-colors">
                Sitemap
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;