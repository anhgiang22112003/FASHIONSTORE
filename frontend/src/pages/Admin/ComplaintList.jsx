import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/badge'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { CreateComplaintButton } from '@/components/ComplaintForm'
import {
    Search,
    Filter,
    Download,
    Calendar as CalendarIcon,
    ChevronLeft,
    ChevronRight,
    Trash2,
    RefreshCw
} from 'lucide-react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import {
    COMPLAINT_STATUS,
    COMPLAINT_STATUS_LABELS,
    COMPLAINT_TYPES,
    COMPLAINT_TYPE_LABELS,
    DEFAULT_PAGE_SIZE,
    PAGE_SIZE_OPTIONS
} from '@/data/constants'
import apiAdmin from '@/service/apiAdmin'
import { ViewComplaintButton } from '@/components/ComplaintDetail'
import { EditComplaintButton } from '@/components/ComplaintForm'
import { toast } from 'react-toastify'

const ComplaintList = ({ onRefresh }) => {
    const [complaints, setComplaints] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [pagination, setPagination] = useState({
        page: 1,
        limit: DEFAULT_PAGE_SIZE,
        total: 0,
        totalPages: 0
    })

    // Filter states
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

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN').format(amount)
    }

    const formatDateTime = (date) => {
        return new Date(date).toLocaleString('vi-VN')
    }

    const getStatusBadgeVariant = (status) => {
        switch (status) {
            case COMPLAINT_STATUS.PENDING:
                return 'default'
            case COMPLAINT_STATUS.APPROVED:
                return 'success'
            case COMPLAINT_STATUS.REJECTED:
                return 'destructive'
            default:
                return 'secondary'
        }
    }

    const fetchComplaints = async (page = 1) => {
        setLoading(true)
        setError('')

        try {
            const params = {
                page,
                limit: pagination.limit,
                ...filters
            }

            if (filters.startDate) {
                params.startDate = format(filters.startDate, 'yyyy-MM-dd')
            }
            if (filters.endDate) {
                params.endDate = format(filters.endDate, 'yyyy-MM-dd')
            }

            Object.keys(params).forEach(key => {
                if (params[key] === '' || params[key] === null || params[key] === undefined) {
                    delete params[key]
                }
            })
            const queryString = new URLSearchParams(params).toString()

            const response = await apiAdmin.get(`/complaints?${queryString}`)
            setComplaints(response.data.data || [])
            setPagination(prev => ({
                ...prev,
                ...response.data.pagination,
                page
            }))
        } catch (err) {
            toast.error('Có lỗi xảy ra khi tải danh sách khiếu nại')
            console.error('Fetch complaints error:', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchComplaints()
    }, [])

    useEffect(() => {
        if (onRefresh) {
            onRefresh(() => fetchComplaints(pagination.page))
        }
    }, [onRefresh, pagination.page])

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }))
    }

    const handleSearch = () => {
        fetchComplaints(1)
    }

    const handleReset = () => {
        setFilters({
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
        setTimeout(() => fetchComplaints(1), 100)
    }

    const handleExport = async () => {
        try {
            const params = { ...filters }
            if (filters.startDate) {
                params.startDate = format(filters.startDate, 'yyyy-MM-dd')
            }
            if (filters.endDate) {
                params.endDate = format(filters.endDate, 'yyyy-MM-dd')
            }
            const queryString = new URLSearchParams(params).toString()

            const response = await apiAdmin.get(`/complaints/export/excel?${queryString}`, {
                responseType: 'arraybuffer', // important!
            })

            const blob = new Blob([response.data], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            })
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

    const handleDelete = async (id) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa khiếu nại này?')) return

        try {
            await apiAdmin.delete(`/complaints/${id}`)
            fetchComplaints(pagination.page)
        } catch (err) {
            toast.error('Có lỗi xảy ra khi xóa khiếu nại')
        }
    }

    const handlePageChange = (newPage) => {
        fetchComplaints(newPage)
    }

    const handlePageSizeChange = (newSize) => {
        setPagination(prev => ({ ...prev, limit: parseInt(newSize) }))
        fetchComplaints(1)
    }

    return (
        <div className="space-y-6 p-3">
            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                            <Filter className="h-5 w-5" />
                            Bộ lọc
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                        >
                            {showAdvancedFilters ? 'Ẩn bộ lọc nâng cao' : 'Hiện bộ lọc nâng cao'}
                        </Button>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Basic Filters */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="space-y-2">
                            <Label>Tìm kiếm</Label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                <Input
                                    placeholder="Mã khiếu nại, đơn hàng, khách hàng..."
                                    value={filters.search}
                                    onChange={(e) => handleFilterChange('search', e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Loại khiếu nại</Label>
                            <Select
                                value={filters.complaintType}
                                onValueChange={(value) => handleFilterChange('complaintType', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Tất cả" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tất cả</SelectItem>
                                    {Object.entries(COMPLAINT_TYPE_LABELS).map(([key, label]) => (
                                        <SelectItem key={key} value={key}>{label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Trạng thái</Label>
                            <Select
                                value={filters.status}
                                onValueChange={(value) => handleFilterChange('status', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Tất cả" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tất cả</SelectItem>
                                    {Object.entries(COMPLAINT_STATUS_LABELS).map(([key, label]) => (
                                        <SelectItem key={key} value={key}>{label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-end gap-2">
                            <Button onClick={handleSearch} className="flex-1">
                                <Search className="h-4 w-4 mr-2" />
                                Tìm kiếm
                            </Button>
                            <Button variant="outline" onClick={handleReset}>
                                <RefreshCw className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Advanced Filters */}
                    {showAdvancedFilters && (
                        <div className="border-t pt-4 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Date Range */}
                                <div className="space-y-2">
                                    <Label>Từ ngày</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" className="w-full justify-start text-left font-normal">
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {filters.startDate ? format(filters.startDate, 'dd/MM/yyyy', { locale: vi }) : 'Chọn ngày'}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar
                                                mode="single"
                                                selected={filters.startDate}
                                                onSelect={(date) => handleFilterChange('startDate', date)}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>

                                <div className="space-y-2">
                                    <Label>Đến ngày</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" className="w-full justify-start text-left font-normal">
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {filters.endDate ? format(filters.endDate, 'dd/MM/yyyy', { locale: vi }) : 'Chọn ngày'}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar
                                                mode="single"
                                                selected={filters.endDate}
                                                onSelect={(date) => handleFilterChange('endDate', date)}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="space-y-2">
                                    <Label>Số tiền từ</Label>
                                    <Input
                                        type="number"
                                        placeholder="0"
                                        value={filters.minAmount}
                                        onChange={(e) => handleFilterChange('minAmount', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Số tiền đến</Label>
                                    <Input
                                        type="number"
                                        placeholder="0"
                                        value={filters.maxAmount}
                                        onChange={(e) => handleFilterChange('maxAmount', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>% từ</Label>
                                    <Input
                                        type="number"
                                        placeholder="0"
                                        value={filters.minPercent}
                                        onChange={(e) => handleFilterChange('minPercent', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>% đến</Label>
                                    <Input
                                        type="number"
                                        placeholder="100"
                                        value={filters.maxPercent}
                                        onChange={(e) => handleFilterChange('maxPercent', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">
                        Hiển thị {complaints.length} / {pagination.total} khiếu nại
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    {/* Nút tạo khiếu nại mới */}
                    <CreateComplaintButton onSuccess={() => fetchComplaints(pagination.page)} />

                    <Button onClick={handleExport} variant="outline" className="gap-2">
                        <Download className="h-4 w-4" />
                        Xuất Excel
                    </Button>
                </div>
            </div>

            {/* Error Alert */}
            {error && (
                <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {/* Table */}
            <Card>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Mã khiếu nại</TableHead>
                                    <TableHead>Đơn hàng</TableHead>
                                    <TableHead>Khách hàng</TableHead>
                                    <TableHead>Loại</TableHead>
                                    <TableHead>Số tiền</TableHead>
                                    <TableHead>%</TableHead>
                                    <TableHead>Trạng thái</TableHead>
                                    <TableHead>Ngày tạo</TableHead>
                                    <TableHead className="text-right">Thao tác</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    Array.from({ length: 5 }).map((_, index) => (
                                        <TableRow key={index}>
                                            {Array.from({ length: 9 }).map((_, cellIndex) => (
                                                <TableCell key={cellIndex}>
                                                    <Skeleton className="h-4 w-full" />
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))
                                ) : complaints.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                                            Không có dữ liệu khiếu nại
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    complaints?.map((complaint) => (
                                        <TableRow key={complaint._id}>
                                            <TableCell className="font-medium">{complaint.code}</TableCell>
                                            <TableCell>{complaint.orderCode}</TableCell>
                                            <TableCell>{complaint.customerName}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline">
                                                    {COMPLAINT_TYPE_LABELS[complaint.complaintType]}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{formatCurrency(complaint.complaintAmount)}đ</TableCell>
                                            <TableCell>{complaint.percent}%</TableCell>
                                            <TableCell>
                                                <Badge variant={getStatusBadgeVariant(complaint.status)}>
                                                    {COMPLAINT_STATUS_LABELS[complaint.status]}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{formatDateTime(complaint.createdAt)}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-2">
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
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleDelete(complaint._id)}
                                                                className="gap-2 text-red-600 hover:text-red-700"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
                <Card>
                    <CardContent className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-2">
                            <Label>Hiển thị:</Label>
                            <Select
                                value={pagination.limit.toString()}
                                onValueChange={handlePageSizeChange}
                            >
                                <SelectTrigger className="w-20">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {PAGE_SIZE_OPTIONS.map(size => (
                                        <SelectItem key={size} value={size.toString()}>{size}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <span className="text-sm text-gray-600">
                                Trang {pagination.page} / {pagination.totalPages}
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(pagination.page - 1)}
                                disabled={pagination.page <= 1}
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Trước
                            </Button>

                            {/* Page numbers */}
                            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                                const pageNum = Math.max(1, pagination.page - 2) + i
                                if (pageNum > pagination.totalPages) return null

                                return (
                                    <Button
                                        key={pageNum}
                                        variant={pageNum === pagination.page ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => handlePageChange(pageNum)}
                                    >
                                        {pageNum}
                                    </Button>
                                )
                            })}

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(pagination.page + 1)}
                                disabled={pagination.page >= pagination.totalPages}
                            >
                                Sau
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}

export default ComplaintList