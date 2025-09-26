import React, { useState, useMemo } from "react";
import { EyeIcon, PencilIcon, FunnelIcon, ArrowDownTrayIcon } from "@heroicons/react/24/outline";

// Dữ liệu đơn hàng giả lập
const orders = [
  { id: "PF0001", customer: "Nguyễn Thị Lan", email: "lan@email.com", date: "24/01/2024", total: "1.250.000₫", status: "Hoàn thành" },
  { id: "PF0002", customer: "Trần Thị Hoa", email: "hoa@email.com", date: "24/01/2024", total: "890.000₫", status: "Hoàn thành" },
  { id: "PF0003", customer: "Lê Thị Mai", email: "mai@email.com", date: "23/01/2024", total: "2.100.000₫", status: "Đang giao" },
  { id: "PF0004", customer: "Phạm Thị Linh", email: "linh@email.com", date: "23/01/2024", total: "650.000₫", status: "Đang giao" },
  { id: "PF0005", customer: "Hoàng Thị Nga", email: "nga@email.com", date: "22/01/2024", total: "1.450.000₫", status: "Đang xử lý" },
  { id: "PF0006", customer: "Vũ Thị Hương", email: "huong@email.com", date: "22/01/2024", total: "780.000₫", status: "Đang xử lý" },
  { id: "PF0007", customer: "Đỗ Thị Thảo", email: "thao@email.com", date: "21/01/2024", total: "1.120.000₫", status: "Đã hủy" },
  { id: "PF0008", customer: "Bùi Thị Loan", email: "loan@email.com", date: "21/01/2024", total: "950.000₫", status: "Đã hủy" },
];

const statusColors = {
  "Hoàn thành": "bg-green-100 text-green-600",
  "Đang giao": "bg-yellow-100 text-yellow-600",
  "Đang xử lý": "bg-blue-100 text-blue-600",
  "Đã hủy": "bg-red-100 text-red-600",
};

// Hàm để chuyển đổi chuỗi ngày DD/MM/YYYY thành đối tượng Date
const parseDate = (dateString) => {
  if (!dateString) return null;
  const [day, month, year] = dateString.split('/').map(Number);
  return new Date(year, month - 1, day);
};

// Hàm để chuyển đổi chuỗi tiền tệ thành số
const parseCurrency = (currencyString) => {
  return parseFloat(currencyString.replace(/\./g, '').replace('₫', '').replace(',', '.'));
};

