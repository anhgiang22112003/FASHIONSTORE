import React, { useState } from 'react'
import { TrendingUp, TrendingDown, Package, FileText, Upload, Download } from 'lucide-react'
import StockImportExport from './StockImportExport'
import StockHistory from '@/components/StockHistory'
import TransactionHistory from '@/components/TransactionHistory'
import ExcelImportModal from '@/components/ExcelImportModal'
import apiAdmin from '@/service/apiAdmin'
import { toast } from 'react-toastify'
import { PageHeader, Toolbar, AdminButton } from "@/components/admin/ui"

export default function StockManagement() {
  const [tab, setTab] = useState('import')
  const [showImportModal, setShowImportModal] = useState(false)

  const handleExportExcel = async () => {
    try {
      const response = await apiAdmin.get('/importExport/transactions/export-excel', {
        responseType: 'arraybuffer',
      })

      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `stock-transactions-${new Date().toISOString().split('T')[0]}.xlsx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Xuất file Excel thất bại!')
    }
  }

  return (
    <div className="p-6 bg-slate-50 dark:bg-slate-950 min-h-screen">
      <PageHeader
        title="Quản lý Kho hàng"
        description="Nhập xuất hàng hóa, cập nhật số lượng tồn kho và theo dõi lịch sử luân chuyển kho."
      />

      <Toolbar
        actions={
          <div className="flex gap-2">
            <AdminButton
              variant="secondary"
              size="sm"
              onClick={() => setShowImportModal(true)}
              icon={<Upload className="w-4 h-4" />}
            >
              Nhập Excel
            </AdminButton>
            <AdminButton
              variant="primary"
              size="sm"
              onClick={handleExportExcel}
              icon={<Download className="w-4 h-4" />}
            >
              Xuất Excel
            </AdminButton>
          </div>
        }
      />

      {/* Tabs */}
      <div className="flex gap-2 mb-6 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm w-max">
        <button
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all ${
            tab === 'import'
              ? 'bg-pink-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
          onClick={() => setTab('import')}
        >
          <TrendingUp className="w-4 h-4" />
          Nhập kho
        </button>
        <button
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all ${
            tab === 'export'
              ? 'bg-pink-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
          onClick={() => setTab('export')}
        >
          <TrendingDown className="w-4 h-4" />
          Xuất kho
        </button>
        <button
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all ${
            tab === 'history'
              ? 'bg-pink-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
          onClick={() => setTab('history')}
        >
          <Package className="w-4 h-4" />
          Lịch sử biến động
        </button>
        <button
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all ${
            tab === 'transaction'
              ? 'bg-pink-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
          onClick={() => setTab('transaction')}
        >
          <FileText className="w-4 h-4" />
          Bảng ghi chi tiết
        </button>
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm p-6">
        {(tab === 'import' || tab === 'export') && (
          <StockImportExport tab={tab} onSuccess={() => { }} />
        )}

        {tab === 'history' && <StockHistory />}
        {tab === 'transaction' && <TransactionHistory />}
      </div>

      {/* Excel Import Modal */}
      <ExcelImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onSuccess={() => {
          setShowImportModal(false)
        }}
      />
    </div>
  )
}