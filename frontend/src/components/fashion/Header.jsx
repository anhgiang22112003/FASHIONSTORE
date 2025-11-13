import React, { useContext, useEffect, useState } from 'react'
import { Search, ShoppingBag, User, Menu, X, Heart, Sparkles } from 'lucide-react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Link, useNavigate } from 'react-router-dom'
import {
  UserCircleIcon,
  BellIcon,
  Cog6ToothIcon,
  ArrowRightStartOnRectangleIcon,
} from '@heroicons/react/24/outline'
import { AuthContext } from '@/context/Authcontext'
import { CartContext } from '@/context/CartContext'
import { WishlistContext } from '@/context/WishlistContext'
import NotificationUser from './NotificationUser'
import apiUser from '@/service/api'

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const navigate = useNavigate()
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const { wishlist } = useContext(WishlistContext)
  const { user, logout } = useContext(AuthContext)
  const { cart } = useContext(CartContext)
  const [unreadCount, setUnreadCount] = useState(0)
  const [showDropdown, setShowDropdown] = useState(false)
  const totalItems = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0
  const wishlistCount = wishlist?.length
  
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const res = await apiUser.get(`/notifications/user/${user?.id}`)
        const notificationData = res.data || []
        const unreadCount = notificationData.filter(n => !n.isRead).length
        setUnreadCount(unreadCount)
      } catch (error) {
        console.error('Lỗi khi lấy thông báo:', error)
      }
    }
    fetchUnreadCount()
  }, [user])
  const navItems = [
    { name: 'Trang chủ', href: '/' },
    { name: 'Nữ', href: '/category/women' },
    { name: 'Nam', href: '/category/men' },
    { name: 'Phụ kiện', href: '/category/accessories' },
    { name: 'Giới thiệu', href: '/about' },
    { name: 'Blog', href: '/blog' }
  ]

  return (
    <header className="sticky top-0 z-50 border-b border-border backdrop-blur-lg">
      {/* Top banner with gradient */}
      <div className="gradient-primary bg-pink-500  text-primary-foreground text-center py-2.5 text-sm font-medium relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" 
             style={{ backgroundSize: '200% 100%' }}></div>
        <div className="relative flex items-center justify-center gap-2">
          <Sparkles className="w-4 h-4 animate-pulse" />
          <span>🎉 Miễn phí vận chuyển cho đơn hàng từ 500K - Hotline: 1900 1234</span>
          <Sparkles className="w-4 h-4 animate-pulse" />
        </div>
      </div>

      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo with gradient text */}
          <div className="flex-shrink-0">
            <Link to="/" className="text-2xl md:text-3xl font-black tracking-tight group">
              <span className="text-foreground group-hover:text-gradient transition-all">FASHION</span>
              <span className="text-gradient">STORE</span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="relative px-4 py-2 text-sm font-semibold text-foreground/70 hover:text-foreground transition-all group"
              >
                {item.name}
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-primary scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
              </Link>
            ))}
          </nav>

          {/* Search Bar */}
          <div className="hidden lg:flex flex-1 max-w-md mx-8">
            <div className="relative w-full group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 group-hover:text-primary transition-colors" />
              <Input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                className="pl-11 pr-4 py-2.5 w-full rounded-full border-2 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-1 sm:space-x-2">
            {/* Wishlist */}
            <Link to="/wishlist">
              <Button
                variant="ghost"
                size="sm"
                className="relative flex items-center justify-center h-10 w-10 rounded-full  transition-all group"
              >
                <Heart className="w-5 h-5 text-foreground  transition-colors" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-primary text-red-600 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-bounce-in shadow-glow-sm">
                    {wishlistCount}
                  </span>
                )}
              </Button>
            </Link>

            {/* Cart */}
            <Button
              variant="ghost"
              size="sm"
              className="relative h-10 w-10 rounded-full hover:bg-accent transition-all group"
              onClick={() => navigate('/cart')}
            >
              <ShoppingBag className="w-5 h-5 text-foreground  transition-colors" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-primary text-red-600 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-bounce-in shadow-glow-sm">
                  {totalItems}
                </span>
              )}
            </Button>

            {/* User */}
            {user ? (
              <>
                <div className="relative">
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="p-2 rounded-full text-foreground hover:bg-accent transition-all relative group"
                  >
                    <BellIcon className="w-6 h-6  transition-colors" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 text-red-600 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center ">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {showDropdown && <NotificationUser userId={user?.id} onNotificationsChange={setUnreadCount} />}
                </div>

                <div className="relative">
                  <button
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="p-1 rounded-full hover:bg-accent transition-all group"
                  >
                    <UserCircleIcon className="w-8 h-8 text-foreground  transition-colors" />
                  </button>
                  {isProfileMenuOpen && (
                    <div className="absolute right-0 mt-3 w-72 bg-card rounded-2xl shadow-xl border border-border overflow-hidden animate-slide-up">
                      <div className="px-5 py-4 bg-gradient-pink-soft border-b border-border">
                        <p className="font-bold text-foreground text-lg">{user?.name}</p>
                        <p className="text-sm text-muted-foreground">{user?.email}</p>
                      </div>
                      <div className="py-2">
                        <button
                          onClick={() => navigate('/profile')}
                          className="flex items-center w-full px-5 py-3 text-sm text-foreground hover:bg-accent transition-all group"
                        >
                          <Cog6ToothIcon className="w-5 h-5 mr-3 text-muted-foreground group-hover:text-primary transition-colors" />
                          <span className="group-hover:text-primary transition-colors">Cài đặt tài khoản</span>
                        </button>
                        <button
                          onClick={logout}
                          className="flex items-center w-full px-5 py-3 text-sm text-foreground hover:bg-accent transition-all group"
                        >
                          <ArrowRightStartOnRectangleIcon className="w-5 h-5 mr-3 text-muted-foreground group-hover:text-destructive transition-colors" />
                          <span className="group-hover:text-destructive transition-colors">Đăng xuất</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <Link to="/login">
                <Button variant="ghost" size="sm" className="h-10 w-10 rounded-full hover:bg-accent group">
                  <User className="w-5 h-5 text-foreground group-hover:text-primary transition-colors" />
                </Button>
              </Link>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden h-10 w-10 rounded-full hover:bg-accent"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation - Fixed positioning and proper containment */}
           <div
        className={`fixed top-0 right-0 h-full w-80 bg-card shadow-2xl transform transition-transform duration-300 z-50 md:hidden ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex justify-between items-center px-6 py-5 border-b border-border bg-gradient-pink-soft">
          <h2 className="text-xl font-bold text-foreground">Menu</h2>
          <button onClick={() => setIsMenuOpen(false)} className="hover:bg-accent p-2 rounded-full transition-all">
            <X className="w-6 h-6 text-foreground" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="relative group">
            <Search className="absolute left-4 top-3.5 text-muted-foreground w-4 h-4 group-hover:text-primary transition-colors" />
            <Input
              type="text"
              placeholder="Tìm kiếm..."
              className="pl-11 pr-4 py-3 w-full rounded-full border-2 border-border focus:border-primary transition-all"
            />
          </div>

          <div className="space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="block py-3 px-4 text-foreground hover:bg-accent hover:text-primary font-semibold rounded-xl transition-all"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Overlay */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </header>
  )
}

export default Header