import React, { useEffect, useState } from "react"
import axios from "axios"
import dayjs from "dayjs"
import duration from "dayjs/plugin/duration"
import { toast } from "react-toastify"
import apiUser from "@/service/api"
import { io } from 'socket.io-client'
import confetti from 'canvas-confetti'

dayjs.extend(duration)

const FlashSaleBanner = () => {
  const [sale, setSale] = useState(null)
  const [timeLeft, setTimeLeft] = useState("00:00:00")
  const [isActive, setIsActive] = useState(false)

  useEffect(() => {
    fetchSale()
    const interval = setInterval(fetchSale, 30_000) // refresh mỗi 30s
    return () => clearInterval(interval)
  }, [])

  const fetchSale = async () => {
    const res = await apiUser.get("/flash-sales/active")
    console.log(res);
    
    if (res.data) {
      setSale(res.data)
      updateCountdown(res.data)
    }
  }
 console.log(sale);
 
  const updateCountdown = (saleData) => {
    const now = new Date().getTime()
    const start = new Date(saleData.startTime).getTime()
    const end = new Date(saleData.endTime).getTime()

    if (now < start) {
      setIsActive(false)
      startCountdown(start - now)
    } else if (now >= start && now <= end) {
      setIsActive(true)
      startCountdown(end - now)
    } else {
      setIsActive(false)
      setTimeLeft("Đã kết thúc")
    }
  }

  const startCountdown = (ms) => {
    let diff = ms
    const timer = setInterval(() => {
      if (diff <= 0) {
        clearInterval(timer)
        fetchSale()
      } else {
        const d = dayjs.duration(diff)
        setTimeLeft(
          `${String(d.hours()).padStart(2, "0")}:${String(d.minutes()).padStart(2, "0")}:${String(d.seconds()).padStart(2, "0")}`
        )
        diff -= 1000
      }
    }, 1000)
  }
  
  useEffect(() => {
  const socket = io(`${process.env.REACT_APP_API_URL}/flash-sales`)
  socket.on('flash-sale-update', (data) => {
    if (data.type === 'status-refresh') {
      setSale(data.data[0])
    } else {
      setSale((prev) => {
        const newSale = { ...prev }
        const idx = newSale.items.findIndex((i) => i._id === data.flashSaleItemId)
        if (idx >= 0) newSale.items[idx].sold = data.sold
        return newSale
      })
    }
  })
  return () => socket.disconnect()
}, [])

  const handleBuyNow = async (itemId) => {
    try {
      const res = await axios.post("/flash-sales/purchase", { itemId, quantity: 1 })
      toast.success("🎉 Bạn đã đặt hàng thành công!")
          confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
    })
      fetchSale() 
    } catch (err) {
      toast.error(err.response?.data?.message || "Đã hết hàng hoặc lỗi hệ thống")
    }
  }

  if (!sale) return null

  return (
    <section className="relative bg-gradient-to-r from-red-600 to-orange-500 text-white rounded-2xl p-6 mt-6 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          🔥 FLASH SALE
        </h2>
        <div className="text-xl font-mono">
          {isActive ? `Kết thúc sau ${timeLeft}` : `Bắt đầu sau ${timeLeft}`}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {sale?.items?.map((it) => (
          <div key={it._id} className="bg-white text-black rounded-xl shadow p-2">
            <img
              src={it.productId?.image}
              alt={it.productId?.name}
              className="w-full h-40 object-cover rounded-md"
            />
            <h3 className="text-sm font-semibold mt-1 line-clamp-2">{it?.productId?.name}</h3>
            <div className="text-red-600 font-bold text-lg mt-1">
              {it?.salePrice?.toLocaleString()}đ
            </div>
            <div className="text-gray-500 text-xs line-through">
              {it?.productId?.sellingPrice?.toLocaleString()}đ
            </div>
            <div className="mt-2 w-full bg-gray-200 h-2 rounded-full">
              <div
                className="h-2 bg-red-500 rounded-full"
                style={{ width: `${(it.sold / it.quantity) * 100}%` }}
              ></div>
            </div>
            <button
              onClick={() => handleBuyNow(it._id)}
              disabled={!isActive || it.sold >= it.quantity}
              className={`mt-2 w-full text-sm font-bold py-1 rounded-md transition 
                ${isActive && it.sold < it.quantity
                  ? "bg-red-500 hover:bg-red-600 text-white"
                  : "bg-gray-300 text-gray-600 cursor-not-allowed"}`}
            >
              {it.sold >= it.quantity
                ? "Đã hết hàng"
                : isActive
                ? "Mua ngay"
                : "Chưa bắt đầu"}
            </button>
          </div>
        ))}
      </div>
    </section>
  )
}

export default FlashSaleBanner
