import React, { useContext, useEffect, useState } from 'react';
import { Search, ShoppingBag, User, Menu, X, Heart } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Link, useNavigate } from 'react-router-dom';
import {
  BellIcon,
  UserCircleIcon,
  Bars3Icon,
  Cog6ToothIcon,
  ArrowRightStartOnRectangleIcon,
  QuestionMarkCircleIcon,
  TicketIcon,
  CurrencyDollarIcon,
  UserPlusIcon,
} from '@heroicons/react/24/outline';
import { ChatBubbleBottomCenterTextIcon } from '@heroicons/react/24/solid';
import { AuthContext } from '@/context/Authcontext';
const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [cartCount] = useState(3);
  const navigate = useNavigate();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);

  const { user, logout } = useContext(AuthContext);
  
  const toggleNotifications = () => {
    setIsNotificationsOpen(!isNotificationsOpen);
    setIsProfileMenuOpen(false);
    setIsMessagesOpen(false);
  };

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
    setIsNotificationsOpen(false);
    setIsMessagesOpen(false);
  };

  const toggleMessages = () => {
    setIsMessagesOpen(!isMessagesOpen);
    setIsNotificationsOpen(false);
    setIsProfileMenuOpen(false);
  };
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
            <Link to={"/wishlist"}>
              <Button variant="ghost" size="sm" className="hidden sm:flex">
                <Heart className="w-5 h-5" />
              </Button>
            </Link>
            {user ? <>
             <div className="flex items-center space-x-4 ml-auto">
              {/* Icon thông báo */}
              <div className="relative">
                <button
                  onClick={toggleNotifications}
                  className="p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-pink-600 transition-colors"
                >
                  <BellIcon className="w-6 h-6" />
                  <span className="absolute top-2 right-2 block h-2 w-2 rounded-full ring-2 ring-white bg-red-500"></span>
                </button>
                {isNotificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl py-2 z-10">
                    <div className="px-4 py-2 border-b border-gray-200">
                      <h4 className="font-semibold text-gray-800">Thông báo (4)</h4>
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      <div className="px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-100">
                        <p className="text-sm font-medium text-pink-600">Đơn hàng mới cần xử lý</p>
                        <p className="text-xs text-gray-500">Đơn hàng #DH123456 vừa được tạo.</p>
                      </div>
                      <div className="px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-100">
                        <p className="text-sm font-medium text-yellow-600">Sản phẩm sắp hết kho</p>
                        <p className="text-xs text-gray-500">Váy Xòe Dịu Dàng chỉ còn 5 sản phẩm.</p>
                      </div>
                      <div className="px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-100">
                        <p className="text-sm font-medium text-blue-600">Đánh giá mới</p>
                        <p className="text-xs text-gray-500">Khách hàng A đã đánh giá sản phẩm Áo Khoác.</p>
                      </div>
                      <div className="px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer">
                        <p className="text-sm font-medium text-green-600">Báo cáo doanh thu</p>
                        <p className="text-xs text-gray-500">Báo cáo doanh thu hàng ngày đã sẵn sàng.</p>
                      </div>
                    </div>
                    <div className="px-4 py-2 border-t border-gray-200 text-center">
                      <a href="#" className="text-sm font-medium text-pink-600 hover:underline">Xem tất cả</a>
                    </div>
                  </div>
                )}
              </div>

              {/* Icon tin nhắn */}
              <div className="relative">
                <button
                  onClick={toggleMessages}
                  className="p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-pink-600 transition-colors"
                >
                  <ChatBubbleBottomCenterTextIcon className="w-6 h-6" />
                  <span className="absolute top-2 right-2 block h-2 w-2 rounded-full ring-2 ring-white bg-blue-500"></span>
                </button>
                {isMessagesOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl py-2 z-10">
                    <div className="px-4 py-2 border-b border-gray-200">
                      <h4 className="font-semibold text-gray-800">Tin nhắn (2)</h4>
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      <div className="px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-800">Tin nhắn mới từ Nguyễn Văn A</p>
                        <p className="text-xs text-gray-500 truncate">Sản phẩm này còn hàng không bạn?</p>
                      </div>
                      <div className="px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer">
                        <p className="text-sm font-medium text-gray-800">Khiếu nại từ Trần Thị B</p>
                        <p className="text-xs text-gray-500 truncate">Sản phẩm giao không đúng màu sắc tôi đã chọn.</p>
                      </div>
                    </div>
                    <div className="px-4 py-2 border-t border-gray-200 text-center">
                      <a href="#" className="text-sm font-medium text-pink-600 hover:underline">Xem tất cả tin nhắn</a>
                    </div>
                  </div>
                )}
              </div>

              {/* Profile Menu Icon */}
              <div className="relative">
                <button
                  onClick={toggleProfileMenu}
                  className="flex items-center space-x-2 px-2 py-1 rounded-full text-gray-700 hover:bg-gray-200 transition-colors"
                >
                  <UserCircleIcon className="w-8 h-8 text-gray-600" />
                  <span className="font-medium hidden md:block"></span>
                </button>
                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl py-2 z-10">
                    <div className="px-4 py-2 border-b border-gray-200">
                      <p className="font-semibold text-gray-800">{user?.user?.name}</p>
                    </div>
                    <div className="py-2 space-y-1">
                      <a onClick={() => navigate("/profile")} href="#" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                        <Cog6ToothIcon className="w-5 h-5 mr-2 text-gray-500" />
                        Cài đặt tài khoản
                      </a>
                      <a href="#" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                        <QuestionMarkCircleIcon className="w-5 h-5 mr-2 text-gray-500" />
                        Hỗ trợ
                      </a>
                      <a onClick={logout} href="#" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                        <ArrowRightStartOnRectangleIcon className="w-5 h-5 mr-2 text-gray-500" />
                        Đăng xuất
                      </a>
                    </div>
                  
                  </div>
                )}
              </div>
            </div></> : <Link to={"/login"}>
              <Button variant="ghost" size="sm" className="hidden sm:flex">
                <User className="w-5 h-5" />
              </Button>
            </Link>
             }
           
            
            <Button
              variant="ghost"
              size="sm"
              className="relative"
              onClick={() => navigate('/cart')}
            >
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
                <Link
                  key={item.name}
                  to={item.href}
                  className="block px-2 py-2 text-gray-700 hover:text-pink-500 font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;