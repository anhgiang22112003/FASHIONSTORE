import { AuthContext } from '@/context/AuthContext'
import { CartContext } from '@/context/CartContext'
import { socket } from '@/service/socket'
import api from '@/service/api'
import React, { useState, useEffect, useRef, useContext, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import BankPaymentModal from '@/components/BankPaymentSection'
import {
  MapPin,
  MapPinned,
  User,
  Phone,
  Mail,
  ShoppingBag,
  CreditCard,
  Shield,
  Truck,
  Zap,
  Minus,
  Plus,
  X,
  MessageCircle,
  Loader2,
  ArrowDown,
  Send,
  Lock,
  Cpu
} from 'lucide-react'

const ChatBot = ({ userId }) => {
  const navigate = useNavigate()
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState("")
  const [isConnected, setIsConnected] = useState(socket.connected)
  const [isTyping, setIsTyping] = useState(false)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [activeConfig, setActiveConfig] = useState(null) // { messageId, productId, color, size, quantity }
  const [showScrollBtn, setShowScrollBtn] = useState(false)
  const messagesEndRef = useRef(null)
  const messagesContainerRef = useRef(null)
  const { user } = useContext(AuthContext)
  const { fetchCart, setCart } = useContext(CartContext)

  const [checkoutName, setCheckoutName] = useState("")
  const [checkoutPhone, setCheckoutPhone] = useState("")
  const [checkoutStreet, setCheckoutStreet] = useState("")
  const [checkoutPayment, setCheckoutPayment] = useState("COD")
  const [checkoutVoucher, setCheckoutVoucher] = useState("")
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false)
  const [checkoutShowBank, setCheckoutShowBank] = useState(false)
  const [checkoutOrderData, setCheckoutOrderData] = useState(null)
  const [checkoutSelectedBank, setCheckoutSelectedBank] = useState(null)
  const [lastOrderId, setLastOrderId] = useState(null) // lưu orderId vừa đặt

  // Address dropdowns
  const [checkoutProvinces, setCheckoutProvinces] = useState([])
  const [checkoutDistricts, setCheckoutDistricts] = useState([])
  const [checkoutWards, setCheckoutWards] = useState([])
  const [checkoutProvinceCode, setCheckoutProvinceCode] = useState("")
  const [checkoutDistrictCode, setCheckoutDistrictCode] = useState("")
  const [checkoutWardCode, setCheckoutWardCode] = useState("")

  // Load provinces json once
  useEffect(() => {
    import('@/data/provinces.json').then(data => setCheckoutProvinces(data.default))
  }, [])

  useEffect(() => {
    if (isChatOpen && user?.id && checkoutProvinces.length > 0) {
      api.get(`/users/${user.id}`).then(res => {
        const u = res.data
        setCheckoutName(u.name || "")
        setCheckoutPhone(u.phone || "")
        setCheckoutStreet(u.address || "")
        // Match saved province/district/ward names
        const savedProvince = checkoutProvinces.find(p => p.name === u.province)
        if (savedProvince) {
          setCheckoutProvinceCode(String(savedProvince.code))
          setCheckoutDistricts(savedProvince.districts || [])
          const savedDistrict = savedProvince.districts.find(d => d.name === u.district)
          if (savedDistrict) {
            setCheckoutDistrictCode(String(savedDistrict.code))
            setCheckoutWards(savedDistrict.wards || [])
            const savedWard = savedDistrict.wards.find(w => w.name === u.ward)
            if (savedWard) setCheckoutWardCode(String(savedWard.code))
          }
        }
      }).catch(err => {
        console.error("Error fetching user data for chatbot checkout:", err)
      })
    }
  }, [isChatOpen, user, checkoutProvinces])
  useEffect(() => {
    if (!userId) return

    const handleConnect = () => {
      setIsConnected(true)
      socket.emit("register", { userId })
    }

    const handleDisconnect = () => {
      setIsConnected(false)
    }

    const handleNewMessages = (msgs) => {
      setMessages(msgs)
      setIsTyping(false)
      // Scroll xuống tin nhắn mới nhất
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 80)
      // Nếu có tin nhắn bot xác nhận thêm giỏ → cập nhật cart ngay lập tức
      const lastMsg = msgs[msgs.length - 1]
      if (lastMsg?.sender === 'BOT' && lastMsg?.content?.includes('Đã thêm')) {
        fetchCart()
      }
    }

    const handleNewMessage = (msg) => {
      setMessages(prev => [...prev, msg])
      setIsTyping(false)
    }
    const sendMessage = (content) => {
      if (!socket || !content.trim()) return
      setIsTyping(true)

      socket.emit("sendMessage", { userId, content })

      // nếu sau 6s không có phản hồi thì tự tắt typing
      setTimeout(() => setIsTyping(false), 6000)
    }

    const handleAdminJoined = (data) => {
      setMessages(prev => [
        ...prev,
        {
          _id: Date.now().toString(),
          sender: "BOT",
          content: data.message,
          type: "TEXT",
          createdAt: new Date().toISOString(),
        }
      ])
    }

    const handleTyping = () => {
      setIsTyping(true)
    }
    socket.on("connect", handleConnect)
    socket.on("disconnect", handleDisconnect)
    socket.on("newMessages", handleNewMessages)
    socket.on("newMessage", handleNewMessage)
    socket.on("adminJoined", handleAdminJoined)
    socket.on("typing", handleTyping)

    return () => {
      socket.off("connect", handleConnect)
      socket.off("disconnect", handleDisconnect)
      socket.off("newMessages", handleNewMessages)
      socket.off("newMessage", handleNewMessage)
      socket.off("adminJoined", handleAdminJoined)
      socket.off("typing", handleTyping)
    }
  }, [userId])

  // Scroll to bottom whenever new messages arrive (only if already at bottom)
  useEffect(() => {
    const container = messagesContainerRef.current
    if (!container) return
    const isAtBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 80
    if (isAtBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, isTyping])

  // Khi mở chat → reset messages để load lại lịch sử từ server

  // Track scroll position to show/hide scroll-to-bottom button
  const handleScroll = useCallback(() => {
    const container = messagesContainerRef.current
    if (!container) return
    const distFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight
    setShowScrollBtn(distFromBottom > 100)
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    setShowScrollBtn(false)
  }

  // Load lịch sử chat khi mở chatbot
  useEffect(() => {
    if (!isChatOpen || !userId) return

    setMessages([]) // clear trước khi fetch mới

    api.get(`/api/chat/conversation/${userId}`)
      .then(res => {
        const conversationId = res.data?._id
        if (!conversationId) {
          setMessages([{
            _id: 'init',
            sender: 'BOT',
            content: 'Xin chào 👋 Tôi là trợ lý mua sắm AI. Tôi có thể giúp gì cho bạn?',
            type: 'TEXT',
            createdAt: new Date().toISOString()
          }])
          return null
        }
        return api.get(`/api/chat/messages/${conversationId}`)
      })
      .then(res => {
        if (!res) return
        const msgs = res.data
        if (Array.isArray(msgs) && msgs.length > 0) {
          setMessages(msgs)
          // Cuộn xuống tin nhắn mới nhất sau khi load xong
          setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'auto' })
          }, 80)
        } else {
          setMessages([{
            _id: 'init',
            sender: 'BOT',
            content: 'Xin chào 👋 Tôi là trợ lý mua sắm AI. Tôi có thể giúp gì cho bạn?',
            type: 'TEXT',
            createdAt: new Date().toISOString()
          }])
        }
      })
      .catch(() => {
        setMessages([{
          _id: 'init',
          sender: 'BOT',
          content: 'Xin chào 👋 Tôi là trợ lý mua sắm AI. Tôi có thể giúp gì cho bạn?',
          type: 'TEXT',
          createdAt: new Date().toISOString()
        }])
      })
  }, [isChatOpen, userId])

  const sendMessage = (content) => {
    if (!socket || !content.trim()) return
    setIsTyping(true)
    socket.emit("sendMessage", { userId, content })
    setInputMessage("")
    setMessages(prev => [
      ...prev,
      {
        _id: Date.now().toString(),
        sender: "USER",
        content,
        type: "TEXT",
        createdAt: new Date().toISOString(),
      }
    ])
  }

  const handleQuickReply = (reply) => {
    if (reply === 'Thanh toán ngay') {
      setMessages(prev => [
        ...prev,
        {
          _id: 'checkout_form_' + Date.now(),
          sender: 'BOT',
          type: 'CHECKOUT_FORM',
          content: 'Vui lòng xác nhận thông tin giao hàng bên dưới để tiến hành đặt hàng:',
          createdAt: new Date().toISOString()
        }
      ])
      return
    }
    if (reply === 'Xem giỏ hàng') {
      setIsChatOpen(false)
      navigate('/cart')
      return
    }
    if (reply === 'Xem đơn hàng') {
      setIsChatOpen(false)
      navigate('/orders', { state: { highlightOrderId: lastOrderId } })
      return
    }
    if (reply === 'Tiếp tục mua sắm') {
      setIsChatOpen(false)
      navigate('/')
      return
    }
    sendMessage(reply)
  }

  const handleCheckoutBankPayment = async (invoiceNumber, totalAmount) => {
    try {
      const res = await api.post("/sepay-webhook/create-payment", {
        invoiceNumber,
        amount: totalAmount,
        description: `Thanh toán đơn hàng ${invoiceNumber}`,
      })
      const { checkoutURL, formFields } = res.data
      const formEl = document.createElement("form")
      formEl.action = checkoutURL
      formEl.method = "POST"
      Object.keys(formFields).forEach(key => {
        const input = document.createElement("input")
        input.type = "hidden"
        input.name = key
        input.value = formFields[key]
        formEl.appendChild(input)
      })
      document.body.appendChild(formEl)
      formEl.submit()
    } catch (err) {
      toast.error("Tạo thanh toán thất bại")
    }
  }

  const renderMessage = (msg) => {
    if (msg.type === 'CHECKOUT_FORM') {
      const selectedProvince = checkoutProvinces.find(p => String(p.code) === checkoutProvinceCode)
      const selectedDistrict = checkoutDistricts.find(d => String(d.code) === checkoutDistrictCode)
      const selectedWard = checkoutWards.find(w => String(w.code) === checkoutWardCode)

      const paymentOptions = [
        { id: 'COD', label: 'COD – Tiền mặt', emoji: '💵', desc: 'Thanh toán khi nhận hàng' },
        { id: 'BANK', label: 'Chuyển khoản', emoji: '🏦', desc: 'Chuyển khoản ngân hàng' },
        { id: 'SEPAY', label: 'Ví Sepay', emoji: '💳', desc: 'Thanh toán nhanh qua Sepay' },
        { id: 'VNPAY', label: 'VNPAY', emoji: '🛡️', desc: 'Thanh toán an toàn VNPAY' },
      ]

      return (
        <div key={msg._id} className="flex justify-start mb-4 w-full" style={{ maxWidth: '96%' }}>
          <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-lg w-full text-gray-800">
            <div className="flex items-center gap-2 pb-3 mb-3 border-b border-gray-100">
              <span className="text-lg">🛒</span>
              <h4 className="font-bold text-sm text-gray-800">Xác nhận thông tin giao hàng</h4>
            </div>

            <div className="space-y-2.5">
              {/* Name */}
              <div>
                <label className="block text-[11px] font-bold text-gray-500 mb-1">Họ và tên <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={checkoutName}
                  onChange={e => setCheckoutName(e.target.value)}
                  placeholder="Nhập họ và tên"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-gray-200 focus:outline-none focus:border-pink-400 bg-gray-50"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-[11px] font-bold text-gray-500 mb-1">Số điện thoại <span className="text-red-500">*</span></label>
                <input
                  type="tel"
                  value={checkoutPhone}
                  onChange={e => setCheckoutPhone(e.target.value)}
                  placeholder="Nhập số điện thoại"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-gray-200 focus:outline-none focus:border-pink-400 bg-gray-50"
                />
              </div>

              {/* Province / District / Ward */}
              <div className="grid grid-cols-3 gap-1.5">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 mb-1">Tỉnh/Thành <span className="text-red-500">*</span></label>
                  <select
                    value={checkoutProvinceCode}
                    onChange={e => {
                      const code = e.target.value
                      const prov = checkoutProvinces.find(p => String(p.code) === code)
                      setCheckoutProvinceCode(code)
                      setCheckoutDistricts(prov?.districts || [])
                      setCheckoutDistrictCode("")
                      setCheckoutWards([])
                      setCheckoutWardCode("")
                    }}
                    className="w-full px-2 py-1.5 text-[10px] rounded-lg border border-gray-200 bg-gray-50 focus:outline-none focus:border-pink-400"
                  >
                    <option value="">Chọn tỉnh</option>
                    {checkoutProvinces.map(p => <option key={p.code} value={String(p.code)}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 mb-1">Quận/Huyện <span className="text-red-500">*</span></label>
                  <select
                    value={checkoutDistrictCode}
                    disabled={!checkoutProvinceCode}
                    onChange={e => {
                      const code = e.target.value
                      const dist = checkoutDistricts.find(d => String(d.code) === code)
                      setCheckoutDistrictCode(code)
                      setCheckoutWards(dist?.wards || [])
                      setCheckoutWardCode("")
                    }}
                    className="w-full px-2 py-1.5 text-[10px] rounded-lg border border-gray-200 bg-gray-50 focus:outline-none focus:border-pink-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">Chọn huyện</option>
                    {checkoutDistricts.map(d => <option key={d.code} value={String(d.code)}>{d.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 mb-1">Phường/Xã <span className="text-red-500">*</span></label>
                  <select
                    value={checkoutWardCode}
                    disabled={!checkoutDistrictCode}
                    onChange={e => setCheckoutWardCode(e.target.value)}
                    className="w-full px-2 py-1.5 text-[10px] rounded-lg border border-gray-200 bg-gray-50 focus:outline-none focus:border-pink-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">Chọn xã</option>
                    {checkoutWards.map(w => <option key={w.code} value={String(w.code)}>{w.name}</option>)}
                  </select>
                </div>
              </div>

              {/* Street */}
              <div>
                <label className="block text-[11px] font-bold text-gray-500 mb-1">Số nhà, tên đường <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={checkoutStreet}
                  onChange={e => setCheckoutStreet(e.target.value)}
                  placeholder="Số nhà, tên đường, thôn xóm..."
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-gray-200 focus:outline-none focus:border-pink-400 bg-gray-50"
                />
              </div>

              {/* Payment */}
              <div>
                <label className="block text-[11px] font-bold text-gray-500 mb-1.5">Phương thức thanh toán <span className="text-red-500">*</span></label>
                <div className="grid grid-cols-2 gap-1.5">
                  {paymentOptions.map(opt => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setCheckoutPayment(opt.id)}
                      className={`flex items-start gap-2 p-2 text-left rounded-lg border transition-all ${
                        checkoutPayment === opt.id
                          ? 'bg-pink-50 border-pink-400 text-pink-700 shadow-sm'
                          : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <span className="text-sm mt-0.5">{opt.emoji}</span>
                      <div>
                        <div className="text-[10px] font-bold leading-tight">{opt.label}</div>
                        <div className="text-[9px] text-gray-400 mt-0.5">{opt.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Voucher */}
              <div>
                <label className="block text-[11px] font-bold text-gray-500 mb-1">Mã giảm giá (nếu có)</label>
                <input
                  type="text"
                  value={checkoutVoucher}
                  onChange={e => setCheckoutVoucher(e.target.value.toUpperCase())}
                  placeholder="Nhập mã voucher"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-gray-200 focus:outline-none focus:border-pink-400 bg-gray-50 tracking-widest"
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setMessages(prev => prev.filter(m => m._id !== msg._id))}
                className="w-1/3 py-2 text-xs font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={isSubmittingOrder}
                onClick={async () => {
                  if (!checkoutName.trim() || !checkoutPhone.trim() || !checkoutStreet.trim() || !checkoutProvinceCode || !checkoutDistrictCode || !checkoutWardCode) {
                    toast.warning('Vui lòng điền đầy đủ Họ tên, SĐT, Tỉnh/Quận/Phường và Số nhà!')
                    return
                  }
                  setIsSubmittingOrder(true)
                  try {
                    const wardName = selectedWard?.name || ''
                    const districtName = selectedDistrict?.name || ''
                    const provinceName = selectedProvince?.name || ''
                    const fullAddress = [checkoutStreet.trim(), wardName, districtName, provinceName].filter(Boolean).join(', ')

                    const res = await api.post('/orders', {
                      address: fullAddress,
                      paymentMethod: checkoutPayment,
                      voucherCode: checkoutVoucher.trim() || undefined,
                      shippingMethod: 'NHANH',
                      shippingInfo: { name: checkoutName.trim(), phone: checkoutPhone.trim(), address: fullAddress },
                    })
                    const order = res.data
                    setLastOrderId(order._id)
                    setMessages(prev => prev.filter(m => m._id !== msg._id))

                     if (checkoutPayment === 'SEPAY') {
                      await handleCheckoutBankPayment(order._id, order.total)
                      setCart({ items: [], subtotal: 0, discount: 0, total: 0, voucherCode: null })
                    } else if (checkoutPayment === 'VNPAY') {
                      const vnpayRes = await api.post('/vnpay/create-payment', { orderId: order._id, amount: order.total })
                      if (vnpayRes.data?.url) {
                        setIsChatOpen(false)
                        window.location.href = vnpayRes.data.url
                        return
                      }
                      setCart({ items: [], subtotal: 0, discount: 0, total: 0, voucherCode: null })
                    } else if (checkoutPayment === 'BANK') {
                      setCheckoutOrderData(order)
                      setCheckoutShowBank(true)
                    }

                    // Notify chatbot with success message
                    const successMsg = `Đặt hàng thành công: Mã đơn hàng: ${order.code || order._id} | Tên: ${checkoutName.trim()} | SĐT: ${checkoutPhone.trim()} | Địa chỉ: ${fullAddress} | Thanh toán: ${checkoutPayment}`
                    sendMessage(successMsg)
                    setCart({ items: [], subtotal: 0, discount: 0, total: 0, voucherCode: null })
                  } catch (err) {
                    toast.error(err?.response?.data?.message || 'Đặt hàng thất bại!')
                  } finally {
                    setIsSubmittingOrder(false)
                  }
                }}
                className="w-2/3 py-2 px-3 text-xs font-bold text-white bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-lg transition-all shadow-sm flex items-center justify-center gap-1"
              >
                {isSubmittingOrder ? 'Đang xử lý...' : '✅ Xác nhận đặt hàng'}
              </button>
            </div>
          </div>
        </div>
      )
    }

    const isUser = msg.sender === "USER"
    const isAdmin = msg.sender === "ADMIN"
    const isBot = msg.sender === "BOT"

    return (
      <div key={msg._id} className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
        <div className={`${msg.type === "PRODUCT" ? 'max-w-[90%] w-full' : 'max-w-[70%]'} rounded-2xl px-4 py-2 ${isUser ? 'bg-blue-500 text-white' : isAdmin ? 'bg-green-100 text-gray-800 border border-green-300' : 'bg-gray-100 text-gray-800'
          }`}>
          {!isUser && isAdmin && <div className="text-xs font-semibold mb-1 text-green-700">👤 Nhân viên hỗ trợ</div>}
          {!isUser && isBot && <div className="text-xs font-semibold mb-1 text-gray-700">🤖 Bot</div>}

          <div className="text-sm whitespace-pre-wrap">{msg.content}</div>

          {/* Render sản phẩm nếu có */}
          {msg.type === "PRODUCT" && msg.metadata?.products && (
            <div className="mt-2.5 flex flex-col gap-2">
              {msg.metadata.products.map((p) => {
                const hasDiscount = p.originalPrice && p.originalPrice > p.sellingPrice;
                const discountPercent = hasDiscount
                  ? Math.round(((p.originalPrice - p.sellingPrice) / p.originalPrice) * 100)
                  : 0;
                const isConfiguring = activeConfig && activeConfig.messageId === msg._id && activeConfig.productId === p._id;
                const colors = p.variations ? [...new Set(p.variations.map(v => v.color))].filter(Boolean) : [];

                return (
                  <div key={p._id} className="bg-white border border-gray-100 rounded-xl p-2.5 shadow-sm hover:shadow transition-shadow flex flex-col gap-2 relative overflow-hidden text-gray-800">
                    <div className="flex gap-3">
                    {/* Thumbnail Image */}
                    <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-50 border border-gray-100">
                      <img 
                        src={p.mainImage || 'https://via.placeholder.com/150'} 
                        alt={p.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div>
                        {/* Rating */}
                        {p.ratingAverage > 0 && (
                          <div className="flex items-center gap-0.5 text-[10px] text-amber-500 font-semibold mb-0.5">
                            <span>⭐</span>
                            <span>{p.ratingAverage.toFixed(1)}</span>
                            <span className="text-gray-400">({p.reviewCount || 0})</span>
                          </div>
                        )}

                        {/* Title */}
                        <Link 
                          to={`/product/${p._id}`}
                          className="font-bold text-gray-800 text-xs hover:text-blue-600 transition-colors line-clamp-1 block leading-tight"
                          onClick={() => setIsChatOpen(false)}
                        >
                          {p.name}
                        </Link>

                        {/* Short Description */}
                        {p.shortDescription && (
                          <p className="text-[10px] text-gray-500 line-clamp-1 mt-0.5">
                            {p.shortDescription}
                          </p>
                        )}
                      </div>

                      {/* Pricing & Discount */}
                      <div className="mt-1 flex items-baseline gap-1 flex-wrap">
                        <span className="text-xs font-black text-pink-600">
                          {p.sellingPrice.toLocaleString('vi-VN')}đ
                        </span>
                        {discountPercent > 0 && (
                          <>
                            <span className="text-[9px] text-gray-400 line-through">
                              {p.originalPrice.toLocaleString('vi-VN')}đ
                            </span>
                            <span className="text-[8px] bg-red-50 text-red-500 px-1 py-0.5 rounded font-bold">
                              -{discountPercent}%
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Actions Panel */}
                    <div className="flex flex-col gap-1 justify-center flex-shrink-0">
                      <Link 
                        to={`/product/${p._id}`}
                        className="px-2 py-1 bg-gray-50 hover:bg-gray-100 text-gray-700 text-[10px] font-bold rounded-md border border-gray-200 transition-colors text-center"
                        onClick={() => setIsChatOpen(false)}
                      >
                        Chi tiết
                      </Link>
                      <button
                        className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold rounded-md shadow-sm hover:shadow transition-colors"
                        onClick={() => {
                          const colors = p.variations ? [...new Set(p.variations.map(v => v.color))].filter(Boolean) : [];
                          if (p.variations && p.variations.length > 0) {
                            const defaultColor = colors[0] || '';
                            const defaultSize = p.variations.find(v => v.color === defaultColor && v.stock > 0)?.size || p.variations[0]?.size || '';
                            setActiveConfig({
                              messageId: msg._id,
                              productId: p._id,
                              color: defaultColor,
                              size: defaultSize,
                              quantity: 1
                            });
                          } else {
                            sendMessage(`Tôi muốn mua ${p.name}`);
                          }
                        }}
                      >
                        + Giỏ
                      </button>
                    </div>
                    </div>

                    {/* Inline selector for color, size and quantity */}
                    {isConfiguring && (
                      <div className="mt-1 pt-2 border-t border-gray-100 text-[11px] flex flex-col gap-2 bg-gray-50/50 p-2 rounded-lg">
                        {colors.length > 0 && (
                          <div>
                            <span className="text-gray-500 block mb-1 font-semibold">Màu sắc:</span>
                            <div className="flex flex-wrap gap-1">
                              {colors.map((c) => (
                                <button
                                  key={c}
                                  onClick={() => {
                                    const firstAvailableVar = p.variations.find(v => v.color === c && v.stock > 0) || p.variations.find(v => v.color === c);
                                    setActiveConfig(prev => ({
                                      ...prev,
                                      color: c,
                                      size: firstAvailableVar ? firstAvailableVar.size : '',
                                      quantity: 1
                                    }));
                                  }}
                                  className={`px-2 py-1 rounded border text-[10px] font-medium transition-all ${
                                    activeConfig.color === c
                                      ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                                  }`}
                                >
                                  {c}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        <div>
                          <span className="text-gray-500 block mb-1 font-semibold">Chọn kích cỡ:</span>
                          <div className="flex flex-wrap gap-1">
                            {p.variations
                              ?.filter(v => v.color === activeConfig.color)
                              ?.map((v) => {
                                const isOutOfStock = v.stock <= 0;
                                const isSelected = activeConfig.size === v.size;
                                return (
                                  <button
                                    key={v.size}
                                    disabled={isOutOfStock}
                                    onClick={() => {
                                      setActiveConfig(prev => ({
                                        ...prev,
                                        size: v.size,
                                        quantity: 1
                                      }));
                                    }}
                                    className={`px-2 py-0.5 rounded border text-[9px] transition-all flex flex-col items-center min-w-[40px] ${
                                      isSelected
                                        ? 'bg-blue-600 border-blue-600 text-white font-bold'
                                        : isOutOfStock
                                        ? 'bg-gray-100 border-gray-150 text-gray-300 cursor-not-allowed line-through'
                                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                                    }`}
                                  >
                                    <span>{v.size}</span>
                                    <span className={`text-[8px] ${isSelected ? 'text-blue-100' : 'text-gray-400'}`}>
                                      (Còn {v.stock})
                                    </span>
                                  </button>
                                );
                              })}
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-1 pt-1.5 border-t border-gray-100">
                          <div className="flex items-center gap-1.5">
                            <span className="text-gray-500 font-semibold">Số lượng:</span>
                            <div className="flex items-center border border-gray-200 bg-white rounded-md overflow-hidden">
                              <button
                                onClick={() => {
                                  setActiveConfig(prev => ({
                                    ...prev,
                                    quantity: Math.max(1, prev.quantity - 1)
                                  }));
                                }}
                                className="px-2 py-0.5 hover:bg-gray-100 font-bold border-r border-gray-200 text-[10px]"
                              >
                                -
                              </button>
                              <span className="px-2.5 font-bold text-gray-800 text-[10px]">{activeConfig.quantity}</span>
                              <button
                                onClick={() => {
                                  const selectedVar = p.variations.find(v => v.color === activeConfig.color && v.size === activeConfig.size);
                                  const maxStock = selectedVar ? selectedVar.stock : 1;
                                  setActiveConfig(prev => ({
                                    ...prev,
                                    quantity: Math.min(maxStock, prev.quantity + 1)
                                  }));
                                }}
                                className="px-2 py-0.5 hover:bg-gray-100 font-bold border-l border-gray-200 text-[10px]"
                              >
                                +
                              </button>
                            </div>
                          </div>

                          <div className="flex gap-1">
                            <button
                              onClick={() => setActiveConfig(null)}
                              className="px-2.5 py-1 text-gray-500 bg-gray-150 hover:bg-gray-200 rounded-md text-[10px] font-medium"
                            >
                              Hủy
                            </button>
                            <button
                              onClick={() => {
                                const selectedVar = p.variations.find(v => v.color === activeConfig.color && v.size === activeConfig.size);
                                if (!selectedVar || selectedVar.stock <= 0) {
                                  alert('Sản phẩm đã hết hàng hoặc không có phân loại này!');
                                  return;
                                }
                                sendMessage(`Thêm sản phẩm ${p.name} màu ${activeConfig.color} size ${activeConfig.size} số lượng ${activeConfig.quantity} vào giỏ`);
                                setActiveConfig(null);
                              }}
                              className="px-3 py-1 text-white bg-blue-600 hover:bg-blue-700 rounded-md text-[10px] font-bold shadow-sm"
                            >
                              Thêm
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Quick replies */}
          {msg.metadata?.quickReplies?.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {msg.metadata.quickReplies.map((reply, idx) => (
                <button key={idx} onClick={() => handleQuickReply(reply)} className="px-3 py-1 bg-white text-blue-600 rounded-full text-xs font-medium hover:bg-blue-50 transition-colors border border-blue-200">{reply}</button>
              ))}
            </div>
          )}

          <div className="text-xs mt-1 opacity-70">
            {new Date(msg.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Chat Trigger Button */}
      <button
        onClick={() => setIsChatOpen(!isChatOpen)}
        className="fixed bottom-20 right-6 z-50 group"
        aria-label="Open AI chat"
      >
        <div className={`relative w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl transition-all duration-300 ${
          isChatOpen
            ? 'bg-gray-700 rotate-0 scale-95'
            : 'bg-gradient-to-br from-violet-600 to-indigo-600 hover:scale-110 hover:shadow-violet-400/40'
        }`}>
          {/* Pulse ring when closed */}
          {!isChatOpen && (
            <span className="absolute inset-0 rounded-2xl bg-violet-500 opacity-30 animate-ping" />
          )}
          {isChatOpen ? (
            <X className="w-5 h-5 text-white" />
          ) : (
            <MessageCircle className="w-6 h-6 text-white" />
          )}
        </div>
      </button>

      {/* Chat Window */}
      {isChatOpen && (
        <div className="fixed bottom-36 right-6 w-[380px] h-[540px] bg-white rounded-3xl shadow-2xl z-50 flex flex-col overflow-hidden border border-gray-100" style={{boxShadow: '0 25px 60px -10px rgba(109,40,217,0.25), 0 10px 30px -5px rgba(0,0,0,0.15)'}}>
          {/* Header */}
          <div className="bg-gradient-to-r from-violet-700 via-indigo-700 to-indigo-800 text-white px-5 py-4 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              {/* AI Avatar with online ring */}
              <div className="relative">
                <div className="w-10 h-10 bg-white/15 backdrop-blur rounded-xl flex items-center justify-center border border-white/20">
                  <Cpu className="w-5 h-5 text-white" />
                </div>
                {user && isConnected && (
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-indigo-800" />
                )}
              </div>
              <div>
                <h3 className="font-bold text-sm tracking-wide">Trợ lý Mua sắm AI</h3>
                <p className="text-[11px] text-white/70 mt-0.5">
                  {user ? (isConnected ? '● Sẵn sàng tư vấn' : '○ Đang kết nối...') : 'Yêu cầu đăng nhập'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsChatOpen(false)}
              className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {user ? (
            <div className="relative flex-1 flex flex-col overflow-hidden">
              {/* Messages */}
              <div
                ref={messagesContainerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto p-4 bg-gray-50"
              >
              {messages.length === 0 && !isTyping && (
                  <div className="flex flex-col items-center justify-center h-full text-center px-6 py-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-violet-100 to-indigo-100 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
                      <MessageCircle className="w-8 h-8 text-violet-600" />
                    </div>
                    <p className="font-bold text-gray-800 text-sm">Trợ lý Mua sắm AI</p>
                    <p className="text-gray-500 text-xs mt-1 leading-relaxed">Hỏi tôi về sản phẩm, tư vấn size,<br/>hoặc thêm vào giỏ hàng trực tiếp!</p>
                  </div>
                )}
                {messages.map(renderMessage)}

                {/* Typing indicator */}
                {isTyping && (
                  <div className="flex justify-start mb-3">
                    <div className="flex items-end gap-2">
                      <div className="w-7 h-7 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex-shrink-0 flex items-center justify-center">
                        <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
                      </div>
                      <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                        <div className="flex space-x-1.5">
                          <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                          <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Scroll to bottom button */}
              {showScrollBtn && (
                <button
                  onClick={scrollToBottom}
                  className="absolute bottom-20 right-4 w-9 h-9 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center transition-all z-10 animate-bounce"
                  title="Xem tin nhắn mới nhất"
                >
                  <ArrowDown className="w-5 h-5" />
                </button>
              )}

              {/* Input */}
              <div className="px-4 py-3 bg-white border-t border-gray-100 flex-shrink-0">
                <form onSubmit={e => { e.preventDefault(); sendMessage(inputMessage) }} className="flex items-center gap-2 bg-gray-50 rounded-2xl px-4 py-2 border border-gray-200 focus-within:border-violet-400 focus-within:ring-2 focus-within:ring-violet-100 transition-all">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={e => setInputMessage(e.target.value)}
                    placeholder="Nhắn tin với AI..."
                    className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none py-1"
                    disabled={!isConnected}
                  />
                  <button
                    type="submit"
                    disabled={!isConnected || !inputMessage.trim()}
                    className="w-8 h-8 flex-shrink-0 bg-gradient-to-br from-violet-600 to-indigo-600 text-white rounded-xl flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
                <p className="text-center text-[10px] text-gray-400 mt-2">AI có thể mắc lỗi. Kiểm tra thông tin trước khi mua.</p>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gray-50 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-violet-100 to-indigo-100 rounded-2xl flex items-center justify-center mb-4">
                <Lock className="w-8 h-8 text-violet-500" />
              </div>
              <h4 className="font-bold text-gray-900 mb-1">Đăng nhập để trò chuyện</h4>
              <p className="text-xs text-gray-500 mb-5 leading-relaxed">Bạn cần đăng nhập để sử dụng<br/>trợ lý mua sắm AI thông minh</p>
              <a href="/login" className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl font-semibold hover:opacity-90 transition-opacity shadow-md text-sm">Đăng nhập ngay</a>
            </div>
          )}
        </div>
      )}

      {checkoutShowBank && (
        <BankPaymentModal
          order={checkoutOrderData}
          onClose={() => {
            setCheckoutShowBank(false)
            fetchCart()
            navigate('/orders')
          }}
          selectedBank={checkoutSelectedBank}
          setSelectedBank={setCheckoutSelectedBank}
        />
      )}
    </>
  )
}

export default ChatBot
