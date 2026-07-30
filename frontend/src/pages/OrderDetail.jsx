import React from 'react'
import OrderDetails from '@/components/OrderDetails'

const OrderDetail = ({ order, onBack }) => {
    return <OrderDetails id={order?._id} onBack={onBack} />
}

export default OrderDetail