import React, { useState, useEffect } from 'react'
import { CreateComplaintButton } from 'components/ComplaintForm'
import {
  Search,
  Filter,
  Download,
  Trash2,
  RefreshCw,
  MessageSquareWarning,
} from 'lucide-react'
import { format } from 'date-fns'
import {
  COMPLAINT_STATUS,
  COMPLAINT_STATUS_LABELS,
  COMPLAINT_TYPE_LABELS,
  DEFAULT_PAGE_SIZE,
} from 'data/constants'
import apiAdmin from 'service/apiAdmin'
import { ViewComplaintButton } from 'components/ComplaintDetail'
import { EditComplaintButton } from 'components/ComplaintForm'
import { toast } from 'react-toastify'
import { PageHeader, Toolbar, FilterPanel, DataTable, Pagination, StatusBadge, AdminButton, ConfirmDialog } from "components/admin/ui"

const ComplaintList = ({ onRefresh }) => {
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(false)
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

  const fetchComplaints = async (page = 1) => {
    setLoading(true)
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

  const columns = [
    {
      header: "Mã khiếu nại",
      render: (row) => <span className="font-bold text-slate-800">{row.code}</span>
    },
    {
      header: "Đơn hàng",
      render: (row) => <span className="text-xs text-slate-600 font-mono">{row.orderCode}</span>
    },
    {
      header: "Khách hàng",
      render: (row) => <span className="text-xs text-slate-700 font-semibold">{row.customerName}</span>
    },
    {
      header: "Loại",
      render: (row) => (
        <span className="inline-flex px-2 py-0.5 rounded-lg bg-purple-50 text-purple-700 border border-purple-200 text-xs font-semibold">
          {COMPLAINT_TYPE_LABELS[row.complaintType]}
        </span>
      )
    },
    {
      header: "Số tiền hoàn",
      render: (row) => <span className="font-bold text-pink-600 text-sm">{formatCurrency(row.complaintAmount)}đ</span>
    },
    {
      header: "%",
      render: (row) => <span className="text-xs text-slate-500 font-bold">{row.percent}%</span>
    },
    {
      header: "Trạng thái",
      render: (row) => {
        let statusStyle = 'active';
        if (row.status === COMPLAINT_STATUS.PENDING) statusStyle = 'pending';
        if (row.status === COMPLAINT_STATUS.REJECTED) statusStyle = 'inactive';
        return <StatusBadge status={statusStyle} label={COMPLAINT_STATUS_LABELS[row.status]} />
      }
    },
    {
      header: "Ngày tạo",
      render: (row) => <span className="text-xs text-slate-400 font-medium">{formatDateTime(row.createdAt)}</span>
    },
    {
      header: "Thao tác",
      sticky: true,
      width: "120px",
      render: (row) => (
        <div className="flex items-center gap-1.5 justify-end">
          <ViewComplaintButton
            complaint={row}
            onUpdate={() => fetchComplaints(pagination.page)}
          />
          {row.status === COMPLAINT_STATUS.PENDING && (
            <>
              <EditComplaintButton
                complaint={row}
                onSuccess={() => fetchComplaints(pagination.page)}
              />
              <button
                onClick={() => setDeleteTarget(row)}
                className="p-1.5 bg-slate-50 hover:bg-slate-100 text-red-600 hover:text-red-700 rounded-lg transition-colors border border-slate-200 shadow-sm"
                title="Xóa"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      )
    }
  ]

  return (
    <div className="p-6 bg-slate-50 dark:bg-slate-950 min-h-screen">
      <PageHeader
        title="Quản lý khiếu nại & chiết khấu"
        description="Theo dõi, giải quyết các khiếu nại từ khách hàng và thiết lập chiết khấu/hoàn tiền nhanh."
        badge={`${pagination.total} khiếu nại`}
      />

      <Toolbar
        searchValue={filters.search}
        onSearchChange={(val) => handleFilterChange('search', val)}
        searchPlaceholder="Tìm mã khiếu nại, đơn hàng, khách hàng..."
        onFilterToggle={() => setShowAdvancedFilters(!showAdvancedFilters)}
        filterActive={showAdvancedFilters}
        filterCount={Object.values(filters).filter(Boolean).length}
        actions={
          <div className="flex items-center gap-2">
            <CreateComplaintButton onSuccess={() => fetchComplaints(pagination.page)} />
            <AdminButton
              variant="secondary"
              size="sm"
              onClick={handleExport}
            >
              <Download className="w-4 h-4 mr-1.5" /> Xuất Excel
            </AdminButton>
          </div>
        }
      />

      <FilterPanel isOpen={showAdvancedFilters} onReset={handleReset}>
        <FilterPanel.Field label="Loại khiếu nại">
          <select
            value={filters.complaintType}
            onChange={(e) => handleFilterChange('complaintType', e.target.value)}
          >
            <option value="">Tất cả loại</option>
            {Object.entries(COMPLAINT_TYPE_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </FilterPanel.Field>

        <FilterPanel.Field label="Trạng thái khiếu nại">
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
          >
            <option value="">Tất cả trạng thái</option>
            {Object.entries(COMPLAINT_STATUS_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </FilterPanel.Field>

        <FilterPanel.Field label="Số tiền từ (VND)">
          <input
            type="number"
            placeholder="0"
            value={filters.minAmount}
            onChange={(e) => handleFilterChange('minAmount', e.target.value)}
          />
        </FilterPanel.Field>

        <FilterPanel.Field label="Số tiền đến (VND)">
          <input
            type="number"
            placeholder="0"
            value={filters.maxAmount}
            onChange={(e) => handleFilterChange('maxAmount', e.target.value)}
          />
        </FilterPanel.Field>
      </FilterPanel>

      <DataTable
        columns={columns}
        data={complaints}
        loading={loading}
        keyExtractor={(row) => row._id}
      />

      <Pagination
        page={pagination.page}
        total={pagination.total}
        limit={pagination.limit}
        onPageChange={fetchComplaints}
      />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={executeDelete}
        title="Xác nhận xóa khiếu nại"
        description={`Bạn có chắc chắn muốn xóa khiếu nại "${deleteTarget?.code}"? Thao tác này không thể hoàn tác.`}
      />
    </div>
  )
}

export default ComplaintList