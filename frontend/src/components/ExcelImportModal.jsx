import React, { useState, useRef } from 'react'
import { X, Upload, FileSpreadsheet, Download, AlertCircle, CheckCircle } from 'lucide-react'
import apiAdmin from '@/service/apiAdmin'
import { toast } from 'react-toastify'

export default function ExcelImportModal({ isOpen, onClose, onSuccess }) {
    const [file, setFile] = useState(null)
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(false)
    const fileInputRef = useRef(null)

    if (!isOpen) return null

    const handleFileChange = (e) => {
        const selectedFile = e.target.files?.[0]
        if (selectedFile) {
            // Validate file type
            const validTypes = [
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'application/vnd.ms-excel'
            ]
            if (!validTypes.includes(selectedFile.type) && !selectedFile.name.endsWith('.xlsx') && !selectedFile.name.endsWith('.xls')) {
                setError('Vui lòng chọn file Excel (.xlsx hoặc .xls)')
                return
            }
            setFile(selectedFile)
            setError(null)
            setSuccess(false)
        }
    }

    const handleDragOver = (e) => {
        e.preventDefault()
        e.stopPropagation()
    }

    const handleDrop = (e) => {
        e.preventDefault()
        e.stopPropagation()

        const droppedFile = e.dataTransfer.files[0]
        if (droppedFile) {
            const validTypes = [
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'application/vnd.ms-excel'
            ]
            if (!validTypes.includes(droppedFile.type) && !droppedFile.name.endsWith('.xlsx') && !droppedFile.name.endsWith('.xls')) {
                setError('Vui lòng chọn file Excel (.xlsx hoặc .xls)')
                return
            }
            setFile(droppedFile)
            setError(null)
            setSuccess(false)
        }
    }


const handleUpload = async () => {
    if (!file) {
        setError('Vui lòng chọn file để tải lên')
        return
    }

    setUploading(true)
    setError(null)
    setSuccess(false)

    try {
        const formData = new FormData()
        formData.append('file', file)

        const response = await apiAdmin.post(
            '/importExport/transactions/import-excel',
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data"   // QUAN TRỌNG
                }
            }
        )

        setSuccess(true)
        setFile(null)
        
        toast.success("Upload file thành công")
        setTimeout(() => onSuccess(), 2000)
    } catch (err) {
        setError(err.response?.data?.message || 'Có lỗi xảy ra khi tải file lên')
    } finally {
        setUploading(false)
    }
}

    const handleDownloadTemplate = async () => {
        try {
            const response = await apiAdmin.get('/importExport/transactions/template', {
                responseType: 'arraybuffer', // important!
            })
            const blob = new Blob([response.data], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            })
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = 'import-template.xlsx'
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)
        } catch (error) {
            console.error('Download error:', error)
            setError('Không thể tải file mẫu')
        }
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Upload className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800">Nhập dữ liệu từ Excel</h2>
                            <p className="text-sm text-slate-600">Tải lên file Excel để nhập dữ liệu vào hệ thống</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        <X className="w-6 h-6 text-slate-600" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Upload Area */}
                    <div
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all"
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".xlsx,.xls"
                            onChange={handleFileChange}
                            className="hidden"
                        />

                        {file ? (
                            <div className="flex items-center justify-center gap-3">
                                <FileSpreadsheet className="w-12 h-12 text-green-600" />
                                <div className="text-left">
                                    <p className="font-semibold text-slate-800">{file.name}</p>
                                    <p className="text-sm text-slate-600">
                                        {(file.size / 1024).toFixed(2)} KB
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <Upload className="w-16 h-16 text-slate-400 mx-auto" />
                                <div>
                                    <p className="text-lg font-medium text-slate-700">
                                        Kéo thả file vào đây hoặc click để chọn
                                    </p>
                                    <p className="text-sm text-slate-500 mt-1">
                                        Hỗ trợ file .xlsx, .xls
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                            <p className="text-red-700">{error}</p>
                        </div>
                    )}

                    {/* Success Message */}
                    {success && (
                        <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                            <p className="text-green-700">Tải file lên thành công!</p>
                        </div>
                    )}

                    {/* Template Download */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
                        <div className="flex items-start gap-3">
                            <FileSpreadsheet className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                                <p className="font-medium text-slate-800 mb-1">
                                    Chưa có file Excel?
                                </p>
                                <p className="text-sm text-slate-600 mb-3">
                                    Tải xuống file mẫu để biết định dạng dữ liệu cần nhập
                                </p>
                                <button
                                    onClick={handleDownloadTemplate}
                                    className="flex items-center gap-2 px-4 py-2 bg-white border border-blue-300 text-blue-700 rounded-lg font-medium hover:bg-blue-50 transition-colors"
                                >
                                    <Download className="w-4 h-4" />
                                    Tải file mẫu
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4">
                        <button
                            onClick={onClose}
                            className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
                        >
                            Hủy
                        </button>
                        <button
                            onClick={handleUpload}
                            disabled={!file || uploading}
                            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
                        >
                            {uploading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Đang tải lên...
                                </span>
                            ) : (
                                'Tải lên'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}