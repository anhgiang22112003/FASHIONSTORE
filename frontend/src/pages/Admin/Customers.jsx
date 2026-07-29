import apiAdmin from 'service/apiAdmin'
import React, { useEffect, useState, useMemo } from 'react'
import { toast } from 'react-toastify'
import { UserIcon, PencilIcon } from '@heroicons/react/24/outline'
import { useDebounce } from 'hooks/useDebounce'
import AdminSpinner from 'components/AdminSpinner'
import { PageHeader, Toolbar, FilterPanel, Pagination, EmptyState, AdminButton } from "components/admin/ui"

const formatVND = (value) => {
  if (value === '' || value === undefined || value === null) return ''
  const num = String(value).replace(/\D/g, '')
  if (!num) return ''
  return Number(num).toLocaleString('vi-VN')
}

const unformatVND = (formattedValue) => {
  if (typeof formattedValue !== 'string') return formattedValue
  const cleanedValue = formattedValue.replace(/[.,]/g, '')
  return cleanedValue === '' ? '' : Number(cleanedValue)
}

const CustomerCard = ({ customer, setEditingCustomer, setActivePage }) => {
  const handleEditClick = () => {
    setEditingCustomer(customer)
    setActivePage('customerEdit')
  }

  return (
    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col items-center text-center hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-700 transition-all duration-300">
      <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center mb-3 text-indigo-600 border border-indigo-100 dark:border-indigo-800">
        <UserIcon className="w-6 h-6 text-indigo-500" />
      </div>
      <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm truncate max-w-full">{customer?.name}</h3>
      <p className="text-xs text-slate-400 dark:text-slate-500 mb-4 truncate max-w-full">{customer?.email}</p>
      <div className="grid grid-cols-2 gap-2 w-full text-xs text-slate-600 mb-4 bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
        <div className="text-left border-r border-slate-200 dark:border-slate-600 pr-2">
          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Đơn hàng</p>
          <p className="font-extrabold text-sm text-indigo-600 dark:text-indigo-400 mt-0.5">{customer?.orderCount || 0}</p>
        </div>
        <div className="text-right pl-2">
          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Chi tiêu</p>
          <p className="font-extrabold text-sm text-slate-800 dark:text-slate-200 mt-0.5">
            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(customer?.totalSpent || 0)}
          </p>
        </div>
      </div>
      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
        Tham gia:{' '}
        {customer?.createdAt
          ? new Date(customer.createdAt).toLocaleDateString('vi-VN')
          : ''}
      </p>
      <div className="mt-4 w-full">
        <AdminButton
          variant="outline"
          size="sm"
          className="w-full text-xs py-1.5"
          onClick={handleEditClick}
          icon={<PencilIcon className="w-3.5 h-3.5" />}
        >
          Sửa thông tin
        </AdminButton>
      </div>
    </div>
  )
}

