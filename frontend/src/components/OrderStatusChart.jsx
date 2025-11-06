import React from "react"

const STATUS_MAP = {
  PENDING: { label: "Chờ xác nhận", color: "bg-yellow-100 text-yellow-700" },
  PROCESSING: { label: "Đang xử lý", color: "bg-blue-100 text-blue-700" },
  SHIPPED: { label: "Đã giao hàng", color: "bg-green-100 text-green-700" },
  COMPLETED: { label: "Hoàn thành", color: "bg-emerald-100 text-emerald-700" },
  CANCELLED: { label: "Đã hủy", color: "bg-red-100 text-red-700" },
}

export default function OrderStatusSummary({ statusSummary = {} }) {
  const statuses = Object.entries(statusSummary)

  if (!statuses.length) {
    return (
      <div className="bg-white p-6 rounded-xl shadow text-gray-500 text-center">
        Không có dữ liệu trạng thái đơn hàng
      </div>
    )
  }

  return (
    <div className=" p-6 rounded-xl shadow space-y-4">
      <h2 className="text-lg font-semibold text-var(--text-color)0">
        Trạng thái đơn hàng
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statuses.map(([status, count], index) => {
          const info = STATUS_MAP[status] || { label: status, color: "bg-gray-100 text-gray-700" }
          return (
            <div
              key={index}
              className={`p-4 rounded-lg text-center font-medium ${info.color}`}
            >
              <p className="text-sm">{info.label}</p>
              <p className="text-2xl font-bold">{count}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
