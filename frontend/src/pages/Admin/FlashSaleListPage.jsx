import React, { useEffect, useState } from "react"
import apiAdmin from "@/service/apiAdmin"
import { toast } from "react-toastify"
import dayjs from "dayjs"
import {
    PlusIcon,
    PencilSquareIcon,
    StopCircleIcon,
    BoltIcon,
    CalendarDaysIcon,
    SparklesIcon,
} from "@heroicons/react/24/outline"

const StatusBadge = ({ status }) => {
    if (status === "ACTIVE") return (
        <span className="inline-flex items-center space-x-1 bg-green-100 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-xl">
            <BoltIcon className="w-3 h-3" />
            <span>Đang diễn ra</span>
        </span>
    )
    if (status === "UPCOMING") return (
        <span className="inline-flex items-center space-x-1 bg-amber-100 text-amber-600 text-xs font-semibold px-2.5 py-1 rounded-xl">
            <CalendarDaysIcon className="w-3 h-3" />
            <span>Sắp bắt đầu</span>
        </span>
    )
    return (
        <span className="inline-flex items-center space-x-1 bg-gray-100 text-gray-600 text-xs font-semibold px-2.5 py-1 rounded-xl">
            <StopCircleIcon className="w-3 h-3" />
            <span>Đã kết thúc</span>
        </span>
    )
}

const FlashSaleListPage = ({ setActiveTab, setEditData }) => {
    const [flashSales, setFlashSales] = useState([])
    const [loading, setLoading] = useState(true)

    const handleEdit = (sale) => {
        setEditData(sale)
        setActiveTab("add-flashsale")
    }

    useEffect(() => {
        const fetchFlashSales = async () => {
            setLoading(true)
            try {
                const res = await apiAdmin.get("/flash-sales/active")
                setFlashSales(res?.data || [])
            } catch (err) {
                toast.error("Lỗi khi tải danh sách Flash Sale")
            } finally {
                setLoading(false)
            }
        }
        fetchFlashSales()
    }, [])

    const handleEndSale = async (saleId) => {
        try {
            await apiAdmin.post(`/flash-sales/${saleId}/end`)
            toast.success("Flash Sale đã kết thúc!")
            setFlashSales((prevSales) => prevSales.filter((sale) => sale._id !== saleId))
        } catch (err) {
            toast.error("Lỗi khi kết thúc Flash Sale")
        }
    }

    return (
        <div style={{ backgroundColor: "var(--bg-color)", color: "var(--text-color)" }} className="min-h-screen p-6 font-sans">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-800 flex items-center space-x-2">
                        <SparklesIcon className="w-5 h-5 text-pink-500" />
                        <span>Quản lý Flash Sale</span>
                    </h2>
                    <p className="text-xs text-gray-500 mt-0.5">Theo dõi và điều phối các chương trình giờ vàng</p>
                </div>
                <button
                    onClick={() => {
                        setEditData(null)
                        setActiveTab("add-flashsale")
                    }}
                    className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-pink-100 hover:shadow-pink-200 transition-all"
                >
                    <PlusIcon className="w-4 h-4" />
                    <span>Thêm sự kiện Flash Sale</span>
                </button>
            </div>

            {/* Loading */}
            {loading ? (
                <div className="flex justify-center items-center py-24">
                    <span className="animate-spin w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full"></span>
                </div>
            ) : flashSales.length === 0 ? (
                /* Empty State */
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                    <div className="p-5 bg-pink-50 rounded-full text-pink-400">
                        <BoltIcon className="w-10 h-10" />
                    </div>
                    <div>
                        <p className="text-base font-bold text-gray-700">Chưa có Flash Sale nào</p>
                        <p className="text-xs text-gray-400 mt-1">Tạo sự kiện giờ vàng đầu tiên để kích cầu mua sắm!</p>
                    </div>
                    <button
                        onClick={() => { setEditData(null); setActiveTab("add-flashsale") }}
                        className="mt-2 px-5 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white text-sm font-semibold rounded-xl shadow-md transition-all hover:from-pink-600 hover:to-purple-700"
                    >
                        + Tạo ngay
                    </button>
                </div>
            ) : (
                /* Table */
                <div className="overflow-x-auto rounded-2xl shadow-sm border border-gray-100 bg-white">
                    <table className="min-w-full table-auto">
                        <thead>
                            <tr className="bg-pink-50 text-gray-650 text-xs font-semibold uppercase tracking-wider border-b border-pink-100">
                                <th className="px-5 py-3.5 text-left">#</th>
                                <th className="px-5 py-3.5 text-left">Tên sự kiện</th>
                                <th className="px-5 py-3.5 text-left">Thời gian bắt đầu</th>
                                <th className="px-5 py-3.5 text-left">Thời gian kết thúc</th>
                                <th className="px-5 py-3.5 text-left">Trạng thái</th>
                                <th className="px-5 py-3.5 text-center">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {flashSales.map((sale, index) => (
                                <tr
                                    key={sale._id}
                                    className="hover:bg-pink-50/30 transition-colors"
                                >
                                    <td className="px-5 py-4 text-xs text-gray-400 font-mono">{index + 1}</td>
                                    <td className="px-5 py-4">
                                        <span className="font-semibold text-sm text-gray-800">{sale.title}</span>
                                    </td>
                                    <td className="px-5 py-4 text-sm text-gray-600">
                                        <div className="flex items-center space-x-1">
                                            <CalendarDaysIcon className="w-3.5 h-3.5 text-gray-400" />
                                            <span>{dayjs(sale.startTime).format("DD/MM/YYYY HH:mm")}</span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 text-sm text-gray-600">
                                        <div className="flex items-center space-x-1">
                                            <CalendarDaysIcon className="w-3.5 h-3.5 text-gray-400" />
                                            <span>{dayjs(sale.endTime).format("DD/MM/YYYY HH:mm")}</span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4">
                                        <StatusBadge status={sale.status} />
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => handleEdit(sale)}
                                                title="Chỉnh sửa"
                                                className="p-1.5 rounded-lg text-blue-500 bg-blue-50 hover:bg-blue-100 hover:text-blue-700 transition-all"
                                            >
                                                <PencilSquareIcon className="w-4 h-4" />
                                            </button>
                                            {sale.status === "ACTIVE" && (
                                                <button
                                                    onClick={() => handleEndSale(sale._id)}
                                                    title="Kết thúc ngay"
                                                    className="p-1.5 rounded-lg text-red-500 bg-red-50 hover:bg-red-100 hover:text-red-700 transition-all"
                                                >
                                                    <StopCircleIcon className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}

export default FlashSaleListPage
