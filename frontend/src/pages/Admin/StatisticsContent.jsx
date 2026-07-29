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
import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import apiAdmin from "@/service/apiAdmin";
import AdminSpinner from "@/components/AdminSpinner";
import { PageHeader, Toolbar, AdminButton } from "@/components/admin/ui";

const ChartTypeToggle = ({ chartType, setChartType }) => (
  <div className="flex items-center space-x-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 shadow-inner">
    <button
      onClick={() => setChartType("bar")}
      className={`px-3 py-1 text-xs font-bold rounded-lg transition duration-150 ${
        chartType === "bar" ? "bg-pink-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-200"
      }`}
    >
      Cột
    </button>
    <button
      onClick={() => setChartType("line")}
      className={`px-3 py-1 text-xs font-bold rounded-lg transition duration-150 ${
        chartType === "line" ? "bg-pink-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-200"
      }`}
    >
      Đường
    </button>
  </div>
);

const RevenueIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m4 2h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
);
const OrderIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
);
const CustomerIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM12 14c-1.474 0-2.859.356-3.951.966-1.092.61-1.94 1.458-2.485 2.485C5.107 18.06 5 19.436 5 21h14c0-1.564-.107-2.94-.564-3.869-.545-1.027-1.393-1.875-2.485-2.485C14.859 14.356 13.474 14 12 14z"></path></svg>
);

