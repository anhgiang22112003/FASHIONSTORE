import React from 'react'

const AdminDasbroad = () => {
    const stats = [
        { title: "Tổng doanh thu", value: "125.5Mđ", trend: "+12.5% so với tháng trước", icon: "📈" },
        { title: "Đơn hàng", value: "1,234", trend: "+8.2% so với tháng trước", icon: "🛒" },
        { title: "Khách hàng", value: "856", trend: "+15.3% so với tháng trước", icon: "👤" },
        { title: "Sản phẩm", value: "342", trend: "+5 sản phẩm mới", icon: "🏷️" },
    ]

    const recentOrders = [
        { name: "Nguyễn Thị Lan", products: 1, price: "1.250.000đ", status: "Hoàn thành" },
        { name: "Nguyễn Thị Hoa", products: 2, price: "890.000đ", status: "Hoàn thành" },
        { name: "Nguyễn Thị Mai", products: 3, price: "2.100.000đ", status: "Đang xử lý" },
        { name: "Nguyễn Thị Linh", products: 4, price: "650.000đ", status: "Đang xử lý" },
        { name: "Nguyễn Thị Nga", products: 5, price: "1.450.000đ", status: "Chờ xác nhận" },
    ]

    const bestSelling = [
        { name: "Váy hồng thanh lịch", sold: 45, price: "590.000đ" },
        { name: "Áo sơ mi trắng", sold: 38, price: "450.000đ" },
        { name: "Chân váy xòe", sold: 32, price: "380.000đ" },
        { name: "Áo cardigan", sold: 28, price: "720.000đ" },
        { name: "Quần jeans", sold: 25, price: "650.000đ" },
    ]

    const statusColors = {
        "Hoàn thành": "bg-green-100 text-green-600",
        "Đang xử lý": "bg-yellow-100 text-yellow-600",
        "Chờ xác nhận": "bg-blue-100 text-blue-600",
    }

    return (
        <div className="p-8 space-y-8">
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-xl shadow flex justify-between items-center">
                        <div>
                            <p className="text-sm text-gray-500">{stat.title}</p>
                            <p className="text-2xl font-bold text-pink-600">{stat.value}</p>
                            <p className="text-xs text-gray-400 mt-1">{stat.trend}</p>
                        </div>
                        <div className="text-3xl">{stat.icon}</div>
                    </div>
                ))}
            </div>

            {/* Orders & Best Selling */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Orders */}
                <div className="bg-white p-6 rounded-xl shadow">
                    <h2 className="text-lg font-semibold mb-4">Đơn hàng gần đây</h2>
                    <ul className="space-y-4">
                        {recentOrders.map((order, idx) => (
                            <li key={idx} className="flex justify-between items-center p-4 bg-pink-50 rounded-lg">
                                <div className="flex items-center space-x-2">
                                    <span className="text-xl">🛒</span> {/* Icon cho đơn hàng */}
                                    <div>
                                        <p className="font-semibold">{order.name}</p>
                                        <p className="text-sm text-gray-500">{order.products} sản phẩm</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold text-pink-600">{order.price}</p>
                                    <span className={`px-2 py-1 rounded-full text-xs ${statusColors[order.status]}`}>
                                        {order.status}
                                    </span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Best Selling Products */}
                <div className="bg-white p-6 rounded-xl shadow">
                    <h2 className="text-lg font-semibold mb-4">Sản phẩm bán chạy</h2>
                    <ul className="space-y-4">
                        {bestSelling.map((product, idx) => (
                            <li key={idx} className="flex justify-between items-center p-4 bg-pink-50 rounded-lg">
                                <div className="flex items-center space-x-2">
                                    <span className="text-xl">🏷️</span> {/* Icon cho sản phẩm */}
                                    <div>
                                        <p className="font-semibold">{product.name}</p>
                                        <p className="text-sm text-gray-500">{product.sold} đã bán</p>
                                    </div>
                                </div>
                                <p className="font-semibold text-pink-600">{product.price}</p>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    )
}

export default AdminDasbroad