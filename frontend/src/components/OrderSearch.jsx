import React, { useState, useEffect } from 'react'
import { Search, Package, User, Calendar, DollarSign } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import apiAdmin from '@/service/apiAdmin'
import { ORDER_STATUS_LABELS } from '@/data/constants'

const OrderSearch = ({ onOrderSelect, selectedOrder }) => {
    const [searchTerm, setSearchTerm] = useState('')
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount)
    }

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('vi-VN')
    }

    const searchOrders = async (term) => {
        if (!term || term.length < 2) {
            setOrders([])
            return
        }

        setLoading(true)
        setError('')

        try {
            const params = {
                orderCode: term,
                limit: 10,
                page:1,
                orderType:"ONLINE"
            }
           const queryString = new URLSearchParams(params).toString()
            const response = await apiAdmin.get(`/orders/all?${queryString}`)
            console.log(response);
            

            setOrders(response.data.data || [])
        } catch (err) {
            setError('Lỗi khi tìm kiếm đơn hàng')
            console.error('Search orders error:', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        const delayedSearch = setTimeout(() => {
            searchOrders(searchTerm)
        }, 500)

        return () => clearTimeout(delayedSearch)
    }, [searchTerm])

    const handleOrderSelect = (order) => {
        onOrderSelect(order)
        setSearchTerm('')
        setOrders([])
    }

    return (
        <div className="space-y-4">
            {/* Search Input */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                    placeholder="Tìm kiếm đơn hàng theo mã đơn, tên khách hàng, số điện thoại..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                />
            </div>

            {/* Selected Order Display */}
            {selectedOrder && (
                <Card className="border-green-200 bg-green-50">
                    <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Package className="h-4 w-4 text-green-600" />
                                    <span className="font-medium">Đơn hàng đã chọn: {selectedOrder.code}</span>
                                    <Badge variant="outline" className="text-green-600 border-green-600">
                                        {ORDER_STATUS_LABELS[selectedOrder.status] || selectedOrder.status}
                                    </Badge>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                                    <div className="flex items-center gap-2">
                                        <User className="h-3 w-3" />
                                        <span>{selectedOrder.customerInfo?.name || selectedOrder.shippingInfo?.name}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <DollarSign className="h-3 w-3" />
                                        <span>{formatCurrency(selectedOrder.total)}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-3 w-3" />
                                        <span>{formatDate(selectedOrder.createdAt)}</span>
                                    </div>
                                </div>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onOrderSelect(null)}
                            >
                                Bỏ chọn
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Search Results */}
            {searchTerm && (
                <div className="space-y-2">
                    {loading && (
                        <div className="space-y-2">
                            {[1, 2, 3].map((i) => (
                                <Card key={i}>
                                    <CardContent className="p-4">
                                        <Skeleton className="h-4 w-full mb-2" />
                                        <Skeleton className="h-3 w-3/4" />
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}

                    {error && (
                        <Card className="border-red-200 bg-red-50">
                            <CardContent className="p-4">
                                <p className="text-red-600 text-sm">{error}</p>
                            </CardContent>
                        </Card>
                    )}

                    {!loading && !error && orders.length === 0 && searchTerm.length >= 2 && (
                        <Card>
                            <CardContent className="p-4">
                                <p className="text-gray-500 text-sm text-center">
                                    Không tìm thấy đơn hàng nào phù hợp
                                </p>
                            </CardContent>
                        </Card>
                    )}

                    {!loading && orders.length > 0 && (
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                            {orders.map((order) => (
                                <Card
                                    key={order._id}
                                    className="cursor-pointer hover:bg-gray-50 transition-colors"
                                    onClick={() => handleOrderSelect(order)}
                                >
                                    <CardContent className="p-4">
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Package className="h-4 w-4 text-blue-600" />
                                                    <span className="font-medium">{order.code}</span>
                                                    <Badge variant="outline">
                                                        {ORDER_STATUS_LABELS[order.status] || order.status}
                                                    </Badge>
                                                </div>
                                                <span className="font-medium text-green-600">
                                                    {formatCurrency(order.total)}
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                                                <div className="flex items-center gap-2">
                                                    <User className="h-3 w-3" />
                                                    <span>{order.customerInfo?.name || order.shippingInfo?.name}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-3 w-3" />
                                                    <span>{formatDate(order.createdAt)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default OrderSearch