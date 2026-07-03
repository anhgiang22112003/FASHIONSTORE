import React, { useEffect, useState } from "react"
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
    TagIcon
} from "@heroicons/react/24/outline"

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

    useEffect(() => {
        if (!searchQuery.trim()) {
            setSearchResults([])
            return
        }

        const timeout = setTimeout(async () => {
            setLoadingSearch(true)
            try {
                const res = await apiAdmin.get(`/products/search?query=${encodeURIComponent(searchQuery)}`)
                setSearchResults(res?.data || [])
            } catch (err) {
                toast.error("Lỗi khi tìm kiếm sản phẩm")
            } finally {
                setLoadingSearch(false)
            }
        }, 500) // ⏱ debounce 500ms

        return () => clearTimeout(timeout)
    }, [searchQuery])

    useEffect(() => {
        if (editData?._id) {
            // Lấy danh sách items của flash sale cũ
            const fetchItems = async () => {
                try {
                    const res = await apiAdmin.get(`/flash-sales/${editData._id}`)
                    setSelectedItems(
                        res?.data?.items?.map((i) => ({
                            productId: i.productId._id,
                            name: i.productId.name,
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
        }
    }, [editData])

    const handleAddItem = (product) => {
        if (selectedItems.some((i) => i.productId === product._id)) {
            toast.info("Sản phẩm này đã được thêm rồi!")
            return
        }

        setSelectedItems((prev) => [
            ...prev,
            {
                productId: product._id,
                name: product.name,
                salePrice: product.sellingPrice,
                quantity: 10,
                stock: product.stock,
            },
        ])
    }

    const handleRemoveItem = (id) => {
        setSelectedItems((prev) => prev.filter((i) => i.productId !== id))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const startMoment = dayjs(startTime)
        const endMoment = dayjs(endTime)

        if (!startMoment.isValid() || !endMoment.isValid()) {
            toast.error("Vui lòng chọn đầy đủ và hợp lệ Thời gian bắt đầu và kết thúc.")
            return
        }

        if (startMoment.isSame(endMoment) || startMoment.isAfter(endMoment)) {
            toast.error("⚠️ Thời gian bắt đầu phải NHỎ HƠN Thời gian kết thúc.")
            return
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

    return (
        <div style={{ backgroundColor: "var(--bg-color)", color: "var(--text-color)" }} className="max-w-full mt-5 mx-auto shadow-xl p-8 rounded-2xl border border-gray-100 font-sans text-gray-800">
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
                            {editData?._id ? `Cập nhật thông tin sự kiện ID: ${editData._id}` : "Thiết lập chương trình giảm giá giờ vàng mới"}
                        </p>
                    </div>
                </div>
            </header>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Cột trái: Cấu hình và Tìm kiếm */}
                <div className="lg:col-span-5 space-y-6">
                    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs space-y-5">
                        <h3 className="text-base font-bold text-gray-850 flex items-center space-x-2 pb-2 border-b border-gray-50">
                            <TagIcon className="w-5 h-5 text-pink-500" />
                            <span>Thông tin sự kiện</span>
                        </h3>

                        {/* Tên Flash Sale */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tên sự kiện Flash Sale</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full border text-black border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-400 transition-all text-sm"
                                placeholder="VD: Giờ Vàng Thứ Sáu Giảm 50%"
                                required
                            />
                        </div>

                        {/* Thời gian */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center space-x-1.5">
                                    <CalendarIcon className="w-4 h-4 text-gray-400" />
                                    <span>Thời gian bắt đầu</span>
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
                                    <span>Thời gian kết thúc</span>
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

                    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs space-y-4">
                        <h3 className="text-base font-bold text-gray-850 flex items-center space-x-2 pb-2 border-b border-gray-50">
                            <MagnifyingGlassIcon className="w-5 h-5 text-pink-500" />
                            <span>Tìm kiếm sản phẩm</span>
                        </h3>

                        {/* Tìm kiếm */}
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

                        {/* Danh sách kết quả */}
                        <div>
                            {loadingSearch && (
                                <div className="flex items-center space-x-2 py-3 justify-center text-xs text-gray-500">
                                    <span className="animate-spin inline-block w-4 h-4 border-2 border-pink-500 border-t-transparent rounded-full"></span>
                                    <span>Đang tìm kiếm...</span>
                                </div>
                            )}

                            <div className="border border-gray-100 rounded-xl max-h-56 overflow-y-auto bg-gray-50/50 divide-y divide-gray-100">
                                {searchResults.length === 0 && !loadingSearch && (
                                    <p className="text-gray-450 text-xs p-4 text-center italic">Nhập tên sản phẩm để bắt đầu chọn...</p>
                                )}
                                {searchResults.map((p) => (
                                    <div key={p._id} className="flex justify-between items-center p-3 hover:bg-pink-50/20 transition-all">
                                        <div className="flex-1 min-w-0 pr-3">
                                            <span className="font-semibold text-xs text-gray-850 block truncate">{p.name}</span>
                                            <span className="text-[10px] text-gray-400 block mt-0.5">Giá gốc: {p.sellingPrice?.toLocaleString()}₫ | Kho: {p.stock}</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleAddItem(p)}
                                            className="bg-pink-50 hover:bg-pink-100 text-pink-600 px-3 py-1 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1"
                                        >
                                            <PlusIcon className="w-3.5 h-3.5" />
                                            <span>Thêm</span>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Cột phải: Sản phẩm đã chọn */}
                <div className="lg:col-span-7 flex flex-col h-full space-y-6">
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
                                    <p className="text-xs text-gray-400 mt-1">Tìm kiếm và click "Thêm" sản phẩm từ cột trái để thêm vào Flash Sale.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-3 overflow-y-auto max-h-[480px] pr-1">
                                {selectedItems.map((item) => (
                                    <div key={item.productId} className="flex flex-col sm:flex-row sm:items-center justify-between border border-gray-100 p-4 rounded-2xl bg-white hover:border-pink-100 hover:shadow-xs transition-all gap-4">
                                        <div className="flex-1 min-w-0">
                                            <span className="font-semibold text-sm text-gray-850 block truncate" title={item.name}>{item.name}</span>
                                            <span className="text-[11px] text-gray-400 block mt-1">
                                                Kho hiện tại: <span className="font-medium text-gray-750">{item.stock}</span>
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-3 self-end sm:self-auto">
                                            {/* Giá sale */}
                                            <div className="w-28">
                                                <span className="block text-[10px] text-gray-400 mb-1">Giá Flash Sale (₫)</span>
                                                <input
                                                    type="number"
                                                    value={item.salePrice}
                                                    onChange={(e) =>
                                                        setSelectedItems((prev) =>
                                                            prev.map((i) => (i.productId === item.productId ? { ...i, salePrice: parseFloat(e.target.value) || 0 } : i))
                                                        )
                                                    }
                                                    className="w-full border text-black border-gray-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-400"
                                                    placeholder="Giá sale"
                                                    min="0"
                                                    required
                                                />
                                            </div>

                                            {/* Số lượng */}
                                            <div className="w-20">
                                                <span className="block text-[10px] text-gray-400 mb-1">Số lượng sale</span>
                                                <input
                                                    type="number"
                                                    value={item.quantity}
                                                    onChange={(e) =>
                                                        setSelectedItems((prev) =>
                                                            prev.map((i) => (i.productId === item.productId ? { ...i, quantity: parseInt(e.target.value) || 0 } : i))
                                                        )
                                                    }
                                                    className="w-full border text-black border-gray-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-400"
                                                    placeholder="SL"
                                                    min="1"
                                                    required
                                                />
                                            </div>

                                            {/* Xóa */}
                                            <div className="pt-4">
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveItem(item.productId)}
                                                    className="text-gray-400 hover:text-red-650 p-2 rounded-xl hover:bg-red-50 transition-colors"
                                                    title="Xóa khỏi chương trình"
                                                >
                                                    <TrashIcon className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Submit Button Section */}
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

