import React, { useEffect, useState } from 'react'
import AdminSpinner from '@/components/AdminSpinner'
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import { toast } from 'react-toastify'
import { Switch } from '@headlessui/react'
import apiAdmin from '@/service/apiAdmin'
import { PageHeader, Toolbar, DataTable, EmptyState, StatusBadge, AdminButton, ConfirmDialog, AdminModal, AdminInput, AdminTextarea } from "@/components/admin/ui"

const Bank = () => {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editBank, setEditBank] = useState(null)
  const [isNewBank, setIsNewBank] = useState(true)
  const [name, setName] = useState("")
  const [dec, setdec] = useState("")
  const [app, setApp] = useState("")
  const [sms, setSms] = useState("")
  const [bank, setBank] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState(null)

  useEffect(() => {
    if (editBank) {
      setName(editBank.name)
      setdec(editBank.description)
      setIsNewBank(editBank.status)
      setApp(editBank.app)
      setSms(editBank.sms)
    }
  }, [editBank])

  const fetchBank = async () => {
    try {
      setIsLoading(true)
      const response = await apiAdmin.get("bank")
      setBank(response?.data || [])
    } catch (error) {
      toast.error("Lỗi khi lấy danh sách ngân hàng!")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchBank()
  }, [editBank])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    let bankdata = {
      name: name,
      description: dec,
      app,
      sms,
      status: isNewBank
    }

    if (!bankdata.name) {
      toast.error("Tên ngân hàng không được để trống!");
      setIsLoading(false);
      return;
    }

    try {
      if (editBank) {
        await apiAdmin.patch(`/bank/${editBank._id}`, bankdata)
        toast.success("Cập nhật ngân hàng thành công")
      } else {
        await apiAdmin.post("/bank", bankdata)
        toast.success("Thêm ngân hàng thành công")
      }
      fetchBank()
      handleCloseForm()
    } catch (error) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra!")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteClick = (type, id, name) => {
    setItemToDelete({ type, id, name })
    setIsModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (itemToDelete) {
      try {
        setIsLoading(true)
        if (itemToDelete.type === 'bank') {
          const res = await apiAdmin.delete(`/bank/${itemToDelete.id}`)
          if (res.status === 200) {
            toast.success("Xóa ngân hàng thành công")
            fetchBank()
          }
        }
      } catch (err) {
        toast.error(err.response?.data?.message || "Lỗi khi xóa!")
      } finally {
        setIsLoading(false)
      }
    }
    setIsModalOpen(false)
    setItemToDelete(null)
  }

  const handleOpenForm = (bank = null) => {
    setEditBank(bank)
    setIsFormOpen(true)
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
    setEditBank(null)
    setName('')
    setdec('')
    setApp('')
    setSms('')
    setIsNewBank(true)
  }

  const columns = [
    {
      header: "Tên ngân hàng",
      render: (row) => <span className="font-bold text-slate-800">{row.name}</span>
    },
    {
      header: "App Package ID",
      render: (row) => <span className="text-xs text-slate-500 font-mono">{row.app || 'N/A'}</span>
    },
    {
      header: "Mô tả / Số tài khoản",
      render: (row) => <span className="text-xs text-slate-600">{row.description || 'N/A'}</span>
    },
    {
      header: "Trạng thái",
      render: (row) => (
        <StatusBadge status={row.status ? 'active' : 'inactive'} />
      )
    },
    {
      header: "Hành động",
      sticky: true,
      width: "100px",
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => handleOpenForm(row)}
            className="p-1.5 bg-slate-50 hover:bg-slate-100 text-blue-600 hover:text-blue-700 rounded-lg transition-colors border border-slate-200 shadow-sm"
            title="Chỉnh sửa"
          >
            <PencilIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDeleteClick('bank', row._id, row.name)}
            className="p-1.5 bg-slate-50 hover:bg-slate-100 text-red-600 hover:text-red-700 rounded-lg transition-colors border border-slate-200 shadow-sm"
            title="Xóa"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ]

  return (
    <div className="p-6 bg-slate-50 dark:bg-slate-950 min-h-screen">
      <PageHeader
        title="Danh sách ngân hàng"
        description="Quản lý các tài khoản ngân hàng kết nối cổng thanh toán tự động và hiển thị mã QR thanh toán."
        badge={`${bank.length} ngân hàng`}
      />

      <Toolbar
        actions={
          <AdminButton
            variant="primary"
            size="sm"
            onClick={() => handleOpenForm()}
          >
            + Thêm ngân hàng mới
          </AdminButton>
        }
      />

      <AdminModal
        open={isFormOpen}
        onClose={handleCloseForm}
        title={editBank ? 'Chỉnh sửa ngân hàng' : 'Thêm ngân hàng mới'}
        description={editBank ? `Cập nhật thông tin ngân hàng: ${editBank.name}` : 'Nhập thông tin ngân hàng mới'}
        size="md"
        footer={
          <>
            <AdminButton variant="ghost" size="sm" onClick={handleCloseForm} disabled={isLoading}>Hủy</AdminButton>
            <AdminButton variant="primary" size="sm" onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? 'Đang lưu…' : 'Lưu lại'}
            </AdminButton>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <AdminInput
            label="Tên ngân hàng"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nhập tên viết tắt hoặc tên chính thức..."
            required
          />
          <AdminTextarea
            label="Mô tả / Số tài khoản"
            value={dec}
            onChange={(e) => setdec(e.target.value)}
            placeholder="Ví dụ: STK - Tên chủ tài khoản..."
            rows={2}
          />
          <AdminTextarea
            label="App Package ID (Tự động mở app thanh toán)"
            value={app}
            onChange={(e) => setApp(e.target.value)}
            placeholder="Ví dụ: com.mbmobile..."
            rows={2}
          />
          <AdminTextarea
            label="SMS Syntax (Nhận diện giao dịch)"
            value={sms}
            onChange={(e) => setSms(e.target.value)}
            placeholder="Cú pháp SMS để định dạng biến biến động số dư..."
            rows={2}
          />
          <div className="flex items-center justify-between py-3 border-y border-slate-100 dark:border-slate-800">
            <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">Trạng thái hoạt động</span>
            <Switch
              checked={isNewBank}
              onChange={setIsNewBank}
              className={`${isNewBank ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'} relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
            >
              <span className={`${isNewBank ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`} />
            </Switch>
          </div>
        </form>
      </AdminModal>

      <DataTable
        columns={columns}
        data={bank}
        loading={isLoading}
        keyExtractor={(row) => row._id}
      />

      {bank.length === 0 && !isLoading && (
        <EmptyState
          title="Chưa kết nối ngân hàng"
          description="Kết nối ngân hàng để hiển thị mã QR tự động trên giao diện thanh toán."
        />
      )}

      <ConfirmDialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Xác nhận xóa ngân hàng"
        description={`Bạn có chắc chắn muốn xóa ngân hàng "${itemToDelete?.name}"? Thao tác này không thể hoàn tác.`}
      />
    </div>
  )
}

export default Bank
