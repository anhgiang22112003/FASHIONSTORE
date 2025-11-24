import apiAdmin from '@/service/apiAdmin'
import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { Package, RefreshCw, ChevronLeft, ChevronRight, Filter, ShoppingCart, Globe, RotateCcw, TrendingUp, TrendingDown } from 'lucide-react'

const STOCK_BADGES = {
    IMPORT: {
        label: "Nhập kho",
        color: "bg-green-100 text-green-700",
        icon: <TrendingUp className="w-3 h-3" />,
    },
    EXPORT: {
        label: "Xuất kho",
        color: "bg-orange-100 text-orange-700",
        icon: <TrendingDown className="w-3 h-3" />,
    },
    POS: {
        label: "POS",
        color: "bg-blue-100 text-blue-700",
        icon: <ShoppingCart className="w-3 h-3" />,
    },
    ONLINE: {
        label: "Online",
        color: "bg-indigo-100 text-indigo-700",
        icon: <Globe className="w-3 h-3" />,
    },
    ONLINE_CANCEL: {
        label: "Hủy Online",
        color: "bg-red-100 text-red-700",
        icon: <RotateCcw className="w-3 h-3" />,
    },
}

export default function StockHistory() {
    const [history, setHistory] = useState([])
    const [historyLoading, setHistoryLoading] = useState(false)
    const [suppliers, setSuppliers] = useState([])

    // Pagination
    const [page, setPage] = useState(1)
    const [limit] = useState(100)
    const [total, setTotal] = useState(0)

    // Filters
    const [showFilters, setShowFilters] = useState(false)
    const [filters, setFilters] = useState({
        productId: '',
        type: '',
        supplierId: '',
        dateFrom: '',
        dateTo: ''
    })

    useEffect(() => {
        fetchSuppliers()
        fetchHistory()
    }, [])

    useEffect(() => {
        fetchHistory()
    }, [page, filters])

    async function fetchSuppliers() {
        try {
            const res = await apiAdmin.get('/supplier')
            setSuppliers(res.data.data || [])
        } catch (e) {
            console.error(e)
        }
    }

    async function fetchHistory() {
        setHistoryLoading(true)
        try {
            const params = new URLSearchParams({
                limit: limit.toString(),
                page: page.toString(),
                ...(filters.productId && { productId: filters.productId }),
                ...(filters.type && { type: filters.type }),
                ...(filters.supplierId && { supplier: filters.supplierId }),
                ...(filters.dateFrom && { dateFrom: filters.dateFrom }),
                ...(filters.dateTo && { dateTo: filters.dateTo })
            })

            const res = await apiAdmin.get(`/stock/history?${params.toString()}`)
            setHistory(res.data.items || [])
            setTotal(res.data.total || 0)
        } catch (e) {
            console.error(e)
            toast.error('Lỗi khi tải lịch sử')
        } finally {
            setHistoryLoading(false)
        }
    }

    function resetFilters() {
        setFilters({
            productId: '',
            type: '',
            supplierId: '',
            dateFrom: '',
            dateTo: ''
        })
        setPage(1)
    }

    const hasActiveFilters = Object.values(filters).some(v => v !== '')

    return (
        <div className=" rounded-xl shadow-lg p-6">
            {/* Header with Filters */}
            <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                <h3 className="text-xl font-bold  flex items-center gap-2">
                    <Package className="w-6 h-6 text-blue-500" />
                    Lịch sử nhập xuất kho
                </h3>
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${showFilters || hasActiveFilters
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                    >
                        <Filter className="w-4 h-4" />
                        Lọc
                        {hasActiveFilters && <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">•</span>}
                    </button>
                    <button
                        onClick={() => fetchHistory()}
                        disabled={historyLoading}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-all disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 ${historyLoading ? 'animate-spin' : ''}`} />
                        Làm mới
                    </button>
                </div>
            </div>

            {/* Filters Panel */}
            {showFilters && (
                <div className="mb-6 p-4  rounded-lg border-2 border-slate-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium  mb-2">Loại giao dịch</label>
                            <select
                                value={filters.type}
                                onChange={e => setFilters({ ...filters, type: e.target.value })}
                                className="w-full px-3 text-black py-2 border border-slate-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                            >
                                <option value="">Tất cả</option>
                                <option value="IMPORT">Nhập kho</option>
                                <option value="EXPORT">Xuất kho</option>
                                <option value="POS">POS</option>
                                <option value="ONLINE">Online</option>
                                <option value="ONLINE_CANCEL">Hủy Online</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium  mb-2">Nhà cung cấp</label>
                            <select
                                value={filters.supplierId}
                                onChange={e => setFilters({ ...filters, supplierId: e.target.value })}
                                className="w-full text-black px-3 py-2 border border-slate-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                            >
                                <option value="">Tất cả</option>
                                {suppliers.map(s => (
                                    <option key={s._id} value={s._id}>{s.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium  mb-2">Từ ngày</label>
                            <input
                                type="date"
                                value={filters.dateFrom}
                                onChange={e => setFilters({ ...filters, dateFrom: e.target.value })}
                                className="w-full text-black px-3 py-2 border border-slate-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium  mb-2">Đến ngày</label>
                            <input
                                type="date"
                                value={filters.dateTo}
                                onChange={e => setFilters({ ...filters, dateTo: e.target.value })}
                                className="w-full text-black px-3 py-2 border border-slate-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                            />
                        </div>

                        <div className="flex items-end">
                            <button
                                onClick={resetFilters}
                                className="w-full px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-medium transition-all"
                            >
                                Xóa bộ lọc
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Table */}
            {historyLoading ? (
                <div className="text-center py-12">
                    <RefreshCw className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
                    <p className="text-slate-600">Đang tải dữ liệu...</p>
                </div>
            ) : history.length === 0 ? (
                <div className="text-center py-12">
                    <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500">Không có dữ liệu</p>
                </div>
            ) : (
                <>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b-2 bg-white border-slate-200">
                                    <th className="text-left p-4 text-sm font-semibold text-slate-700">Thời gian</th>
                                    <th className="text-left p-4 text-sm font-semibold text-slate-700">Sản phẩm</th>
                                    <th className="text-left p-4 text-sm font-semibold text-slate-700">Biến thể</th>
                                    <th className="text-center p-4 text-sm font-semibold text-slate-700">Số lượng</th>
                                    <th className="text-center p-4 text-sm font-semibold text-slate-700">Loại</th>
                                    <th className="text-left p-4 text-sm font-semibold text-slate-700">Người thực hiện</th>
                                    <th className="text-left p-4 text-sm font-semibold text-slate-700">NCC</th>
                                    <th className="text-left p-4 text-sm font-semibold text-slate-700">Ghi chú</th>
                                </tr>
                            </thead>
                            <tbody>
                                {history.map((h) => (
                                    <tr key={h._id} className="border-b border-slate-100 hover:bg-slate-50 hover:text-black transition-colors">
                                        <td className="p-4 text-sm text-slate-600">
                                            {new Date(h.createdAt).toLocaleString('vi-VN')}
                                        </td>
                                        <td className="p-4 text-sm font-medium ">
                                            {h.productName || h.product?.name || h.product}
                                        </td>
                                        <td className="p-4 text-sm text-slate-600">
                                            <span className="bg-slate-100 px-2 py-1 rounded">
                                                {h.color}/{h.size}
                                            </span>
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className="font-semibold ">{h.quantity}</span>
                                        </td>
                                        <td className="p-4 text-center">
                                            <span
                                                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${STOCK_BADGES[h.type]?.color || "bg-gray-100 text-gray-600"
                                                    }`}
                                            >
                                                {STOCK_BADGES[h.type]?.icon}
                                                {STOCK_BADGES[h.type]?.label || h.type}
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm text-slate-600">
                                            {h?.userId?.name || h?.userId?.email || "-"}
                                        </td>
                                        <td className="p-4 text-sm text-slate-600">
                                            {h.supplier?.name || '-'}
                                        </td>
                                        <td className="p-4 text-sm text-slate-600">
                                            {h.note || '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {total > limit && (
                        <div className="flex justify-center items-center py-6 space-x-2 border-t-2 border-slate-200 mt-6">
                            <button
                                onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                                disabled={page === 1}
                                className="flex items-center gap-1 px-4 py-2 border-2 border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Trước
                            </button>

                            {Array.from({ length: Math.ceil(total / limit) }, (_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setPage(i + 1)}
                                    className={`px-4 py-2 rounded-lg font-medium transition-all ${page === i + 1
                                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                                        : 'border-2 border-slate-300 hover:bg-slate-50'
                                        }`}
                                >
                                    {i + 1}
                                </button>
                            ))}

                            <button
                                onClick={() => setPage(prev => prev + 1)}
                                disabled={page >= Math.ceil(total / limit)}
                                className="flex items-center gap-1 px-4 py-2 border-2 border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                Sau
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    )}

                    {/* Stats */}
                    <div className="mt-4 text-center text-sm text-slate-600">
                        Hiển thị {(page - 1) * limit + 1} - {Math.min(page * limit, total)} trong tổng số {total} bản ghi
                    </div>
                </>
            )}
        </div>
    )
}