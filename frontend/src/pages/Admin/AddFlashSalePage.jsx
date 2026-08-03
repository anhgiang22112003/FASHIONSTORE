import React, { useEffect, useState, useCallback, useMemo } from "react"
import apiAdmin from "@/service/apiAdmin"
import { toast } from "react-toastify"
import dayjs from "dayjs"
import {
  ArrowLeftIcon,
  CalendarIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  SparklesIcon,
  ShoppingBagIcon,
  PlusIcon,
  CheckIcon,
  XMarkIcon,
  TagIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline"

/* ─── helpers ────────────────────────────────────── */
const formatMoney = (n) => (Number(n) || 0).toLocaleString("vi-VN") + "₫"

const QUICK_DISCOUNTS = [
  { label: "-10%", pct: 10 },
  { label: "-20%", pct: 20 },
  { label: "-30%", pct: 30 },
  { label: "-50%", pct: 50 },
]

const ITEM_STATUS = {
  OK: "ok",
  BELOW_COST: "below_cost",
  OVER_STOCK: "over_stock",
  ZERO_PRICE: "zero_price",
}

function getItemStatus(item) {
  if (!item.salePrice || item.salePrice <= 0) return ITEM_STATUS.ZERO_PRICE
  if (item.costPrice && item.salePrice < item.costPrice) return ITEM_STATUS.BELOW_COST
  if (item.quantity > item.stock) return ITEM_STATUS.OVER_STOCK
  return ITEM_STATUS.OK
}

function StatusDot({ status }) {
  const map = {
    [ITEM_STATUS.OK]: "bg-green-500",
    [ITEM_STATUS.BELOW_COST]: "bg-red-500",
    [ITEM_STATUS.OVER_STOCK]: "bg-amber-500",
    [ITEM_STATUS.ZERO_PRICE]: "bg-red-500",
  }
  return <span className={`inline-block w-2 h-2 rounded-full ${map[status] || "bg-gray-300"}`} />
}

function StatusTooltip({ item }) {
  const status = getItemStatus(item)
  if (status === ITEM_STATUS.OK) return null
  const map = {
    [ITEM_STATUS.BELOW_COST]: {
      text: `Giá sale thấp hơn giá vốn (${formatMoney(item.costPrice)}). Bạn sẽ lỗ!`,
      color: "text-red-600 bg-red-50 border-red-200",
    },
    [ITEM_STATUS.OVER_STOCK]: {
      text: `Số lượng sale (${item.quantity}) vượt quá tồn kho (${item.stock})`,
      color: "text-amber-700 bg-amber-50 border-amber-200",
    },
    [ITEM_STATUS.ZERO_PRICE]: {
      text: "Chưa thiết lập giá flash sale",
      color: "text-red-600 bg-red-50 border-red-200",
    },
  }
  const info = map[status]
  return (
    <div className={`flex items-start gap-1.5 text-xs p-2 rounded-lg border mt-1.5 ${info?.color || ""}`}>
      <ExclamationTriangleIcon className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
      <span>{info?.text}</span>
    </div>
  )
}

/* ─── Quick Discount Buttons ──────────────────────── */
function QuickDiscountBtns({ originalPrice, onApply }) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {QUICK_DISCOUNTS.map((d) => {
        const newPrice = Math.round(originalPrice * (1 - d.pct / 100))
        return (
          <button
            key={d.pct}
            type="button"
            onClick={() => onApply(newPrice, d.pct)}
            className="px-2 py-1 text-[10px] font-bold rounded-lg border border-gray-200 bg-gray-50 text-gray-600 hover:bg-pink-50 hover:border-pink-300 hover:text-pink-700 transition-all"
          >
            {d.label}
          </button>
        )
      })}
    </div>
  )
}

