import React, { useEffect, useState } from "react"
import apiAdmin from "@/service/apiAdmin"
import { toast } from "react-toastify"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import vi from "dayjs/locale/vi"
import {
  CalendarDaysIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ShoppingBagIcon,
  CurrencyDollarIcon,
  CubeIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline"
import { PageHeader } from "@/components/admin/ui"

dayjs.extend(relativeTime)
dayjs.locale(vi)

const formatMoney = (n) => (Number(n) || 0).toLocaleString("vi-VN") + "₫"

const STATUS_CONFIG = {
  ACTIVE: { label: "Đang diễn ra", color: "bg-green-100 text-green-700 border-green-200", dot: "bg-green-500" },
  UPCOMING: { label: "Sắp bắt đầu", color: "bg-blue-100 text-blue-700 border-blue-200", dot: "bg-blue-500" },
  ENDED: { label: "Đã kết thúc", color: "bg-gray-100 text-gray-500 border-gray-200", dot: "bg-gray-400" },
}

const SaleCard = ({ sale, onEnd }) => {
  const [expanded, setExpanded] = useState(false)
  const status = STATUS_CONFIG[sale.status] || STATUS_CONFIG.ENDED
  const sellRate = sale.totalQuantity > 0 ? Math.round((sale.totalSold / sale.totalQuantity) * 100) : 0
  const isRunning = sale.status === "ACTIVE" || sale.status === "UPCOMING"

  return (
    <div className={`border rounded-2xl overflow-hidden transition-all ${isRunning ? "border-pink-200 shadow-sm" : "border-gray-200"}`}>
      <div
        className={`flex items-center justify-between gap-4 px-5 py-4 cursor-pointer transition-colors ${isRunning ? "bg-gradient-to-r from-pink-50/50 to-white" : "bg-gray-50/50"}`}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${status.dot} ${sale.status === "ACTIVE" ? "animate-pulse" : ""}`} />
          <div className="min-w-0">
            <h3 className="font-bold text-sm text-gray-800 truncate">{sale.title}</h3>
            <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500">
              <CalendarDaysIcon className="w-3.5 h-3.5" />
              <span>{dayjs(sale.startTime).format("DD/MM/YYYY HH:mm")}</span>
              <span>→</span>
              <span>{dayjs(sale.endTime).format("DD/MM/YYYY HH:mm")}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="hidden sm:flex items-center gap-4 text-xs">
            <div className="text-center">
              <p className="text-gray-400">Bán được</p>
              <p className="font-bold text-gray-700">{sale.totalSold} / {sale.totalQuantity}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-400">Doanh thu</p>
              <p className="font-bold text-pink-600">{formatMoney(sale.totalRevenue)}</p>
            </div>
          </div>
          <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full border ${status.color}`}>{status.label}</span>
          {expanded ? <ChevronUpIcon className="w-4 h-4 text-gray-400" /> : <ChevronDownIcon className="w-4 h-4 text-gray-400" />}
        </div>
      </div>
      {expanded && (
        <div className="border-t border-gray-100 bg-white">
          <div className="px-5 pt-4">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-gray-500">Tiến độ bán</span>
              <span className={`font-bold ${sellRate >= 80 ? "text-green-600" : "text-gray-600"}`}>{sellRate}% ({sale.totalSold}/{sale.totalQuantity})</span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-500 ${sellRate >= 80 ? "bg-gradient-to-r from-green-400 to-green-500" : "bg-gradient-to-r from-pink-400 to-rose-500"}`} style={{ width: `${sellRate}%` }} />
            </div>
          </div>
          <div className="px-5 py-3 overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-gray-400 uppercase tracking-wider">
                  <th className="pb-2 font-medium">Sản phẩm</th>
                  <th className="pb-2 font-medium text-right">Giá gốc</th>
                  <th className="pb-2 font-medium text-right">Giá sale</th>
                  <th className="pb-2 font-medium text-center">Bán / Tồn</th>
                  <th className="pb-2 font-medium text-right">Doanh thu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {sale.items?.map((item, i) => {
                  const itemRevenue = (item.salePrice || 0) * (item.sold || 0)
                  const itemRate = item.quantity > 0 ? Math.round((item.sold / item.quantity) * 100) : 0
                  const product = item.product || item.productId || {}
                  const originalPrice = product.sellingPrice || 0
                  return (
                    <tr key={i} className="hover:bg-gray-50/50">
                      <td className="py-2.5 pr-3">
                        <div className="flex items-center gap-2">
                          {product.mainImage && <img src={product.mainImage} alt="" className="w-8 h-8 rounded-lg object-cover flex-shrink-0 border border-gray-100" />}
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-800 truncate max-w-[200px]">{product.name || "SP đã xóa"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 text-right text-gray-400 line-through">{formatMoney(originalPrice)}</td>
                      <td className="py-2.5 text-right font-bold text-pink-600">{formatMoney(item.salePrice)}</td>
                      <td className="py-2.5 text-center">
                        <span className="font-bold text-gray-700">{item.sold}</span>
                        <span className="text-gray-400">/{item.quantity}</span>
                        <span className={`ml-1 font-semibold ${itemRate >= 80 ? "text-green-600" : "text-gray-500"}`}>({itemRate}%)</span>
                      </td>
                      <td className="py-2.5 text-right font-bold text-gray-800">{formatMoney(itemRevenue)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          {sale.status === "ACTIVE" && onEnd && (
            <div className="px-5 pb-4">
              <button
                onClick={(e) => { e.stopPropagation(); onEnd(sale._id) }}
                className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold rounded-xl border border-red-200 transition-colors"
              >Kết thúc ngay</button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

const FlashSaleHistoryPage = ({ setActiveTab }) => {
  const [sales, setSales] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("")
  const [search, setSearch] = useState("")

  const fetchSales = async () => {
    setLoading(true)
    try {
      const params = {}
      if (filter) params.status = filter
      if (search) params.search = search
      const res = await apiAdmin.get("/flash-sales/history", { params })
      setSales(res?.data || [])
    } catch {
      toast.error("Lỗi khi tải lịch sử Flash Sale")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchSales() }, [filter, search])

  const handleEndSale = async (saleId) => {
    try {
      await apiAdmin.post(`/flash-sales/${saleId}/end`)
      toast.success("Flash Sale đã kết thúc!")
      fetchSales()
    } catch {
      toast.error("Lỗi khi kết thúc Flash Sale")
    }
  }

  const stats = sales.reduce(
    (acc, s) => ({
      totalSales: acc.totalSales + 1,
      totalSold: acc.totalSold + (s.totalSold || 0),
      totalRevenue: acc.totalRevenue + (s.totalRevenue || 0),
      activeCount: acc.activeCount + (s.status === "ACTIVE" ? 1 : 0),
    }),
    { totalSales: 0, totalSold: 0, totalRevenue: 0, activeCount: 0 }
  )

  return (
    <div className="p-6 bg-slate-50 dark:bg-slate-950 min-h-screen">
      <PageHeader
        title="Lịch sử Flash Sale"
        description="Xem hiệu suất và doanh thu của tất cả các đợt Flash Sale."
        badge={`${sales.length} sự kiện`}
      />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-1"><ShoppingBagIcon className="w-4 h-4" /><span>Tổng sự kiện</span></div>
          <p className="text-2xl font-bold text-gray-800">{stats.totalSales}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-1"><CubeIcon className="w-4 h-4" /><span>Tổng đã bán</span></div>
          <p className="text-2xl font-bold text-gray-800">{stats.totalSold}</p>
        </div>
        <div className="bg-white rounded-xl border border-pink-100 p-4">
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-1"><CurrencyDollarIcon className="w-4 h-4 text-pink-500" /><span>Tổng doanh thu</span></div>
          <p className="text-2xl font-bold text-pink-600">{formatMoney(stats.totalRevenue)}</p>
        </div>
        <div className="bg-white rounded-xl border border-green-100 p-4">
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-1"><span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /><span>Đang chạy</span></div>
          <p className="text-2xl font-bold text-green-600">{stats.activeCount}</p>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-xs">
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm theo tên sự kiện..." className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-400" />
          <ShoppingBagIcon className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
        </div>
        <div className="flex items-center gap-2">
          {["", "ACTIVE", "UPCOMING", "ENDED"].map((s) => {
            const labels = { "": "Tất cả", ACTIVE: "Đang chạy", UPCOMING: "Sắp tới", ENDED: "Đã kết thúc" }
            return (
              <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${filter === s ? "bg-pink-500 text-white border-pink-500" : "bg-white text-gray-600 border-gray-200 hover:border-pink-300"}`}>
                {labels[s]}
              </button>
            )
          })}
        </div>
        <button onClick={fetchSales} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors" title="Làm mới">
          <ArrowPathIcon className="w-4 h-4 text-gray-500" />
        </button>
      </div>
      {loading ? (
        <div className="flex justify-center items-center py-24">
          <span className="animate-spin w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full" />
        </div>
      ) : sales.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4"><ShoppingBagIcon className="w-8 h-8 text-gray-300" /></div>
          <p className="text-gray-500 font-semibold">Chưa có Flash Sale nào</p>
          <p className="text-xs text-gray-400 mt-1">Tạo sự kiện đầu tiên để bắt đầu.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sales.map((sale) => (<SaleCard key={sale._id} sale={sale} onEnd={handleEndSale} />))}
        </div>
      )}
    </div>
  )
}

export default FlashSaleHistoryPage
