/* Hallmark · macrostructure: Marquee Hero · section: FlashSaleBanner · tone: Vercel Glassmorphism */
import React, { useEffect, useRef, useState, memo, useCallback, useMemo } from "react"
import dayjs from "dayjs"
import duration from "dayjs/plugin/duration"
import apiUser from "service/api"
import { socket } from "service/socket"
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
          background-color: #030306;
          color: white;
          padding: 6rem 2rem;
          position: relative;
          overflow: hidden;
        }

        /* Glassmorphic border lines and glowing backdrops */
        .fs-glow-bg {
          position: absolute;
          width: 35%;
          height: 35%;
          background: radial-gradient(circle, rgba(168, 85, 247, 0.08) 0%, transparent 70%);
          top: 10%;
          left: 5%;
          pointer-events: none;
          z-index: 1;
        }

        .fs-container {
          max-width: 1400px;
          margin: 0 auto;
          position: relative;
          z-index: 2;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(12px);
          border-radius: 20px;
          padding: 3rem;
          box-shadow: 0 30px 60px rgba(0,0,0,0.4);
        }

        /* Custom moving laser animated border glow overlay */
        .fs-border-glow-line {
          position: absolute;
          inset: 0;
          border-radius: 20px;
          pointer-events: none;
          box-shadow: inset 0 0 12px rgba(168, 85, 247, 0.1);
        }

        .fs-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          padding-bottom: 2rem;
          margin-bottom: 3rem;
          flex-wrap: wrap;
          gap: 1.5rem;
        }

        .fs-title {
          font-family: var(--font-display, 'Playfair Display', serif);
          font-size: 2rem;
          font-weight: 900;
          letter-spacing: -0.02em;
          text-transform: uppercase;
          color: white;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .fs-title-flash {
          color: #a855f7;
          filter: drop-shadow(0 0 8px #a855f7);
          animation: flashGlow 1.5s ease-in-out infinite alternate;
        }

        @keyframes flashGlow {
          from { filter: drop-shadow(0 0 4px #a855f7); }
          to { filter: drop-shadow(0 0 12px #a855f7); }
        }

        .fs-meta {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          flex-wrap: wrap;
        }

        .fs-status-label {
          font-family: var(--font-body, 'Inter', sans-serif);
          font-size: 0.6875rem;
          font-weight: 700;
          letter-spacing: 0.2em;
          color: rgba(255, 255, 255, 0.5);
        }

        .fs-countdown-wrap {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .fs-countdown-box {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          min-width: 3rem;
          height: 3rem;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-body, 'Inter', sans-serif);
          font-size: 1.25rem;
          font-weight: 800;
          color: white;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          position: relative;
          overflow: hidden;
        }

        .fs-countdown-box::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; height: 50%;
          background: rgba(255, 255, 255, 0.02);
          border-bottom: 1px solid rgba(255, 255, 255, 0.03);
        }

        .fs-countdown-colon {
          color: #a855f7;
          font-weight: 900;
          font-size: 1.5rem;
          animation: colonBlink 1s infinite;
        }

        @keyframes colonBlink {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }

        .fs-scroll-wrap {
          display: flex;
          gap: 2rem;
          overflow-x: auto;
          padding: 0.5rem 0.5rem 2rem;
          scrollbar-width: thin;
          scrollbar-color: rgba(255,255,255,0.1) transparent;
        }

        .fs-scroll-wrap::-webkit-scrollbar {
          height: 6px;
        }

        .fs-scroll-wrap::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
        }

        /* 3D Glassmorphic Cards */
        .fs-card {
          flex-shrink: 0;
          width: 280px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          position: relative;
          overflow: hidden;
          transition: border-color 0.3s, transform 0.3s, box-shadow 0.3s;
        }

        .fs-card.is-hovered {
          border-color: #a855f7;
          transform: translateY(-8px);
          box-shadow: 0 15px 40px rgba(168, 85, 247, 0.15), 0 20px 40px rgba(0,0,0,0.6);
        }

        .fs-card-img-wrap {
          position: relative;
          aspect-ratio: 3 / 4;
          overflow: hidden;
          background: rgba(255, 255, 255, 0.01);
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }

        .fs-card-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .fs-card-glare {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 3;
        }

        .fs-card-discount {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: #ef4444;
          color: white;
          font-family: var(--font-body, 'Inter', sans-serif);
          font-size: 0.6875rem;
          font-weight: 700;
          padding: 0.3rem 0.6rem;
          border-radius: 4px;
          box-shadow: 0 4px 10px rgba(239, 68, 68, 0.3);
          z-index: 4;
        }

        .fs-card-body {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          flex-grow: 1;
        }

        .fs-card-title {
          font-family: var(--font-body, 'Inter', sans-serif);
          font-size: 0.875rem;
          font-weight: 500;
          line-height: 1.45;
          color: rgba(255, 255, 255, 0.85);
          margin: 0 0 1rem;
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
          margin-bottom: 1.25rem;
        }

        .fs-card-price-sale {
          font-size: 1.125rem;
          font-weight: 800;
          color: white;
        }

        .fs-card-price-original {
          font-size: 0.8125rem;
          text-decoration: line-through;
          color: rgba(255, 255, 255, 0.4);
        }

        .fs-progress-wrap {
          margin-top: auto;
          margin-bottom: 1.5rem;
        }

        .fs-progress-bar {
          width: 100%;
          height: 4px;
          background: rgba(255, 255, 255, 0.08);
          border-radius: 2px;
          position: relative;
          overflow: hidden;
          margin-bottom: 0.5rem;
        }

        .fs-progress-fill {
          height: 100%;
          background: linear-gradient(to right, #a855f7, #ef4444);
          border-radius: 2px;
          transition: width 0.3s;
        }

        .fs-progress-text {
          font-family: var(--font-body, 'Inter', sans-serif);
          font-size: 0.6875rem;
          color: rgba(255, 255, 255, 0.5);
          margin: 0;
        }

        .fs-buy-btn {
          width: 100%;
          font-family: var(--font-body, 'Inter', sans-serif);
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 0.875rem;
          border: 1px solid transparent;
          border-radius: 6px;
          cursor: pointer;
          transition: background 0.3s, color 0.3s, border-color 0.3s;
        }

        .fs-buy-btn.is-active {
          background: #ffffff;
          color: #000000;
        }

        .fs-buy-btn.is-active:hover {
          background: transparent;
          color: #ffffff;
          border-color: rgba(255, 255, 255, 0.3);
        }

        .fs-buy-btn.is-disabled {
          background: rgba(255, 255, 255, 0.04);
          border-color: rgba(255, 255, 255, 0.04);
          color: rgba(255, 255, 255, 0.3);
          cursor: not-allowed;
        }
      `}</style>
      
      <section className="fs-section">
        <div className="fs-glow-bg" />
        
        <div className="fs-container">
          <div className="fs-border-glow-line" />
          
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