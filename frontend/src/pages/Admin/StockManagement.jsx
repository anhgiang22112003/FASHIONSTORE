import React, { useState } from 'react'
import { TrendingUp, TrendingDown, Package, FileText } from 'lucide-react'
import StockImportExport from './StockImportExport'
import StockHistory from '@/components/StockHistory'
import TransactionHistory from '@/components/TransactionHistory'

export default function StockManagement() {
    const [tab, setTab] = useState('import')

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
            <div className="max-w-full mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-800 mb-2">Quản lý Kho hàng</h1>
                    <p className="text-slate-600">Nhập xuất và theo dõi lịch sử kho hàng</p>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6 bg-white p-2 rounded-xl shadow-sm">
                    <button
                        className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${tab === 'import'
                            ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md'
                            : 'text-slate-600 hover:bg-slate-50'
                            }`}
                        onClick={() => setTab('import')}
                    >
                        <TrendingUp className="w-5 h-5" />
                        Nhập kho
                    </button>
                    <button
                        className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${tab === 'export'
                            ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md'
                            : 'text-slate-600 hover:bg-slate-50'
                            }`}
                        onClick={() => setTab('export')}
                    >
                        <TrendingDown className="w-5 h-5" />
                        Xuất kho
                    </button>
                    <button
                        className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${tab === 'history'
                            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                            : 'text-slate-600 hover:bg-slate-50'
                            }`}
                        onClick={() => setTab('history')}
                    >
                        <Package className="w-5 h-5" />
                        Lịch sử
                    </button>
                    <button
                        className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${tab === 'transaction'
                            ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md'
                            : 'text-slate-600 hover:bg-slate-50'
                            }`}
                        onClick={() => setTab('transaction')}
                    >
                        <FileText className="w-5 h-5" />
                        Bảng ghi
                    </button>
                </div>

                {/* Content */}
                {(tab === 'import' || tab === 'export') && (
                    <StockImportExport tab={tab} onSuccess={() => {}} />
                )}

                {tab === 'history' && <StockHistory />}
                {tab === 'transaction' && <TransactionHistory />}
            </div>
        </div>
    )
}