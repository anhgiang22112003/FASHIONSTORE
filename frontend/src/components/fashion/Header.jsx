import React, { useState } from 'react';
import { Search, ShoppingBag, User, Menu, X, Heart } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Link, useNavigate } from 'react-router-dom';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [cartCount] = useState(3);
  const navigate = useNavigate();

  const navItems = [
    { name: 'Trang chủ', href: '/' },
    { name: 'Nữ', href: '/category/women' },
    { name: 'Nam', href: '/category/men' },
    { name: 'Phụ kiện', href: '/category/accessories' },
    { name: 'Giới thiệu', href: '/about' },
    { name: 'Blog', href: '/blog' }
  ];

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      {/* Top banner */}
      <div className="bg-black text-white text-center py-2 text-sm">
        🎉 Miễn phí vận chuyển cho đơn hàng từ 500K - Hotline: 1900 1234
      </div>

      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="text-2xl font-bold text-gray-900">
              FASHION
              <span className="text-pink-500">STORE</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="text-gray-700 hover:text-pink-500 font-medium transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Search Bar */}
          <div className="hidden lg:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                className="pl-10 pr-4 py-2 w-full border-gray-300 rounded-full focus:ring-pink-500 focus:border-pink-500"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="hidden sm:flex">
              <Heart className="w-5 h-5" />
            </Button>
            
            <Button variant="ghost" size="sm" className="hidden sm:flex">
              <User className="w-5 h-5" />
            </Button>
            
            <Button variant="ghost" size="sm" className="relative">
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Button>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="flex flex-col space-y-4">
              <div className="px-2">
                <Input
                  type="text"
                  placeholder="Tìm kiếm..."
                  className="w-full"
                />
              </div>
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="block px-2 py-2 text-gray-700 hover:text-pink-500 font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;