import React, { useState } from 'react'
import {
    TrashIcon,
    PlusIcon,
    MagnifyingGlassIcon,
    TicketIcon,
    StarIcon,
    BuildingLibraryIcon
} from "@heroicons/react/24/outline"

const Sidebar = ({ activeTab, setActiveTab, isOpen, toggleSidebar }) => {
    const [openSubmenu, setOpenSubmenu] = useState(null)
    const [hoverSubmenu, setHoverSubmenu] = useState(null)


    const navItems = [
        {
            id: 'dashboard', name: 'Dashboard', icon: (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V7h-8v14zm0-18v4h8V3h-8z"></path></svg>
            )
        },
        {
            id: 'products', name: 'Sản phẩm', icon: (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M11 20H4a2 2 0 01-2-2V8a2 2 0 012-2h16a2 2 0 012 2v2M8 12h4m-4 4h4m-4-8h8m-4 12v-2h-4v2h4zm0-6v-2h-4v2h4z"></path></svg>
            )
        },
        {
            id: 'importExport', name: 'Nhập/xuất sản phẩm', icon: (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M11 20H4a2 2 0 01-2-2V8a2 2 0 012-2h16a2 2 0 012 2v2M8 12h4m-4 4h4m-4-8h8m-4 12v-2h-4v2h4zm0-6v-2h-4v2h4z"></path></svg>
            )
        },
        {
            id: 'orders', name: 'Đơn hàng', icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 18a8 8 0 110-16 8 8 0 010 16zm-1-10v4h-2v-4h2zm2 0h2v4h-2v-4z"></path></svg>,
            submenu: [
                { id: 'orders', name: 'Đơn hàng online' },
                { id: 'orders-pos', name: 'Mua tại chỗ (POS)' }
            ]
        },
        {
            id: 'product-categories', name: 'Danh mục', icon: (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15H9v-2h2v2zm0-4H9v-2h2v2zm0-4H9V7h2v2zm4 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V7h2v2z"></path></svg>
            )
        },
        {
            id: 'product-collections', name: 'Bộ sưu tập', icon: (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 8h-4c0-2.76-2.24-5-5-5s-5 2.24-5 5H4c-1.1 0-2 .9-2 2v9c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-5-3c1.66 0 3 1.34 3 3H7c0-1.66 1.34-3 3-3s3 1.34 3 3z"></path></svg>
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
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            )
        },
        {
            id: 'users',
            name: 'Người dùng',
            icon: (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.5.87 2.62 1.94 3.29 2.95V19h4v-2.5c0-2.33-4.67-3.5-7-3.5z"></path></svg>
            ),
            submenu: [
                { id: 'customers', name: 'Khách hàng' },
                { id: 'staff', name: 'Nhân viên' },
                { id: 'supplier', name: 'Nhà cung cấp' }
            ]
        },

        {
            id: 'chat', name: 'Chat với khách', icon: (
                <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path d="M2 5a2 2 0 012-2h16a2 2 0 012 2v11a2 2 0 01-2 2H6l-4 4V5z" />
                </svg>
            )
        },
        {
            id: 'statistics', name: 'Thống kê', icon: (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17 11c.55 0 1 .45 1 1v7c0 .55-.45 1-1 1H7c-.55 0-1-.45-1-1v-7c0-.55.45-1 1-1h10zM7 9V6c0-1.1.9-2 2-2h6c1.1 0 2 .9 2 2v3h-2V6h-6v3H7zm11-4V3h-4V1h-4v2H6v2h12zm-8 4v2h2v-2h-2z"></path></svg>
            )
        },
        {
            id: 'bank', name: 'Ngân hàng', icon: (
                <BuildingLibraryIcon className="w-5 h-5" />
            )
        },
        {
            id: 'settings', name: 'Cài đặt', icon: (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.39-1.07-.75-1.66-1.04l-.35-2.73c-.05-.24-.26-.42-.5-.42h-4c-.25 0-.46.18-.5.42l-.35 2.73c-.59.29-1.14.65-1.66 1.04l-2.49-1c-.22-.08-.49 0-.61.22l-2 3.46c-.12.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.39 1.07.75 1.66 1.04l.35 2.73c.05.24.26.42.5.42h4c.25 0 .46-.18.5-.42l.35-2.73c.59-.29 1.14-.65 1.66-1.04l2.49 1c.22.08.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"></path></svg>
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
             from-white via-pink-50 to-purple-50
            shadow-2xl border-r border-pink-100
            flex flex-col items-center py-6 
            transition-all duration-300 ease-in-out
            ${isOpen ? 'w-64' : 'w-20'}
            z-50
            backdrop-blur-sm
        `}>
            {/* Header */}
            <div className={`flex items-center space-x-3 mb-8 ${isOpen ? 'justify-between w-full px-6' : 'justify-center w-full'}`}>
                {isOpen && (
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">PF</span>
                        </div>
                        <h2 className="text-xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                            PinkFashion
                        </h2>
                    </div>
                )}
                <button
                    onClick={toggleSidebar}
                    className="p-2 rounded-xl bg-white/80 backdrop-blur-sm text-gray-600 hover:bg-gradient-to-r hover:from-pink-500 hover:to-purple-600 hover:text-white transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                    <svg
                        className={`w-5 h-5 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : 'rotate-0'}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"></path>
                    </svg>
                </button>
            </div>

            {/* Navigation */}
            <nav className="w-full flex-1 overflow-y-auto px-3 space-y-1 scrollbar-thin scrollbar-thumb-pink-300 scrollbar-track-transparent">
                {navItems.map((item) => (
                    <div key={item.id} className="group">
                        <a
                            href="#"
                            onClick={(e) => {
                                e.preventDefault()
                                handleNavClick(item)
                            }}
                            className={`
                                flex items-center space-x-3 p-3 rounded-xl transition-all duration-300
                               ${activeTab === item.id || item.submenu?.some(sub => sub.id === activeTab)
                                    ? 'bg-gradient-to-r from-pink-500 to-purple-600  shadow-lg transform scale-105'
                                    : ' hover:bg-white/70 hover:text-pink-600 hover:shadow-md hover:transform hover:scale-102'
                                }
                                ${!isOpen ? 'justify-center' : ''}
                                backdrop-blur-sm
                            `}
                        >
                            <div className={`flex-shrink-0 ${activeTab === item.id ? 'text-white' : ''}`}>
                                {item.icon}
                            </div>

                            {isOpen && (
                                <>
                                    <span className="font-medium text-sm flex-1 truncate">
                                        {item.name}
                                    </span>
                                    {item.submenu && (
                                        <div className={`transform transition-transform duration-200 ${openSubmenu === item.id ? 'rotate-180' : 'rotate-0'}`}>
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M7 10l5 5 5-5z" />
                                            </svg>
                                        </div>
                                    )}
                                </>
                            )}
                        </a>

                        {/* Submenu */}
                        {item.submenu && openSubmenu === item.id && isOpen && (
                            <div className="ml-6 mt-2 space-y-1 animate-fadeIn">
                                {item.submenu.map(sub => (
                                    <a
                                        key={sub.id}
                                        href="#"
                                        onClick={(e) => {
                                            e.preventDefault()
                                            setActiveTab(sub.id)
                                        }}
                                        className={`
                                            block p-2 pl-4 rounded-lg text-sm transition-all duration-200
                                            ${activeTab === sub.id
                                                ? 'bg-gradient-to-r from-pink-100 to-purple-100 text-pink-700 font-semibold border-l-3 border-pink-500'
                                                : ' hover:bg-white/50 hover:text-pink-600 hover:pl-5'
                                            }
                                        `}
                                    >
                                        {sub.name}
                                    </a>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </nav>

            {/* Footer */}


            <style jsx>{`
                .scrollbar-thin {
                    scrollbar-width: thin;
                }
                
                .scrollbar-thin::-webkit-scrollbar {
                    width: 6px;
                }
                
                .scrollbar-thumb-pink-300::-webkit-scrollbar-thumb {
                    background: linear-gradient(to bottom, #f9a8d4, #c084fc);
                    border-radius: 3px;
                }
                
                .scrollbar-thumb-pink-300::-webkit-scrollbar-thumb:hover {
                    background: linear-gradient(to bottom, #f472b6, #a855f7);
                }
                
                .scrollbar-track-transparent::-webkit-scrollbar-track {
                    background: transparent;
                }
                
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                .animate-fadeIn {
                    animation: fadeIn 0.3s ease-out;
                }
                
                .hover\\:scale-102:hover {
                    transform: scale(1.02); 
                }
            `}</style>
        </div>
    )
}

export default Sidebar