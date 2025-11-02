import React, { useEffect, useRef, useState } from "react"
import dayjs from "dayjs"
import duration from "dayjs/plugin/duration"
import apiUser from "@/service/api"
import { socket } from "@/service/socket"
import FlashSaleCheckoutModal from "../FlashSaleCheckoutModal"

dayjs.extend(duration)

const FlashSaleBanner = () => {
  const [sale, setSale] = useState(null)
  const [timeLeft, setTimeLeft] = useState("00:00:00")
  const [isActive, setIsActive] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)

  const timerRef = useRef(null)

  useEffect(() => {
    fetchSale()
    const interval = setInterval(fetchSale, 30_000)
    return () => clearInterval(interval)
  }, [])

  const fetchSale = async () => {
    const res = await apiUser.get("/flash-sales/active")
    if (Array.isArray(res.data) && res.data.length > 0) {
      setSale(res.data[0])
      updateCountdown(res.data[0])
    } else {
      setSale(null)
    }
  }

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
    if (timerRef.current) clearInterval(timerRef.current)
    let diff = ms
    timerRef.current = setInterval(() => {
      if (diff <= 0) {
        clearInterval(timerRef.current)
        timerRef.current = null
        fetchSale()
      } else {
        const d = dayjs.duration(diff)
        const hours = String(Math.floor(d.asHours())).padStart(2, "0")
        const minutes = String(d.minutes()).padStart(2, "0")
        const seconds = String(d.seconds()).padStart(2, "0")

        setTimeLeft(`${hours}:${minutes}:${seconds}`)
        diff -= 1000
      }
    }, 1000)
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  useEffect(() => {
    socket.on("flash-sale-update", (data) => {
      if (data.type === "status-refresh") {
        setSale(data.data[0])
      } else {
        setSale((prev) => {
          if (!prev || !prev.items) return prev

          const newSale = { ...prev }
          const idx = newSale.items.findIndex((i) => i._id === data.flashSaleItemId)

          if (idx >= 0) {
            const updatedItem = { ...newSale.items[idx], sold: data.sold }
            newSale.items = [
              ...newSale.items.slice(0, idx),
              updatedItem,
              ...newSale.items.slice(idx + 1)
            ]
          }
          return newSale
        })
      }
    })
    return () => {
      if (socket.disconnect) socket.disconnect()
    }
  }, [])

  const handleBuyNow = (item) => {
    setSelectedItem(item)
  }

  const handleCloseModal = () => {
    setSelectedItem(null)
  }

  const handleSuccess = () => {
    fetchSale()
  }

  if (!sale) return null

  const saleStatusText = isActive
    ? "KẾT THÚC SAU"
    : sale.startTime > new Date().toISOString()
      ? "SẮP BẮT ĐẦU"
      : "ĐÃ KẾT THÚC"

  return (
    <section
      className="relative rounded-2xl p-4 sm:p-6 mt-6 shadow-2xl overflow-hidden border-2 border-red-500"
      style={{ background: "linear-gradient(90deg, #ffdde1 0%, #ffc0c0 100%)" }}
    >
      {/* HEADER & COUNTDOWN */}
      <div className="flex flex-col sm:flex-row items-center justify-between mb-4 pb-2 border-b border-red-300">
        <h2 className="text-3xl font-extrabold flex items-center gap-3 text-red-700 uppercase">
          <span role="img" aria-label="flash">⚡</span> FLash SALE HÔM NAY
        </h2>
        <div className="flex items-center gap-3 mt-2 sm:mt-0">
          <span className="text-sm font-semibold text-red-800">{saleStatusText}:</span>
          <div className="flex space-x-1 font-mono text-white">
            {timeLeft.split(':').map((unit, index) => (
              <div key={index} className="bg-red-600 rounded-lg p-2 min-w-[40px] text-center shadow-md">
                <span className="text-2xl font-bold leading-none">{unit}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* DANH SÁCH SẢN PHẨM - ĐÃ TĂNG KÍCH THƯỚC ITEM */}
      <div className="flex space-x-4 pb-4 overflow-x-auto custom-scrollbar-hide">
        {sale?.items?.map((it) => (
          <div
            key={it._id}
            // ĐÃ THAY ĐỔI: Tăng từ w-48 lên w-60
            className="flex-shrink-0 w-60 bg-white text-gray-900 rounded-xl shadow-lg hover:shadow-2xl transition duration-300 transform hover:-translate-y-1 overflow-hidden border border-gray-100"
          >
            {/* Ảnh Sản Phẩm */}
            <div className="relative h-52"> {/* ĐÃ THAY ĐỔI: Tăng từ h-40 lên h-52 */}
              <img
                src={it.product?.mainImage}
                alt={it.product?.name}
                className="w-full h-full object-cover"
              />
              <span className="absolute top-0 right-0 bg-red-600 text-white text-sm font-bold px-2 py-1 rounded-bl-lg">
                -{Math.round(((it.product?.sellingPrice - it.salePrice) / it.product?.sellingPrice) * 100)}%
              </span>
            </div>

            <div className="p-3">
              {/* ĐÃ CHỈNH SỬA: Tăng font size từ text-base lên text-lg */}
              <h3 className="text-lg font-semibold line-clamp-2 min-h-[56px]">
                {it?.product?.name}
              </h3>
              <div className="flex items-baseline gap-2 mt-1">
                {/* ĐÃ CHỈNH SỬA: Tăng font size từ text-xl lên text-2xl */}
                <span className="text-red-600 font-extrabold text-2xl">
                  {it?.salePrice?.toLocaleString()}đ
                </span>
                <span className="text-gray-400 text-sm line-through">
                  {it?.product?.sellingPrice?.toLocaleString()}đ
                </span>
              </div>

              {/* Thanh tiến trình */}
              <div className="mt-3">
                <div className="w-full bg-red-100 h-2 rounded-full relative">
                  <div
                    className="h-2 bg-red-500 rounded-full"
                    style={{ width: `${(it.sold / it.quantity) * 100}%` }}
                  ></div>
                </div>
                <p className="text-xs text-red-500 font-medium mt-1 text-center">
                  Đã bán: **{it.sold}** / **{it.quantity}**
                </p>
              </div>

              {/* Nút Mua */}
              <button
                onClick={() => handleBuyNow(it)}
                disabled={!isActive || it.sold >= it.quantity}
                className={`mt-3 w-full text-base font-bold py-2 rounded-lg shadow-md transition duration-200 
                        ${isActive && it.sold < it.quantity
                    ? "bg-red-600 hover:bg-red-700 text-white"
                    : "bg-gray-300 text-gray-600 cursor-not-allowed"}`}
              >
                {it.sold >= it.quantity
                  ? "Đã hết hàng 😭"
                  : isActive
                    ? "MUA NGAY"
                    : "CHƯA BẮT ĐẦU"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 🛍️ Modal */}
      {selectedItem && (
        <FlashSaleCheckoutModal
          item={selectedItem}
          onClose={handleCloseModal}
          onSuccess={handleSuccess}
        />
      )}
    </section>
  )
}

export default FlashSaleBanner