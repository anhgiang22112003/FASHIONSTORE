import React, { useEffect, useState } from "react"
import apiAdmin from "@/service/apiAdmin"
import EditStaff from "./EditStaff"
import { PlusIcon } from '@heroicons/react/24/outline'
import AdminSpinner from "@/components/AdminSpinner"
import { PageHeader, Toolbar, FilterPanel, EmptyState, StatusBadge, AdminButton } from "@/components/admin/ui"

const StaffCard = ({ staff, onEdit }) => {
  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-all duration-300 flex flex-col items-center text-center">
      <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center mb-4 text-indigo-600 border border-indigo-100 dark:border-indigo-800 font-extrabold text-lg">
        {staff?.name ? staff.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : "NV"}
      </div>
      <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base">{staff?.name}</h3>
      <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 font-mono">{staff?.email}</p>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{staff?.phone || "--"}</p>
      <div className="mt-4 flex flex-col items-center gap-3 w-full">
        <StatusBadge status={staff?.status === "active" ? "active" : "inactive"} />
        <AdminButton variant="secondary" size="sm" onClick={() => onEdit(staff)} className="w-full mt-2">
          Chỉnh sửa
        </AdminButton>
      </div>
    </div>
  )
}

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
    <div className="p-6 bg-slate-50 dark:bg-slate-950 min-h-screen">
      <PageHeader
        title="Quản lý nhân viên"
        description="Xem xét và thiết lập quyền truy cập cho đội ngũ nhân sự quản trị hệ thống."
        badge={`${filteredStaffs.length} nhân viên`}
      />

      <Toolbar
        searchValue={filters.nameOrEmail}
        onSearchChange={(val) => setFilters({ ...filters, nameOrEmail: val })}
        searchPlaceholder="Tìm kiếm nhân viên..."
        onFilterToggle={() => setIsFilterOpen(!isFilterOpen)}
        filterActive={isFilterOpen}
        filterCount={Object.values(filters).filter(val => val !== "" && val !== "Tất cả").length}
        actions={
          <AdminButton
            variant="primary"
            size="sm"
            onClick={() => { setEditData(null); setOpenForm(true); }}
            icon={<PlusIcon className="w-4 h-4" />}
          >
            Thêm nhân viên
          </AdminButton>
        }
      />

      <FilterPanel isOpen={isFilterOpen} onReset={clearFilters}>
        <FilterPanel.Field label="Trạng thái">
          <select 
            value={filters.status} 
            onChange={(e) => setFilters({ ...filters, status: e.target.value })} 
          >
            <option value="Tất cả">Tất cả</option>
            <option value="active">Hoạt động</option>
            <option value="inactive">Ngừng hoạt động</option>
          </select>
        </FilterPanel.Field>
      </FilterPanel>

      {loading ? (
        <AdminSpinner message="Đang tải dữ liệu nhân viên..." />
      ) : filteredStaffs?.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredStaffs.map((staff) => (
            <StaffCard
              key={staff._id}
              staff={staff}
              onEdit={handleEdit}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="Không tìm thấy nhân viên"
          description="Chưa có tài khoản nhân viên nào phù hợp với bộ lọc tìm kiếm hiện tại."
        />
      )}

      <EditStaff
        onClose={() => setOpenForm(false)}
        refresh={fetchStaff}
        editData={editData}
        open={openForm}
      />
    </div>
  )
}

export default StaffPage