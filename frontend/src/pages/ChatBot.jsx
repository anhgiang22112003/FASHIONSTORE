import { AuthContext } from '@/context/Authcontext'
import { socket } from '@/service/socket'
import React, { useState, useEffect, useRef, useContext } from 'react'
import { Link } from 'react-router-dom'

const ChatBot = ({ userId }) => {
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState("")
  const [isConnected, setIsConnected] = useState(socket.connected)
  const [isTyping, setIsTyping] = useState(false)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const messagesEndRef = useRef(null)
  const { user } = useContext(AuthContext)
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
    socket.on("sendMessage", sendMessage)
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
      socket.off("sendMessage", sendMessage)
    }
  }, [userId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isTyping])

  useEffect(() => {
    if (isChatOpen && messages.length === 0) {
      setMessages([{
        _id: 'init',
        sender: 'BOT',
        content: 'Xin chào 👋 Tôi là trợ lý mua sắm AI. Tôi có thể giúp gì cho bạn?',
        type: 'TEXT',
        createdAt: new Date().toISOString()
      }])
    }
  }, [isChatOpen])

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

  const handleQuickReply = (reply) => sendMessage(reply)

  const renderMessage = (msg) => {
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

                return (
                  <div key={p._id} className="bg-white border border-gray-100 rounded-xl p-2.5 shadow-sm hover:shadow transition-shadow flex gap-3 relative overflow-hidden text-gray-800">
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
                        onClick={() => sendMessage(`Thêm sản phẩm ${p._id} vào giỏ`)}
                      >
                        + Giỏ
                      </button>
                    </div>
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
      {/* Chat Button */}
      <button onClick={() => setIsChatOpen(!isChatOpen)} className="fixed bottom-20 right-6 w-16 h-16 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-all z-50 flex items-center justify-center">
        {isChatOpen ? '✖' : '💬'}
      </button>

      {/* Chat Window */}
      {isChatOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[500px] bg-white rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mr-3">🤖</div>
              <div>
                <h3 className="font-semibold">Trợ lý AI</h3>
                <p className="text-xs opacity-90">{user ? (isConnected ? '● Đang hoạt động' : '○ Đang kết nối...') : 'Yêu cầu đăng nhập'}</p>
              </div>
            </div>
            <button onClick={() => setIsChatOpen(false)} className="hover:bg-white/20 p-1 rounded-lg transition-colors">✖</button>
          </div>

          {user ? (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                {messages.length === 0 && !isTyping && (
                  <div className="text-center text-gray-500 mt-10">
                    <div className="text-5xl mb-4">💬</div>
                    <p>Chào mừng bạn đến với trợ lý mua sắm AI!</p>
                    <p className="text-sm mt-2">Hãy bắt đầu trò chuyện...</p>
                  </div>
                )}
                {messages.map(renderMessage)}

                {/* Typing indicator */}
                {isTyping && (
                  <div className="flex justify-start mb-4">
                    <div className="bg-gray-100 rounded-2xl px-4 py-3">
                      <div className="flex space-x-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 bg-white border-t">
                <form onSubmit={e => { e.preventDefault(); sendMessage(inputMessage) }} className="flex space-x-2">
                  <input type="text" value={inputMessage} onChange={e => setInputMessage(e.target.value)} placeholder="Nhập tin nhắn..." className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500" disabled={!isConnected} />
                  <button type="submit" disabled={!isConnected || !inputMessage.trim()} className="bg-blue-500 text-white px-6 py-2 rounded-full hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">Gửi</button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-6 bg-gray-50 text-center">
              <div className="text-5xl mb-4">🔒</div>
              <h4 className="font-bold text-gray-800 mb-2">Đăng nhập để trò chuyện</h4>
              <p className="text-sm text-gray-600 mb-6 font-medium">Bạn cần đăng nhập tài khoản để sử dụng trợ lý mua sắm AI thông minh.</p>
              <a href="/login" className="px-6 py-2.5 bg-blue-500 text-white rounded-full font-semibold hover:bg-blue-600 transition-colors shadow-md text-sm">Đăng nhập ngay</a>
            </div>
          )}
        </div>
      )}
    </>
  )
}

export default ChatBot
