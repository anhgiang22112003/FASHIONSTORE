import React, { useEffect, useState } from "react"
import apiAdmin from "@/service/apiAdmin"
import { toast } from "react-toastify"
import dayjs from "dayjs"
import { Button } from "@/components/ui/button"

const FlashSaleListPage = ({ setActiveTab, setEditData }) => {
    const [flashSales, setFlashSales] = useState([])
    const handleEdit = (sale) => {
        setEditData(sale)
        setActiveTab("add-flashsale")
    }
    useEffect(() => {
        const fetchFlashSales = async () => {
            try {
                const res = await apiAdmin.get("/flash-sales/active") // API để lấy danh sách Flash Sale
                setFlashSales(res?.data || [])
            } catch (err) {
                toast.error("Lỗi khi tải danh sách Flash Sale")
            }
        }

        fetchFlashSales()
    }, [])

    const handleEndSale = async (saleId) => {
        try {
            await apiAdmin.post(`/flash-sales/${saleId}/end`) // API kết thúc Flash Sale
            toast.success("Flash Sale đã kết thúc!")
            setFlashSales((prevSales) => prevSales.filter((sale) => sale._id !== saleId))
        } catch (err) {
            toast.error("Lỗi khi kết thúc Flash Sale")
        }
    }

    return (
        <div style={{ backgroundColor: "var(--bg-color)", color: "var(--text-color)" }} className="min-h-screen  p-5 font-sans ">
            {/* Tiêu đề */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="flex text-3xl font-bold">
                    Danh sách Flash Sale
                </h2>

                {/* Nút Thêm */}
                <button

                    onClick={() => {
                        setEditData(null)
                        setActiveTab("add-flashsale")
                    }}
                    className="flex items-center space-x-2 px-6 py-3 text-sm font-medium rounded-lg transition-colors bg-[#ff69b4] hover:bg-[#ff4f9f] text-white"
                >
                    + Thêm sự kiện Flashsale
                </button>
            </div>

            {/* Bảng Danh sách Flash Sale */}
            <div className="overflow-x-auto rounded-xl shadow-lg">
                <table className="min-w-full table-auto border-collapse">
                    <thead>
                        <tr className="bg-pink-100 text-rose-800 font-extrabold text-sm uppercase tracking-wider">
                            <th className="px-4 py-3 text-left rounded-tl-xl">Tiêu đề</th>
                            <th className="px-4 py-3 text-left">Thời gian bắt đầu</th>
                            <th className="px-4 py-3 text-left">Thời gian kết thúc</th>
                            <th className="px-4 py-3 text-left">Trạng thái</th>
                            <th className="px-4 py-3 text-left rounded-tr-xl">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {flashSales.map((sale, index) => (
                            <tr
                                key={sale._id}
                                className={`
                            ${index % 2 === 0 ? 'bg-white' : 'bg-pink-50'} 
                            border-b border-pink-200 
                            hover:bg-pink-100 transition-colors
                        `}
                            >
                                <td className="px-4 py-3 font-medium text-gray-800">{sale.title}</td>
                                <td className="px-4 py-3 text-gray-600">{dayjs(sale.startTime).format("YYYY-MM-DD HH:mm")}</td>
                                <td className="px-4 py-3 text-gray-600">{dayjs(sale.endTime).format("YYYY-MM-DD HH:mm")}</td>
                                <td className="px-4 py-3">
                                    {/* Logic hiển thị trạng thái */}
                                    {sale.status === "ACTIVE" ? (
                                        <span className="text-green-600 bg-green-100 px-3 py-1 rounded-full text-xs font-bold">Đang diễn ra</span>
                                    ) : sale.status === "UPCOMING" ? (
                                        <span className="text-amber-600 bg-amber-100 px-3 py-1 rounded-full text-xs font-bold">Sắp bắt đầu</span>
                                    ) : (
                                        <span className="text-gray-600 bg-gray-200 px-3 py-1 rounded-full text-xs font-bold">Đã kết thúc</span>
                                    )}
                                </td>
                                <td className="px-4 ml-2 py-3">
                                    <button
                                        onClick={() => handleEdit(sale)}
                                        className="bg-pink-500  text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors shadow-md"
                                    >
                                        Sửa
                                    </button>
                                    {sale.status === "ACTIVE" && (
                                        <button
                                            onClick={() => handleEndSale(sale._id)}
                                            className="bg-red-500 text-white px-4 ml-3 py-2 rounded-lg text-sm font-medium hover:bg-red-600 transition-colors shadow-md"
                                        >
                                            Kết thúc
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default FlashSaleListPage
