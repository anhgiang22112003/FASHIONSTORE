// SideCartDrawer.jsx
import { ShoppingBag, X, Minus, Plus, Trash2, Package } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../ui/sheet'
import { Button } from '../ui/button'
import { useContext, useState } from 'react'
import { CartContext } from '@/context/CartContext'
import { Link, useNavigate } from 'react-router-dom'
import api from '@/service/api'
import { toast } from 'react-toastify'
import { Skeleton } from '../ui/skeleton'

const SideCartDrawer = ({ isOpen, onClose }) => {
    const { cart, fetchCart } = useContext(CartContext)
    const navigate = useNavigate()
    const [loadedImages, setLoadedImages] = useState({})
    const [qtyInput, setQtyInput] = useState({});

    const cartItems = cart?.items || []
    const totalPrice = cart?.total || 0
    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0)

    const handleImageLoad = (itemId) => {
        setLoadedImages(prev => ({ ...prev, [itemId]: true }))
    }

    const handleRemoveItem = async (itemId) => {
        try {
            await api.delete(`/cart/remove/${itemId}`)
            toast.success('Đã xóa sản phẩm khỏi giỏ hàng')
            fetchCart()
        } catch (err) {
            toast.error('Xóa thất bại')
        }
    }

    const handleUpdateQuantity = async (itemId, newQuantity, maxStock) => {

        // Giới hạn
        if (newQuantity < 1) newQuantity = 1;
        if (newQuantity > maxStock) {
            newQuantity = maxStock;
            toast.warning(`Chỉ còn ${maxStock} sản phẩm, đã điều chỉnh số lượng`);
        }

        // Cập nhật UI NGAY
        setQtyInput(prev => ({
            ...prev,
            [itemId]: String(newQuantity)
        }));

        try {
            await api.patch(`/cart/update/${itemId}`, { quantity: newQuantity });
            fetchCart(); // cập nhật server
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Cập nhật thất bại');
        }
    };


    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent
                side="right"
                className="w-[400px] sm:max-w-md p-0 flex flex-col h-full bg-background"
            >
                {/* Header */}
                <SheetHeader className="px-6 py-4 border-b bg-gradient-to-r from-pink-50 to-background">
                    <SheetTitle className="text-xl font-bold text-foreground flex items-center gap-2">
                        <div className="p-2 rounded-full bg-pink-100">
                            <ShoppingBag className="w-5 h-5 text-pink-600" />
                        </div>
                        <span>Giỏ Hàng ({totalItems})</span>
                    </SheetTitle>
                </SheetHeader>

                {/* Body - Danh sách sản phẩm */}
                <div className="flex-grow overflow-y-auto px-4 py-2">
                    {cartItems.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center py-12">
                            <div className="w-24 h-24 rounded-full bg-pink-50 flex items-center justify-center mb-4">
                                <Package className="w-12 h-12 text-pink-300" />
                            </div>
                            <p className="text-muted-foreground text-lg font-medium">Giỏ hàng trống</p>
                            <p className="text-sm text-muted-foreground mt-1">Hãy thêm sản phẩm yêu thích vào giỏ!</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {cartItems.map((item) => (
                                <div
                                    key={item._id}
                                    className="group relative flex gap-3 p-3 rounded-lg border border-border bg-card hover:shadow-md transition-all duration-300"
                                >
                                    {/* IMAGE with Loading State */}
                                    <Link
                                        to={`/product/${item.product?._id}`}
                                        onClick={onClose}
                                        className="relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border border-border bg-muted"
                                    >
                                        {!loadedImages[item._id] && (
                                            <Skeleton className="absolute inset-0 w-full h-full" />
                                        )}
                                        <img
                                            src={item.product?.mainImage || '/placeholder.svg'}
                                            alt={item.product?.productName}
                                            className={`w-full h-full object-cover transition-all duration-300 ${loadedImages[item._id] ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                                                }`}
                                            onLoad={() => handleImageLoad(item._id)}
                                        />
                                    </Link>

                                    <div className="flex-grow min-w-0 flex flex-col justify-between">
                                        <div>
                                            <Link
                                                to={`/product/${item.product?._id}`}
                                                onClick={onClose}
                                                className="block"
                                            >
                                                <p className="font-semibold text-sm text-foreground line-clamp-2 group-hover:text-pink-600 transition-colors">
                                                    {item.product?.productName}
                                                </p>
                                            </Link>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-pink-50 text-pink-700 border border-pink-200">
                                                    {item.color}
                                                </span>
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-muted text-muted-foreground border border-border">
                                                    {item.size}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Price & Quantity Controls */}
                                        <div className="flex items-center justify-between mt-2">
                                            <p className="font-bold text-pink-600 text-base">
                                                {item.price?.toLocaleString('vi-VN')}đ
                                            </p>

                                            <div className="flex items-center gap-1.5 bg-muted rounded-full p-0.5">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="w-7 h-7 rounded-full hover:bg-pink-100 hover:text-pink-600 transition-colors"
                                                    onClick={() => {
                                                        const variant = item.product.variations.find(
                                                            v => v.color === item.color && v.size === item.size
                                                        );
                                                        const maxStock = variant ? variant.stock : 1;

                                                        handleUpdateQuantity(item._id, item.quantity - 1, maxStock);
                                                    }}
                                                    disabled={item.quantity <= 1}
                                                >
                                                    <Minus className="w-3.5 h-3.5" />
                                                </Button>

                                                <input
                                                    type="text"
                                                    value={qtyInput[item._id] ?? String(item.quantity)}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        if (/^\d*$/.test(val)) {
                                                            setQtyInput(prev => ({
                                                                ...prev,
                                                                [item._id]: val
                                                            }));
                                                        }
                                                    }}
                                                    onBlur={() => {
                                                        const variant = item.product.variations.find(
                                                            v => v.color === item.color && v.size === item.size
                                                        );
                                                        const maxStock = variant ? variant.stock : 1;

                                                        let num = parseInt(qtyInput[item._id]);
                                                        if (isNaN(num) || num < 1) num = 1;
                                                        if (num > maxStock) {
                                                            num = maxStock;
                                                            toast.warning(`Chỉ còn ${maxStock} sản phẩm, đã điều chỉnh số lượng`);
                                                        }

                                                        handleUpdateQuantity(item._id, num, maxStock);
                                                    }}
                                                    className="w-10 h-7 text-center text-sm font-semibold bg-white border border-border rounded-full focus:ring-2 focus:ring-pink-400 focus:outline-none"
                                                />

                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="w-7 h-7 rounded-full hover:bg-pink-100 hover:text-pink-600 transition-colors"
                                                    onClick={() => {
                                                        const variant = item.product.variations.find(
                                                            v => v.color === item.color && v.size === item.size
                                                        );
                                                        const maxStock = variant ? variant.stock : 1;

                                                        handleUpdateQuantity(item._id, item.quantity + 1, maxStock);
                                                    }}
                                                >
                                                    <Plus className="w-3.5 h-3.5" />
                                                </Button>

                                            </div>
                                        </div>
                                    </div>

                                    {/* Delete Button */}
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="absolute top-2 right-2 w-7 h-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-red-500 hover:bg-red-50"
                                        onClick={() => handleRemoveItem(item._id)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer - Tổng tiền và nút thanh toán */}
                <div className="px-6 py-4 border-t bg-background/95 backdrop-blur-sm">
                    <div className="bg-gradient-to-r from-pink-50 to-pink-100/50 rounded-lg p-4 mb-3">
                        <div className="flex justify-between items-center">
                            <span className="text-base font-medium text-foreground">Tổng cộng:</span>
                            <div className="text-right">
                                <span className="text-2xl font-bold text-pink-600 block">
                                    {totalPrice.toLocaleString('vi-VN')}đ
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    ({totalItems} sản phẩm)
                                </span>
                            </div>
                        </div>
                    </div>

                    <Button
                        className="w-full bg-pink-600 hover:bg-pink-700 py-6 text-base font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                        disabled={cartItems.length === 0}
                        onClick={() => {
                            onClose()
                            navigate('/checkout')
                        }}
                    >
                        <ShoppingBag className="w-5 h-5 mr-2" />
                        Thanh Toán Ngay
                    </Button>

                    <Button
                        variant="ghost"
                        className="w-full mt-2 text-muted-foreground hover:text-pink-600 hover:bg-pink-50"
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
