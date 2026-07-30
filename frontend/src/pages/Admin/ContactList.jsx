import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import {
  Mail,
  Search,
  CheckCircle,
  Clock,
  Trash2,
  Reply,
  Send,
  Loader2,
  X,
  User,
  Phone,
  MessageSquare,
  Filter,
  RefreshCw
} from 'lucide-react'
import apiAdmin from '@/service/apiAdmin'
import DataTable from '@/components/admin/ui/DataTable'
import { toast } from 'react-toastify'

const ReplyModal = ({ contact, isOpen, onClose, onSuccess }) => {
  const [replyMessage, setReplyMessage] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (contact?.reply) {
      setReplyMessage(contact.reply)
    } else {
      setReplyMessage('')
    }
  }, [contact])

  if (!isOpen || !contact) return null

  const handleSendReply = async () => {
    if (!replyMessage.trim()) {
      toast.error('Vui lòng nhập nội dung phản hồi')
      return
    }
    setLoading(true)
    try {
      await apiAdmin.put(`/contacts/${contact._id}/reply`, { reply: replyMessage })
      toast.success(`Đã gửi email phản hồi tới ${contact.email} 📧`)
      onSuccess?.()
      onClose()
    } catch (err) {
      console.error(err)
      toast.error(err.response?.data?.message || 'Có lỗi khi gửi phản hồi')
    } finally {
      setLoading(false)
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 bg-gradient-to-r from-pink-500 to-purple-600 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <Reply className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Phản hồi khách hàng</h3>
              <p className="text-xs opacity-90">{contact.email}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Customer Message Box */}
          <div className="p-4 bg-pink-50/50 border border-pink-100 rounded-xl space-y-2">
            <div className="flex justify-between items-center text-xs text-gray-500">
              <span className="font-semibold text-gray-700">{contact.name} ({contact.phone || 'Chưa có SĐT'})</span>
              <span>{new Date(contact.createdAt).toLocaleString('vi-VN')}</span>
            </div>
            <p className="text-sm font-semibold text-purple-900">Tiêu đề: {contact.subject || 'Không có tiêu đề'}</p>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{contact.message}</p>
          </div>

          {/* Reply Form */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
              Nội dung phản hồi (sẽ gửi qua email cho khách) *
            </label>
            <textarea
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
              rows={5}
              placeholder="Nhập nội dung giải đáp, tư vấn hoặc hỗ trợ khách hàng..."
              className="w-full p-4 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 resize-none"
            />
          </div>

          {contact.repliedAt && (
            <div className="text-xs text-emerald-600 bg-emerald-50 p-3 rounded-lg border border-emerald-100 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>Đã phản hồi trước đó vào {new Date(contact.repliedAt).toLocaleString('vi-VN')} bởi {contact.repliedBy || 'Admin'}</span>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={handleSendReply}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-pink-200 transition-all disabled:opacity-60"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Gửi email phản hồi
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}

const ContactList = () => {
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedContact, setSelectedContact] = useState(null)
  const [isReplyOpen, setIsReplyOpen] = useState(false)
  const fetchContacts = async () => {
    setLoading(true)
    try {
      const res = await apiAdmin.get('/contacts', {
        params: { search, status: statusFilter }
      })

      setContacts(res.data.data || res.data || [])
    } catch (err) {
      console.error(err)
      toast.error('Không thể tải danh sách tin nhắn liên hệ')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchContacts()
    }, 300)
    return () => clearTimeout(timer)
  }, [search, statusFilter])

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa tin nhắn liên hệ này?')) return
    try {
      await apiAdmin.delete(`/contacts/${id}`)
      toast.success('Đã xóa tin nhắn liên hệ')
      fetchContacts()
    } catch (err) {
      toast.error('Xóa thất bại')
    }
  }

  const columns = [
    {
      header: 'Khách hàng',
      accessor: (row) => (
        <div className="flex flex-col">
          <span className="font-semibold text-gray-900">{row.name}</span>
          <span className="text-xs text-gray-500">{row.email}</span>
          {row.phone && <span className="text-xxs text-pink-600">{row.phone}</span>}
        </div>
      ),
    },
    {
      header: 'Tiêu đề / Nội dung',
      accessor: (row) => (
        <div className="max-w-xs">
          <p className="font-medium text-xs text-purple-700 truncate">{row.subject || 'Không tiêu đề'}</p>
          <p className="text-xs text-gray-600 line-clamp-2 mt-0.5">{row.message}</p>
        </div>
      ),
    },
    {
      header: 'Ngày gửi',
      accessor: (row) => (
        <span className="text-xs text-gray-500">
          {new Date(row.createdAt).toLocaleDateString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          })}
        </span>
      ),
    },
    {
      header: 'Trạng thái',
      accessor: (row) => (
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${row.status === 'replied'
          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
          : 'bg-amber-50 text-amber-700 border border-amber-200 animate-pulse'
          }`}>
          {row.status === 'replied' ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
          {row.status === 'replied' ? 'Đã phản hồi' : 'Chờ xử lý'}
        </span>
      ),
    },
    {
      header: 'Thao tác',
      accessor: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSelectedContact(row)
              setIsReplyOpen(true)
            }}
            className="p-1.5 text-pink-600 hover:text-pink-800 hover:bg-pink-50 rounded-lg transition-colors flex items-center gap-1 text-xs font-medium"
            title="Trả lời email"
          >
            <Reply className="w-4 h-4" /> Phản hồi
          </button>
          <button
            onClick={() => handleDelete(row._id)}
            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
            title="Xóa"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Mail className="w-6 h-6 text-pink-500" /> Quản lý liên hệ & Phản hồi khách hàng
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Tiếp nhận thắc mắc từ form liên hệ và trả lời qua email
          </p>
        </div>
        <button
          onClick={fetchContacts}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 text-sm font-semibold rounded-xl transition-all shadow-sm"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Làm mới
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm theo tên, email, tiêu đề, nội dung..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-300"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-300 bg-white"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="pending">Chờ xử lý</option>
            <option value="replied">Đã phản hồi</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={contacts}
        loading={loading}
        emptyText="Chưa có tin nhắn liên hệ nào"
      />

      {/* Reply Modal */}
      <ReplyModal
        contact={selectedContact}
        isOpen={isReplyOpen}
        onClose={() => setIsReplyOpen(false)}
        onSuccess={fetchContacts}
      />
    </div>
  )
}

export default ContactList
