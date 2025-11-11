import React, { useEffect, useState, useCallback } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
  LineChart,
  Line,
} from "recharts";
import apiAdmin from "@/service/apiAdmin"; // Giả sử đã có file service này

// Custom Component: Toggle Switch (Giữ nguyên)
const ChartTypeToggle = ({ chartType, setChartType }) => (
    <div className="flex items-center space-x-2 p-1 bg-gray-100 rounded-lg shadow-inner">
        <button
            onClick={() => setChartType("bar")}
            className={`px-3 py-1 text-sm font-semibold rounded-md transition duration-150 ${
                chartType === "bar" ? "bg-pink-600 text-white shadow-md" : "text-gray-600 hover:bg-gray-200"
            }`}
        >
            Cột
        </button>
        <button
            onClick={() => setChartType("line")}
            className={`px-3 py-1 text-sm font-semibold rounded-md transition duration-150 ${
                chartType === "line" ? "bg-pink-600 text-white shadow-md" : "text-gray-600 hover:bg-gray-200"
            }`}
        >
            Đường
        </button>
    </div>
);

// Icon components... (Giữ nguyên)
const RevenueIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m4 2h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
);
const OrderIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
);
const CustomerIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM12 14c-1.474 0-2.859.356-3.951.966-1.092.61-1.94 1.458-2.485 2.485C5.107 18.06 5 19.436 5 21h14c0-1.564-.107-2.94-.564-3.869-.545-1.027-1.393-1.875-2.485-2.485C14.859 14.356 13.474 14 12 14z"></path></svg>
);