const Customers = ({ setEditingCustomer, setActivePage, data }) => {
  const [provinces, setProvinces] = useState([])
  const [totalCustomers, setTotalCustomers] = useState(0)
  const limit = 12

  useEffect(() => {
    import('data/provinces.json')
      .then((data) => setProvinces(data.default || data))
      .catch(error => console.error("Lỗi tải tỉnh/thành:", error))
  }, [])

  const defaultFilters = useMemo(() => ({
    nameOrEmail: '',
    gender: '',
    customerGroup: '',
    province: '',
    status: 'Tất cả',
    startDate: '',
    endDate: '',
    minTotalSpent: '',
    maxTotalSpent: '',
    minOrderCount: '',
    maxOrderCount: '',
  }), [])

  const [customersData, setCustomersData] = useState([])
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [filters, setFilters] = useState(defaultFilters)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isLoading, setIsLoading] = useState(false)

  const debouncedFilters = {
    nameOrEmail: useDebounce(filters.nameOrEmail, 600),
    customerGroup: useDebounce(filters.customerGroup, 600),
    minTotalSpent: useDebounce(filters.minTotalSpent, 600),
    maxTotalSpent: useDebounce(filters.maxTotalSpent, 600),
    minOrderCount: useDebounce(filters.minOrderCount, 600),
    maxOrderCount: useDebounce(filters.maxOrderCount, 600),
  }

  const fetchCustomers = async (currentPage = page) => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      params.append('page', currentPage)
      params.append('limit', limit)

      const finalFilters = {
        ...filters,
        ...debouncedFilters,
        nameOrEmail: debouncedFilters.nameOrEmail,
        customerGroup: debouncedFilters.customerGroup,
        minTotalSpent: debouncedFilters.minTotalSpent,
        maxTotalSpent: debouncedFilters.maxTotalSpent,
        minOrderCount: debouncedFilters.minOrderCount,
        maxOrderCount: debouncedFilters.maxOrderCount,
      }

      Object.entries(finalFilters).forEach(([key, value]) => {
        if (value !== '' && value !== 'Tất cả') {
          if (key.startsWith('min') || key.startsWith('max')) {
            const numValue = Number(value)
            if (!isNaN(numValue) && numValue >= 0) {
              params.append(key, numValue.toString())
            }
          } else {
            params.append(key, value)
          }
        }
      })

      const response = await apiAdmin.get(`/users?${params.toString()}`)
      setCustomersData(response.data.data)
      setTotalPages(response.data.totalPages)
      setTotalCustomers(response.data.total)
    } catch (error) {
      console.error(error)
      toast.error('Không thể tải danh sách khách hàng!')
      setCustomersData([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCustomers(page)
  }, [page])

  useEffect(() => {
    if (page !== 1) {
      setPage(1)
    } else {
      fetchCustomers(1)
    }
  }, [
    filters.gender, filters.province, filters.status,
    filters.startDate, filters.endDate,
    debouncedFilters.nameOrEmail, debouncedFilters.customerGroup,
    debouncedFilters.minTotalSpent, debouncedFilters.maxTotalSpent,
    debouncedFilters.minOrderCount, debouncedFilters.maxOrderCount,
    data
  ])

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    if (name === 'minTotalSpent' || name === 'maxTotalSpent') {
      const numericValue = unformatVND(value)
      setFilters({ ...filters, [name]: numericValue })
    } else if (name.startsWith('minOrderCount') || name.startsWith('maxOrderCount')) {
      const numValue = value === '' ? '' : Number(value)
      if (!isNaN(numValue) || value === '') {
        setFilters({ ...filters, [name]: numValue })
      }
    } else {
      setFilters({ ...filters, [name]: value })
    }
  }

  const clearFilters = () => {
    setFilters(defaultFilters)
    if (page !== 1) {
      setPage(1)
    }
  }

  return (
    <div className="p-6 bg-slate-50 dark:bg-slate-950 min-h-screen">
      <PageHeader
        title="Danh sách Khách hàng"
        description="Quản lý thông tin thành viên, nhóm khách hàng, số lượng đơn hàng và giá trị giao dịch."
        badge={`${totalCustomers} khách hàng`}
      />

      <Toolbar
        onFilterToggle={() => setIsFilterOpen(!isFilterOpen)}
        filterActive={isFilterOpen}
        filterCount={Object.values(filters).filter(val => val !== "" && val !== "Tất cả").length}
        actions={
          <AdminButton
            variant="primary"
            size="sm"
            onClick={() => setActivePage('add-customer')}
          >
            + Thêm khách hàng
          </AdminButton>
        }
      />

      <FilterPanel isOpen={isFilterOpen} onReset={clearFilters}>
        <FilterPanel.Field label="Tìm kiếm">
          <input
            type="text"
            name="nameOrEmail"
            placeholder="Tên, Email, SĐT..."
            value={filters.nameOrEmail}
            onChange={handleFilterChange}
          />
        </FilterPanel.Field>

        <FilterPanel.Field label="Giới tính">
          <select name="gender" value={filters.gender} onChange={handleFilterChange}>
            <option value="">Tất cả</option>
            <option value="male">Nam</option>
            <option value="female">Nữ</option>
            <option value="other">Khác</option>
          </select>
        </FilterPanel.Field>

        <FilterPanel.Field label="Nhóm khách hàng">
          <input
            type="text"
            name="customerGroup"
            placeholder="Nhập nhóm..."
            value={filters.customerGroup}
            onChange={handleFilterChange}
          />
        </FilterPanel.Field>

        <FilterPanel.Field label="Tỉnh / Thành phố">
          <select name="province" value={filters.province} onChange={handleFilterChange}>
            <option value="">Tất cả</option>
            {provinces.map(p => (
              <option key={p.code} value={p.name}>{p.name}</option>
            ))}
          </select>
        </FilterPanel.Field>

        <FilterPanel.Field label="Trạng thái tài khoản">
          <select name="status" value={filters.status} onChange={handleFilterChange}>
            <option value="Tất cả">Tất cả</option>
            <option value="active">Hoạt động</option>
            <option value="inactive">Bị khóa</option>
          </select>
        </FilterPanel.Field>

        <FilterPanel.Field label="Ngày tham gia (Từ)">
          <input
            type="date"
            name="startDate"
            value={filters.startDate}
            onChange={handleFilterChange}
          />
        </FilterPanel.Field>

        <FilterPanel.Field label="Ngày tham gia (Đến)">
          <input
            type="date"
            name="endDate"
            value={filters.endDate}
            onChange={handleFilterChange}
          />
        </FilterPanel.Field>

        <div className="flex gap-2">
          <FilterPanel.Field label="Đơn từ">
            <input
              type="number"
              name="minOrderCount"
              placeholder="0"
              value={filters.minOrderCount}
              onChange={handleFilterChange}
            />
          </FilterPanel.Field>
          <FilterPanel.Field label="Đơn đến">
            <input
              type="number"
              name="maxOrderCount"
              placeholder="100"
              value={filters.maxOrderCount}
              onChange={handleFilterChange}
            />
          </FilterPanel.Field>
        </div>

        <div className="flex gap-2">
          <FilterPanel.Field label="Chi tiêu từ">
            <input
              type="text"
              name="minTotalSpent"
              placeholder="Từ ₫"
              value={formatVND(filters.minTotalSpent)}
              onChange={handleFilterChange}
            />
          </FilterPanel.Field>
          <FilterPanel.Field label="Chi tiêu đến">
            <input
              type="text"
              name="maxTotalSpent"
              placeholder="Đến ₫"
              value={formatVND(filters.maxTotalSpent)}
              onChange={handleFilterChange}
            />
          </FilterPanel.Field>
        </div>
      </FilterPanel>

      {isLoading ? (
        <AdminSpinner message="Đang tải dữ liệu khách hàng..." />
      ) : customersData && customersData.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {customersData.map((customer) => (
              <CustomerCard
                key={customer._id}
                customer={customer}
                setEditingCustomer={setEditingCustomer}
                setActivePage={setActivePage}
              />
            ))}
          </div>

          <Pagination
            page={page}
            total={totalCustomers}
            limit={limit}
            onPageChange={setPage}
          />
        </>
      ) : (
        <EmptyState
          title="Không tìm thấy khách hàng"
          description="Thử thay đổi bộ lọc tìm kiếm hoặc thêm mới một khách hàng để bắt đầu."
        />
      )}
    </div>
  )
}

export default Customers