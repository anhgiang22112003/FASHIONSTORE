import React from 'react'

const Sidebar = ({ activeTab, setActiveTab, isOpen, toggleSidebar }) => {
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
            id: 'orders', name: 'Đơn hàng', icon: (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 18a8 8 0 110-16 8 8 0 010 16zm-1-10v4h-2v-4h2zm2 0h2v4h-2v-4z"></path></svg>
            )
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
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fill-rule="evenodd" clip-rule="evenodd" d="M15 14.25C13.3431 14.25 12 15.5931 12 17.25C12 18.9069 13.3431 20.25 15 20.25C16.6569 20.25 18 18.9069 18 17.25C18 15.5931 16.6569 14.25 15 14.25ZM10.5 17.25C10.5 14.7647 12.5147 12.75 15 12.75C17.4853 12.75 19.5 14.7647 19.5 17.25C19.5 19.7353 17.4853 21.75 15 21.75C12.5147 21.75 10.5 19.7353 10.5 17.25Z" fill="#080341"></path> <path fill-rule="evenodd" clip-rule="evenodd" d="M15.75 8.25H8.25V6.75H15.75V8.25Z" fill="#080341"></path> <path fill-rule="evenodd" clip-rule="evenodd" d="M15.75 11.25H8.25V9.75H15.75V11.25Z" fill="#080341"></path> <path fill-rule="evenodd" clip-rule="evenodd" d="M5.25 3H16.0607L18.75 5.68934V12H17.25V6.31066L15.4393 4.5H6.75V19.5H9.75V21H5.25V3Z" fill="#080341"></path> <path fill-rule="evenodd" clip-rule="evenodd" d="M9.75 14.25H8.25V12.75H9.75V14.25Z" fill="#080341"></path> <path fill-rule="evenodd" clip-rule="evenodd" d="M13.5791 16.0854L14.9207 15.4146L15.4634 16.5H16.4999V18H14.5364L13.5791 16.0854Z" fill="#080341"></path> </g></svg>)
        },
        {
            id: 'promotion', name: 'Khuyến mại', icon: (
                <svg className="w-5 h-5" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g id="Layer_2" data-name="Layer 2"> <g id="invisible_box" data-name="invisible box"> <rect width="48" height="48" fill="none"></rect> </g> <g id="Layer_7" data-name="Layer 7"> <path d="M43,7H38a2,2,0,0,0-1.4.6L34,10.2,31.4,7.6A2,2,0,0,0,30,7H5a2.9,2.9,0,0,0-3,3V38a3,3,0,0,0,3,3H30a2,2,0,0,0,1.4-.6L34,37.8l2.6,2.6A2,2,0,0,0,38,41h5a3,3,0,0,0,3-3V10A2.9,2.9,0,0,0,43,7ZM14,18a2,2,0,1,1-2,2A2,2,0,0,1,14,18Zm8,12a2,2,0,1,1,2-2A2,2,0,0,1,22,30Zm2.4-9.6-10,10a1.9,1.9,0,0,1-2.8,0,1.9,1.9,0,0,1,0-2.8l10-10a2,2,0,0,1,2.8,2.8ZM36,33a2,2,0,0,1-4,0V31a2,2,0,0,1,4,0Zm0-8a2,2,0,0,1-4,0V23a2,2,0,0,1,4,0Zm0-8a2,2,0,0,1-4,0V15a2,2,0,0,1,4,0Z"></path> </g> </g> </g></svg>)
        },
            {
            id: 'flash-sale', name: 'Flash Sale', icon: (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            )
        },
        {
            id: 'customers', name: 'Khách hàng', icon: (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.5.87 2.62 1.94 3.29 2.95V19h4v-2.5c0-2.33-4.67-3.5-7-3.5z"></path></svg>
            )
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
            id: 'settings', name: 'Cài đặt', icon: (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.39-1.07-.75-1.66-1.04l-.35-2.73c-.05-.24-.26-.42-.5-.42h-4c-.25 0-.46.18-.5.42l-.35 2.73c-.59.29-1.14.65-1.66 1.04l-2.49-1c-.22-.08-.49 0-.61.22l-2 3.46c-.12.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.39 1.07.75 1.66 1.04l.35 2.73c.05.24.26.42.5.42h4c.25 0 .46-.18.5-.42l.35-2.73c.59-.29 1.14-.65 1.66-1.04l2.49 1c.22.08.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"></path></svg>
            )
        },
    ]

    return (
        <div
            className={`
                fixed lg:relative
                h-screen lg:h-auto
                bg-white shadow-xl 
                flex flex-col items-center py-8 space-y-4
                transition-all duration-300 ease-in-out
                ${isOpen ? 'w-64' : 'w-20'}
                z-50
            `}
        >
            <div className={`
                flex items-center space-x-2
                ${isOpen ? 'justify-between w-full px-8' : 'justify-center w-full'}
            `}>
                {isOpen && <h2 className="text-xl font-bold text-pink-600">PinkFashion</h2>}
                <button
                    onClick={toggleSidebar}
                    className="p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-pink-600 transition-colors"
                >
                    <svg className="w-6 h-6 transform transition-transform duration-300"
                        style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                        fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"></path>
                    </svg>
                </button>
            </div>

            <nav className="w-full mt-8 space-y-2 px-4 overflow-y-auto flex-1">
                {navItems.map((item) => (
                    <a
                        key={item.id}
                        href="#"
                        onClick={() => setActiveTab(item.id)}
                        className={`
                            flex items-center space-x-3 p-4 rounded-xl transition-colors duration-200
                            ${activeTab === item.id ? 'bg-pink-600 text-white font-semibold' : 'text-gray-600 hover:bg-pink-50 hover:text-pink-600'}
                            ${!isOpen ? 'justify-center' : ''}
                        `}
                    >
                        {item.icon}
                        <span className={`
                            ${!isOpen ? 'hidden' : ''}
                        `}>
                            {item.name}
                        </span>
                    </a>
                ))}
            </nav>
        </div>
    )
}

export default Sidebar