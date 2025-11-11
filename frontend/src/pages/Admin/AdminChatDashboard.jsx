import React, { useState, useEffect, useRef } from "react"
import { socket } from "../../service/socket"
import apiAdmin from "../../service/apiAdmin"

const AdminChatDashboard = ({ adminId }) => {
  const [conversations, setConversations] = useState([])
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState("")
  const [isConnected, setIsConnected] = useState(false)
  const messagesEndRef = useRef(null)

  // Fetch danh sách cuộc trò chuyện
  const fetchConversations = async () => {
    try {
      const response = await apiAdmin.get("/api/chat/conversations")
      setConversations(response.data.conversations || [])
    } catch (error) {
      console.error("❌ Lỗi khi lấy danh sách cuộc hội thoại:", error)
    }
  }

  // Setup socket admin
  useEffect(() => {
    if (!socket) return

    const handleConnect = () => {
      setIsConnected(true)
      socket.emit("adminRegister", { adminId })
    }

    const handleDisconnect = () => setIsConnected(false)
    const handleNotification = fetchConversations
    const handleMessageUpdate = (data) => {
      // ✅ Cập nhật tin nhắn cho cuộc hội thoại đang mở
      if (data.conversationId === selectedConversation) {
        setMessages(prev => [...prev, data.message])
      }
      // Đồng thời cập nhật lại danh sách cuộc hội thoại để phản ánh tin nhắn mới
      fetchConversations();
    }

    // ✅ Người dùng gửi tin nhắn (dù bot hay admin trả lời), admin dashboard cần nhận
    const handleNewMessages = (msgs) => {
      // Sự kiện này đến từ user, có thể bỏ qua vì ta đã dùng messageUpdate cho admin
    }


    socket.on("connect", handleConnect)
    socket.on("disconnect", handleDisconnect)
    socket.on("adminNotification", handleNotification)
    socket.on("messageUpdate", handleMessageUpdate)

    return () => {
      socket.off("connect", handleConnect)
      socket.off("disconnect", handleDisconnect)
      socket.off("adminNotification", handleNotification)
      socket.off("messageUpdate", handleMessageUpdate)
    }
  }, [adminId, selectedConversation])

  // Refresh conversation mỗi 30 giây
  useEffect(() => {
    fetchConversations()
    const interval = setInterval(fetchConversations, 30000)
    return () => clearInterval(interval)
  }, [])

  // Khi chọn conversation
  useEffect(() => {
    if (!socket) return
    if (!selectedConversation) return setMessages([])

    // ✅ Yêu cầu lịch sử tin nhắn khi chọn conversation
    socket.emit("getMessages", { conversationId: selectedConversation })

    const handleHistory = (msgs) => setMessages(msgs)
    socket.on("messagesHistory", handleHistory)

    return () => {
      socket.off("messagesHistory", handleHistory)
    }
  }, [selectedConversation])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleTakeover = (conversationId) => {
    if (socket) {
      socket.emit("adminTakeover", { conversationId, adminId })
      socket.on("takeoverSuccess", fetchConversations)
    }
  }

  const sendMessage = () => {
    if (!socket || !inputMessage.trim() || !selectedConversation) return
    const conversation = conversations.find(c => c._id === selectedConversation)
    if (!conversation) return

    socket.emit("adminSendMessage", {
      conversationId: selectedConversation,
      adminId,
      content: inputMessage,
      userId: conversation.user._id,
    })

    // ❌ XÓA logic TỰ thêm tin nhắn vào state ở đây.
    // Tin nhắn sẽ được thêm vào thông qua sự kiện 'messageUpdate' từ server.

    setInputMessage("")
  }

  const renderMessage = (msg) => {
    const isAdmin = msg.sender === "ADMIN"
    const isBot = msg.sender === "BOT"
    const isUser = msg.sender === "USER"

    return (
      <div key={msg._id} className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
        <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${isUser
            ? "bg-blue-500 text-white"
            : isAdmin
              ? "bg-green-100 text-gray-800 border border-green-300"
              : "bg-gray-100 text-gray-800"
          }`}>
          {!isUser && <div className="text-xs font-semibold mb-1">{isBot ? "🤖 Bot" : "👤 Admin"}</div>}

          {msg.type === "TEXT" && <div className="text-sm whitespace-pre-wrap">{msg.content}</div>}

          {/* ... (Phần render PRODUCT, PAYMENT, quickReplies, v.v. cần được hoàn thiện dựa trên MessageType) */}

          <div className="text-xs mt-1 opacity-70">
            {new Date(msg.createdAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
          </div>
        </div>
      </div>
    )
  }

  const selectedConv = conversations.find(c => c._id === selectedConversation)

  return (
    <div style={{ backgroundColor: "var(--bg-color)", color: "var(--text-color)" }} className="min-h-screen  p-5 font-sans ">

      <div className="flex h-screen ">
        {/* Sidebar */}
        <div className="w-80  border-r flex flex-col">
          <div className="p-4 border-b bg-blue-600 text-white">
            <h2 className="text-xl font-bold">Quản lý Chat</h2>
            <p className="text-sm opacity-90">{isConnected ? "● Đang hoạt động" : "○ Đang kết nối..."}</p>
          </div>

          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="p-4 text-center text-gray-500">Chưa có cuộc hội thoại nào</div>
            ) : conversations.map(conv => (
              <div
                key={conv._id}
                onClick={() => setSelectedConversation(conv._id)}
                className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${selectedConversation === conv._id ? " border-l-4 border-blue-500" : ""}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold ">{conv?.user?.name}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full ${conv.mode === "ADMIN" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                    {conv.mode === "ADMIN" ? "👤 Admin" : "🤖 Bot"}
                  </span>
                </div>
                <p className="text-sm  truncate">{conv?.user?.email}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className={`text-xs px-2 py-0.5 rounded ${conv.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                    {conv.status}
                  </span>
                  <span className="text-xs text-gray-500">{new Date(conv.lastMessageAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}</span>
                </div>
                {conv.assignedAdmin && <p className="text-xs text-blue-600 mt-1">Được xử lý bởi: {conv.assignedAdmin.name}</p>}
              </div>
            ))}
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 flex flex-col">
          {selectedConv ? (
            <>
              <div className=" p-4 border-b flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold ">{selectedConv?.user?.name}</h2>
                  <p className="text-sm ">{selectedConv?.user?.email}</p>
                </div>
                {selectedConv?.mode === "BOT" && (
                  <button onClick={() => handleTakeover(selectedConv?._id)} className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
                    Can thiệp
                  </button>
                )}
              </div>

              <div className="flex-1 overflow-y-auto p-4 ">
                {messages.map(renderMessage)}
                <div ref={messagesEndRef} />
              </div>

              {selectedConv.mode === "ADMIN" && (
                <div className="p-4  border-t">
                  <form onSubmit={e => { e.preventDefault(); sendMessage() }} className="flex space-x-2">
                    <input type="text" value={inputMessage} onChange={e => setInputMessage(e.target.value)} placeholder="Nhập tin nhắn..." className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    <button type="submit" disabled={!inputMessage.trim()} className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50">Gửi</button>
                  </form>
                </div>
              )}
              {selectedConv.mode === "BOT" && (
                <div className="p-4 bg-gray-200 text-center text-sm font-medium">
                  🤖 Cuộc trò chuyện đang được xử lý bởi Bot. Bạn có thể can thiệp nếu cần.
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center text-gray-500">
                <div className="text-6xl mb-4">💬</div>
                <p className="text-xl">Chọn một cuộc hội thoại để bắt đầu</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminChatDashboard
