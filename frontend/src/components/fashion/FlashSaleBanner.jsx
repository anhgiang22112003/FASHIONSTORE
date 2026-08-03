/* FlashSaleBanner · section component */
import React, { useEffect, useRef, useState, memo, useCallback, useMemo, useContext } from "react"
import { useNavigate } from "react-router-dom"
import dayjs from "dayjs"
import duration from "dayjs/plugin/duration"
import apiUser from "@/service/api"
import { socket } from "@/service/socket"
import { toast } from "react-toastify"
import { Eye, ShoppingBag, Star, Zap, ShoppingCart } from "lucide-react"
import FlashSaleCheckoutModal from "../FlashSaleCheckoutModal"
import VariantSelectionModal from "./VariantSelectionModal"
import { AuthContext } from '@/context/AuthContext'

dayjs.extend(duration)

const colorMap = {
  'Đen': '#111111', 'Den': '#111111',
  'Trắng': '#F5F5F5', 'Trang': '#F5F5F5',
  'Đỏ': '#EF4444', 'Do': '#EF4444',
  'Xanh': '#3B82F6', 'Xanh dương': '#3B82F6',
  'Xanh lá': '#10B981', 'Xanh la': '#10B981',
  'Vàng': '#F59E0B', 'Vang': '#F59E0B',
  'Hồng': '#EC4899', 'Hong': '#EC4899',
  'Xám': '#9CA3AF', 'Xam': '#9CA3AF',
  'Cam': '#F97316',
  'Tím': '#8B5CF6', 'Tim': '#8B5CF6',
  'Nâu': '#92400E', 'Nau': '#92400E',
  'Kem': '#FEF3C7', 'Beige': '#F5F0E8',
}

