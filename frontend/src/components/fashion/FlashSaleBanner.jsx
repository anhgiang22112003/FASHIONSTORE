import React, { useEffect, useRef, useState, memo, useCallback, useMemo } from "react"
import dayjs from "dayjs"
import duration from "dayjs/plugin/duration"
// Import API và Socket từ code cũ
import apiUser from "@/service/api"
import { socket } from "@/service/socket"
// Import Modal từ code cũ
import FlashSaleCheckoutModal from "../FlashSaleCheckoutModal"

dayjs.extend(duration)

// Định nghĩa Styles (Không thay đổi từ code mới của bạn)
const bannerStyles = {
  section: {
    position: 'relative',
    borderRadius: '16px',
    padding: '24px',
    marginTop: '24px',
    background: 'linear-gradient(135deg, #fff5f7 0%, #ffe8ed 50%, #ffd6e0 100%)',
    boxShadow: '0 10px 40px rgba(255, 105, 180, 0.15)',
    overflow: 'hidden',
    border: '2px solid #ffb3c6'
  },
  decorativeBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: 'linear-gradient(90deg, #ff69b4 0%, #ffc0cb 50%, #ff69b4 100%)',
    animation: 'shimmer 3s infinite linear'
  },
  header: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '16px',
    paddingBottom: '16px',
    borderBottom: '2px solid rgba(255, 105, 180, 0.2)',
    flexWrap: 'wrap',
    gap: '16px'
  },
  title: {
    fontSize: '28px',
    fontWeight: 800,
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    background: 'linear-gradient(135deg, #ff1493 0%, #ff69b4 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    textTransform: 'uppercase',
    letterSpacing: '1px'
  },
  countdownContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  countdownLabel: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#d6336c'
  },
  countdownBox: {
    background: 'linear-gradient(135deg, #ff1493 0%, #ff69b4 100%)',
    borderRadius: '8px',
    padding: '8px 12px',
    minWidth: '48px',
    textAlign: 'center',
    boxShadow: '0 4px 15px rgba(255, 20, 147, 0.3)',
    color: '#fff',
    fontSize: '24px',
    fontWeight: 700,
    fontFamily: 'monospace'
  },
  scrollContainer: {
    display: 'flex',
    gap: '16px',
    paddingBottom: '16px',
    overflowX: 'auto',
    scrollbarWidth: 'thin',
    scrollbarColor: '#ffb3c6 transparent'
  },
  productCard: {
    flexShrink: 0,
    width: '260px',
    background: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
    overflow: 'hidden',
    transition: 'all 0.3s ease',
    border: '1px solid rgba(255, 105, 180, 0.1)'
  },
  productCardHover: {
    transform: 'translateY(-8px)',
    boxShadow: '0 12px 35px rgba(255, 105, 180, 0.25)'
  },
  imageContainer: {
    position: 'relative',
    height: '220px',
    overflow: 'hidden'
  },
  productImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.3s ease'
  },
  discountBadge: {
    position: 'absolute',
    top: '8px',
    right: '8px',
    background: 'linear-gradient(135deg, #ff1493 0%, #ff69b4 100%)',
    color: '#fff',
    fontSize: '14px',
    fontWeight: 700,
    padding: '6px 12px',
    borderRadius: '20px',
    boxShadow: '0 2px 10px rgba(255, 20, 147, 0.4)'
  },
  productContent: {
    padding: '12px'
  },
  productName: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#1a1a1a',
    minHeight: '48px',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    marginBottom: '8px'
  },
  priceContainer: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '8px',
    marginBottom: '12px'
  },
  salePrice: {
    color: '#ff1493',
    fontWeight: 800,
    fontSize: '22px'
  },
  originalPrice: {
    color: '#999',
    fontSize: '14px',
    textDecoration: 'line-through'
  },
  progressContainer: {
    marginTop: '12px'
  },
  progressBar: {
    width: '100%',
    height: '6px',
    background: '#ffe0e9',
    borderRadius: '10px',
    position: 'relative',
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #ff69b4 0%, #ff1493 100%)',
    borderRadius: '10px',
    transition: 'width 0.3s ease'
  },
  progressText: {
    fontSize: '12px',
    color: '#d6336c',
    fontWeight: 600,
    marginTop: '6px',
    textAlign: 'center'
  },
  buyButton: {
    marginTop: '12px',
    width: '100%',
    fontSize: '15px',
    fontWeight: 700,
    padding: '10px',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  buyButtonActive: {
    background: 'linear-gradient(135deg, #ff1493 0%, #ff69b4 100%)',
    color: '#fff',
    boxShadow: '0 4px 15px rgba(255, 20, 147, 0.3)'
  },
  buyButtonDisabled: {
    background: '#e0e0e0',
    color: '#999',
    cursor: 'not-allowed'
  }
};

