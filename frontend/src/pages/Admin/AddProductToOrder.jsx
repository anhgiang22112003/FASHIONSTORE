import apiAdmin from "@/service/apiAdmin"
import React, { useEffect, useState } from "react"
import { toast } from "react-toastify"

const AddProductToOrder = ({ orderId, fetchOrder }) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [results, setResults] = useState([])
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [selectedColor, setSelectedColor] = useState("")
  const [selectedSize, setSelectedSize] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(false)

  // ✅ debounce tìm kiếm sản phẩm
  useEffect(() => {
    const delay = setTimeout(() => {
      if (searchTerm.trim().length > 1) {
        fetchResults(searchTerm)
      } else {
        setResults([])
        setSelectedProduct(null)
      }
    }, 500)
    return () => clearTimeout(delay)
  }, [searchTerm])

  const fetchResults = async (query) => {
    try {
      setLoading(true)
      const res = await apiAdmin.get(`/products/search?query=${query}`)
      setResults(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddToOrder = async () => {
    if (!selectedProduct || !selectedColor || !selectedSize) {
      toast.error("Vui lòng chọn đầy đủ màu và size!")
      return
    }

    const body = {
      productId: selectedProduct._id,
      color: selectedColor?.color || selectedColor,
      size: selectedSize?.size || selectedSize,
      quantity,
    }

    try {
      await apiAdmin.patch(`/orders/${orderId}/add-item`, body)
      toast.success("✅ Đã thêm sản phẩm vào đơn hàng")
      setSearchTerm("")
      setResults([])
      setSelectedProduct(null)
      setSelectedColor("")
      setSelectedSize("")
      setQuantity(1)
      if (fetchOrder) fetchOrder() // reload lại dữ liệu order sau khi thêm
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi khi thêm sản phẩm")
    }
  }

  return (
    <div className="p-4 bg-white rounded-xl shadow space-y-4">
      {/* Ô tìm kiếm */}
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Tìm sản phẩm..."
          className="border border-gray-300 rounded-lg px-3 py-2 w-full"
        />
        {loading && (
          <div className="absolute right-3 top-2 text-gray-400 text-sm animate-pulse">
            Đang tìm...
          </div>
        )}
      </div>

      {/* Danh sách kết quả */}
      {results.length > 0 && (
        <ul className="divide-y divide-gray-200">
          {results.map((product) => (
            <li
              key={product._id}
              onClick={() => setSelectedProduct(product)}
              className={`p-3 cursor-pointer hover:bg-gray-100 rounded-md ${
                selectedProduct?._id === product._id ? "bg-pink-50" : ""
              }`}
            >
              <div className="flex items-center space-x-3">
                <img
                  src={product?.mainImage}
                  className="w-16 h-16 object-cover rounded"
                />
                <div>
                  <p className="font-semibold">{product.name}</p>
                  <p className="text-gray-500 text-sm">
                    {product?.sellingPrice?.toLocaleString()}đ
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Khi chọn sản phẩm */}
      {selectedProduct && (
        <div className="border-t pt-4">
          <h3 className="font-semibold mb-2">Chọn thuộc tính</h3>

          {/* Màu */}
          <div className="mb-3">
            <label className="block text-sm font-medium">Màu:</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {[
                ...new Set(selectedProduct.variations.map((v) => v.color)),
              ].map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`px-3 py-1 rounded-full border ${
                    selectedColor === color
                      ? "bg-pink-500 text-white"
                      : "bg-gray-100"
                  }`}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>

          {/* Size */}
          <div className="mb-3">
            <label className="block text-sm font-medium">Size:</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {selectedProduct.variations
                .filter((v) => v.color === selectedColor)
                .map((v) => (
                  <button
                    key={v.size}
                    onClick={() => setSelectedSize(v.size)}
                    disabled={v.stock <= 0}
                    className={`px-3 py-1 rounded-full border ${
                      selectedSize === v.size
                        ? "bg-pink-500 text-white"
                        : "bg-gray-100"
                    } ${
                      v.stock <= 0
                        ? "opacity-50 cursor-not-allowed"
                        : "cursor-pointer"
                    }`}
                  >
                    {v.size} ({v.stock})
                  </button>
                ))}
            </div>
          </div>

          {/* Số lượng */}
          <div className="flex items-center space-x-2 mb-4">
            <label className="text-sm font-medium">Số lượng:</label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="border rounded-lg px-2 py-1 w-20 text-center"
            />
          </div>

          {/* Nút thêm */}
          <button
            onClick={handleAddToOrder}
            className="w-full bg-pink-600 text-white py-2 rounded-lg hover:bg-pink-700"
          >
            Thêm vào đơn hàng
          </button>
        </div>
      )}
    </div>
  )
}

export default AddProductToOrder