/* ProductCard - unchanged logic, added onAddToCart prop */
const ProductCard = memo(({ item, isActive, onBuyNow, onAddToCart }) => {
  const [isHovered, setIsHovered] = useState(false)
  const cardRef = useRef(null)
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50 })

  const discountPercent = useMemo(() =>
    Math.round(((item.product?.sellingPrice - item.salePrice) / item.product?.sellingPrice) * 100),
    [item.product?.sellingPrice, item.salePrice]
  )

  const soldPercent = useMemo(() =>
    Math.min((item.sold / item.quantity) * 100, 100),
    [item.sold, item.quantity]
  )

  const isSoldOut = item.sold >= item.quantity
  const isLowStock = !isSoldOut && soldPercent >= 80
  const product = item.product || {}
  const colors = Array.from(new Set((product?.variations || []).map(v => v.color).filter(Boolean)))
  const sizes = Array.from(new Set((product?.variations || []).map(v => v.size).filter(Boolean)))

  const navigate = useNavigate()

  const handleMouseMove = useCallback((e) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    setGlarePos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    })
  }, [])

  const handleNavigateDetail = useCallback((e) => {
    e?.stopPropagation()
    if (product?._id) navigate(`/product/${product._id}`)
  }, [navigate, product?._id])

  const handleBuyNowClick = useCallback((e) => {
    e.stopPropagation()
    if (isActive && !isSoldOut) onBuyNow(item)
  }, [isActive, isSoldOut, onBuyNow, item])

  const handleAddToCartClick = useCallback((e) => {
    e.stopPropagation()
    if (isActive && !isSoldOut) onAddToCart(item)
  }, [isActive, isSoldOut, onAddToCart, item])

  return (
    <div
      ref={cardRef}
      className="fs-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
    >
      <div className="fs-card-img-wrap">
        <img src={product?.mainImage} alt={product?.name} className="fs-card-img" style={{ transform: isHovered ? 'scale(1.06)' : 'scale(1)' }} loading="lazy" />
        {isHovered && <div className="fs-card-glare" style={{ background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255,255,255,0.18) 0%, transparent 60%)` }} />}
        {isSoldOut && <div className="fs-card-overlay">HẾT HÀNG</div>}
        <span className="fs-card-discount">-{discountPercent}%</span>
      </div>
      <div className="fs-card-body">
        <div className="fs-card-brand">{product?.brand || 'FASHIONSTORE'}{product?.material && ` · ${product.material}`}</div>
        <button type="button" className="fs-card-title" onClick={handleNavigateDetail}>{product?.name}</button>
        <div className="fs-card-badges">
          <div className="fs-card-rating">
            {[...Array(5)].map((_, i) => (<Star key={i} size={11} className={i < Math.floor(product?.ratingAverage || 0) ? 'text-amber-400 fill-current' : 'text-gray-300'} />))}
            <span className="fs-rating-count">({product?.reviewCount ?? 0})</span>
          </div>
          {sizes.length > 0 && (
            <div className="fs-card-sizes">
              {sizes.slice(0, 3).map((s, i) => (<span key={i} className="fs-size-badge">{s}</span>))}
              {sizes.length > 3 && <span className="fs-sizes-more">+{sizes.length - 3}</span>}
            </div>
          )}
        </div>
        <div className="fs-card-meta-row">
          {colors.length > 0 && (
            <div className="fs-card-colors">
              {colors.slice(0, 4).map((c, i) => (<span key={i} title={c} className="fs-color-dot" style={{ backgroundColor: colorMap[c] || '#CBD5E1' }} />))}
              {colors.length > 4 && <span className="fs-colors-more">+{colors.length - 4}</span>}
            </div>
          )}
          <div className="fs-card-price-group">
            <span className="fs-card-price">{item?.salePrice?.toLocaleString()}₫</span>
            <span className="fs-card-price-original">{product?.sellingPrice?.toLocaleString()}₫</span>
          </div>
        </div>
        <div className="fs-progress-wrap">
          <div className="fs-progress-bar"><div className="fs-progress-fill" style={{ width: `${soldPercent}%` }} /></div>
          <div className="fs-progress-label">
            <span>Đã bán {item.sold}</span>
            <span className={isLowStock ? 'text-red-500 font-semibold' : ''}>{isSoldOut ? 'Hết hàng' : `Còn ${item.quantity - item.sold}`}</span>
          </div>
        </div>
        <div className="fs-card-actions">
          <button type="button" onClick={handleBuyNowClick} disabled={!isActive || isSoldOut} className={`fs-btn-buy ${isActive && !isSoldOut ? 'is-active' : 'is-disabled'}`}>
            <Zap size={14} />
            <span>{isSoldOut ? 'Hết hàng' : isActive ? 'Mua ngay' : 'Sắp diễn ra'}</span>
          </button>
          <button type="button" onClick={handleAddToCartClick} disabled={!isActive || isSoldOut} className={`fs-btn-cart ${isActive && !isSoldOut ? 'is-active' : 'is-disabled'}`}>
            <ShoppingCart size={14} />
          </button>
          <button type="button" onClick={handleNavigateDetail} className="fs-btn-view" aria-label="Xem chi tiết"><Eye size={14} /></button>
        </div>
      </div>
    </div>
  )
})
ProductCard.displayName = 'ProductCard'

/* Countdown */
const CountdownDisplay = memo(({ timeLeft }) => {
  const parts = timeLeft.split(':')
  return (
    <div className="fs-countdown-wrap">
      {parts.map((unit, i) => (
        <React.Fragment key={i}>
          <div className="fs-countdown-box"><span className="fs-countdown-digit">{unit}</span></div>
          {i < parts.length - 1 && <span className="fs-countdown-colon">:</span>}
        </React.Fragment>
      ))}
    </div>
  )
})
CountdownDisplay.displayName = 'CountdownDisplay'

/* SaleSection — one flash sale with its own countdown */
const SaleSection = memo(({ sale, onBuyNow, onAddToCart }) => {
  const [timeLeft, setTimeLeft] = useState('00:00:00')
  const [isActive, setIsActive] = useState(false)
  const timerRef = useRef(null)

  const startCountdown = useCallback((ms) => {
    if (timerRef.current) clearInterval(timerRef.current)
    let diff = ms
    timerRef.current = setInterval(() => {
      if (diff <= 0) {
        clearInterval(timerRef.current)
        timerRef.current = null
      } else {
        const d = dayjs.duration(diff)
        setTimeLeft(`${String(Math.floor(d.asHours())).padStart(2,'0')}:${String(d.minutes()).padStart(2,'0')}:${String(d.seconds()).padStart(2,'0')}`)
        diff -= 1000
      }
    }, 1000)
  }, [])

  useEffect(() => {
    const now = Date.now()
    const start = new Date(sale.startTime).getTime()
    const end = new Date(sale.endTime).getTime()
    if (now < start) { setIsActive(false); startCountdown(start - now) }
    else if (now >= start && now <= end) { setIsActive(true); startCountdown(end - now) }
    else { setIsActive(false); setTimeLeft('Đã kết thúc') }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [sale.startTime, sale.endTime, startCountdown])

  const saleStatusText = useMemo(() => {
    if (isActive) return 'KẾT THÚC SAU'
    if (sale.startTime && new Date(sale.startTime) > new Date()) return 'BẮT ĐẦU SAU'
    return 'ĐÃ KẾT THÚC'
  }, [isActive, sale.startTime])

  if (!sale?.items?.length) return null

  return (
    <section className="fs-section">
      <div className="fs-glow-bg" />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="fs-container">
          <div className="fs-header">
            <h2 className="fs-title">
              <span className="fs-title-flash">⚡</span> FLASH SALE{sale.title ? `: ${sale.title}` : ' HÔM NAY'}
            </h2>
            <div className="fs-meta">
              <span className="fs-status-label">{saleStatusText}</span>
              <CountdownDisplay timeLeft={timeLeft} />
            </div>
          </div>
          <div className="fs-scroll-wrap">
            {sale.items.map((item) => (
              <ProductCard key={item._id} item={item} isActive={isActive} onBuyNow={onBuyNow} onAddToCart={onAddToCart} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
})
SaleSection.displayName = 'SaleSection'

const FlashSaleBanner = () => {
  const navigate = useNavigate()
  const { user } = useContext(AuthContext)
  const [sales, setSales] = useState([])
  const [selectedItem, setSelectedItem] = useState(null)
  const [variantModalItem, setVariantModalItem] = useState(null)
  const timerRefs = useRef({})

  const clearTimers = useCallback(() => {
    Object.values(timerRefs.current).forEach(id => clearInterval(id))
    timerRefs.current = {}
  }, [])

  const fetchSales = useCallback(async () => {
    try {
      const res = await apiUser.get("/flash-sales/active")
      if (Array.isArray(res.data) && res.data.length > 0) {
        setSales(res.data)
      } else {
        setSales([])
        clearTimers()
      }
    } catch {
      setSales([])
      clearTimers()
    }
  }, [clearTimers])

  useEffect(() => { fetchSales(); const id = setInterval(fetchSales, 30_000); return () => clearInterval(id) }, [fetchSales])
  useEffect(() => () => clearTimers(), [clearTimers])

  useEffect(() => {
    const handler = (data) => {
      if (data.type === "status-refresh") {
        if (Array.isArray(data.data) && data.data.length > 0) {
          setSales(data.data)
        } else {
          setSales([])
          clearTimers()
        }
      } else {
        setSales(prev => prev.map(sale => {
          if (!sale?.items) return sale
          const idx = sale.items.findIndex(i => i._id === data.flashSaleItemId)
          if (idx < 0) return sale
          const items = sale.items.map((it, i) => i === idx ? { ...it, sold: data.sold } : it)
          return { ...sale, items }
        }))
      }
    }
    socket.on("flash-sale-update", handler)
    return () => socket.off("flash-sale-update")
  }, [clearTimers])

  const handleBuyNow = useCallback((item) => {
    if (!user) {
      toast.warning('Vui lòng đăng nhập để đặt hàng flash sale')
      navigate('/login')
      return
    }
    setSelectedItem(item)
  }, [navigate, user])
  const handleCloseModal = useCallback(() => setSelectedItem(null), [])
  const handleSuccess = useCallback((orderId) => {
    setSelectedItem(null)
    fetchSales()
    if (orderId) {
      navigate('/orders', { state: { highlightOrderId: orderId } })
    } else {
      toast.success('Đặt hàng flash sale thành công!')
    }
  }, [fetchSales, navigate])

  const handleAddToCart = useCallback((item) => {
    if (!user) {
      toast.warning('Vui lòng đăng nhập để thêm vào giỏ hàng')
      navigate('/login')
      return
    }
    setVariantModalItem(item)
  }, [navigate, user])
  const handleVariantSuccess = useCallback(() => {
    setVariantModalItem(null)
  }, [])

  if (sales.length === 0) return null

  return (
    <>
      <style>{`
        .fs-section {
          background: linear-gradient(180deg, #ffffff 0%, #fff1f2 100%);
          padding: 2.5rem 0 3.5rem;
          position: relative;
          overflow: hidden;
        }
        .fs-section + .fs-section { padding-top: 1rem; }
        .fs-glow-bg {
          position: absolute;
          width: 35%; height: 35%;
          background: radial-gradient(circle, rgba(236,72,153,0.1) 0%, transparent 70%);
          top: 10%; left: 5%;
          pointer-events: none;
        }
        .fs-container {
          position: relative; z-index: 2;
          background: #ffffff;
          border: 1px solid #fbcfe8;
          border-radius: 20px;
          padding: 2rem 2rem 1.5rem;
          box-shadow: 0 20px 40px rgba(236,72,153,0.06);
        }
        .fs-header {
          display: flex; align-items: center; justify-content: space-between;
          border-bottom: 1px solid #fce7f3;
          padding-bottom: 1.25rem; margin-bottom: 1.5rem;
          flex-wrap: wrap; gap: 1rem;
        }
        .fs-title {
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 1.5rem; font-weight: 900;
          letter-spacing: -0.02em; text-transform: uppercase;
          color: #111827; margin: 0;
          display: flex; align-items: center; gap: 0.6rem;
        }
        .fs-title-flash {
          color: #ec4899;
          filter: drop-shadow(0 0 8px rgba(236,72,153,0.4));
          animation: flashGlow 1.5s ease-in-out infinite alternate;
        }
        @keyframes flashGlow { from { opacity: 0.7; } to { opacity: 1; } }
        .fs-meta { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; }
        .fs-status-label {
          font-size: 0.7rem; font-weight: 700; letter-spacing: 0.12em;
          color: #be185d; background: #fdf2f8;
          padding: 0.35rem 0.75rem; border-radius: 99px;
          border: 1px solid #fbcfe8;
        }
        .fs-countdown-wrap { display: flex; align-items: center; gap: 0.35rem; }
        .fs-countdown-box {
          background: #111827; border: 1px solid #374151;
          min-width: 2.5rem; height: 2.5rem; border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          font-size: 1rem; font-weight: 800; color: #fff;
          box-shadow: 0 2px 8px rgba(0,0,0,0.12);
        }
        .fs-countdown-colon { color: #ec4899; font-weight: 900; font-size: 1.25rem; }
        .fs-scroll-wrap {
          display: flex; gap: 1rem;
          overflow-x: auto;
          padding: 0.25rem 0.25rem 1rem;
          scrollbar-width: thin;
          scrollbar-color: #f9a8d4 transparent;
        }
        .fs-scroll-wrap::-webkit-scrollbar { height: 6px; }
        .fs-scroll-wrap::-webkit-scrollbar-track { background: transparent; }
        .fs-scroll-wrap::-webkit-scrollbar-thumb { background: #f9a8d4; border-radius: 99px; }
        .fs-card {
          flex-shrink: 0; width: 240px;
          background: #fff; border: 1px solid #f3f4f6;
          border-radius: 16px; display: flex; flex-direction: column;
          position: relative; overflow: hidden;
          transition: border-color 0.3s, transform 0.3s, box-shadow 0.3s;
          box-shadow: 0 2px 8px rgba(0,0,0,0.03);
        }
        .fs-card:hover {
          border-color: #f472b6;
          transform: translateY(-4px);
          box-shadow: 0 12px 28px rgba(236,72,153,0.12);
        }
        .fs-card-img-wrap {
          position: relative; aspect-ratio: 3/4;
          overflow: hidden; background: #f9fafb;
        }
        .fs-card-img {
          width: 100%; height: 100%; object-fit: cover;
          display: block; transition: transform 0.5s ease;
        }
        .fs-card-glare {
          position: absolute; inset: 0; z-index: 3; pointer-events: none;
        }
        .fs-card-overlay {
          position: absolute; inset: 0; z-index: 5;
          background: rgba(0,0,0,0.45); backdrop-filter: blur(2px);
          display: flex; align-items: center; justify-content: center;
          color: #fff; font-size: 0.85rem; font-weight: 800;
          letter-spacing: 0.1em; text-transform: uppercase;
        }
        .fs-card-discount {
          position: absolute; top: 0.6rem; right: 0.6rem;
          background: #ef4444; color: #fff;
          font-size: 0.7rem; font-weight: 800;
          padding: 0.2rem 0.55rem; border-radius: 99px;
          box-shadow: 0 3px 8px rgba(239,68,68,0.3); z-index: 4;
        }
        .fs-card-body {
          padding: 0.85rem 0.9rem 1rem;
          display: flex; flex-direction: column; flex-grow: 1;
        }
        .fs-card-brand {
          font-size: 0.6rem; font-weight: 700;
          letter-spacing: 0.1em; text-transform: uppercase;
          color: #ec4899; margin-bottom: 0.25rem;
        }
        .fs-card-title {
          display: block; width: 100%; text-align: left;
          color: #111827; font-size: 0.8rem; font-weight: 700;
          line-height: 1.4; background: none; border: none;
          padding: 0; cursor: pointer;
          display: -webkit-box; -webkit-line-clamp: 2;
          -webkit-box-orient: vertical; overflow: hidden;
          min-height: 2.25rem; margin-bottom: 0.5rem;
          transition: color 0.2s;
        }
        .fs-card-title:hover { color: #db2777; }
        .fs-card-badges {
          display: flex; justify-content: space-between;
          align-items: center; gap: 0.5rem; margin-bottom: 0.6rem;
        }
        .fs-card-rating { display: flex; align-items: center; gap: 1px; }
        .fs-rating-count { font-size: 0.65rem; color: #9ca3af; margin-left: 0.2rem; }
        .fs-card-sizes { display: flex; gap: 0.25rem; align-items: center; }
        .fs-size-badge {
          font-size: 0.55rem; font-weight: 700; color: #374151;
          background: #f9fafb; padding: 0.15rem 0.4rem;
          border-radius: 999px; border: 1px solid #f3f4f6;
        }
        .fs-sizes-more { font-size: 0.55rem; color: #9ca3af; }
        .fs-card-meta-row {
          display: flex; justify-content: space-between;
          align-items: center; gap: 0.5rem; margin-bottom: 0.65rem;
        }
        .fs-card-colors { display: flex; gap: 0.25rem; align-items: center; }
        .fs-color-dot {
          width: 0.65rem; height: 0.65rem; border-radius: 999px;
          border: 1px solid rgba(0,0,0,0.1);
        }
        .fs-colors-more { font-size: 0.6rem; color: #9ca3af; }
        .fs-card-price-group { display: flex; align-items: baseline; gap: 0.35rem; text-align: right; }
        .fs-card-price { font-size: 1rem; font-weight: 800; color: #be185d; }
        .fs-card-price-original {
          font-size: 0.7rem; text-decoration: line-through; color: #d1d5db;
        }
        .fs-progress-wrap { margin-top: auto; margin-bottom: 0.75rem; }
        .fs-progress-bar {
          width: 100%; height: 5px; background: #fce7f3;
          border-radius: 99px; overflow: hidden; margin-bottom: 0.3rem;
        }
        .fs-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #ec4899, #ef4444);
          border-radius: 99px; transition: width 0.4s ease;
        }
        .fs-progress-label {
          display: flex; justify-content: space-between;
          font-size: 0.6rem; color: #9ca3af;
        }
        .fs-card-actions { display: flex; gap: 0.35rem; }
        .fs-btn-buy {
          flex: 1; display: inline-flex; align-items: center; justify-content: center;
          gap: 0.4rem; padding: 0.6rem 0;
          font-size: 0.75rem; font-weight: 700; border-radius: 10px;
          border: none; cursor: pointer; transition: all 0.2s;
        }
        .fs-btn-buy.is-active { background: linear-gradient(135deg, #ec4899, #db2777); color: #fff; box-shadow: 0 3px 12px rgba(236,72,153,0.25); }
        .fs-btn-buy.is-active:hover { background: linear-gradient(135deg, #db2777, #be185d); transform: translateY(-1px); box-shadow: 0 5px 16px rgba(236,72,153,0.35); }
        .fs-btn-buy.is-disabled { background: #f3f4f6; color: #9ca3af; cursor: not-allowed; }
        .fs-btn-cart { flex-shrink: 0; width: auto; display: inline-flex; align-items: center; justify-content: center; gap: 0.4rem; padding: 0.6rem 0.6rem; font-size: 0.72rem; font-weight: 700; border-radius: 10px; border: none; cursor: pointer; transition: all 0.2s; }
        .fs-btn-cart.is-active { background: linear-gradient(135deg, #10b981, #059669); color: #fff; box-shadow: 0 3px 12px rgba(16,185,129,0.25); }
        .fs-btn-cart.is-active:hover { background: linear-gradient(135deg, #059669, #047857); transform: translateY(-1px); }
        .fs-btn-cart.is-disabled { background: #f3f4f6; color: #9ca3af; cursor: not-allowed; }
        .fs-btn-view {
          width: 2.2rem; height: 2.2rem; flex-shrink: 0;
          display: inline-flex; align-items: center; justify-content: center;
          background: #f9fafb; color: #6b7280;
          border: 1px solid #e5e7eb; border-radius: 10px;
          transition: all 0.2s; cursor: pointer;
        }
        .fs-btn-view:hover { background: #ec4899; color: #fff; border-color: #ec4899; }
      `}</style>

      {sales.map((sale) => <SaleSection key={sale._id} sale={sale} onBuyNow={handleBuyNow} onAddToCart={handleAddToCart} />)}

      {selectedItem && (
        <FlashSaleCheckoutModal
          item={selectedItem}
          onClose={handleCloseModal}
          onSuccess={handleSuccess}
        />
      )}
      {variantModalItem && (
        <VariantSelectionModal
          product={variantModalItem.product}
          isOpen={!!variantModalItem}
          onClose={() => setVariantModalItem(null)}
          onSuccessAndOpenCart={handleVariantSuccess}
        />
      )}
    </>
  )
}

export default memo(FlashSaleBanner)