// Memoized ProductCard Component
const ProductCard = memo(({
  item,
  isActive,
  onBuyNow
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const discountPercent = useMemo(() =>
    Math.round(((item.product?.sellingPrice - item.salePrice) / item.product?.sellingPrice) * 100),
    [item.product?.sellingPrice, item.salePrice]
  );

  const soldPercent = useMemo(() =>
    (item.sold / item.quantity) * 100,
    [item.sold, item.quantity]
  );

  const isSoldOut = item.sold >= item.quantity;

  const handleClick = useCallback(() => {
    if (isActive && !isSoldOut) {
      onBuyNow(item);
    }
  }, [isActive, isSoldOut, onBuyNow, item]);

  return (
    <div
      style={{
        ...bannerStyles.productCard,
        ...(isHovered ? bannerStyles.productCardHover : {})
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={bannerStyles.imageContainer}>
        <img
          src={item.product?.mainImage}
          alt={item.product?.name}
          style={{
            ...bannerStyles.productImage,
            transform: isHovered ? 'scale(1.05)' : 'scale(1)'
          }}
        />
        <span style={bannerStyles.discountBadge}>
          -{discountPercent}%
        </span>
      </div>

      <div style={bannerStyles.productContent}>
        <h3 style={bannerStyles.productName}>
          {item?.product?.name}
        </h3>
        
        <div style={bannerStyles.priceContainer}>
          <span style={bannerStyles.salePrice}>
            {item?.salePrice?.toLocaleString()}đ
          </span>
          <span style={bannerStyles.originalPrice}>
            {item?.product?.sellingPrice?.toLocaleString()}đ
          </span>
        </div>

        <div style={bannerStyles.progressContainer}>
          <div style={bannerStyles.progressBar}>
            <div
              style={{
                ...bannerStyles.progressFill,
                width: `${soldPercent}%`
              }}
            />
          </div>
          <p style={bannerStyles.progressText}>
            Đã bán: **{item.sold}** / **{item.quantity}**
          </p>
        </div>

        <button
          onClick={handleClick}
          disabled={!isActive || isSoldOut}
          style={{
            ...bannerStyles.buyButton,
            ...(isActive && !isSoldOut
              ? bannerStyles.buyButtonActive
              : bannerStyles.buyButtonDisabled
            ),
            ...(isActive && !isSoldOut && isHovered ? {
              transform: 'scale(1.02)',
              boxShadow: '0 6px 20px rgba(255, 20, 147, 0.4)'
            } : {})
          }}
        >
          {isSoldOut
            ? "Đã hết hàng 😭"
            : isActive
              ? "MUA NGAY"
              : "CHƯA BẮT ĐẦU"}
        </button>
      </div>
    </div>
  );
});

ProductCard.displayName = 'ProductCard';

// Memoized Countdown Display
const CountdownDisplay = memo(({ timeLeft }) => (
  <div style={bannerStyles.countdownContainer}>
    {timeLeft.split(':').map((unit, index) => (
      <div key={index} style={bannerStyles.countdownBox}>
        {unit}
      </div>
    ))}
  </div>
));

CountdownDisplay.displayName = 'CountdownDisplay';

const FlashSaleBanner = () => {
  const [sale, setSale] = useState(null)
  const [timeLeft, setTimeLeft] = useState("00:00:00")
  const [isActive, setIsActive] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)

  const timerRef = useRef(null)

  // LOGIC CŨ: Bắt đầu đếm ngược
  const startCountdown = useCallback((ms) => {
    if (timerRef.current) clearInterval(timerRef.current)
    let diff = ms
    timerRef.current = setInterval(() => {
      if (diff <= 0) {
        if (timerRef.current) clearInterval(timerRef.current)
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
  }, []); // Không phụ thuộc vào fetchSale trong logic đếm ngược

  // LOGIC CŨ: Cập nhật trạng thái và gọi đếm ngược
  const updateCountdown = useCallback((saleData) => {
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
  }, [startCountdown]);


  // LOGIC CŨ: Fetch Sale
  const fetchSale = useCallback(async () => {
    try {
      // SỬ DỤNG LẠI API CALL THỰC TẾ
      const res = await apiUser.get("/flash-sales/active")
      if (Array.isArray(res.data) && res.data.length > 0) {
        setSale(res.data[0])
        updateCountdown(res.data[0])
      } else {
        setSale(null)
        // Dọn dẹp đếm ngược nếu không có sale
        if (timerRef.current) clearInterval(timerRef.current)
        setTimeLeft("00:00:00")
      }
    } catch (error) {
      console.error("Error fetching flash sale:", error)
      setSale(null)
      if (timerRef.current) clearInterval(timerRef.current)
      setTimeLeft("00:00:00")
    }
  }, [updateCountdown]); // Phụ thuộc vào updateCountdown

  // LOGIC CŨ: Fetch Sale lần đầu và interval 30s
  useEffect(() => {
    fetchSale()
    const interval = setInterval(fetchSale, 30_000) // 30 giây
    return () => clearInterval(interval)
  }, [fetchSale])

  // LOGIC CŨ: Clear interval khi component unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  // LOGIC CŨ: Socket event handling
  useEffect(() => {
    socket.on("flash-sale-update", (data) => {
      if (data.type === "status-refresh") {
        if (Array.isArray(data.data) && data.data.length > 0) {
          const freshSale = data.data[0]
          setSale(freshSale)
          updateCountdown(freshSale) // Cập nhật isActive và countdown ngay khi nhận event
        } else {
          setSale(null)
          setIsActive(false)
          setTimeLeft("00:00:00")
          if (timerRef.current) clearInterval(timerRef.current)
        }
      } else {
        // Cập nhật số lượng đã bán của 1 item
        setSale((prev) => {
          if (!prev || !prev.items) return prev

          const newSale = { ...prev }
          const idx = newSale.items.findIndex((i) => i._id === data.flashSaleItemId)

          if (idx >= 0) {
            const updatedItem = { ...newSale.items[idx], sold: data.sold }
            newSale.items = newSale.items.map((item, index) =>
              index === idx ? updatedItem : item
            )
          }
          return newSale
        })
      }
    })
    
    // Đã xóa socket.disconnect() trong return của bạn vì nó có thể ngắt kết nối
    // toàn bộ ứng dụng. Chỉ ngắt kết nối socket nếu nó được kết nối trong component này.
    // Giữ nguyên logic return của bạn (hoặc xóa nếu socket được quản lý ở cấp cao hơn)
    return () => {
      // Giả định socket được quản lý ở nơi khác và chỉ cần tắt listener
      socket.off("flash-sale-update");
      // Nếu socket được khởi tạo/kết nối ở đây và cần ngắt:
      // if (socket.connected) socket.disconnect()
    }
  }, []) // Dependency rỗng vì socket được import

  const handleBuyNow = useCallback((item) => {
    setSelectedItem(item)
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedItem(null)
  }, []);

  const handleSuccess = useCallback(() => {
    fetchSale()
  }, [fetchSale]);

  const saleStatusText = useMemo(() => {
    if (isActive) return "KẾT THÚC SAU"
    if (sale?.startTime && new Date(sale.startTime) > new Date()) return "SẮP BẮT ĐẦU"
    return "ĐÃ KẾT THÚC"
  }, [isActive, sale?.startTime]);

  if (!sale) return null

  return (
    <>
      {/* CSS cho animation và scrollbar */}
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        
        /* CSS cho thanh cuộn tùy chỉnh (Custom Scrollbar) */
        .custom-scrollbar-hide::-webkit-scrollbar {
          height: 8px;
        }
        
        .custom-scrollbar-hide::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .custom-scrollbar-hide::-webkit-scrollbar-thumb {
          background: #ffb3c6;
          border-radius: 4px;
        }
        
        .custom-scrollbar-hide::-webkit-scrollbar-thumb:hover {
          background: #ff69b4;
        }
      `}</style>
      
      <section style={bannerStyles.section}>
        <div style={bannerStyles.decorativeBorder} />
        
        {/* HEADER & COUNTDOWN */}
        <div style={bannerStyles.header}>
          <h2 style={bannerStyles.title}>
            <span role="img" aria-label="flash">⚡</span>
            Flash Sale Hôm Nay
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <span style={bannerStyles.countdownLabel}>{saleStatusText}:</span>
            <CountdownDisplay timeLeft={timeLeft} />
          </div>
        </div>

        {/* DANH SÁCH SẢN PHẨM */}
        <div style={bannerStyles.scrollContainer} className="custom-scrollbar-hide">
          {sale?.items?.map((item) => (
            <ProductCard
              key={item._id}
              item={item}
              isActive={isActive}
              onBuyNow={handleBuyNow}
            />
          ))}
        </div>

        {/* 🛍️ Modal - SỬ DỤNG COMPONENT THỰC TẾ CỦA BẠN */}
        {selectedItem && (
          <FlashSaleCheckoutModal
            item={selectedItem}
            onClose={handleCloseModal}
            onSuccess={handleSuccess}
          />
        )}
      </section>
    </>
  );
};

export default memo(FlashSaleBanner);