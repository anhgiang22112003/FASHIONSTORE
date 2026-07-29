/* Hallmark · macrostructure: Marquee Hero · section: FlashSaleBanner · tone: Vercel Glassmorphism */
import React, { useEffect, useRef, useState, memo, useCallback, useMemo } from "react"
import dayjs from "dayjs"
import duration from "dayjs/plugin/duration"
import apiUser from "@/service/api"
import { socket } from "@/service/socket"
import FlashSaleCheckoutModal from "../FlashSaleCheckoutModal"

dayjs.extend(duration)

// Product Card for Flash Sale
const ProductCard = memo(({ item, isActive, onBuyNow }) => {
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef(null);
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50 });

  const discountPercent = useMemo(() =>
    Math.round(((item.product?.sellingPrice - item.salePrice) / item.product?.sellingPrice) * 100),
    [item.product?.sellingPrice, item.salePrice]
  );

  const soldPercent = useMemo(() =>
    (item.sold / item.quantity) * 100,
    [item.sold, item.quantity]
  );

  const isSoldOut = item.sold >= item.quantity;

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setGlarePos({ x, y });
  };

  const handleClick = useCallback(() => {
    if (isActive && !isSoldOut) {
      onBuyNow(item);
    }
  }, [isActive, isSoldOut, onBuyNow, item]);

  return (
    <div
      ref={cardRef}
      className={`fs-card ${isHovered ? 'is-hovered' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
    >
      <div className="fs-card-img-wrap">
        <img
          src={item.product?.mainImage}
          alt={item.product?.name}
          className="fs-card-img"
          style={{
            transform: isHovered ? 'scale(1.05)' : 'scale(1)'
          }}
        />
        {/* Neon Light Sweep Overlay */}
        {isHovered && (
          <div
            className="fs-card-glare"
            style={{
              background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255,255,255,0.18) 0%, transparent 60%)`
            }}
          />
        )}
        <span className="fs-card-discount">
          -{discountPercent}%
        </span>
      </div>

      <div className="fs-card-body">
        <h3 className="fs-card-title">
          {item?.product?.name}
        </h3>
        
        <div className="fs-card-price-row">
          <span className="fs-card-price-sale">
            {item?.salePrice?.toLocaleString()}₫
          </span>
          <span className="fs-card-price-original">
            {item?.product?.sellingPrice?.toLocaleString()}₫
          </span>
        </div>

        <div className="fs-progress-wrap">
          <div className="fs-progress-bar">
            <div
              className="fs-progress-fill"
              style={{ width: `${soldPercent}%` }}
            />
          </div>
          <p className="fs-progress-text">
            Đã bán: <span className="font-bold">{item.sold}</span> / {item.quantity}
          </p>
        </div>

        <button
          onClick={handleClick}
          disabled={!isActive || isSoldOut}
          className={`fs-buy-btn ${isActive && !isSoldOut ? 'is-active' : 'is-disabled'}`}
        >
          {isSoldOut
            ? "Đã hết hàng"
            : isActive
              ? "Mua ngay"
              : "Sắp diễn ra"}
        </button>
      </div>
    </div>
  );
});

ProductCard.displayName = 'ProductCard';

