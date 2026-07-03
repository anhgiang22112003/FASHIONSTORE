import apiAdmin from '@/service/apiAdmin'
import React, { useEffect, useState, useMemo } from 'react'
import { toast } from 'react-toastify'
import { PlusIcon, FunnelIcon, TrashIcon, PencilIcon, UserIcon } from '@heroicons/react/24/outline'
import { useDebounce } from '@/hooks/useDebounce'
import AdminSpinner from '@/components/AdminSpinner'


const FilterItem = ({ label, children }) => (
  <div className="flex flex-col space-y-1">
    <label className="text-sm font-medium ">{label}</label>
    {children}
  </div>
)
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
    <div className="bg-white p-6 rounded-2xl shadow-lg flex flex-col items-center text-center border border-gray-100 hover:shadow-xl transition-shadow duration-300">
      <div className="w-16 h-16 rounded-full bg-pink-100 flex items-center justify-center mb-4 text-pink-600 shadow-inner">
        <UserIcon className="w-8 h-8 text-pink-500" />
      </div>
      <h3 className="text-lg font-bold text-gray-800">{customer?.name}</h3>
      <p className="text-xs text-gray-500 mb-4">{customer?.email}</p>
      <div className="flex justify-between w-full text-sm text-gray-600 mb-4 bg-gray-50 p-3 rounded-xl">
        <div className="text-left">
          <p className="text-xxs text-gray-400 font-semibold uppercase tracking-wider">Đơn hàng</p>
          <p className="font-bold text-base text-pink-600">{customer?.orderCount || 0}</p>
        </div>
        <div className="text-right">
          <p className="text-xxs text-gray-400 font-semibold uppercase tracking-wider">Chi tiêu</p>
          <p className="font-bold text-base text-pink-600">
            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(customer?.totalSpent || 0)}
          </p>
        </div>
      </div>
      <p className="text-xxs text-gray-400">
        Tham gia:{' '}
        {customer?.createdAt
          ? new Date(customer.createdAt).toLocaleDateString('vi-VN')
          : ''}
      </p>
      <div className="flex space-x-2 mt-4 w-full">
        <button
          onClick={handleEditClick}
          className="w-full flex items-center justify-center space-x-1.5 px-4 py-2 bg-pink-600 text-white rounded-xl font-bold hover:bg-pink-700 transition-all text-xs shadow-md shadow-pink-200"
        >
          <PencilIcon className="w-3.5 h-3.5" />
          <span>Sửa thông tin</span>
        </button>
      </div>
    </div>
  )
}

