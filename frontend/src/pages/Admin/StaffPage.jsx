import React, { useEffect, useState } from "react"
import apiAdmin from "@/service/apiAdmin"
import EditStaff from "./EditStaff"
import { PlusIcon, FunnelIcon, TrashIcon } from '@heroicons/react/24/outline'

const StaffCard = ({ staff, onEdit }) => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg flex flex-col items-center text-center">
      <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4 text-blue-600">
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 12c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"></path>
        </svg>
      </div>
      <h3 className="text-xl font-semibold text-gray-800">{staff?.name}</h3>
      <p className="text-sm text-gray-500 mb-2">{staff?.email}</p>
      <p className="text-sm text-gray-600 mb-4">{staff?.phone || "--"}</p>
      <div className="flex justify-center w-full mb-4">
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
          staff?.status === "active" 
            ? "bg-green-100 text-green-700" 
            : "bg-red-100 text-red-700"
        }`}>
          {staff?.status === "active" ? "Hoạt động" : "Ngừng hoạt động"}
        </span>
      </div>
      <div className="flex space-x-2 mt-4">
        <button
          onClick={() => onEdit(staff)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"></path>
          </svg>
          <span>Sửa</span>
        </button>
      </div>
    </div>
  )
}

const FilterItem = ({ label, children }) => (
  <div className="flex flex-col space-y-1">
    <label className="text-sm font-medium">{label}</label>
    {children}
  </div>
)

const StaffPage = () => {
  const [staffs, setStaffs] = useState([])
  const [loading, setLoading] = useState(false)
  const [openForm, setOpenForm] = useState(false)
  const [editData, setEditData] = useState(null)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  
  const defaultFilters = {
    nameOrEmail: '',
    status: 'Tất cả',
  }
  
  const [filters, setFilters] = useState(defaultFilters)

  const fetchStaff = async () => {
    setLoading(true)
    try {
      const res = await apiAdmin.get("/users/staff")
      setStaffs(res.data.data || [])
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchStaff()
  }, [])

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters({ ...filters, [name]: value })
  }

  const clearFilters = () => {
    setFilters(defaultFilters)
  }

  const handleEdit = (staff) => {
    setEditData(staff)
    setOpenForm(true)
  }

  const filteredStaffs = staffs.filter((staff) => {
    const matchesSearch = filters.nameOrEmail === '' || 
      staff.name?.toLowerCase().includes(filters.nameOrEmail.toLowerCase()) ||
      staff.email?.toLowerCase().includes(filters.nameOrEmail.toLowerCase()) ||
      staff.phone?.includes(filters.nameOrEmail)
    
    const matchesStatus = filters.status === 'Tất cả' || staff.status === filters.status
    
    return matchesSearch && matchesStatus
  })

  return (
    <div style={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-color)' }} className="min-h-screen font-sans antialiased">
      <div className="space-y-6 p-5">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-4">
            <h1 className="text-3xl font-bold">Quản lý nhân viên</h1>
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`px-4 py-2 rounded-xl flex items-center space-x-1 font-medium transition-all ${
                isFilterOpen 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
              }`}
            >
              <FunnelIcon className="w-5 h-5" />
              <span>Bộ lọc</span>
            </button>
          </div>
          <button
            onClick={() => { setEditData(null); setOpenForm(true); }}
            className="flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors bg-blue-600 hover:bg-blue-700 text-white"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Thêm nhân viên</span>
          </button>
        </div>

        <div
          className={`transition-all duration-300 ease-in-out overflow-hidden ${
            isFilterOpen ? 'max-h-full opacity-100 mb-6' : 'max-h-0 opacity-0 mb-0'
          }`}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 rounded-xl shadow relative">
            <FilterItem label="Tìm kiếm (Tên, Email, SĐT)">
              <input
                type="text"
                name="nameOrEmail"
                placeholder="Nhập từ khóa tìm kiếm..."
                value={filters.nameOrEmail}
                onChange={handleFilterChange}
                className="px-3 py-2 border rounded-lg text-black focus:ring-2 focus:ring-blue-300"
              />
            </FilterItem>

            <FilterItem label="Trạng thái">
              <select 
                name="status" 
                value={filters.status} 
                onChange={handleFilterChange} 
                className="px-3 py-2 border rounded-lg text-black bg-white"
              >
                <option value="Tất cả">Tất cả</option>
                <option value="active">Hoạt động</option>
                <option value="inactive">Ngừng hoạt động</option>
              </select>
            </FilterItem>

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

        {loading ? (
          <div className="text-center py-10 text-gray-500">
            <svg className="animate-spin h-8 w-8 text-blue-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Đang tải dữ liệu nhân viên...
          </div>
        ) : filteredStaffs?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {filteredStaffs.map((staff) => (
              <StaffCard
                key={staff._id}
                staff={staff}
                onEdit={handleEdit}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-gray-500">
            Không tìm thấy nhân viên nào phù hợp với bộ lọc.
          </div>
        )}

        {openForm && (
          <EditStaff
            onClose={() => setOpenForm(false)}
            refresh={fetchStaff}
            editData={editData}
          />
        )}
      </div>
    </div>
  )
}

export default StaffPage