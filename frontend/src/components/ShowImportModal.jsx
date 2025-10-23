import React, { useState } from 'react'
import { EyeIcon, FunnelIcon, ArrowDownTrayIcon, ArrowUpTrayIcon } from "@heroicons/react/24/outline"
import { toast } from 'react-toastify'
import apiAdmin from '@/service/apiAdmin'
const ShowImportModal = ({fetchProducts}) => {
    const [showImportModal, setShowImportModal] = useState(false)
    const [loading, setLoading] = useState(false)
    const handleOpenImport = () => setShowImportModal(true)
    const handleImportExcel = async (e) => {
        const file = e.target.files[0]
        if (!file) return

        const formData = new FormData()
        formData.append("file", file)

        try {
            setLoading(true)
            const res = await apiAdmin.post("/excel/products/import", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            })
            const data = res.data

            if (data.errors && data.errors.length > 0) {
                toast.warning(`${data.message} ⚠️`)
                data.errors.forEach(err => toast.error(err))
            } else {
                toast.success(data.message || "Import Excel thành công 🎉")
                 fetchProducts()
            }
           
        } catch (err) {
            console.error(err)
            toast.error(err?.response?.data?.message || "Lỗi khi import Excel ❌")
        } finally {
            setLoading(false)
            e.target.value = "" // reset input file
        }
    }
    return (
        <>
            <button
                onClick={handleOpenImport}
                disabled={loading}
                className="flex items-center space-x-1 bg-pink-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-pink-700 transition-colors disabled:opacity-60"
            >
                <ArrowUpTrayIcon className="w-5 h-5" />
                <span>Import Excel</span>
            </button>
            {showImportModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-2xl w-96 p-6 relative animate-fadeIn">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                            <ArrowUpTrayIcon className="w-6 h-6 text-pink-600" />
                            <span>Nhập sản phẩm  từ Excel</span>
                        </h2>

                        <p className="text-sm text-gray-500 mb-3">
                            Chọn tệp Excel đúng định dạng để nhập dữ liệu sản phẩm vào hệ thống.
                        </p>

                        {/* Input chọn file */}
                        <input
                            type="file"
                            accept=".xlsx, .xls"
                            onChange={handleImportExcel}
                            className="block w-full text-sm text-gray-700 border border-gray-300 rounded-lg cursor-pointer focus:ring-2 focus:ring-pink-500"
                        />

                        {/* Link tải file mẫu */}
                        <div className="mt-3 text-sm text-gray-600">
                            Chưa có file mẫu?{" "}
                            <button
                                onClick={async () => {
                                    try {
                                        const res = await apiAdmin.get("/excel/products/export-template", { responseType: "blob" })
                                        const blob = new Blob([res.data], {
                                            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                                        })
                                        const url = window.URL.createObjectURL(blob)
                                        const a = document.createElement("a")
                                        a.href = url
                                        a.download = "template_import_products.xlsx"
                                        a.click()
                                        window.URL.revokeObjectURL(url)
                                        toast.success("Đã tải file mẫu Excel ✅")
                                    } catch (err) {
                                        toast.error("Không thể tải file mẫu ❌")
                                    }
                                }}
                                className="text-pink-600 hover:underline font-medium"
                            >
                                Tải tại đây
                            </button>
                        </div>

                        {/* Nút đóng */}
                        <div className="flex justify-end mt-6 space-x-3">
                            <button
                                onClick={() => setShowImportModal(false)}
                                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 font-medium transition-colors"
                            >
                                Hủy
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default ShowImportModal