import React, { useEffect, useState } from "react"
import apiAdmin from "service/apiAdmin"
import { toast } from "react-toastify"
import dayjs from "dayjs"
import {
  PencilSquareIcon,
  StopCircleIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/outline"
import { PageHeader, Toolbar, DataTable, StatusBadge, AdminButton, EmptyState } from "components/admin/ui"

const FlashSaleListPage = ({ setActiveTab, setEditData }) => {
  const [flashSales, setFlashSales] = useState([])
  const [loading, setLoading] = useState(true)

  const handleEdit = (sale) => {
    setEditData(sale)
    setActiveTab("add-flashsale")
  }

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

  useEffect(() => {
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

  const columns = [
    {
      header: "#",
      width: "50px",
      render: (row, index) => <span className="font-mono text-slate-400">{index + 1}</span>
    },
    {
      header: "Tên sự kiện",
      render: (row) => <span className="font-bold text-slate-800">{row.title}</span>
    },
    {
      header: "Thời gian bắt đầu",
      render: (row) => (
        <div className="flex items-center gap-1.5 text-xs text-slate-600">
          <CalendarDaysIcon className="w-3.5 h-3.5 text-slate-400" />
          <span>{dayjs(row.startTime).format("DD/MM/YYYY HH:mm")}</span>
        </div>
      )
    },
    {
      header: "Thời gian kết thúc",
      render: (row) => (
        <div className="flex items-center gap-1.5 text-xs text-slate-600">
          <CalendarDaysIcon className="w-3.5 h-3.5 text-slate-400" />
          <span>{dayjs(row.endTime).format("DD/MM/YYYY HH:mm")}</span>
        </div>
      )
    },
    {
      header: "Trạng thái",
      render: (row) => (
        <StatusBadge
          status={row.status === "ACTIVE" ? "active" : row.status === "UPCOMING" ? "pending" : "inactive"}
          customLabel={row.status === "ACTIVE" ? "Đang diễn ra" : row.status === "UPCOMING" ? "Sắp bắt đầu" : "Đã kết thúc"}
        />
      )
    },
    {
      header: "Hành động",
      sticky: true,
      width: "100px",
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => handleEdit(row)}
            className="p-1.5 bg-slate-50 hover:bg-slate-100 text-blue-600 hover:text-blue-700 rounded-lg transition-colors border border-slate-200 shadow-sm"
            title="Chỉnh sửa"
          >
            <PencilSquareIcon className="w-4 h-4" />
          </button>
          {row.status === "ACTIVE" && (
            <button
              onClick={() => handleEndSale(row._id)}
              className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 rounded-lg transition-colors border border-red-255 shadow-sm"
              title="Kết thúc ngay"
            >
              <StopCircleIcon className="w-4 h-4" />
            </button>
          )}
        </div>
      )
    }
  ]

  return (
    <div className="p-6 bg-slate-50 dark:bg-slate-950 min-h-screen">
      <PageHeader
        title="Quản lý Flash Sale"
        description="Theo dõi và điều phối các chương trình khuyến mãi giờ vàng giá sốc."
        badge={`${flashSales.length} sự kiện`}
      />

      <Toolbar
        actions={
          <AdminButton
            variant="primary"
            size="sm"
            onClick={() => {
              setEditData(null)
              setActiveTab("add-flashsale")
            }}
          >
            + Thêm sự kiện Flash Sale
          </AdminButton>
        }
      />

      {loading ? (
        <div className="flex justify-center items-center py-24">
          <span className="animate-spin w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full"></span>
        </div>
      ) : flashSales.length === 0 ? (
        <EmptyState
          title="Chưa có Flash Sale nào"
          description="Tạo sự kiện giờ vàng đầu tiên để kích cầu mua sắm và bùng nổ doanh số!"
          action={
            <AdminButton
              variant="primary"
              size="sm"
              onClick={() => {
                setEditData(null)
                setActiveTab("add-flashsale")
              }}
            >
              + Tạo ngay
            </AdminButton>
          }
        />
      ) : (
        <DataTable
          columns={columns}
          data={flashSales}
          loading={loading}
          keyExtractor={(row) => row._id}
        />
      )}
    </div>
  )
}

export default FlashSaleListPage
