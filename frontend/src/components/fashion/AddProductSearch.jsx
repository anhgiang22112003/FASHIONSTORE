import { CartContext } from "@/context/CartContext"
import api from "@/service/api"
import React, { useContext, useEffect } from "react"
import { toast } from "react-toastify"

const AddproductSearch = ({ fetCart }) => {
    const [searchTerm, setSearchTerm] = React.useState("")
    const [results, setResults] = React.useState([])
    const [selectedProduct, setSelectedProduct] = React.useState(null)
    const [selectedColor, setSelectedColor] = React.useState("")
    const [selectedSize, setSelectedSize] = React.useState("")
    const [quantity, setQuantity] = React.useState(1)
    const [loading, setLoading] = React.useState(false)
    const { fetchCart } = useContext(CartContext)

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            if (searchTerm.trim().length > 1) {
                fetchResults(searchTerm)
            } else {
                setResults([])
                setSelectedProduct(null)
            }
        }, 500)
        return () => clearTimeout(delayDebounce)
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


    const handleAddToCart = async () => {
        if (!selectedProduct || !selectedColor || !selectedSize) {
            toast.error("Vui lòng chọn đầy đủ màu và size!")
            return
        }
        const body = {
            productId: selectedProduct._id,
            color: selectedColor?.color,
            size: selectedSize?.size,
            quantity,
        }

        try {
            await api.post("/cart/add", body)
            toast.success("Đã thêm sản phẩm vào giỏ hàng 🎉")
            setSearchTerm("")
            setResults([])
            setSelectedProduct(null)
            setSelectedColor("")
            setSelectedSize("")
            setQuantity(1)
            fetchCart()
        } catch (err) {
            toast.error(err.response?.data?.message || "Lỗi thêm vào giỏ hàng")
        }
    }

    return (
        <div className="p-4 bg-white rounded-xl shadow-md space-y-4">
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
                    {results?.map((product) => (
                        <li
                            key={product._id}
                            onClick={() => setSelectedProduct(product)}
                            className={`p-3 cursor-pointer hover:bg-gray-100 rounded-md ${selectedProduct?._id === product?._id ? "bg-pink-50" : ""
                                }`}
                        >
                            <div className="flex items-center space-x-3">
                                <img src={product?.mainImage} className="w-16 h-16 object-cover rounded" />
                                <div>
                                    <p className="font-semibold">{product?.name}</p>
                                    <p className="text-gray-500 text-sm">{product?.sellingPrice?.toLocaleString()}đ</p>
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
                            {selectedProduct?.variations?.map((color) => (
                                <button
                                    key={color}
                                    onClick={() => setSelectedColor(color)}
                                    className={`px-3 py-1 rounded-full border ${selectedColor === color ? "bg-pink-500 text-white" : "bg-gray-100"
                                        }`}
                                >
                                    {color.color}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Size */}
                    <div className="mb-3">
                        <label className="block text-sm font-medium">Size:</label>
                        <div className="flex flex-wrap gap-2 mt-1">
                            {selectedProduct?.variations?.map((size) => (
                                <button
                                    key={size}
                                    onClick={() => setSelectedSize(size)}
                                    className={`px-3 py-1 rounded-full border ${selectedSize === size ? "bg-pink-500 text-white" : "bg-gray-100"
                                        }`}
                                >
                                    {size.size}
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
export default AddproductSearch