// Countdown Block
const CountdownDisplay = memo(({ timeLeft }) => (
  <div className="fs-countdown-wrap">
    {timeLeft.split(':').map((unit, index) => (
      <React.Fragment key={index}>
        <div className="fs-countdown-box">
          <span className="fs-countdown-digit">{unit}</span>
        </div>
        {index < 2 && <span className="fs-countdown-colon">:</span>}
      </React.Fragment>
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
  }, []);

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

  const fetchSale = useCallback(async () => {
    try {
      const res = await apiUser.get("/flash-sales/active")
      if (Array.isArray(res.data) && res.data.length > 0) {
        setSale(res.data[0])
        updateCountdown(res.data[0])
      } else {
        setSale(null)
        if (timerRef.current) clearInterval(timerRef.current)
        setTimeLeft("00:00:00")
      }
    } catch (error) {
      console.error("Error fetching flash sale:", error)
      setSale(null)
      if (timerRef.current) clearInterval(timerRef.current)
      setTimeLeft("00:00:00")
    }
  }, [updateCountdown]);

  useEffect(() => {
    fetchSale()
    const interval = setInterval(fetchSale, 30_000)
    return () => clearInterval(interval)
  }, [fetchSale])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  useEffect(() => {
    socket.on("flash-sale-update", (data) => {
      if (data.type === "status-refresh") {
        if (Array.isArray(data.data) && data.data.length > 0) {
          const freshSale = data.data[0]
          setSale(freshSale)
          updateCountdown(freshSale)
        } else {
          setSale(null)
          setIsActive(false)
          setTimeLeft("00:00:00")
          if (timerRef.current) clearInterval(timerRef.current)
        }
      } else {
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
    
    return () => {
      socket.off("flash-sale-update");
    }
  }, [])

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
    if (sale?.startTime && new Date(sale.startTime) > new Date()) return "BẮT ĐẦU SAU"
    return "ĐÃ KẾT THÚC"
  }, [isActive, sale?.startTime]);

  if (!sale) return null

  return (
    <>
      <style>{`
        .fs-section {
          background: linear-gradient(180deg, #ffffff 0%, #fff1f2 100%);
          color: #111827;
          padding: 4rem 0;
          position: relative;
          overflow: hidden;
        }

        .fs-glow-bg {
          position: absolute;
          width: 35%;
          height: 35%;
          background: radial-gradient(circle, rgba(236, 72, 153, 0.1) 0%, transparent 70%);
          top: 10%;
          left: 5%;
          pointer-events: none;
          z-index: 1;
        }

        .fs-container {
          position: relative;
          z-index: 2;
          background: #ffffff;
          border: 1px solid #fbcfe8;
          border-radius: 24px;
          padding: 2.5rem;
          box-shadow: 0 20px 40px rgba(236, 72, 153, 0.08);
        }

        .fs-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid #fce7f3;
          padding-bottom: 1.5rem;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          gap: 1.5rem;
        }

        .fs-title {
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          font-size: 1.75rem;
          font-weight: 900;
          letter-spacing: -0.02em;
          text-transform: uppercase;
          color: #111827;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .fs-title-flash {
          color: #ec4899;
          filter: drop-shadow(0 0 8px rgba(236,72,153,0.4));
          animation: flashGlow 1.5s ease-in-out infinite alternate;
        }

        @keyframes flashGlow {
          from { opacity: 0.7; }
          to { opacity: 1; }
        }

        .fs-meta {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          flex-wrap: wrap;
        }

        .fs-status-label {
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.15em;
          color: #be185d;
          background: #fdf2f8;
          padding: 0.4rem 0.8rem;
          border-radius: 99px;
          border: 1px solid #fbcfe8;
        }

        .fs-countdown-wrap {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .fs-countdown-box {
          background: #111827;
          border: 1px solid #374151;
          min-width: 2.75rem;
          height: 2.75rem;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.125rem;
          font-weight: 800;
          color: #ffffff;
          box-shadow: 0 4px 10px rgba(0,0,0,0.1);
        }

        .fs-countdown-colon {
          color: #ec4899;
          font-weight: 900;
          font-size: 1.5rem;
        }

        .fs-scroll-wrap {
          display: flex;
          gap: 1.5rem;
          overflow-x: auto;
          padding: 0.5rem 0.5rem 1.5rem;
          scrollbar-width: thin;
          scrollbar-color: #f472b6 transparent;
        }

        .fs-card {
          flex-shrink: 0;
          width: 260px;
          background: #ffffff;
          border: 1px solid #f3f4f6;
          border-radius: 16px;
          display: flex;
          flex-direction: column;
          position: relative;
          overflow: hidden;
          transition: border-color 0.3s, transform 0.3s, box-shadow 0.3s;
          box-shadow: 0 4px 15px rgba(0,0,0,0.03);
        }

        .fs-card.is-hovered {
          border-color: #f472b6;
          transform: translateY(-6px);
          box-shadow: 0 15px 30px rgba(236, 72, 153, 0.15);
        }

        .fs-card-img-wrap {
          position: relative;
          aspect-ratio: 3 / 4;
          overflow: hidden;
          background: #f9fafb;
        }

        .fs-card-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.6s ease;
        }

        .fs-card-discount {
          position: absolute;
          top: 0.75rem;
          right: 0.75rem;
          background: #ef4444;
          color: white;
          font-size: 0.75rem;
          font-weight: 700;
          padding: 0.25rem 0.6rem;
          border-radius: 99px;
          box-shadow: 0 4px 10px rgba(239, 68, 68, 0.3);
          z-index: 4;
        }

        .fs-card-body {
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          flex-grow: 1;
        }

        .fs-card-title {
          font-size: 0.875rem;
          font-weight: 600;
          line-height: 1.45;
          color: #1f2937;
          margin: 0 0 0.75rem;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          min-height: 2.5rem;
        }

        .fs-card-price-row {
          display: flex;
          align-items: baseline;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .fs-card-price-sale {
          font-size: 1.125rem;
          font-weight: 800;
          color: #be185d;
        }

        .fs-card-price-original {
          font-size: 0.8125rem;
          text-decoration: line-through;
          color: #9ca3af;
        }

        .fs-progress-wrap {
          margin-top: auto;
          margin-bottom: 1.25rem;
        }

        .fs-progress-bar {
          width: 100%;
          height: 6px;
          background: #fce7f3;
          border-radius: 99px;
          position: relative;
          overflow: hidden;
          margin-bottom: 0.4rem;
        }

        .fs-progress-fill {
          height: 100%;
          background: linear-gradient(to right, #ec4899, #ef4444);
          border-radius: 99px;
          transition: width 0.3s;
        }

        .fs-progress-text {
          font-size: 0.6875rem;
          color: #6b7280;
          margin: 0;
        }

        .fs-buy-btn {
          width: 100%;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 0.75rem;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          transition: background 0.3s, color 0.3s;
        }

        .fs-buy-btn.is-active {
          background: linear-gradient(135deg, #ec4899 0%, #db2777 100%);
          color: #ffffff;
          box-shadow: 0 4px 15px rgba(236, 72, 153, 0.25);
        }

        .fs-buy-btn.is-active:hover {
          background: linear-gradient(135deg, #db2777 0%, #be185d 100%);
        }

        .fs-buy-btn.is-disabled {
          background: #f3f4f6;
          color: #9ca3af;
          cursor: not-allowed;
        }
      `}</style>
      
      <section className="fs-section">
        <div className="fs-glow-bg" />
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="fs-container">
            {/* HEADER & COUNTDOWN */}
            <div className="fs-header">
              <h2 className="fs-title">
                <span className="fs-title-flash">⚡</span> FLASH SALE HÔM NAY
              </h2>
              <div className="fs-meta">
                <span className="fs-status-label">{saleStatusText}</span>
                <CountdownDisplay timeLeft={timeLeft} />
              </div>
            </div>

            {/* PRODUCT LIST */}
            <div className="fs-scroll-wrap">
              {sale?.items?.map((item) => (
                <ProductCard
                  key={item._id}
                  item={item}
                  isActive={isActive}
                  onBuyNow={handleBuyNow}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Modal */}
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