const Customers = ({ setEditingCustomer, setActivePage, data }) => {
  const [provinces, setProvinces] = useState([])
  const [totalCustomers, setTotalCustomers] = useState(0)
  const limit = 12
  useEffect(() => {
    import('@/data/provinces.json')
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

  // --- Handlers ---
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
    <div style={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-color)' }} className="min-h-screen font-sans antialiased">
      <div className="space-y-6 p-5">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-4">
            <h1 className="text-3xl font-bold">Quản lý Khách hàng</h1>
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`px-4 py-2 rounded-xl flex items-center space-x-1 font-medium transition-all ${isFilterOpen ? 'bg-pink-600 text-white hover:bg-pink-700' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
                }`}
            >
              <FunnelIcon className="w-5 h-5" />
              <span>Bộ lọc</span>
            </button>

            {/* Nút Xóa bộ lọc */}

          </div>
          <button
            onClick={() => setActivePage('add-customer')}
            className="flex items-center space-x-2 px-4 py-2.5 text-sm font-semibold rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white shadow-md shadow-pink-200 transition-all"
          >
            <PlusIcon className="w-4 h-4" />
            <span>Thêm khách hàng</span>
          </button>
        </div>

        <div
    className={`transition-all duration-300 ease-in-out overflow-hidden ${
        isFilterOpen ? 'max-h-full opacity-100 mb-6' : 'max-h-0 opacity-0 mb-0'
    }`}
>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3  p-4 rounded-xl shadow relative">
        
        <FilterItem label="Tìm kiếm (Tên, Email, SĐT)">
            <input
                type="text"
                name="nameOrEmail"
                placeholder="Nhập từ khóa tìm kiếm..."
                value={filters.nameOrEmail}
                onChange={handleFilterChange}
                className="px-3 py-2 border rounded-lg text-black focus:ring-2 focus:ring-pink-300"
            />
        </FilterItem>

        {/* 2. Giới tính */}
        <FilterItem label="Giới tính">
            <select name="gender" value={filters.gender} onChange={handleFilterChange} className="px-3 py-2 border rounded-lg text-black bg-white">
                <option value="">Tất cả</option>
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
                <option value="other">Khác</option>
            </select>
        </FilterItem>

        {/* 3. Nhóm khách hàng (Debounced) */}
        <FilterItem label="Nhóm khách hàng">
            <input
                type="text"
                name="customerGroup"
                placeholder="Nhập tên nhóm..."
                value={filters.customerGroup}
                onChange={handleFilterChange}
                className="px-3 py-2 border rounded-lg text-black focus:ring-2 focus:ring-pink-300"
            />
        </FilterItem>

        {/* 4. Tỉnh/Thành phố */}
        <FilterItem label="Tỉnh/Thành phố">
            <select name="province" value={filters.province} onChange={handleFilterChange} className="px-3 py-2 border rounded-lg text-black bg-white">
                <option value="">Tất cả</option>
                {provinces.map(p => (
                    <option key={p.code} value={p.name}>
                        {p.name}
                    </option>
                ))}
            </select>
        </FilterItem>

        {/* 5. Trạng thái hoạt động */}
        <FilterItem label="Trạng thái tài khoản">
            <select name="status" value={filters.status} onChange={handleFilterChange} className="px-3 py-2 border rounded-lg text-black bg-white">
                <option value="Tất cả">Tất cả</option>
                <option value="active">Hoạt động</option>
                <option value="inactive">Bị khóa</option>
            </select>
        </FilterItem>

        {/* 6. Tổng chi tiêu (₫) */}
        <FilterItem label="Tổng chi tiêu (₫)">
            <div className="flex space-x-2">
                <input
                    type="text"
                    name="minTotalSpent"
                    placeholder="Từ"
                    value={formatVND(filters.minTotalSpent)}
                    onChange={handleFilterChange}
                    className="w-1/2 px-3 py-2 border rounded-lg text-black"
                />
                <input
                    type="text"
                    name="maxTotalSpent"
                    placeholder="Đến"
                    value={formatVND(filters.maxTotalSpent)}
                    onChange={handleFilterChange}
                    className="w-1/2 px-3 py-2 border rounded-lg text-black"
                />
            </div>
        </FilterItem>

        {/* 7. Số đơn hàng (Debounced) */}
        <FilterItem label="Số lượng đơn hàng">
            <div className="flex space-x-2">
                <input
                    type="number"
                    name="minOrderCount"
                    placeholder="Từ"
                    value={filters.minOrderCount}
                    onChange={handleFilterChange}
                    className="w-1/2 px-3 py-2 border rounded-lg text-black"
                />
                <input
                    type="number"
                    name="maxOrderCount"
                    placeholder="Đến"
                    value={filters.maxOrderCount}
                    onChange={handleFilterChange}
                    className="w-1/2 px-3 py-2 border rounded-lg text-black"
                />
            </div>
        </FilterItem>

        {/* 8. Ngày tham gia */}
        <FilterItem label="Ngày tham gia (Từ)">
            <input
                type="date"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
                className="px-3 py-2 border rounded-lg text-black bg-white"
            />
        </FilterItem>
        <FilterItem label="Ngày tham gia (Đến)">
            <input
                type="date"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
                className="px-3 py-2 border rounded-lg text-black bg-white"
            />
        </FilterItem>

        {/* Nút Xóa bộ lọc được di chuyển xuống cuối và căn phải */}
        {/* Thêm class col-span-full để chiếm hết chiều rộng, và flex để căn phải */}
        <div className="col-span-full flex justify-end pt-2 border-t border-gray-100">
            <button
                onClick={clearFilters}
                className="px-4 py-2 rounded-lg flex items-center space-x-1 font-medium transition-all bg-red-100 text-red-600 border border-red-300 hover:bg-red-200"
            >
                <TrashIcon className="w-5 h-5" />
                <span>Xóa bộ lọc</span>
            </button>
        </div>
    </div>
</div>


        {isLoading ? (
          <AdminSpinner message="Đang tải dữ liệu khách hàng..." />
        ) : customersData?.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {customersData.map((customer) => (
                <CustomerCard
                  key={customer._id}
                  customer={customer}
                  setEditingCustomer={setEditingCustomer}
                  setActivePage={setActivePage}
                />
              ))}
            </div>

            {/* Phân trang */}
            {!isLoading && customersData?.length > 0 && (
              <div className="mt-6">
                {totalCustomers > limit && (
                  <div className="flex justify-center items-center mt-6 space-x-2">
                    <button
                      onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                      disabled={page === 1}
                      className="px-3 py-1 border rounded-lg hover:bg-gray-200 disabled:opacity-50"
                    >
                      &larr; Trước
                    </button>

                    {Array.from({ length: Math.ceil(totalCustomers / limit) }, (_, i) => (
                      <button
                        key={i}
                        onClick={() => setPage(i + 1)}
                        className={`px-3 py-1 border rounded-lg font-semibold ${page === i + 1
                          ? "bg-pink-600 text-white"
                          : "bg-white text-gray-700 hover:bg-gray-100"
                          }`}
                      >
                        {i + 1}
                      </button>
                    )).slice(Math.max(0, page - 3), Math.min(totalPages, page + 2))} {/* Hiển thị tối đa 5 trang xung quanh trang hiện tại */}

                    {totalPages > 5 && page < totalPages - 2 && (
                      <span className="px-3 py-1">...</span>
                    )}

                    <button
                      onClick={() => setPage(prev => prev + 1)}
                      disabled={page >= totalPages}
                      className="px-3 py-1 border rounded-lg hover:bg-gray-200 disabled:opacity-50"
                    >
                      Sau &rarr;
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-10 text-gray-500">
            Không tìm thấy khách hàng nào phù hợp với bộ lọc.
          </div>
        )}
      </div>
    </div>
  )
}

export default Customers