const OrdersContent = ({setActiveTab}) => {
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [filters, setFilters] = useState({
    customerName: '',
    minDate: '',
    maxDate: '',
    minTotal: '',
    maxTotal: '',
    status: 'Tất cả',
  });

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const toggleFilter = () => {
    setIsFilterVisible(!isFilterVisible);
  };

  // Lấy danh sách khách hàng duy nhất và trạng thái từ dữ liệu
  const uniqueCustomers = useMemo(() => {
    const customerNames = new Set(orders.map(o => o.customer));
    return [...customerNames];
  }, []);

  const uniqueStatuses = useMemo(() => {
    const statuses = new Set(orders.map(o => o.status));
    return ['Tất cả', ...statuses];
  }, []);

  // Lọc đơn hàng dựa trên các bộ lọc đã chọn
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      // Lọc theo tên khách hàng
      const customerMatch = filters.customerName === '' || order.customer.toLowerCase().includes(filters.customerName.toLowerCase());

      // Lọc theo trạng thái
      const statusMatch = filters.status === 'Tất cả' || order.status === filters.status;

      // Lọc theo ngày
      const orderDate = parseDate(order.date);
      const minDate = filters.minDate ? new Date(filters.minDate) : null;
      const maxDate = filters.maxDate ? new Date(filters.maxDate) : null;
      const dateMatch = (!minDate || orderDate >= minDate) && (!maxDate || orderDate <= maxDate);

      // Lọc theo tổng tiền
      const orderTotal = parseCurrency(order.total);
      const minTotal = filters.minTotal ? parseFloat(filters.minTotal) : null;
      const maxTotal = filters.maxTotal ? parseFloat(filters.maxTotal) : null;
      const totalMatch = (!minTotal || orderTotal >= minTotal) && (!maxTotal || orderTotal <= maxTotal);

      return customerMatch && statusMatch && dateMatch && totalMatch;
    });
  }, [orders, filters]);

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans antialiased">
      {/* Main Content */}
      <main className="flex-1 p-6">
         <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Danh sách Đơn hàng</h1>
        {/* Header buttons */}
        <div className="flex space-x-2">
          <button 
            onClick={toggleFilter} 
            className="flex items-center space-x-1 bg-pink-50 text-pink-600 px-4 py-2 rounded-xl font-semibold hover:bg-pink-100 transition-colors"
          >
            <FunnelIcon className="w-5 h-5" />
            <span>Bộ lọc</span>
          </button>
          <button className="flex items-center space-x-1 bg-pink-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-pink-700 transition-colors">
            <ArrowDownTrayIcon className="w-5 h-5" />
            <span>Xuất báo cáo</span>
          </button>
        </div>
      </div>

        {/* Filter dropdown */}
        {isFilterVisible && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Lọc theo khách hàng */}
              <div className="col-span-1 md:col-span-2 lg:col-span-2">
                <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 mb-1">
                  Tên khách hàng
                </label>
                <input
                  type="text"
                  id="customerName"
                  name="customerName"
                  placeholder="Tìm hoặc chọn khách hàng"
                  value={filters.customerName}
                  onChange={handleFilterChange}
                  list="customer-names"
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all"
                />
                <datalist id="customer-names">
                  {uniqueCustomers.map((name) => (
                    <option key={name} value={name} />
                  ))}
                </datalist>
              </div>

              {/* Lọc theo trạng thái */}
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Trạng thái
                </label>
                <select
                  id="status"
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all"
                >
                  {uniqueStatuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>

              {/* Lọc theo ngày */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Khoảng ngày
                </label>
                <div className="flex space-x-2">
                  <input
                    type="date"
                    name="minDate"
                    value={filters.minDate}
                    onChange={handleFilterChange}
                    className="w-1/2 px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all"
                  />
                  <input
                    type="date"
                    name="maxDate"
                    value={filters.maxDate}
                    onChange={handleFilterChange}
                    className="w-1/2 px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all"
                  />
                </div>
              </div>

              {/* Lọc theo tổng tiền */}
              <div className="col-span-1 md:col-span-2 lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Khoảng giá tiền
                </label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    name="minTotal"
                    placeholder="Từ"
                    value={filters.minTotal}
                    onChange={handleFilterChange}
                    className="w-1/2 px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all"
                  />
                  <input
                    type="number"
                    name="maxTotal"
                    placeholder="Đến"
                    value={filters.maxTotal}
                    onChange={handleFilterChange}
                    className="w-1/2 px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Orders table */}
        <div className="overflow-x-auto bg-white rounded-xl shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-pink-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Mã đơn</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Khách hàng</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Ngày đặt</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Tổng tiền</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Trạng thái</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-pink-50">
                    <td className="px-6 py-4 font-semibold text-pink-600">{order.id}</td>
                    <td className="px-6 py-4">
                      <p>{order.customer}</p>
                      <p className="text-gray-400 text-sm">{order.email}</p>
                    </td>
                    <td className="px-6 py-4">{order.date}</td>
                    <td className="px-6 py-4 font-semibold">{order.total}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${statusColors[order.status]}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 flex space-x-2">
                      <button onClick={()=>setActiveTab("edit-order")} className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200">
                        <EyeIcon className="w-5 h-5" />
                      </button>
                      <button className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200">
                        <PencilIcon className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-gray-500">Không tìm thấy đơn hàng nào phù hợp với bộ lọc.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default OrdersContent;
