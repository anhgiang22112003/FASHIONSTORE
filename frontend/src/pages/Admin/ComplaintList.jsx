import React, { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { CreateComplaintButton } from '@/components/ComplaintForm'
import {
    Search,
    Filter,
    Download,
    ChevronLeft,
    ChevronRight,
    Trash2,
    RefreshCw,
    MessageSquareWarning,
    AlertTriangle
} from 'lucide-react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import {
    COMPLAINT_STATUS,
    COMPLAINT_STATUS_LABELS,
    COMPLAINT_TYPE_LABELS,
    DEFAULT_PAGE_SIZE,
    PAGE_SIZE_OPTIONS
} from '@/data/constants'
import apiAdmin from '@/service/apiAdmin'
import { ViewComplaintButton } from '@/components/ComplaintDetail'
import { EditComplaintButton } from '@/components/ComplaintForm'
import { toast } from 'react-toastify'
import AdminSpinner from '@/components/AdminSpinner'

const ComplaintList = ({ onRefresh }) => {
    const [complaints, setComplaints] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [deleteTarget, setDeleteTarget] = useState(null)
    const [pagination, setPagination] = useState({
        page: 1,
        limit: DEFAULT_PAGE_SIZE,
        total: 0,
        totalPages: 0
    })
    const [filters, setFilters] = useState({
        search: '',
        complaintType: '',
        status: '',
        customerId: '',
        startDate: null,
        endDate: null,
        minAmount: '',
        maxAmount: '',
        minPercent: '',
        maxPercent: ''
    })
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)

    const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN').format(amount)
    const formatDateTime = (date) => new Date(date).toLocaleString('vi-VN')

    const getStatusStyle = (status) => {
        switch (status) {
            case COMPLAINT_STATUS.PENDING:
                return 'bg-amber-100 text-amber-700 border border-amber-200'
            case COMPLAINT_STATUS.APPROVED:
                return 'bg-emerald-100 text-emerald-700 border border-emerald-200'
            case COMPLAINT_STATUS.REJECTED:
                return 'bg-red-100 text-red-700 border border-red-200'
            default:
                return 'bg-gray-100 text-gray-600 border border-gray-200'
        }
    }

    const fetchComplaints = async (page = 1) => {
        setLoading(true)
        setError('')
        try {
            const params = { page, limit: pagination.limit, ...filters }
            if (filters.startDate) params.startDate = format(filters.startDate, 'yyyy-MM-dd')
            if (filters.endDate) params.endDate = format(filters.endDate, 'yyyy-MM-dd')
            Object.keys(params).forEach(key => {
                if (params[key] === '' || params[key] === null || params[key] === undefined) delete params[key]
            })
            const queryString = new URLSearchParams(params).toString()
            const response = await apiAdmin.get(`/complaints?${queryString}`)
            setComplaints(response.data.data || [])
            setPagination(prev => ({ ...prev, ...response.data.pagination, page }))
        } catch (err) {
            toast.error('Có lỗi xảy ra khi tải danh sách khiếu nại')
            console.error('Fetch complaints error:', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchComplaints() }, [])
    useEffect(() => {
        if (onRefresh) onRefresh(() => fetchComplaints(pagination.page))
    }, [onRefresh, pagination.page])

    const handleFilterChange = (key, value) => setFilters(prev => ({ ...prev, [key]: value }))
    const handleSearch = () => fetchComplaints(1)
    const handleReset = () => {
        setFilters({
            search: '', complaintType: '', status: '', customerId: '',
            startDate: null, endDate: null, minAmount: '', maxAmount: '', minPercent: '', maxPercent: ''
        })
        setTimeout(() => fetchComplaints(1), 100)
    }

    const handleExport = async () => {
        try {
            const params = { ...filters }
            if (filters.startDate) params.startDate = format(filters.startDate, 'yyyy-MM-dd')
            if (filters.endDate) params.endDate = format(filters.endDate, 'yyyy-MM-dd')
            const queryString = new URLSearchParams(params).toString()
            const response = await apiAdmin.get(`/complaints/export/excel?${queryString}`, { responseType: 'arraybuffer' })
            const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `complaints_${Date.now()}.xlsx`
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)
        } catch (err) {
            toast.error('Có lỗi xảy ra khi xuất file Excel')
        }
    }

    const executeDelete = async () => {
        if (!deleteTarget) return
        try {
            await apiAdmin.delete(`/complaints/${deleteTarget._id}`)
            toast.success('Xóa khiếu nại thành công')
            fetchComplaints(pagination.page)
        } catch (err) {
            toast.error('Có lỗi xảy ra khi xóa khiếu nại')
        } finally {
            setDeleteTarget(null)
        }
    }

    const handlePageChange = (newPage) => fetchComplaints(newPage)
    const handlePageSizeChange = (newSize) => {
        setPagination(prev => ({ ...prev, limit: parseInt(newSize) }))
        fetchComplaints(1)
    }

    return (
        <div className="space-y-6 p-4 lg:p-6" style={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-color)' }}>

            {/* ===== Page Header ===== */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <MessageSquareWarning className="h-6 w-6 text-pink-500" />
                        Quản lý khiếu nại & chiết khấu
                    </h1>
                    <p className="text-sm text-gray-500 mt-0.5">
                        Xử lý và theo dõi các yêu cầu chiết khấu, hoàn tiền từ khách hàng
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <CreateComplaintButton onSuccess={() => fetchComplaints(pagination.page)} />
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 px-4 py-2.5 bg-white border border-pink-200 text-pink-600 rounded-xl text-sm font-semibold hover:bg-pink-50/50 transition-all shadow-sm"
                    >
                        <Download className="h-4 w-4" />
                        Xuất Excel
                    </button>
                </div>
            </div>

            {/* ===== Stats bar ===== */}
            <div className="text-sm text-gray-500">
                Hiển thị{' '}
                <span className="font-semibold text-gray-700">{complaints.length}</span>
                {' '}/{' '}
                <span className="font-semibold text-gray-700">{pagination.total}</span>
                {' '}khiếu nại
            </div>

            {/* ===== Filter Section ===== */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-pink-500 to-purple-600">
                    <div className="flex items-center justify-between">
                        <h2 className="text-base font-semibold text-white flex items-center gap-2">
                            <Filter className="h-4 w-4" />
                            Bộ lọc tìm kiếm
                        </h2>
                        <button
                            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                            className={`text-xs px-3 py-1.5 rounded-lg transition-all font-medium ${showAdvancedFilters
                                ? 'bg-white text-pink-600'
                                : 'bg-white/20 text-white hover:bg-white/30'
                                }`}
                        >
                            {showAdvancedFilters ? 'Ẩn nâng cao' : 'Bộ lọc nâng cao'}
                        </button>
                    </div>
                </div>
                <div className="p-5 space-y-4">
                    {/* Basic filters */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Mã khiếu nại, đơn hàng, khách hàng..."
                                value={filters.search}
                                onChange={(e) => handleFilterChange('search', e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl text-black focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-400 transition-all"
                            />
                        </div>
                        <select
                            value={filters.complaintType}
                            onChange={(e) => handleFilterChange('complaintType', e.target.value)}
                            className="px-3 py-2.5 text-sm border border-gray-200 rounded-xl text-black focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-400 transition-all bg-white"
                        >
                            <option value="">Tất cả loại</option>
                            {Object.entries(COMPLAINT_TYPE_LABELS).map(([key, label]) => (
                                <option key={key} value={key}>{label}</option>
                            ))}
                        </select>
                        <select
                            value={filters.status}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                            className="px-3 py-2.5 text-sm border border-gray-200 rounded-xl text-black focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-400 transition-all bg-white"
                        >
                            <option value="">Tất cả trạng thái</option>
                            {Object.entries(COMPLAINT_STATUS_LABELS).map(([key, label]) => (
                                <option key={key} value={key}>{label}</option>
                            ))}
                        </select>
                        <div className="flex gap-2">
                            <button
                                onClick={handleSearch}
                                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:from-pink-600 hover:to-purple-700 transition-all"
                            >
                                <Search className="h-4 w-4" />
                                Tìm kiếm
                            </button>
                            <button
                                onClick={handleReset}
                                className="px-3 py-2.5 border border-gray-200 text-gray-500 rounded-xl hover:bg-gray-50 transition-all"
                                title="Đặt lại bộ lọc"
                            >
                                <RefreshCw className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    {/* Advanced filters */}
                    {showAdvancedFilters && (
                        <div className="border-t border-gray-100 pt-4 grid grid-cols-1 md:grid-cols-4 gap-3">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Số tiền từ</label>
                                <input type="number" placeholder="0" value={filters.minAmount}
                                    onChange={(e) => handleFilterChange('minAmount', e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl text-black focus:outline-none focus:ring-2 focus:ring-pink-300" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Số tiền đến</label>
                                <input type="number" placeholder="0" value={filters.maxAmount}
                                    onChange={(e) => handleFilterChange('maxAmount', e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl text-black focus:outline-none focus:ring-2 focus:ring-pink-300" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">% từ</label>
                                <input type="number" placeholder="0" value={filters.minPercent}
                                    onChange={(e) => handleFilterChange('minPercent', e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl text-black focus:outline-none focus:ring-2 focus:ring-pink-300" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">% đến</label>
                                <input type="number" placeholder="100" value={filters.maxPercent}
                                    onChange={(e) => handleFilterChange('maxPercent', e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl text-black focus:outline-none focus:ring-2 focus:ring-pink-300" />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ===== Table ===== */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-pink-50">
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Mã khiếu nại</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Đơn hàng</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Khách hàng</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Loại</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Số tiền</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">%</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Trạng thái</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Ngày tạo</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={9} className="py-10">
                                        <AdminSpinner message="Đang tải danh sách khiếu nại..." />
                                    </td>
                                </tr>
                            ) : complaints.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="text-center py-16">
                                        <MessageSquareWarning className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                                        <p className="text-gray-400 font-medium">Không có dữ liệu khiếu nại</p>
                                        <p className="text-gray-300 text-sm mt-1">Thử thay đổi bộ lọc hoặc tạo khiếu nại mới</p>
                                    </td>
                                </tr>
                            ) : (
                                complaints.map((complaint) => (
                                    <tr key={complaint._id} className="hover:bg-pink-50/40 hover:text-black transition-all">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm font-semibold text-gray-800">{complaint.code}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-gray-600">{complaint.orderCode}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-gray-700 font-medium">{complaint.customerName}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="inline-flex px-2 py-0.5 rounded-lg bg-purple-50 text-purple-700 border border-purple-200 text-xs font-medium">
                                                {COMPLAINT_TYPE_LABELS[complaint.complaintType]}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm font-semibold text-pink-600">{formatCurrency(complaint.complaintAmount)}đ</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-gray-600">{complaint.percent}%</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusStyle(complaint.status)}`}>
                                                {COMPLAINT_STATUS_LABELS[complaint.status]}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-xs text-gray-500">{formatDateTime(complaint.createdAt)}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <ViewComplaintButton
                                                    complaint={complaint}
                                                    onUpdate={() => fetchComplaints(pagination.page)}
                                                />
                                                {complaint.status === COMPLAINT_STATUS.PENDING && (
                                                    <>
                                                        <EditComplaintButton
                                                            complaint={complaint}
                                                            onSuccess={() => fetchComplaints(pagination.page)}
                                                        />
                                                        <button
                                                            onClick={() => setDeleteTarget(complaint)}
                                                            className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Xóa"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ===== Pagination ===== */}
            {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between bg-white rounded-2xl shadow border border-gray-100 px-5 py-3 flex-wrap gap-3">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>Hiển thị:</span>
                        <select
                            value={pagination.limit.toString()}
                            onChange={(e) => handlePageSizeChange(e.target.value)}
                            className="border border-gray-200 rounded-lg px-2 py-1 text-sm text-black focus:outline-none focus:ring-2 focus:ring-pink-300"
                        >
                            {PAGE_SIZE_OPTIONS.map(size => (
                                <option key={size} value={size.toString()}>{size}</option>
                            ))}
                        </select>
                        <span>Trang <strong>{pagination.page}</strong> / <strong>{pagination.totalPages}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <button
                            onClick={() => handlePageChange(pagination.page - 1)}
                            disabled={pagination.page <= 1}
                            className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1"
                        >
                            <ChevronLeft className="h-4 w-4" /> Trước
                        </button>
                        {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                            const pageNum = Math.max(1, pagination.page - 2) + i
                            if (pageNum > pagination.totalPages) return null
                            return (
                                <button
                                    key={pageNum}
                                    onClick={() => handlePageChange(pageNum)}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${pageNum === pagination.page
                                        ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
                                        : 'border border-gray-200 hover:bg-gray-50'
                                        }`}
                                >
                                    {pageNum}
                                </button>
                            )
                        })}
                        <button
                            onClick={() => handlePageChange(pagination.page + 1)}
                            disabled={pagination.page >= pagination.totalPages}
                            className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1"
                        >
                            Sau <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* ===== Custom Delete Confirmation Modal ===== */}
            {deleteTarget && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 transform transition-all duration-300 scale-100 animate-scaleUp text-black">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-red-50 rounded-xl">
                                <AlertTriangle className="h-6 w-6 text-red-500" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Xác nhận xóa khiếu nại</h3>
                                <p className="text-xs text-gray-400">Hành động này không thể hoàn tác</p>
                            </div>
                        </div>
                        
                        <div className="space-y-2 mb-6">
                            <p className="text-sm text-gray-600 leading-relaxed">
                                Bạn có chắc chắn muốn xóa khiếu nại của khách hàng <span className="font-semibold text-gray-800">{deleteTarget.customerName}</span>?
                            </p>
                            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-xs space-y-1">
                                <div className="flex justify-between"><span className="text-gray-400">Mã khiếu nại:</span> <span className="font-medium text-gray-700">{deleteTarget.code}</span></div>
                                <div className="flex justify-between"><span className="text-gray-400">Đơn hàng:</span> <span className="font-medium text-gray-700">{deleteTarget.orderCode}</span></div>
                                <div className="flex justify-between"><span className="text-gray-400">Số tiền hoàn:</span> <span className="font-semibold text-pink-600">{formatCurrency(deleteTarget.complaintAmount)}đ</span></div>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-2.5">
                            <button
                                onClick={() => setDeleteTarget(null)}
                                className="px-4 py-2.5 border border-gray-200 text-gray-500 rounded-xl text-xs font-semibold hover:bg-gray-50 transition-all"
                            >
                                Hủy bỏ
                            </button>
                            <button
                                onClick={executeDelete}
                                className="px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-semibold shadow-sm shadow-red-100 transition-all flex items-center gap-1.5"
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                                Xác nhận xóa
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ComplaintList