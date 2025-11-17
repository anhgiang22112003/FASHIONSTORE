import React, { useContext, useEffect, useState, useRef } from 'react'
import { Search, ShoppingBag, User, Menu, X, Heart, Sparkles, ChevronDown } from 'lucide-react'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
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
  const notificationRef = useRef(null)
  const profileRef = useRef(null)
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const [categories, setCategories] = useState([])
  const { wishlist } = useContext(WishlistContext)
  const { user, logout } = useContext(AuthContext)
  const { cart } = useContext(CartContext)
  const [unreadCount, setUnreadCount] = useState(0)
  const [showDropdown, setShowDropdown] = useState(false)
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false)
  const [isHoveringCategory, setIsHoveringCategory] = useState(false)
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
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notificationRef.current && !notificationRef.current.contains(e.target)) {
        setShowDropdown(false)
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await apiUser.get('/categories')
        setCategories(res.data.data || [])
      } catch (error) {
        console.error('Lỗi khi lấy danh mục:', error)
      }
    }
    fetchCategories()
  }, [])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden'
      document.body.style.position = 'fixed'
      document.body.style.width = '100%'
    } else {
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.width = ''
    }
    return () => {
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.width = ''
    }
  }, [isMenuOpen])

  const navItems = [
    { name: 'Trang chủ', href: '/' },
    { name: 'Giới thiệu', href: '/about' },
    { name: 'Blog', href: '/blog' }
  ]

  return (
    <>
      <header className="sticky top-0 border-b border-border backdrop-blur-lg bg-white/95" style={{ zIndex: 50 }}>
        {/* Top banner with gradient */}
        <div className="gradient-primary bg-pink-500 text-primary-foreground text-center py-2.5 text-sm font-medium relative overflow-hidden">
          <div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"
            style={{ backgroundSize: '200% 100%' }}
          ></div>
          <div className="relative flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 animate-pulse" />
            <span className="text-xs sm:text-sm">🎉 Miễn phí vận chuyển cho đơn hàng từ 500K - Hotline: 1900 1234</span>
            <Sparkles className="w-4 h-4 animate-pulse" />
          </div>
        </div>

        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo with gradient text */}
            <div className="flex-shrink-0">
              <Link to="/" className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight group">
                <span className="text-foreground group-hover:text-gradient transition-all">FASHION</span>
                <span className="text-gradient">STORE</span>
              </Link>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex space-x-1 items-center">
              {/* Categories with Hover Submenu */}
              <div
                className="relative"
                onMouseEnter={() => setIsHoveringCategory(true)}
                onMouseLeave={() => setIsHoveringCategory(false)}
              >
                <button
                  className="relative px-4 py-2 text-sm font-semibold text-foreground/70 hover:text-foreground transition-all group flex items-center gap-1"
                  style={{ cursor: 'pointer' }}
                >
                  Danh mục
                  <ChevronDown
                    className="w-4 h-4 transition-transform"
                    style={{
                      transform: isHoveringCategory ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.3s ease'
                    }}
                  />
                  <span
                    className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-primary transition-transform origin-left"
                    style={{
                      transform: isHoveringCategory ? 'scaleX(1)' : 'scaleX(0)',
                      transition: 'transform 0.3s ease'
                    }}
                  ></span>
                </button>

                {/* Submenu with beautiful styling */}
                <div
                  className="absolute left-0 mt-2 w-72 bg-card rounded-2xl shadow-2xl border border-border overflow-hidden"
                  style={{
                    opacity: isHoveringCategory ? 1 : 0,
                    visibility: isHoveringCategory ? 'visible' : 'hidden',
                    transform: isHoveringCategory ? 'translateY(0)' : 'translateY(-10px)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 240, 245, 0.95) 100%)',
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 192, 203, 0.1)',
                    zIndex: 1001
                  }}
                >
                  {/* Submenu Header */}
                  <div
                    className="px-5 py-4 border-b border-pink-100"
                    style={{
                      background: 'linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%)'
                    }}
                  >
                    <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-pink-500" />
                      Danh mục sản phẩm
                    </h3>
                  </div>

                  {/* Categories List */}
                  <div
                    className="py-2 max-h-96 overflow-y-auto"
                    style={{
                      scrollbarWidth: 'thin',
                      scrollbarColor: '#ec4899 #fce7f3'
                    }}
                  >
                    {categories.map((category, index) => (
                      <button
                        key={category._id}
                        onClick={() => {
                          navigate(`/category/${category.slug || category.name.replace(/\s+/g, '-').toLowerCase()}`, {
                            state: { id: category._id },
                          })
                          setIsHoveringCategory(false)
                        }}
                        className="w-full text-left px-5 py-3 text-sm font-medium text-gray-700 hover:bg-pink-50 transition-all group relative"
                        style={{
                          animation: isHoveringCategory ? `slideIn 0.3s ease ${index * 0.05}s both` : 'none'
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <span className="group-hover:text-pink-600 transition-colors">
                            {category.name}
                          </span>
                          <ChevronDown
                            className="w-4 h-4 text-gray-400 group-hover:text-pink-500 transition-all"
                            style={{
                              transform: 'rotate(-90deg)'
                            }}
                          />
                        </div>
                        <div
                          className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-pink-400 to-pink-600"
                          style={{
                            transform: 'scaleY(0)',
                            transition: 'transform 0.3s ease',
                            transformOrigin: 'top'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.transform = 'scaleY(1)'}
                        ></div>
                      </button>
                    ))}
                  </div>

                  {/* Submenu Footer */}
                  {categories.length === 0 && (
                    <div className="px-5 py-8 text-center text-gray-500 text-sm">
                      Chưa có danh mục nào
                    </div>
                  )}
                </div>
              </div>

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
                  className="relative flex items-center justify-center h-9 w-9 sm:h-10 sm:w-10 rounded-full transition-all group"
                >
                  <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-foreground transition-colors" />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center shadow-lg">
                      {wishlistCount}
                    </span>
                  )}
                </Button>
              </Link>

              {/* Cart */}
              <Button
                variant="ghost"
                size="sm"
                className="relative h-9 w-9 sm:h-10 sm:w-10 rounded-full hover:bg-accent transition-all group"
                onClick={() => navigate('/cart')}
              >
                <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-foreground transition-colors" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center shadow-lg">
                    {totalItems}
                  </span>
                )}
              </Button>

              {/* User */}
              {user ? (
                <>
                  <div className="relative block" ref={notificationRef}>
                    <button
                      onClick={() => setShowDropdown(!showDropdown)}
                      className="p-2 rounded-full text-foreground hover:bg-accent transition-all relative group"
                    >
                      <BellIcon className="w-5 h-5 sm:w-6 sm:h-6 transition-colors" />
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center shadow-lg">
                          {unreadCount}
                        </span>
                      )}
                    </button>

                    {showDropdown && <NotificationUser userId={user?.id} onNotificationsChange={setUnreadCount} />}
                  </div>

                  <div className="relative hidden sm:block" ref={profileRef}>
                    <button
                      onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                      className="flex items-center gap-2 p-1 rounded-full hover:bg-accent transition-all group"
                    >
                      <UserCircleIcon className="w-7 h-7 sm:w-8 sm:h-8 text-foreground transition-colors" />
                      <span className="font-semibold text-foreground text-sm sm:text-base">
                        {user.name}
                      </span>
                    </button>

                    {isProfileMenuOpen && (
                      <div
                        className="absolute right-0 mt-3 w-72 bg-card rounded-2xl shadow-xl border border-border overflow-hidden z-50 animate-slideDownFade"
                        ref={profileRef}
                      >
                        <div
                          className="px-5 py-4 border-b border-border"
                          style={{
                            background: 'linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%)'
                          }}
                        >
                          <p className="font-bold text-foreground text-lg">{user?.name}</p>
                          <p className="text-sm text-muted-foreground">{user?.email}</p>
                        </div>
                        <div className="py-2">
                          <button
                            onClick={() => {
                              navigate('/profile')
                              setIsProfileMenuOpen(false)
                            }}
                            className="flex items-center w-full px-5 py-3 text-sm text-foreground hover:bg-accent transition-all group"
                          >
                            <Cog6ToothIcon className="w-5 h-5 mr-3 text-muted-foreground group-hover:text-primary transition-colors" />
                            <span className="group-hover:text-primary transition-colors">Cài đặt tài khoản</span>
                          </button>
                          <button
                            onClick={() => {
                              logout()
                              setIsProfileMenuOpen(false)
                            }}
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
                <Link to="/login" className="hidden sm:block">
                  <Button variant="ghost" size="sm" className="h-9 w-9 sm:h-10 sm:w-10 rounded-full hover:bg-accent group">
                    <User className="w-4 h-4 sm:w-5 sm:h-5 text-foreground group-hover:text-primary transition-colors" />
                  </Button>
                </Link>
              )}

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden h-9 w-9 rounded-full hover:bg-accent"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Overlay - Must be rendered outside header */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm md:hidden"
          style={{
            zIndex: 99998,
            animation: 'fadeIn 0.3s ease'
          }}
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Mobile Navigation - Must be rendered outside header */}
      <div
        className="fixed top-0 right-0 h-full w-full max-w-sm bg-white shadow-2xl transform transition-all duration-300 md:hidden"
        style={{
          zIndex: 99999,
          transform: isMenuOpen ? 'translateX(0)' : 'translateX(100%)',
          boxShadow: isMenuOpen ? '-10px 0 50px rgba(0, 0, 0, 0.5)' : 'none'
        }}
      >
        <div
          className="flex justify-between items-center px-6 py-5 border-b border-pink-200"
          style={{
            background: 'linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%)'
          }}
        >
          <h2 className="text-xl font-bold text-gray-800">Menu</h2>
          <button
            onClick={() => setIsMenuOpen(false)}
            className="hover:bg-white/50 p-2 rounded-full transition-all"
          >
            <X className="w-6 h-6 text-gray-800" />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto h-[calc(100%-80px)]">
          <div className="relative group">
            <Search className="absolute left-4 top-3.5 text-muted-foreground w-4 h-4 group-hover:text-primary transition-colors" />
            <Input
              type="text"
              placeholder="Tìm kiếm..."
              className="pl-11 pr-4 py-3 w-full rounded-full border-2 border-pink-200 focus:border-pink-500 transition-all"
            />
          </div>

          <div className="space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="block py-3 px-4 text-gray-700 hover:bg-pink-50 hover:text-pink-600 font-semibold rounded-xl transition-all"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}

            {/* Mobile Categories with Beautiful Accordion */}
            <div className="border-t border-pink-200 pt-2 mt-2">
              <button
                onClick={() => setIsCategoryMenuOpen(!isCategoryMenuOpen)}
                className="flex items-center justify-between w-full py-3 px-4 text-gray-700 hover:bg-pink-50 hover:text-pink-600 font-semibold rounded-xl transition-all"
                style={{
                  background: isCategoryMenuOpen ? 'linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%)' : 'transparent'
                }}
              >
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Danh mục
                </span>
                <ChevronDown
                  className="w-4 h-4 transition-transform"
                  style={{
                    transform: isCategoryMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.3s ease'
                  }}
                />
              </button>

              <div
                style={{
                  maxHeight: isCategoryMenuOpen ? '500px' : '0',
                  overflow: 'hidden',
                  transition: 'max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                <div className="ml-4 space-y-1 mt-2 pb-2">
                  {categories.map((category, index) => (
                    <Link
                      key={category._id}
                      className="block py-2.5 px-4 text-gray-700 hover:bg-pink-50 hover:text-pink-600 rounded-lg transition-all text-sm font-medium relative group"
                      onClick={() => {
                        navigate(`/category/${category.slug || category.name.replace(/\s+/g, '-').toLowerCase()}`, {
                          state: { id: category._id },
                        })
                        setIsMenuOpen(false)
                      }}
                      style={{
                        animation: isCategoryMenuOpen ? `slideIn 0.3s ease ${index * 0.05}s both` : 'none'
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span>{category.name}</span>
                        <ChevronDown
                          className="w-3 h-3 text-gray-400 group-hover:text-pink-500 transition-all"
                          style={{ transform: 'rotate(-90deg)' }}
                        />
                      </div>
                      <div
                        className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-pink-400 to-pink-600 rounded-r"
                        style={{
                          transform: 'scaleY(0)',
                          transition: 'transform 0.3s ease',
                          transformOrigin: 'top'
                        }}
                      ></div>
                    </Link>
                  ))}

                  {categories.length === 0 && (
                    <div className="px-4 py-6 text-center text-gray-500 text-sm">
                      Chưa có danh mục nào
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Mobile User Menu */}
            {user && (
              <div className="border-t border-pink-200 pt-4 mt-4 space-y-2">
                <div
                  className="px-4 py-3 rounded-xl"
                  style={{
                    background: 'linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%)'
                  }}
                >
                  <p className="font-bold text-gray-800">{user?.name}</p>
                  <p className="text-sm text-gray-600">{user?.email}</p>
                </div>
                <button
                  onClick={() => {
                    navigate('/profile')
                    setIsMenuOpen(false)
                  }}
                  className="flex items-center w-full px-4 py-3 text-gray-700 hover:bg-pink-50 rounded-xl transition-all"
                >
                  <Cog6ToothIcon className="w-5 h-5 mr-3" />
                  <span>Cài đặt tài khoản</span>
                </button>
                <button
                  onClick={() => {
                    logout()
                    setIsMenuOpen(false)
                  }}
                  className="flex items-center w-full px-4 py-3 text-gray-700 hover:bg-pink-50 rounded-xl transition-all"
                >
                  <ArrowRightStartOnRectangleIcon className="w-5 h-5 mr-3" />
                  <span>Đăng xuất</span>
                </button>
              </div>
            )}

            {!user && (
              <Link
                to="/login"
                className="block py-3 px-4 text-center text-white font-semibold rounded-xl transition-all mt-4"
                onClick={() => setIsMenuOpen(false)}
                style={{
                  background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)'
                }}
              >
                Đăng nhập
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Inline Styles for Animations */}
      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        /* Custom Scrollbar for Submenu */
        .overflow-y-auto::-webkit-scrollbar {
          width: 6px;
        }

        .overflow-y-auto::-webkit-scrollbar-track {
          background: #fce7f3;
          border-radius: 10px;
        }

        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #ec4899 0%, #db2777 100%);
          border-radius: 10px;
        }

        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #db2777 0%, #be185d 100%);
        }

        /* Hover effect for submenu items */
        button:hover .absolute {
          transform: scaleY(1) !important;
        }
           @keyframes slideDownFade {
    0% {
      opacity: 0;
      transform: translateY(-10px) scale(0.98);
    }
    100% {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  .animate-slideDownFade {
    animation: slideDownFade 0.25s ease-out;
  }
          
      `}</style>
    </>
  )
}

export default Header