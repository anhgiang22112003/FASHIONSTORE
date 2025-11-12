import { CartContext } from "@/context/CartContext"
import api from "@/service/api"
import React, { useContext, useEffect, useState } from "react"
import { toast } from "react-toastify"

const AddProductSearch = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [results, setResults] = useState([])
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [selectedColor, setSelectedColor] = useState("")
  const [selectedSize, setSelectedSize] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(false)
  const { fetchCart } = useContext(CartContext)

  // 🔍 Tìm kiếm sản phẩm theo tên
  useEffect(() => {
    const delay = setTimeout(() => {
      if (searchTerm.trim().length > 1) fetchResults(searchTerm)
      else {
        setResults([])
        setSelectedProduct(null)
      }
    }, 400)
    return () => clearTimeout(delay)
  }, [searchTerm])

  const fetchResults = async (query) => {
    try {
      setLoading(true)
      const res = await api.get(`/products/search?query=${query}`)
      setResults(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }
  const handleSearchChange = (product) => {
    setSelectedProduct(product)
    setResults([])
  }


  // 🎨 Lấy màu & size theo sản phẩm được chọn
  const allColors = selectedProduct
    ? [...new Set(selectedProduct.variations.map((v) => v.color))]
    : []

  const availableSizes = selectedProduct && selectedColor
    ? selectedProduct.variations
        .filter((v) => v.color === selectedColor)
        .map((v) => v.size)
    : []

  const handleAddToCart = async () => {
    if (!selectedProduct || !selectedColor || !selectedSize) {
      toast.error("Vui lòng chọn đủ màu và size!")
      return
    }

    try {
      const body = {
        productId: selectedProduct._id,
        color: selectedColor,
        size: selectedSize,
        quantity,
      }
      await api.post("/cart/add", body)
      toast.success("🎉 Đã thêm sản phẩm vào giỏ hàng")
      setSearchTerm("")
      setResults([])
      setSelectedProduct(null)
      setSelectedColor("")
      setSelectedSize("")
      setQuantity(1)
      fetchCart()
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi khi thêm vào giỏ")
    }
  }

  return (
    <div className="p-4 bg-white rounded-xl shadow-md space-y-4 mb-4">
      {/* Ô tìm kiếm */}
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder=" Tìm sản phẩm..."
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
              onClick={() => handleSearchChange(product)}
              className={`p-3 cursor-pointer hover:bg-gray-100 rounded-md ${
                selectedProduct?._id === product._id ? "bg-pink-50" : ""
              }`}
            >
              <div className="flex items-center space-x-3">
                <img
                  src={product.mainImage}
                  className="w-16 h-16 object-cover rounded"
                />
                <div>
                  <p className="font-semibold">{product.name}</p>
                  <p className="text-gray-500 text-sm">
                    {product.sellingPrice?.toLocaleString()}đ
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Khi đã chọn sản phẩm */}
      {selectedProduct && (
        <div className="border-t pt-4">
          <div className="flex items-center gap-3 mb-4">
            <img
              src={selectedProduct.mainImage}
              className="w-20 h-20 rounded-lg object-cover"
            />
            <div>
              <p className="font-semibold text-lg">{selectedProduct.name}</p>
              <p className="text-pink-600 font-medium">
                {selectedProduct.sellingPrice?.toLocaleString()}đ
              </p>
            </div>
          </div>

          {/* Màu */}
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Màu:</label>
            <div className="flex flex-wrap gap-2">
              {allColors.map((color) => (
                <button
                  key={color}
                  onClick={() => {
                    setSelectedColor(color)
                    setSelectedSize("") // reset size khi đổi màu
                  }}
                  className={`px-3 py-1 rounded-full border text-sm ${
                    selectedColor === color
                      ? "bg-pink-500 text-white border-pink-500"
                      : "bg-gray-100 border-gray-300"
                  }`}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>

          {/* Size */}
          {selectedColor && (
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">Size:</label>
              <div className="flex flex-wrap gap-2">
                {availableSizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-3 py-1 rounded-full border text-sm ${
                      selectedSize === size
                        ? "bg-pink-500 text-white border-pink-500"
                        : "bg-gray-100 border-gray-300"
                    }`}
                  >
                    {size}
                  </button>
                ))}
                {availableSizes.length === 0 && (
                  <p className="text-gray-400 text-sm italic">
                    Không có size cho màu này
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Số lượng */}
          <div className="flex items-center gap-2 mb-4">
            <label className="text-sm font-medium">Số lượng:</label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
              className="border rounded-lg px-2 py-1 w-20 text-center"
            />
          </div>

          {/* Nút thêm vào giỏ */}
          <button
            onClick={handleAddToCart}
            className="w-full bg-pink-600 text-white py-2 rounded-lg hover:bg-pink-700"
          >
             Thêm vào giỏ hàng
          </button>
        </div>
      )}
    </div>
  )
}

export default AddProductSearch
