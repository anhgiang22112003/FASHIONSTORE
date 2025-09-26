import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const monthlyRevenueData = [
  { month: 'Thg 1', doanh_thu: 30000000 },
  { month: 'Thg 2', doanh_thu: 45000000 },
  { month: 'Thg 3', doanh_thu: 60000000 },
  { month: 'Thg 4', doanh_thu: 55000000 },
  { month: 'Thg 5', doanh_thu: 75000000 },
  { month: 'Thg 6', doanh_thu: 90000000 },
];

const bestSellingProductsData = [
  { product: 'Váy hồng', doanh_so: 120 },
  { product: 'Áo sơ mi', doanh_so: 95 },
  { product: 'Chân váy', doanh_so: 80 },
  { product: 'Quần jean', doanh_so: 70 },
  { product: 'Áo khoác', doanh_so: 65 },
];

const Statistics = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportRange, setReportRange] = useState('monthly');

  const handleExport = () => {
    alert('Xuất báo cáo trong khoảng thời gian từ ' + startDate + ' đến ' + endDate);
  };

  return (
    <div className="space-y-8">
      {/* Header with Date Range and Export Button */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-4 md:space-y-0">
        <div className="flex items-center space-x-4">
          <label className="flex flex-col">
            <span className="text-sm font-semibold text-gray-600">Từ ngày</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-200"
            />
          </label>
          <label className="flex flex-col">
            <span className="text-sm font-semibold text-gray-600">Đến ngày</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-200"
            />
          </label>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center space-x-2 px-6 py-3 bg-pink-600 text-white rounded-xl font-semibold hover:bg-pink-700 transition-colors"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"></path></svg>
          <span>Xuất báo cáo</span>
        </button>
      </div>

      {/* Main Statistics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Doanh thu theo tháng */}
        <div className="bg-white p-6 rounded-2xl shadow-md space-y-4 h-96">
          <h3 className="text-xl font-bold text-gray-800">Doanh thu theo tháng</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={monthlyRevenueData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="doanh_thu" fill="#EC4899" name="Doanh thu" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Sản phẩm bán chạy */}
        <div className="bg-white p-6 rounded-2xl shadow-md space-y-4 h-96">
          <h3 className="text-xl font-bold text-gray-800">Sản phẩm bán chạy</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={bestSellingProductsData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="product" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="doanh_so" fill="#DB2777" name="Sản phẩm đã bán" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Report Cards */}
      <div className="bg-white p-8 rounded-2xl shadow-xl space-y-6">
        <h2 className="text-2xl font-bold text-gray-800">Báo cáo chi tiết</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Doanh thu trung bình */}
          <div className="bg-pink-50 p-6 rounded-2xl flex flex-col items-start space-y-2">
            <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 mb-2">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zM8 12l4-4 4 4h-3v4h-2v-4H8z"></path></svg>
            </div>
            <p className="text-lg text-gray-600">Doanh thu trung bình</p>
            <p className="text-3xl font-bold text-pink-600">4.2M₫</p>
            <p className="text-sm text-gray-500">mỗi ngày</p>
          </div>

          {/* Đơn hàng trung bình */}
          <div className="bg-pink-50 p-6 rounded-2xl flex flex-col items-start space-y-2">
            <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 mb-2">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zm-1 10V7H8v5H5.82c-.38 0-.62-.4-.44-.75l5.2-9.6c.2-.38.74-.38.94 0l5.2 9.6c.18.35-.06.75-.44.75H13v5h-2v-5z"></path></svg>
            </div>
            <p className="text-lg text-gray-600">Đơn hàng trung bình</p>
            <p className="text-3xl font-bold text-pink-600">42</p>
            <p className="text-sm text-gray-500">mỗi ngày</p>
          </div>

          {/* Khách hàng mới */}
          <div className="bg-pink-50 p-6 rounded-2xl flex flex-col items-start space-y-2">
            <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 mb-2">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"></path></svg>
            </div>
            <p className="text-lg text-gray-600">Khách hàng mới</p>
            <p className="text-3xl font-bold text-pink-600">15</p>
            <p className="text-sm text-gray-500">mỗi tuần</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistics;