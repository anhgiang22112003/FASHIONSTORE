// SideCartDrawer.jsx
import { ShoppingBag, X, Minus, Plus, Trash2 } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../ui/sheet'
import { Button } from '../ui/button'
import { useContext, useMemo } from 'react'
import { CartContext } from '@/context/CartContext'
// Import Link từ react-router-dom nếu bạn dùng để chuyển hướng
import { Link, useNavigate } from 'react-router-dom'
import api from '@/service/api' // Giả định có api service
import { toast } from 'react-toastify'

const SideCartDrawer = ({ isOpen, onClose }) => {
    // Lấy dữ liệu và hàm từ CartContext
    const { cart, fetchCart } = useContext(CartContext)
    const navigate = useNavigate() // Hook chuyển hướng

    // 1. Tính toán dữ liệu hiển thị từ đối tượng `cart`
    const cartItems = cart?.items || []
    const totalPrice = cart?.total || 0
    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0)


    const handleRemoveItem = async (itemId) => {
        try {
            await api.delete(`/cart/remove/${itemId}`)
            toast.success('Đã xóa sản phẩm khỏi giỏ hàng')
            fetchCart()
        } catch (err) {
            toast.error('Xóa thất bại')
        }
    }

    const handleUpdateQuantity = async (itemId, newQuantity) => {
        if (newQuantity <= 0) {
            removeItem(itemId)
            return
        }
        try {
            await api.patch(`/cart/update/${itemId}`, { quantity: newQuantity })
            fetchCart()
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Cập nhật thất bại')
        }
    }


    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent
                side="right"
                className="w-[400px] sm:max-w-none p-0 flex flex-col h-full bg-white shadow-2xl"
            >
                {/* Header */}
                <SheetHeader className="p-4 border-b">
                    <SheetTitle className="text-2xl font-bold text-gray-900 flex items-center">
                        <ShoppingBag className="w-6 h-6 mr-2 text-pink-600" />
                        Giỏ Hàng Của Bạn ({totalItems})
                    </SheetTitle>
                </SheetHeader>

                {/* Body - Danh sách sản phẩm */}
                <div className="flex-grow overflow-y-auto p-4 space-y-4">
                    {cartItems.length === 0 ? (
                        <p className="text-center text-gray-500 mt-10">Giỏ hàng trống.</p>
                    ) : (
                        cartItems.map((item, index) => (
                            <div
                                key={index}
                                className="flex items-start space-x-3 border-b pb-3 last:border-b-0"
                            >
                                {/* IMAGE: Lấy từ product.mainImage. Bạn cần đảm bảo dữ liệu này có */}
                                <img
                                    src={item.product?.mainImage || 'placeholder-image.jpg'}
                                    alt={item.product?.productName}
                                    className="w-16 h-16 object-cover rounded-md flex-shrink-0 border"
                                />

                                <div className="flex-grow min-w-0">
                                    <Link to={`/product/${item.product?._id}`} onClick={onClose}>
                                        <p className="font-semibold text-gray-800 line-clamp-1 hover:text-pink-600 transition">
                                            {item.product?.productName}
                                        </p>
                                    </Link>
                                    <p className="text-sm text-gray-500">
                                        Màu: **{item.color}**, Size: **{item.size}**
                                    </p>

                                    {/* Price & Quantity Controls */}
                                    <div className="flex items-center justify-between mt-2">
                                        <p className="font-bold text-pink-600 text-lg">
                                            {item.price?.toLocaleString('vi-VN')}đ
                                        </p>

                                        <div className="flex items-center space-x-1">
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="w-6 h-6 p-0 rounded-full"
                                                onClick={() => handleUpdateQuantity(item._id, item.quantity - 1)}
                                                disabled={item.quantity <= 1}
                                            >
                                                <Minus className="w-3 h-3" />
                                            </Button>
                                            <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="w-6 h-6 p-0 rounded-full"
                                                onClick={() => handleUpdateQuantity(item._id, item.quantity + 1)}
                                            >
                                                <Plus className="w-3 h-3" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                {/* Nút xóa sản phẩm */}
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="w-6 h-6 flex-shrink-0 text-gray-400 hover:text-red-500"
                                    onClick={() => handleRemoveItem(item._id)}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer - Tổng tiền và nút thanh toán */}
                <div className="p-4 border-t sticky bottom-0 bg-white">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-lg font-medium text-gray-700">Tổng cộng:</span>
                        <span className="text-2xl font-bold text-pink-600">
                            {totalPrice.toLocaleString('vi-VN')}đ
                        </span>
                    </div>

                    <Button
                        className="w-full bg-pink-600 hover:bg-pink-700 py-3 text-lg font-bold shadow-lg"
                        disabled={cartItems.length === 0}
                        onClick={() => {
                            onClose()
                            navigate('/checkout')
                        }}
                    >
                        Tiến Hành Thanh Toán
                    </Button>

                    <Button
                        variant="link"
                        className="w-full mt-2 text-gray-500 hover:text-pink-600"
                        onClick={onClose}
                    >
                        Tiếp tục mua sắm
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    )
}

export default SideCartDrawer