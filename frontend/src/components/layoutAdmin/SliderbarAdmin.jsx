import React, { useState } from 'react'
import {
  TicketIcon,
  StarIcon,
  BuildingLibraryIcon
} from "@heroicons/react/24/outline"

const Sidebar = ({ activeTab, setActiveTab, isOpen, toggleSidebar }) => {
  const [openSubmenu, setOpenSubmenu] = useState(null)

  const navItems = [
    {
      id: 'dashboard', name: 'Dashboard', icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z"></path></svg>
      )
    },
    {
      id: 'products', name: 'Sản phẩm', icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
      )
    },
    {
      id: 'importExport', name: 'Nhập/xuất sản phẩm', icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg>
      )
    },
    {
      id: 'orders', name: 'Đơn hàng', icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
      ),
      submenu: [
        { id: 'orders', name: 'Đơn hàng' },
        { id: 'orders-pos', name: 'Mua tại chỗ (POS)' },
        { id: 'compalint', name: 'Chiết khấu khiếu nại' }
      ]
    },
    {
      id: 'product-categories', name: 'Danh mục', icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7"></path></svg>
      )
    },
    {
      id: 'product-collections', name: 'Bộ sưu tập', icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
      )
    },
    {
      id: 'review', name: 'Đánh giá', icon: (
        <StarIcon className="w-5 h-5" />
      )
    },
    {
      id: 'promotion', name: 'Khuyến mại', icon: (
        <TicketIcon className="w-5 h-5" />
      )
    },
    {
      id: 'flash-sale', name: 'Flash Sale', icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
      )
    },
    {
      id: 'users',
      name: 'Người dùng',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
      ),
      submenu: [
        { id: 'customers', name: 'Khách hàng' },
        { id: 'staff', name: 'Nhân viên' },
        { id: 'supplier', name: 'Nhà cung cấp' }
      ]
    },
    {
      id: 'chat', name: 'Chat với khách', icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
      )
    },
    {
      id: 'statistics', name: 'Thống kê', icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2"></path></svg>
      )
    },
    {
      id: 'bank', name: 'Ngân hàng', icon: (
        <BuildingLibraryIcon className="w-5 h-5" />
      )
    },
    {
      id: 'settings', name: 'Cài đặt', icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
      )
    },
  ]

  const handleNavClick = (item) => {
    if (item.submenu) {
      setOpenSubmenu(openSubmenu === item.id ? null : item.id)
    } else {
      setActiveTab(item.id)
      setOpenSubmenu(null)
    }
  }

  return (
    <div className={`
      fixed lg:relative
      h-screen lg:h-auto
      bg-slate-900 text-slate-300
      shadow-2xl border-r border-slate-800
      flex flex-col items-center py-6 
      transition-all duration-300 ease-in-out
      ${isOpen ? 'w-64 translate-x-0' : 'w-20 -translate-x-full lg:translate-x-0'}
      z-50
      scrollbar-none
    `}>
      {/* Brand Header */}
      <div className={`flex items-center mb-8 ${isOpen ? 'justify-between w-full px-6' : 'justify-center w-full'}`}>
        {isOpen ? (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-extrabold text-sm">PF</span>
            </div>
            <h2 className="text-lg font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent tracking-wide">
              PinkFashion
            </h2>
          </div>
        ) : (
          <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg cursor-pointer" onClick={toggleSidebar}>
            <span className="text-white font-extrabold text-sm">PF</span>
          </div>
        )}
      </div>

      {/* Navigation Menu */}
      <nav className="w-full flex-1 overflow-y-auto px-3 space-y-1 select-none">
        {navItems.map((item) => {
          const isSelected = activeTab === item.id || item.submenu?.some(sub => sub.id === activeTab)
          
          return (
            <div key={item.id} className="group">
              <button
                onClick={() => handleNavClick(item)}
                className={`
                  w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-200
                  ${isSelected
                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg shadow-pink-900/20'
                    : 'hover:bg-slate-800/60 hover:text-slate-100'
                  }
                  ${!isOpen ? 'justify-center' : ''}
                `}
              >
                <div className={`flex-shrink-0 ${isSelected ? 'text-white' : 'text-slate-400 group-hover:text-slate-100'}`}>
                  {item.icon}
                </div>

                {isOpen && (
                  <>
                    <span className="font-semibold text-sm flex-1 text-left truncate">
                      {item.name}
                    </span>
                    {item.submenu && (
                      <div className={`transform transition-transform duration-200 ${openSubmenu === item.id ? 'rotate-180' : 'rotate-0'}`}>
                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    )}
                  </>
                )}
              </button>

              {/* Submenu rendering */}
              {item.submenu && openSubmenu === item.id && isOpen && (
                <div className="ml-6 mt-1 space-y-1 pl-3 border-l border-slate-800">
                  {item.submenu.map(sub => {
                    const isSubSelected = activeTab === sub.id
                    return (
                      <button
                        key={sub.id}
                        onClick={() => setActiveTab(sub.id)}
                        className={`
                          w-full block p-2 pl-3 rounded-lg text-xs font-semibold text-left transition-all duration-150
                          ${isSubSelected
                            ? 'text-pink-400 bg-slate-800'
                            : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/40'
                          }
                        `}
                      >
                        {sub.name}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </nav>
    </div>
  )
}

export default Sidebar