/* ─── Price Info Row ──────────────────────────────── */
function PriceInfo({ originalPrice, salePrice, costPrice }) {
  const discount = originalPrice > 0 ? Math.round(((originalPrice - salePrice) / originalPrice) * 100) : 0
  const profit = salePrice - (costPrice || 0)
  const margin = salePrice > 0 ? Math.round((profit / salePrice) * 100) : 0
  const isLoss = profit < 0

  return (
    <div className="grid grid-cols-3 gap-2 mt-1.5">
      <div className="text-center p-1.5 rounded-lg bg-gray-50">
        <p className="text-[10px] text-gray-400">Giảm</p>
        <p className={`text-xs font-bold ${discount > 0 ? "text-green-600" : "text-gray-500"}`}>
          {discount > 0 ? `-${discount}%` : "0%"}
        </p>
      </div>
      <div className="text-center p-1.5 rounded-lg bg-gray-50">
        <p className="text-[10px] text-gray-400">Lợi nhuận</p>
        <p className={`text-xs font-bold ${isLoss ? "text-red-500" : "text-green-600"}`}>
          {isLoss ? `-${formatMoney(Math.abs(profit))}` : `+${formatMoney(profit)}`}
        </p>
      </div>
      <div className="text-center p-1.5 rounded-lg bg-gray-50">
        <p className="text-[10px] text-gray-400">Biên độ</p>
        <p className={`text-xs font-bold ${margin < 0 ? "text-red-500" : "text-blue-600"}`}>
          {margin}%
        </p>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════
   Main Component
   ═══════════════════════════════════════════════════════ */
const AddFlashSalePage = ({ setActiveTab, editData }) => {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [loadingSearch, setLoadingSearch] = useState(false)
  const [title, setTitle] = useState(editData?.title || "")
  const [startTime, setStartTime] = useState(
    editData?.startTime ? dayjs(editData.startTime).format("YYYY-MM-DDTHH:mm") : ""
  )
  const [endTime, setEndTime] = useState(
    editData?.endTime ? dayjs(editData.endTime).format("YYYY-MM-DDTHH:mm") : ""
  )
  const [selectedItems, setSelectedItems] = useState([])

  /* ── summary ─────────────────────────── */
  const summary = useMemo(() => {
    const total = selectedItems.length
    const warnings = selectedItems.filter((i) => getItemStatus(i) !== ITEM_STATUS.OK).length
    const lossCount = selectedItems.filter((i) => getItemStatus(i) === ITEM_STATUS.BELOW_COST).length
    const totalSaleQty = selectedItems.reduce((s, i) => s + (parseInt(i.quantity) || 0), 0)
    return { total, warnings, lossCount, totalSaleQty }
  }, [selectedItems])

  /* ── search ──────────────────────────── */
  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults([]); return }
    const timeout = setTimeout(async () => {
      setLoadingSearch(true)
      try {
        const res = await apiAdmin.get(`/products/search?query=${encodeURIComponent(searchQuery)}`)
        setSearchResults(res?.data || [])
      } catch {
        toast.error("Lỗi khi tìm kiếm sản phẩm")
      } finally {
        setLoadingSearch(false)
      }
    }, 500)
    return () => clearTimeout(timeout)
  }, [searchQuery])

  /* ── load edit data ──────────────────── */
  useEffect(() => {
    if (!editData?._id) return
    const fetchItems = async () => {
      try {
        const res = await apiAdmin.get(`/flash-sales/${editData._id}`)
        setSelectedItems(
          res?.data?.items?.map((i) => ({
            productId: i.productId._id,
            name: i.productId.name,
            mainImage: i.productId.mainImage,
            originalPrice: i.productId.sellingPrice,
            costPrice: i.productId.costPrice || 0,
            salePrice: i.salePrice,
            quantity: i.quantity,
            stock: i.productId.stock,
          })) || []
        )
      } catch {
        toast.error("Lỗi khi tải sản phẩm Flash Sale")
      }
    }
    fetchItems()
  }, [editData])

  /* ── handlers ────────────────────────── */
  const handleAddItem = useCallback((product) => {
    if (selectedItems.some((i) => i.productId === product._id)) {
      toast.info("Sản phẩm này đã được thêm rồi!")
      return
    }
    // Auto-suggest: giảm 30% mặc định
    const suggestedPrice = Math.round(product.sellingPrice * 0.7 / 1000) * 1000
    setSelectedItems((prev) => [
      ...prev,
      {
        productId: product._id,
        name: product.name,
        mainImage: product.mainImage,
        originalPrice: product.sellingPrice,
        costPrice: product.costPrice || 0,
        salePrice: suggestedPrice,
        quantity: Math.min(10, product.stock || 10),
        stock: product.stock,
      },
    ])
  }, [selectedItems])

  const handleRemoveItem = useCallback((id) => {
    setSelectedItems((prev) => prev.filter((i) => i.productId !== id))
  }, [])

  const handleSalePriceChange = useCallback((productId, value) => {
    const newPrice = Math.round(parseFloat(value) || 0)
    setSelectedItems((prev) =>
      prev.map((i) => (i.productId === productId ? { ...i, salePrice: newPrice } : i))
    )
  }, [])

  const handleQuantityChange = useCallback((productId, value) => {
    const newQty = parseInt(value) || 0
    setSelectedItems((prev) =>
      prev.map((i) => (i.productId === productId ? { ...i, quantity: newQty } : i))
    )
  }, [])

  const handleQuickDiscount = useCallback((productId, newPrice) => {
    setSelectedItems((prev) =>
      prev.map((i) => (i.productId === productId ? { ...i, salePrice: newPrice } : i))
    )
  }, [])

  const handleMaxStock = useCallback((productId) => {
    setSelectedItems((prev) =>
      prev.map((i) =>
        i.productId === productId ? { ...i, quantity: i.stock } : i
      )
    )
  }, [])

  /* ── submit ──────────────────────────── */
  const handleSubmit = async (e) => {
    e.preventDefault()

    const startMoment = dayjs(startTime)
    const endMoment = dayjs(endTime)

    if (!startMoment.isValid() || !endMoment.isValid()) {
      toast.error("Vui lòng chọn đầy đủ thời gian bắt đầu và kết thúc.")
      return
    }
    if (startMoment.isSame(endMoment) || startMoment.isAfter(endMoment)) {
      toast.error("Thời gian bắt đầu phải nhỏ hơn thời gian kết thúc.")
      return
    }
    if (selectedItems.length === 0) {
      toast.error("Chưa có sản phẩm nào trong chương trình.")
      return
    }
    const hasNoPrice = selectedItems.some((i) => !i.salePrice || i.salePrice <= 0)
    if (hasNoPrice) {
      toast.error("Vui lòng thiết lập giá flash sale cho tất cả sản phẩm.")
      return
    }
    const hasLoss = selectedItems.some((i) => i.costPrice && i.salePrice < i.costPrice)
    if (hasLoss) {
      const lossItems = selectedItems.filter((i) => i.costPrice && i.salePrice < i.costPrice)
      if (!window.confirm(`${lossItems.length} sản phẩm có giá sale thấp hơn giá vốn (bán lỗ). Tiếp tục?`)) {
        return
      }
    }

    const payload = {
      title,
      startTime: startMoment.toDate(),
      endTime: endMoment.toDate(),
      items: selectedItems.map((item) => ({
        productId: item.productId,
        salePrice: item.salePrice,
        quantity: item.quantity,
      })),
    }

    try {
      if (editData?._id) {
        await apiAdmin.put(`/flash-sales/${editData._id}`, payload)
        toast.success("Cập nhật Flash Sale thành công!")
      } else {
        await apiAdmin.post("/flash-sales", payload)
        toast.success("Thêm Flash Sale thành công!")
      }
      setActiveTab("flash-sale")
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi khi lưu Flash Sale")
    }
  }

  /* ═══════════════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════════════ */
  return (
    <div
      style={{ backgroundColor: "var(--bg-color)", color: "var(--text-color)" }}
      className="max-w-full mt-5 mx-auto shadow-xl p-8 rounded-2xl border border-gray-100 font-sans text-gray-800"
    >
      {/* Header */}
      <header className="flex justify-between items-center mb-8 border-b border-gray-100 pb-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setActiveTab("flash-sale")}
            className="p-2 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 hover:text-gray-900 transition-all shadow-sm"
            title="Quay lại"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              {editData?._id ? "Chỉnh sửa Flash Sale" : "Thêm sự kiện Flash Sale"}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {editData?._id
                ? `Cập nhật thông tin sự kiện ID: ${editData._id}`
                : "Thiết lập chương trình giảm giá giờ vàng mới"}
            </p>
          </div>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* ── Cột trái: Config + Search ── */}
        <div className="lg:col-span-5 space-y-6">
          {/* Thông tin sự kiện */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs space-y-5">
            <h3 className="text-base font-bold text-gray-850 flex items-center space-x-2 pb-2 border-b border-gray-50">
              <TagIcon className="w-5 h-5 text-pink-500" />
              <span>Thông tin sự kiện</span>
            </h3>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Tên sự kiện
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border text-black border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-400 transition-all text-sm"
                placeholder="VD: Giờ Vàng Thứ Sáu Giảm 50%"
                required
              />
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center space-x-1.5">
                  <CalendarIcon className="w-4 h-4 text-gray-400" />
                  <span>Bắt đầu</span>
                </label>
                <input
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full text-black border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-400 transition-all text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center space-x-1.5">
                  <CalendarIcon className="w-4 h-4 text-gray-400" />
                  <span>Kết thúc</span>
                </label>
                <input
                  type="datetime-local"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full text-black border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-400 transition-all text-sm"
                  required
                />
              </div>
            </div>
          </div>

          {/* Tìm kiếm sản phẩm */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-gray-850 flex items-center space-x-2 pb-2 border-b border-gray-50">
              <MagnifyingGlassIcon className="w-5 h-5 text-pink-500" />
              <span>Tìm kiếm sản phẩm</span>
            </h3>

            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Nhập tên sản phẩm..."
                className="w-full text-black border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-400 transition-all text-sm"
              />
              <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
            </div>

            <div>
              {loadingSearch && (
                <div className="flex items-center space-x-2 py-3 justify-center text-xs text-gray-500">
                  <span className="animate-spin inline-block w-4 h-4 border-2 border-pink-500 border-t-transparent rounded-full" />
                  <span>Đang tìm kiếm...</span>
                </div>
              )}

              <div className="border border-gray-100 rounded-xl max-h-56 overflow-y-auto bg-gray-50/50 divide-y divide-gray-100">
                {searchResults.length === 0 && !loadingSearch && (
                  <p className="text-gray-450 text-xs p-4 text-center italic">
                    Nhập tên sản phẩm để bắt đầu chọn...
                  </p>
                )}
                {searchResults.map((p) => {
                  const alreadyAdded = selectedItems.some((i) => i.productId === p._id)
                  return (
                    <div key={p._id} className="flex justify-between items-center p-3 hover:bg-pink-50/20 transition-all">
                      <div className="flex-1 min-w-0 pr-3">
                        <span className="font-semibold text-xs text-gray-850 block truncate">
                          {p.name}
                        </span>
                        <span className="text-[10px] text-gray-400 block mt-0.5">
                          Giá gốc: {formatMoney(p.sellingPrice)} · Kho: {p.stock}
                          {p.costPrice ? ` · Vốn: ${formatMoney(p.costPrice)}` : ""}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleAddItem(p)}
                        disabled={alreadyAdded}
                        className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1 ${
                          alreadyAdded
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-pink-50 hover:bg-pink-100 text-pink-600"
                        }`}
                      >
                        {alreadyAdded ? (
                          <><CheckIcon className="w-3.5 h-3.5" /><span>Đã thêm</span></>
                        ) : (
                          <><PlusIcon className="w-3.5 h-3.5" /><span>Thêm</span></>
                        )}
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ── Cột phải: Sản phẩm đã chọn ── */}
        <div className="lg:col-span-7 flex flex-col h-full space-y-4">
          {/* Summary bar */}
          {selectedItems.length > 0 && (
            <div className="bg-white border border-gray-100 rounded-xl px-5 py-3 flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-4 text-xs">
                <span className="font-semibold text-gray-700">
                  <ShoppingBagIcon className="w-4 h-4 inline mr-1 text-pink-500" />
                  {summary.total} sản phẩm
                </span>
                <span className="text-gray-400">·</span>
                <span className="text-gray-500">
                  Tổng SL sale: <span className="font-semibold text-gray-700">{summary.totalSaleQty}</span>
                </span>
                {summary.warnings > 0 && (
                  <>
                    <span className="text-gray-400">·</span>
                    <span className={`font-semibold flex items-center gap-1 ${summary.lossCount > 0 ? "text-red-600" : "text-amber-600"}`}>
                      <ExclamationTriangleIcon className="w-3.5 h-3.5" />
                      {summary.warnings} cảnh báo
                    </span>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Item list */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs flex-1 flex flex-col min-h-[400px]">
            <h3 className="text-base font-bold text-gray-850 flex items-center space-x-2 pb-3 border-b border-gray-100 mb-4">
              <ShoppingBagIcon className="w-5 h-5 text-pink-500" />
              <span>Sản phẩm trong chương trình ({selectedItems.length})</span>
            </h3>

            {selectedItems.length === 0 ? (
              <div className="flex-grow flex flex-col items-center justify-center text-center p-8 space-y-3">
                <div className="p-4 bg-pink-50 rounded-full text-pink-500">
                  <ShoppingBagIcon className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700">Chưa có sản phẩm nào</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Tìm kiếm và click "Thêm" sản phẩm từ cột trái.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4 overflow-y-auto max-h-[520px] pr-1">
                {selectedItems.map((item) => {
                  const status = getItemStatus(item)
                  return (
                    <div
                      key={item.productId}
                      className={`border rounded-2xl p-4 transition-all ${
                        status === ITEM_STATUS.BELOW_COST
                          ? "border-red-200 bg-red-50/30"
                          : status === ITEM_STATUS.OVER_STOCK
                            ? "border-amber-200 bg-amber-50/30"
                            : "border-gray-100 bg-white hover:border-pink-100 hover:shadow-xs"
                      }`}
                    >
                      {/* Product info row */}
                      <div className="flex items-start gap-3 mb-3">
                        {item.mainImage && (
                          <img
                            src={item.mainImage}
                            alt={item.name}
                            className="w-12 h-12 rounded-lg object-cover flex-shrink-0 border border-gray-100"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <StatusDot status={status} />
                            <span className="font-semibold text-sm text-gray-850 truncate block" title={item.name}>
                              {item.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5 text-[10px] text-gray-400">
                            <span>Giá gốc: <span className="font-medium text-gray-600">{formatMoney(item.originalPrice)}</span></span>
                            {item.costPrice > 0 && (
                              <span>· Vốn: <span className="font-medium text-gray-600">{formatMoney(item.costPrice)}</span></span>
                            )}
                            <span>· Kho: <span className="font-medium text-gray-600">{item.stock}</span></span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.productId)}
                          className="text-gray-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                          title="Xóa"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Quick discount buttons */}
                      <div className="mb-3">
                        <p className="text-[10px] text-gray-400 mb-1.5 font-medium">CHỐN NHANH GIẢM GIÁ:</p>
                        <QuickDiscountBtns
                          originalPrice={item.originalPrice}
                          onApply={(price) => handleQuickDiscount(item.productId, price)}
                        />
                      </div>

                      {/* Price + Quantity inputs */}
                      <div className="grid grid-cols-2 gap-3 mb-1">
                        <div>
                          <label className="block text-[10px] text-gray-400 mb-1 font-medium">
                            GIÁ FLASH SALE (₫)
                          </label>
                          <input
                            type="number"
                            value={item.salePrice}
                            onChange={(e) => handleSalePriceChange(item.productId, e.target.value)}
                            className="w-full border text-black border-gray-200 rounded-xl px-3 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-400"
                            placeholder="Giá sale"
                            min="0"
                            required
                          />
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="block text-[10px] text-gray-400 font-medium">
                              SỐ LƯỢNG SALE
                            </label>
                            {item.stock > 0 && (
                              <button
                                type="button"
                                onClick={() => handleMaxStock(item.productId)}
                                className="text-[10px] text-pink-600 hover:text-pink-700 font-semibold"
                              >
                                Tối đa ({item.stock})
                              </button>
                            )}
                          </div>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleQuantityChange(item.productId, e.target.value)}
                            className="w-full border text-black border-gray-200 rounded-xl px-3 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-400"
                            placeholder="SL"
                            min="1"
                            max={item.stock}
                            required
                          />
                        </div>
                      </div>

                      {/* Price info breakdown */}
                      <PriceInfo
                        originalPrice={item.originalPrice}
                        salePrice={item.salePrice}
                        costPrice={item.costPrice}
                      />

                      {/* Status warning */}
                      <StatusTooltip item={item} />
                    </div>
                  )
                })}
              </div>
            )}

            {/* Submit */}
            <div className="border-t border-gray-100 pt-6 mt-6 flex flex-col sm:flex-row sm:justify-end gap-3">
              <button
                type="button"
                onClick={() => setActiveTab("flash-sale")}
                className="px-5 py-2.5 bg-white text-gray-700 rounded-xl font-semibold border border-gray-200 hover:bg-gray-50 hover:text-gray-900 transition-all text-sm shadow-xs flex items-center justify-center space-x-2"
              >
                <XMarkIcon className="w-4 h-4" />
                <span>Hủy bỏ</span>
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-xl font-semibold shadow-md shadow-pink-100 hover:shadow-pink-200 transition-all text-sm flex items-center justify-center space-x-2"
              >
                <CheckIcon className="w-4 h-4" />
                <span>{editData?._id ? "Lưu thay đổi" : "Kích hoạt Flash Sale"}</span>
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

export default AddFlashSalePage
