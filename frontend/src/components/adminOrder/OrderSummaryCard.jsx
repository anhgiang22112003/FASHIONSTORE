import React from 'react'
import { formatCurrency } from '../../pages/Admin/EditOrder' // Import hàm định dạng tiền

const OrderSummaryCard = ({ totals, trackingHistory, editHistory }) => {
  return (
    <>
      {/* 🧾 Tóm tắt đơn hàng */}
      <div className="bg-white rounded-2xl shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Tóm tắt đơn hàng</h2>
        <div className="space-y-2 text-gray-600">
          <div className="flex justify-between">
            <p>Tạm tính</p>
            <p className="font-medium">{formatCurrency(totals.subtotal)}</p>
          </div>
          <div className="flex justify-between">
            <p>Phí vận chuyển</p>
            <p className="font-medium">{formatCurrency(totals.shippingFee)}</p>
          </div>
          <div className="flex justify-between">
            <p>Giảm giá</p>
            <p className="font-medium text-green-600">-{formatCurrency(totals.discount)}</p>
          </div>
          <div className="flex justify-between font-bold text-gray-800 pt-2 border-t border-gray-200">
            <p>Tổng cộng</p>
            <p className="text-pink-600 text-xl">{formatCurrency(totals.total)}</p>
          </div>
        </div>
      </div>

      {/* 🚚 Lịch sử vận chuyển */}
      <div className="bg-white rounded-2xl shadow-md p-6 mt-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Lịch sử đơn hàng</h2>
        <ol className="relative border-l border-gray-200 ml-4">
          {trackingHistory.slice().reverse().map((step, index) => (
            <li key={index} className="mb-4 ml-6">
              <span className="absolute flex items-center justify-center w-5 h-5 bg-pink-100 rounded-full -left-2.5 ring-4 ring-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-pink-500" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9 2a1 1 0 00-1 1v1a1 1 0 002 0V3a1 1 0 00-1-1zM3.465 4.965a1 1 0 00-.707 1.707l1.414 1.414a1 1 0 00.707.293c.264 0 .52-.105.707-.293l1.414-1.414a1 1 0 00-1.707-1.707L3.465 4.965zM12 2a1 1 0 00-1 1v1a1 1 0 002 0V3a1 1 0 00-1-1zM2 9a1 1 0 001 1h1a1 1 0 000-2H3a1 1 0 00-1 1zM19 9a1 1 0 00-1 1h-1a1 1 0 000-2h1a1 1 0 001 1zM12 19a1 1 0 00-1-1v-1a1 1 0 002 0v1a1 1 0 00-1 1zM5.536 17.536a1 1 0 00.707-.293l1.414-1.414a1 1 0 00-1.414-1.414l-1.414 1.414a1 1 0 00.293 1.707zM17.536 5.536a1 1 0 00.293-.707l-1.414-1.414a1 1 0 00-1.414 1.414l1.414 1.414a1 1 0 00.707-.293z" />
                </svg>
              </span>
              <p className="text-gray-500 text-sm font-medium">{step.date}</p>
              <p className="font-semibold text-gray-800">{step.note}</p>
            </li>
          ))}
        </ol>
      </div>

      {/* 🛠️ Lịch sử chỉnh sửa */}
      {editHistory?.length > 0 && (
        <div className=" text-black rounded-2xl shadow-md p-6 mt-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Lịch sử chỉnh sửa</h2>
          <ol className="relative border-l border-gray-200 ml-4 space-y-4">
            {editHistory.map((edit, i) => (
              <li key={i} className="ml-6">
                <div className="absolute w-3 h-3 bg-blue-400 rounded-full -left-1.5 border-2 border-white"></div>
                {typeof edit.changes === "object" ? (
                  <div className=" rounded-lg p-3  border border-gray-100">
                    <p>📝 <b>{edit.changes.field}</b></p>
                    <p className="">Từ: <span className="italic">{edit.changes.old}</span></p>
                    <p className="">Thành: <b>{edit.changes.new}</b></p>
                  </div>
                ) : (
                  <p className=" rounded-lg p-3 border border-gray-100">{edit.changes}</p>
                )}
                <p className="text-xs  mt-1">
                  {new Date(edit.editedAt).toLocaleString('vi-VN')}
                </p>
              </li>
            ))}
          </ol>
        </div>
      )}
    </>
  )
}

export default OrderSummaryCard
