import React, { useEffect, useState } from "react"
import { toast } from "react-toastify"
import apiAdmin from "@/service/apiAdmin"
import { QRCodeCanvas } from "qrcode.react"
import io from "socket.io-client"

const socket = io("http://localhost:4000") // Thay đổi URL nếu cần

const BankPaymentModal = ({ order, onClose, selectedBank, setSelectedBank }) => {
  const [banks, setBanks] = useState([])
  const [loading, setLoading] = useState(false)
  const [isPaid, setIsPaid] = useState(false)

  useEffect(() => {
    const fetchBanks = async () => {
      try {
        const response = await apiAdmin.get("bank")
        const activeBanks = response.data.filter(b => b.status === true)
        setBanks(activeBanks)
      } catch (err) {
        toast.error("Không tải được danh sách ngân hàng")
      }
    }
    fetchBanks()
  }, [])

  // Lắng nghe socket khi thanh toán thành công
  useEffect(() => {
    socket.on("user_payment_success", (data) => {
      if (data.order._id === order._id) {
        setIsPaid(true)
        toast.success("Thanh toán thành công 🎉")
        setTimeout(() => window.location.href = "/orders", 2000)
      }
    })
    return () => socket.off("user_payment_success")
  }, [order])

  const defaultAccount = {
    name: "Nguyễn Hồng Giang",
    number: "0343887327",
  }
  const data =<img src='https://img.vietqr.io/image/vietinbank-113366668888-compact.jpg'/>
    const info = `don+hang+${order._id}`
  const qrData = `https://img.vietqr.io/image/cake-0343887327-compact2.jpg?addInfo=${info}&amount=${order.total}`
 console.log(qrData);
 
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-[500px] relative">
        <h2 className="text-xl font-bold mb-3">Thanh toán qua ngân hàng</h2>

        <button onClick={onClose} className="absolute top-3 right-3 text-gray-500 hover:text-black">✕</button>

        {/* Danh sách ngân hàng */}
        <div className="space-y-2 max-h-[200px] overflow-y-auto mb-4">
          {banks.map(bank => (
            <div
              key={bank._id}
              onClick={() => setSelectedBank(bank)}
              className={`p-3 border rounded-lg cursor-pointer ${selectedBank?._id === bank._id ? "border-pink-500 bg-pink-50" : "hover:bg-gray-100"}`}
            >
              <div className="font-semibold">{bank.name}</div>
              <div className="text-sm text-gray-600">{bank.app}</div>
            </div>
          ))}
        </div>

        {/* QR code */}
        {selectedBank && (
          <div className="flex flex-col items-center">
            <QRCodeCanvas  de value={qrData} size={180} />
            <p className="mt-2 text-sm text-gray-600">
              <b>Chủ TK:</b> {defaultAccount.name} <br />
              <b>STK:</b> {defaultAccount.number} <br />
              <b>Nội dung:</b> don hang {order._id}
            </p>

            {!isPaid ? (
              <div className="mt-4 flex items-center space-x-2 text-gray-700">
                <span>Đang chờ thanh toán...</span>
                <div className="w-5 h-5 border-2 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <p className="mt-3 text-green-600 font-semibold">✅ Thanh toán thành công</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default BankPaymentModal