const Statistics = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [revenueChartType, setRevenueChartType] = useState("bar"); 

  const [monthlyRevenue, setMonthlyRevenue] = useState([]);
  const [bestSelling, setBestSelling] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  const formatCurrency = useCallback((value) => {
    if (!value) return "0₫";
    const num = parseFloat(value).toFixed(0);
    return `${num.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}₫`;
  }, []);
  
  const formatNumber = useCallback((value) => {
    if (typeof value === 'number') {
      return value.toLocaleString('vi-VN');
    }
    return value;
  }, []);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-xl shadow-lg border border-slate-200 text-xs">
          <p className="font-bold text-slate-800 mb-1">{label}</p>
          {payload.map((entry, index) => (
            <p key={`item-${index}`} className="font-semibold" style={{ color: entry.color }}>
              {entry.name}: {entry.name === "Doanh thu" ? formatCurrency(entry.value) : formatNumber(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const CustomBarLabel = ({ x, y, width, height, value, dataKey }) => {
    const formattedValue = dataKey === "Doanh thu" ? formatCurrency(value) : formatNumber(value);
    const isSmall = height < 20; 

    return (
      <text
        x={x + width / 2}
        y={isSmall ? y - 10 : y}
        fill="#475569"
        textAnchor="middle"
        dy={isSmall ? 0 : -6}
        fontSize="10px"
        fontWeight="bold"
      >
        {formattedValue}
      </text>
    );
  };
  
  const CustomYAxisTick = ({ x, y, payload }) => {
    return (
      <g transform={`translate(${x},${y})`}>
        <text 
          x={-10} 
          y={0} 
          dy={4} 
          textAnchor="end" 
          fill="#64748b" 
          fontSize="10px"
          fontWeight="bold"
        >
          {formatCurrency(payload.value)}
        </text>
      </g>
    );
  };

  const fetchStatistics = async () => {
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

  return (
    <div className="p-6 bg-slate-50 dark:bg-slate-950 min-h-screen">
      <PageHeader
        title="Báo cáo & Thống kê"
        description="Xem phân tích biểu đồ doanh thu, thống kê các sản phẩm bán chạy nhất và tỷ lệ chuyển đổi khách hàng."
      />

      <Toolbar
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-1.5 text-xs text-slate-700 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/20"
              />
              <span className="text-slate-400 text-xs font-bold">~</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-1.5 text-xs text-slate-700 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/20"
              />
            </div>
            <AdminButton
              variant="secondary"
              size="sm"
              onClick={fetchStatistics}
              loading={loading}
            >
              Lọc kết quả
            </AdminButton>
            <AdminButton
              variant="primary"
              size="sm"
              onClick={handleExport}
              icon={<ArrowDownTrayIcon className="w-4 h-4" />}
            >
              Xuất báo cáo
            </AdminButton>
          </div>
        }
      />

      {/* Metrics Grid */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center gap-4 hover:shadow-md transition-all">
            <div className="p-3 bg-pink-50 text-pink-600 rounded-xl">
              <RevenueIcon />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Doanh thu trung bình / ngày</p>
              <p className="text-xl font-black text-pink-600 mt-0.5">{formatCurrency(summary.averageRevenue)}</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center gap-4 hover:shadow-md transition-all">
            <div className="p-3 bg-pink-50 text-pink-600 rounded-xl">
              <OrderIcon />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Đơn hàng trung bình / ngày</p>
              <p className="text-xl font-black text-slate-800 mt-0.5">{formatNumber(summary.averageOrders)}</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center gap-4 hover:shadow-md transition-all">
            <div className="p-3 bg-pink-50 text-pink-600 rounded-xl">
              <CustomerIcon />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Khách hàng mới / tuần</p>
              <p className="text-xl font-black text-slate-800 mt-0.5">{formatNumber(summary.newCustomers)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Doanh thu theo tháng */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-4 h-96">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-800">
              📈 Biểu đồ doanh thu
            </h3>
            <ChartTypeToggle 
              chartType={revenueChartType} 
              setChartType={setRevenueChartType} 
            />
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center flex-grow">
              <AdminSpinner message="Đang tải dữ liệu doanh thu..." />
            </div>
          ) : (
            <div className="flex-grow">
              <ResponsiveContainer width="100%" height="100%">
                {revenueChartType === "bar" ? (
                  <BarChart
                    data={monthlyRevenue}
                    margin={{ top: 10, right: 10, left: 20, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" /> 
                    <XAxis dataKey="name" stroke="#94a3b8" angle={-15} textAnchor="end" height={45} fontSize={10} />
                    <YAxis tick={CustomYAxisTick} stroke="#94a3b8" /> 
                    <Tooltip cursor={{ fill: '#f8fafc' }} content={<CustomTooltip />} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <Bar dataKey="Doanh thu" fill="#EC4899" radius={[4, 4, 0, 0]}>
                      <LabelList dataKey="Doanh thu" content={<CustomBarLabel dataKey="Doanh thu" />} />
                    </Bar> 
                  </BarChart>
                ) : (
                  <LineChart
                    data={monthlyRevenue}
                    margin={{ top: 10, right: 30, left: 20, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" stroke="#94a3b8" angle={-15} textAnchor="end" height={45} fontSize={10} />
                    <YAxis tick={CustomYAxisTick} stroke="#94a3b8" />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <Line 
                      type="monotone" 
                      dataKey="Doanh thu" 
                      stroke="#DB2777" 
                      strokeWidth={3}
                      dot={{ stroke: '#EC4899', strokeWidth: 4, r: 4 }} 
                      activeDot={{ r: 8 }}
                      label={({ x, y, value }) => ( 
                        <text x={x} y={y} dy={-10} textAnchor="middle" fill="#DB2777" fontSize="9px" fontWeight="bold">
                          {formatCurrency(value)}
                        </text>
                      )}
                    />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Sản phẩm bán chạy */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-4 h-96">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-800">
              🏆 Top sản phẩm bán chạy nhất
            </h3>
          </div>
          {loading ? (
            <div className="flex items-center justify-center flex-grow">
              <AdminSpinner message="Đang tải sản phẩm bán chạy..." />
            </div>
          ) : (
            <div className="flex-grow">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={bestSelling}
                  margin={{ top: 10, right: 10, left: 20, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" angle={-15} textAnchor="end" height={45} fontSize={10} />
                  <YAxis stroke="#94a3b8" fontSize={10} />
                  <Tooltip cursor={{ fill: '#f8fafc' }} content={<CustomTooltip />} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="Sản phẩm đã bán" fill="#DB2777" radius={[4, 4, 0, 0]}>
                    <LabelList dataKey="Sản phẩm đã bán" content={<CustomBarLabel dataKey="Sản phẩm đã bán" />} />
                  </Bar> 
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Statistics;