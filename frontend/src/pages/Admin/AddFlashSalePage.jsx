import React, { useEffect, useState } from "react"
import apiAdmin from "@/service/apiAdmin"
import { toast } from "react-toastify"
import dayjs from "dayjs"

const AddFlashSalePage = ({ setActiveTab }) => {
  const [title, setTitle] = useState("")
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")
  const [products, setProducts] = useState([])
  const [selectedItems, setSelectedItems] = useState([])

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await apiAdmin.get("/products")
        setProducts(res?.data.products || [])
      } catch (err) {
        toast.error("Lỗi khi tải danh sách sản phẩm")
      }
    }
    fetchProducts()
  }, [])

  const handleAddItem = (product) => {
    if (selectedItems.some((i) => i.productId === product._id)) return
    setSelectedItems((prev) => [...prev, { productId: product._id, name: product.name, salePrice: product.sellingPrice, quantity: 10 }])
  }

  const handleRemoveItem = (id) => {
    setSelectedItems((prev) => prev.filter((i) => i.productId !== id))
  }

const handleSubmit = async (e) => {
    e.preventDefault();

    // Kiểm tra các trường đã nhập
    if (!title || !startTime || !endTime || selectedItems.length === 0) {
        return toast.warning("Vui lòng điền đầy đủ thông tin và chọn sản phẩm");
    }

    // Chuyển đổi startTime và endTime thành đối tượng Date
    const payload = {
        title,
        startTime: new Date(startTime), // Đảm bảo là đối tượng Date
        endTime: new Date(endTime),     // Đảm bảo là đối tượng Date
        items: selectedItems.map((item) => ({
            productId: item.productId, // ID của sản phẩm
            salePrice: item.salePrice, // Giá bán
            quantity: item.quantity,   // Số lượng
        })),
    };

    try {
        // Gửi POST request đến API của backend
        const res = await apiAdmin.post("/flash-sales", payload);
        
        // Thông báo thành công
        toast.success("🎉 Thêm Flash Sale thành công!");
        setActiveTab("dashboard");  // Chuyển tab nếu cần
    } catch (err) {
        // Thông báo lỗi nếu có
        toast.error(err.response?.data?.message || "Lỗi khi thêm Flash Sale");
    }
};


  return (
   <div className="max-w-full mx-auto bg-pink-50 shadow-2xl p-8 rounded-2xl border border-rose-200">
    {/* Tiêu đề Form */}
    <h2 className="text-3xl font-bold mb-6 text-rose-700 border-b pb-3 border-rose-200">
         Thêm Sự kiện Flash Sale mới
    </h2>

    <form onSubmit={handleSubmit} className="space-y-6">
        {/* Trường Tên Flash Sale */}
        <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">Tên Flash Sale</label>
            <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border border-rose-300 rounded-xl p-3 focus:ring-rose-500 focus:border-rose-500 transition-shadow shadow-sm"
                placeholder="Ví dụ: Sale Noel Giảm Sốc 50%"
            />
        </div>

        {/* Thời gian Bắt đầu / Kết thúc */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-semibold mb-1 text-gray-700">Thời gian bắt đầu</label>
                <input
                    type="datetime-local"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full border border-rose-300 rounded-xl p-3 focus:ring-rose-500 focus:border-rose-500 transition-shadow shadow-sm"
                />
            </div>
            <div>
                <label className="block text-sm font-semibold mb-1 text-gray-700">Thời gian kết thúc</label>
                <input
                    type="datetime-local"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full border border-rose-300 rounded-xl p-3 focus:ring-rose-500 focus:border-rose-500 transition-shadow shadow-sm"
                />
            </div>
        </div>

        <hr className="my-4 border-rose-300" />

        {/* Khu vực Chọn sản phẩm */}
        <h3 className="text-xl font-bold text-gray-800">📦 Chọn sản phẩm Flash Sale</h3>

        <div className="border border-rose-300 rounded-xl max-h-72 overflow-y-auto bg-white shadow-inner">
            {products.map((p) => (
                <div key={p._id} className="flex justify-between items-center p-3 border-b border-rose-100 last:border-b-0 hover:bg-rose-50 transition-colors">
                    <span className="font-medium text-gray-800">{p.name}</span>
                    <button
                        type="button"
                        onClick={() => handleAddItem(p)}
                        className="bg-rose-500 text-white px-4 py-1 rounded-full text-sm font-medium hover:bg-rose-600 transition-colors shadow"
                    >
                        + Thêm
                    </button>
                </div>
            ))}
        </div>

        {/* Khu vực Sản phẩm đã chọn */}
        {selectedItems.length > 0 && (
            <div className="mt-6 p-4 bg-white rounded-xl shadow-lg border border-rose-300">
                <h4 className="font-bold mb-3 text-lg text-rose-600">🛒 Danh sách sản phẩm Flash Sale</h4>
                <div className="space-y-3">
                    {selectedItems.map((item) => (
                        <div key={item.productId} className="flex justify-between items-center border border-gray-200 p-3 rounded-lg bg-white shadow-sm">
                            <span className="font-medium text-gray-800 flex-1 truncate pr-2">{item.name}</span>
                            <div className="flex items-center gap-3">
                                {/* Input Giá sale */}
                                <input
                                    type="number"
                                    value={item.salePrice}
                                    onChange={(e) =>
                                        setSelectedItems((prev) =>
                                            prev.map((i) => (i.productId === item.productId ? { ...i, salePrice: e.target.value } : i))
                                        )
                                    }
                                    className="w-24 border border-rose-300 rounded-lg p-2 text-sm focus:ring-rose-500"
                                    placeholder="Giá sale"
                                />
                                {/* Input Số lượng */}
                                <input
                                    type="number"
                                    value={item.quantity}
                                    onChange={(e) =>
                                        setSelectedItems((prev) =>
                                            prev.map((i) => (i.productId === item.productId ? { ...i, quantity: e.target.value } : i))
                                        )
                                    }
                                    className="w-20 border border-rose-300 rounded-lg p-2 text-sm focus:ring-rose-500"
                                    placeholder="SL"
                                />
                                {/* Nút Xóa */}
                                <button
                                    type="button"
                                    onClick={() => handleRemoveItem(item.productId)}
                                    className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100 transition-colors"
                                >
                                    <span className="font-bold text-lg">×</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* Nút Submit */}
        <button 
            type="submit" 
            className="w-full bg-rose-600 text-white px-6 py-3 rounded-xl font-bold text-lg hover:bg-rose-700 transition-all shadow-lg mt-6 transform hover:scale-[1.01]"
        >
            Tạo Flash Sale
        </button>
    </form>
</div>
  )
}

export default AddFlashSalePage