const Statistics = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [revenueChartType, setRevenueChartType] = useState("bar"); 

  const [monthlyRevenue, setMonthlyRevenue] = useState([]);
  const [bestSelling, setBestSelling] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  // Hàm format tiền tệ (Giữ nguyên)
  const formatCurrency = useCallback((value) => {
    if (!value) return "0₫";
    const num = parseFloat(value).toFixed(0);
    return `${num.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}₫`;
  }, []);
  
  // Hàm format số lượng (Giữ nguyên)
  const formatNumber = useCallback((value) => {
      if (typeof value === 'number') {
          return value.toLocaleString('vi-VN');
      }
      return value;
  }, []);


  // Custom Tooltip (Giữ nguyên)
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="text-sm font-semibold text-gray-700">{label}</p>
          {payload.map((entry, index) => (
            <p key={`item-${index}`} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: <span className="font-bold">{entry.name === "Doanh thu" ? formatCurrency(entry.value) : formatNumber(entry.value)}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Custom Label cho Bar (Chỉnh sửa để đảm bảo không bị che)
  const CustomBarLabel = ({ x, y, width, height, value, dataKey }) => {
    const formattedValue = dataKey === "Doanh thu" ? formatCurrency(value) : formatNumber(value);
    
    // Nếu chiều cao cột quá thấp (vd: < 20px), đẩy label ra ngoài hoàn toàn
    const isSmall = height < 20; 

    return (
      <text
        x={x + width / 2}
        y={isSmall ? y - 10 : y} // Nếu nhỏ thì đẩy lên cao hơn
        fill="#4A5568"
        textAnchor="middle"
        dy={isSmall ? 0 : -6} // Đẩy chữ lên trên cột một chút
        fontSize="12px"
        fontWeight="bold"
      >
        {formattedValue}
      </text>
    );
  };
  
  // Custom Ticks cho YAxis (để đảm bảo không bị cắt)
  const CustomYAxisTick = ({ x, y, payload }) => {
    return (
      <g transform={`translate(${x},${y})`}>
        <text 
            x={-10} // Tăng khoảng cách từ label đến trục Y (trừ 10px)
            y={0} 
            dy={4} 
            textAnchor="end" 
            fill="#666" 
            fontSize="12px"
        >
          {formatCurrency(payload.value)}
        </text>
      </g>
    );
  };


  // ======== Logic API (Giữ nguyên) ========
  const fetchStatistics = async () => {
    // ... (logic fetch API giữ nguyên)
    try {
      setLoading(true);

      const [revenueRes, bestRes, summaryRes] = await Promise.all([
        apiAdmin.get(`/statistics/revenue`, {
          params: { from: startDate, to: endDate },
        }),
        apiAdmin.get(`/statistics/best-sellers`),
        apiAdmin.get(`/statistics/summary`),
      ]);

      setMonthlyRevenue(
        revenueRes.data.map((item) => ({
          name: `Tháng ${item.month}`,
          "Doanh thu": item.total,
        }))
      );
      setBestSelling(
        bestRes.data.map((item) => ({
          name: item.name,
          "Sản phẩm đã bán": item.sold,
        }))
      );
      setSummary(summaryRes.data);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu thống kê:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatistics();
  }, []);

  const handleExport = async () => {
    // ... (logic export giữ nguyên)
    try {
        const response = await apiAdmin.get(`/statistics/export`, {
            params: { from: startDate, to: endDate },
            responseType: "blob",
        });

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "bao_cao_thong_ke.xlsx");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (error) {
        console.error("Lỗi khi xuất báo cáo:", error);
    }
  };


  // --- Bắt đầu Render ---
  return (
    <div style={{ backgroundColor: "var(--bg-color)", color: "var(--text-color)" }} className="min-h-screen p-5 md:p-8  font-sans text-gray-800">
      
      {/* Header và Controls (Giữ nguyên) */}
      <div className=" p-6 rounded-2xl shadow-xl mb-8">
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold ">📊 Thống kê</h1>
        </header>
        
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <label className="flex flex-col">
                <span className="text-sm font-semibold  mb-1">Từ ngày</span>
                <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="px-4 py-2 text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 transition duration-150"
                />
            </label>
            <label className="flex flex-col">
                <span className="text-sm font-semibold  mb-1">Đến ngày</span>
                <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="px-4 py-2 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 transition duration-150"
                />
            </label>
            <button
                onClick={fetchStatistics}
                className="mt-6 px-6 py-2 bg-pink-600 text-white rounded-lg font-semibold hover:bg-pink-700 transition duration-150"
                disabled={loading}
            >
                {loading ? "Đang tải..." : "Lọc"}
            </button>
          </div>

          <button
            onClick={handleExport}
            className="flex items-center space-x-2 px-6 py-2 bg-pink-600 text-white rounded-lg font-semibold hover:bg-pink-700 transition duration-150 shadow-md"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"></path>
            </svg>
            <span>Xuất báo cáo</span>
          </button>
        </div>
      </div>


      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        
        {/* Doanh thu theo tháng (Chart động) */}
        <div className="bg-white p-6 rounded-2xl shadow-xl space-y-4 h-96">
          <div className="flex justify-between items-center border-b pb-2">
            <h3 className="text-xl font-bold text-gray-800">
              📈 Doanh thu theo tháng
            </h3>
            <ChartTypeToggle 
                chartType={revenueChartType} 
                setChartType={setRevenueChartType} 
            />
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center h-full"><p>Đang tải...</p></div>
          ) : (
            <ResponsiveContainer width="100%" height="90%">
                {/* Tăng left margin cho cả 2 loại biểu đồ để khắc phục Trục Y bị cắt */}
                {revenueChartType === "bar" ? (
                    // 1. Biểu đồ Cột
                    <BarChart
                        data={monthlyRevenue}
                        margin={{ top: 10, right: 10, left: 20, bottom: 20 }} // Tăng left margin lên 20
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" /> 
                        <XAxis dataKey="name" stroke="#6b7280" angle={-15} textAnchor="end" height={50} />
                        {/* Sử dụng CustomYAxisTick để đẩy label ra xa hơn */}
                        <YAxis tick={CustomYAxisTick} stroke="#6b7280" /> 
                        <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} content={<CustomTooltip />} />
                        <Legend iconType="circle" wrapperStyle={{ paddingTop: '10px' }} />
                        <Bar dataKey="Doanh thu" fill="#EC4899" radius={[4, 4, 0, 0]}>
                            {/* Sử dụng CustomBarLabel đã chỉnh sửa */}
                            <LabelList dataKey="Doanh thu" content={<CustomBarLabel dataKey="Doanh thu" />} />
                        </Bar> 
                    </BarChart>
                ) : (
                    // 2. Biểu đồ Đường
                    <LineChart
                        data={monthlyRevenue}
                        margin={{ top: 10, right: 30, left: 20, bottom: 20 }} // Tăng left margin lên 20
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
                        <XAxis dataKey="name" stroke="#6b7280" angle={-15} textAnchor="end" height={50} />
                        {/* Sử dụng CustomYAxisTick để đẩy label ra xa hơn */}
                        <YAxis tick={CustomYAxisTick} stroke="#6b7280" />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend iconType="circle" wrapperStyle={{ paddingTop: '10px' }} />
                        <Line 
                            type="monotone" 
                            dataKey="Doanh thu" 
                            stroke="#DB2777" 
                            strokeWidth={3}
                            dot={{ stroke: '#EC4899', strokeWidth: 4, r: 4 }} 
                            activeDot={{ r: 8 }}
                            // Chỉnh lại label cho biểu đồ đường để không bị che
                            label={({ x, y, value }) => ( 
                                <text x={x} y={y} dy={-10} textAnchor="middle" fill="#DB2777" fontSize="12px" fontWeight="bold">
                                    {formatCurrency(value)}
                                </text>
                            )}
                        />
                    </LineChart>
                )}
            </ResponsiveContainer>
          )}
        </div>

        {/* Sản phẩm bán chạy (Giữ nguyên Cột nhưng tối ưu YAxis) */}
        <div className="bg-white p-6 rounded-2xl shadow-xl space-y-4 h-96">
          <h3 className="text-xl font-bold text-gray-800 border-b pb-2">
            🔥 Sản phẩm bán chạy
          </h3>
          {loading ? (
            <div className="flex items-center justify-center h-full"><p>Đang tải...</p></div>
          ) : (
            <ResponsiveContainer width="100%" height="90%">
              <BarChart
                data={bestSelling}
                margin={{ top: 10, right: 10, left: 20, bottom: 20 }} // Tăng left margin lên 20
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
                <XAxis dataKey="name" stroke="#6b7280" angle={-15} textAnchor="end" height={50} />
                <YAxis stroke="#6b7280" /> {/* Không cần CustomYAxisTick vì số lượng ngắn hơn */}
                <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} content={<CustomTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '10px' }} />
                <Bar dataKey="Sản phẩm đã bán" fill="#DB2777" radius={[4, 4, 0, 0]}>
                   {/* Sử dụng CustomBarLabel đã chỉnh sửa */}
                   <LabelList dataKey="Sản phẩm đã bán" content={<CustomBarLabel dataKey="Sản phẩm đã bán" />} />
                </Bar> 
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Báo cáo chi tiết (Giữ nguyên) */}
      <div className=" p-6 rounded-2xl shadow-xl space-y-6">
        <h2 className="text-2xl font-bold  border-b pb-3">
          📋 Báo cáo chi tiết
        </h2>
        
        {!summary ? (
             <p className="text-center py-4">Đang tải...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* ... (Các card chi tiết giữ nguyên) */}
            <div className="bg-pink-50 p-6 rounded-2xl flex flex-col items-start space-y-3 border-l-4 border-pink-600 shadow-sm transition hover:shadow-lg">
              <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center text-pink-600">
                <RevenueIcon />
              </div>
              <p className="text-base text-gray-600 font-medium">Doanh thu trung bình</p>
              <p className="text-4xl font-extrabold text-pink-600">
                {formatCurrency(summary.averageRevenue)}
              </p>
              <p className="text-sm text-gray-500 pt-1">mỗi ngày</p>
            </div>

            <div className="bg-pink-50 p-6 rounded-2xl flex flex-col items-start space-y-3 border-l-4 border-pink-600 shadow-sm transition hover:shadow-lg">
              <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center text-pink-600">
                <OrderIcon />
              </div>
              <p className="text-base text-gray-600 font-medium">Đơn hàng trung bình</p>
              <p className="text-4xl font-extrabold text-pink-600">
                {formatNumber(summary.averageOrders)}
              </p>
              <p className="text-sm text-gray-500 pt-1">mỗi ngày</p>
            </div>

            <div className="bg-pink-50 p-6 rounded-2xl flex flex-col items-start space-y-3 border-l-4 border-pink-600 shadow-sm transition hover:shadow-lg">
              <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center text-pink-600">
                <CustomerIcon />
              </div>
              <p className="text-base text-gray-600 font-medium">Khách hàng mới</p>
              <p className="text-4xl font-extrabold text-pink-600">
                {formatNumber(summary.newCustomers)}
              </p>
              <p className="text-sm text-gray-500 pt-1">mỗi tuần</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Statistics; 