import React from 'react'

export const AdminSpinner = ({ message = 'Đang tải dữ liệu...' }) => {
    return (
        <div className="flex flex-col items-center justify-center py-16 w-full text-black">
            <div className="relative w-12 h-12">
                <div className="absolute inset-0 rounded-full border-4 border-pink-100"></div>
                <div className="absolute inset-0 rounded-full border-4 border-pink-500 border-t-transparent animate-spin"></div>
            </div>
            <p className="text-sm text-gray-500 mt-4 font-medium animate-pulse">{message}</p>
        </div>
    )
}

export default AdminSpinner
