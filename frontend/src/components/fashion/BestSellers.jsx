/* Hallmark · macrostructure: Marquee Hero · section: BestSellers · tone: Vercel Holographic */
import React, { useContext, useEffect, useRef, useState } from 'react'
import { Star, ShoppingBag, Heart, Sparkles, TrendingUp, Eye } from 'lucide-react'
import api from '@/service/api'
import { Link, useNavigate } from 'react-router-dom'
import SideCartDrawer from './SideCartDrawer'
import { toast } from 'react-toastify'
import { WishlistContext } from '@/context/WishlistContext'
import { AuthContext } from '@/context/AuthContext'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

const VariantSelectionModal = React.lazy(() => import('./VariantSelectionModal'))

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

const SkeletonCard = () => (
  <div className="bs-card-skeleton">
    <div className="bs-skeleton-img" />
    <div className="bs-skeleton-info">
      <div className="bs-skeleton-line bs-w-1-4" />
      <div className="bs-skeleton-line bs-w-4-5" />
      <div className="bs-skeleton-line bs-w-3-5" />
    </div>
  </div>
)

const ProductCard = ({ product, isFavorite, onToggleFavorite, onAddToCart, index }) => {
  const [hovered, setHovered] = useState(false)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const [glare, setGlare] = useState({ x: 50, y: 50 })
  const cardRef = useRef(null)
  const navigate = useNavigate()

  const colors = Array.from(new Set((product?.variations || []).map(v => v.color).filter(Boolean)))
  const sizes  = Array.from(new Set((product?.variations || []).map(v => v.size).filter(Boolean)))
  const hasDiscount = product?.originalPrice > product?.sellingPrice
  const discountPct = hasDiscount
    ? Math.round(((product.originalPrice - product.sellingPrice) / product.originalPrice) * 100) : 0

  const rankLabels = ['01', '02', '03', '04', '05', '06', '07', '08']

  const handleMouseMove = (e) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const cx = rect.width / 2
    const cy = rect.height / 2
    
    // Smooth 3D tilt angles
    const rY = ((x - cx) / cx) * 10
    const rX = -((y - cy) / cy) * 10
    setTilt({ x: rX, y: rY })
    setGlare({ x: (x / rect.width) * 100, y: (y / rect.height) * 100 })
  }

  const handleMouseLeave = () => {
    setHovered(false)
    setTilt({ x: 0, y: 0 })
    setGlare({ x: 50, y: 50 })
  }

  return (
    <div
      ref={cardRef}
      className={`bs-card group ${hovered ? 'is-hovered' : ''}`}
      onMouseEnter={() => setHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={() => navigate(`/product/${product?._id}`)}
      style={{
        animationDelay: `${index * 80}ms`,
        transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${hovered ? 1.02 : 1})`,
        transition: hovered ? 'transform 0.05s linear, border-color 0.3s' : 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.3s'
      }}
    >
      {/* Image container */}
      <div className="bs-card-img-wrap">
        <img
          src={product?.mainImage}
          alt={product?.name}
          loading="lazy"
          className="bs-card-img"
        />

        {/* Dynamic gloss sheen glare overlay */}
        {hovered && (
          <div
            className="bs-card-glare"
            style={{
              background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255,255,255,0.18) 0%, transparent 60%)`
            }}
          />
        )}

        {/* Rank indicator - Layered Z-axis */}
        <div className="bs-card-rank">
          <span>{rankLabels[index] || index + 1}</span>
        </div>

        {/* Discount tag - Layered Z-axis */}
        {hasDiscount && (
          <div className="bs-card-discount">
            -{discountPct}%
          </div>
        )}

        {/* Wishlist heart - Layered Z-axis */}
        <button
          onClick={(e) => { e.stopPropagation(); onToggleFavorite(product._id) }}
          className={`bs-card-wishlist ${isFavorite ? 'is-favorite' : ''}`}
          aria-label="Thêm vào yêu thích"
        >
          <Heart size={14} className={isFavorite ? 'fill-current' : ''} />
        </button>

        {/* Frosted Glass Quick action bottom panel */}
        <div className="bs-card-actions">
          <button
            onClick={(e) => { e.stopPropagation(); onAddToCart(product) }}
            className="bs-btn-action bs-btn-primary-action"
          >
            <ShoppingBag size={14} />
            Thêm vào giỏ
          </button>
          <span
            className="bs-btn-action bs-btn-view-action"
            onClick={e => { e.stopPropagation(); navigate(`/product/${product?._id}`) }}
          >
            <Eye size={14} />
          </span>
        </div>
      </div>

      {/* Info container */}
      <div className="bs-card-info">
        <div className="bs-card-meta">
          <span className="bs-card-brand">{product?.brand || 'FASHIONSTORE'}</span>
          {product?.material && <span className="bs-card-material"> · {product.material}</span>}
        </div>

        <h3 className="bs-card-title">{product?.name}</h3>

        {/* Star Rating and Sizes */}
        <div className="bs-card-rating-sizes">
          <div className="bs-card-rating">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={11}
                className={i < Math.floor(product?.ratingAverage || 0) ? 'text-amber-400 fill-current' : 'text-gray-600'}
              />
            ))}
            <span className="bs-rating-count">({product?.reviewCount ?? 0})</span>
          </div>

          {sizes.length > 0 && (
            <div className="bs-card-sizes">
              {sizes.slice(0, 3).map((s, i) => (
                <span key={i} className="bs-size-badge">{s}</span>
              ))}
              {sizes.length > 3 && <span className="bs-sizes-more">+{sizes.length - 3}</span>}
            </div>
          )}
        </div>

        {/* Price and Colors */}
        <div className="bs-card-footer">
          <div className="bs-card-price-group">
            <span className="bs-card-price">
              {product?.sellingPrice?.toLocaleString('vi-VN')}₫
            </span>
            {hasDiscount && (
              <span className="bs-card-price-original">
                {product?.originalPrice?.toLocaleString('vi-VN')}₫
              </span>
            )}
          </div>

          {colors.length > 0 && (
            <div className="bs-card-colors">
              {colors.slice(0, 4).map((c, idx) => (
                <span
                  key={idx}
                  title={c}
                  className="bs-color-dot"
                  style={{ backgroundColor: colorMap[c] || '#CBD5E1' }}
                />
              ))}
              {colors.length > 4 && (
                <span className="bs-colors-more">+{colors.length - 4}</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const BestSellers = () => {
  const [products, setProducts]   = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [isVariantModalOpen, setIsVariantModalOpen] = useState(false)
  const [isCartDrawerOpen, setIsCartDrawerOpen]   = useState(false)
  const [favorites, setFavorites] = useState([])
  
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 })
  const [showCursor, setShowCursor] = useState(false)
  
  const { fetchWishlist } = useContext(WishlistContext)
  const { user } = useContext(AuthContext)
  const containerRef = useRef(null)
  const sectionRef = useRef(null)

  const getBestSellers = async () => {
    try {
      const res = await api.get('/products/best-sellers')
      setProducts(res.data || [])
    } catch (e) {
      console.error(e)
    }
  }

  const getFavorites = async () => {
    try {
      const res = await api.get('/users/favorites')
      setFavorites((res.data || []).map(p => p._id ?? p.id))
    } catch (e) { /* guest */ }
  }

  useEffect(() => {
    const init = async () => {
      setIsLoading(true)
      await Promise.allSettled([
        getBestSellers(),
        user ? getFavorites() : Promise.resolve()
      ])
      setIsLoading(false)
    }
    init()
  }, [])

  useEffect(() => { if (user) getFavorites() }, [user])

  const toggleFavorite = async (productId) => {
    if (!user) { toast.info('Vui lòng đăng nhập để thêm yêu thích'); return }
    const already = favorites.includes(productId)
    setFavorites(prev => already ? prev.filter(id => id !== productId) : [...prev, productId])
    try {
      if (already) {
        await api.delete(`/users/favorites/${productId}`)
        toast.info('Đã xóa khỏi yêu thích 💔')
      } else {
        await api.post(`/users/favorites/${productId}`, {})
        toast.success('Đã thêm vào yêu thích ❤️')
      }
      fetchWishlist()
    } catch {
      toast.error('Có lỗi xảy ra')
      await getFavorites()
    }
  }

  useGSAP(() => {
    if (isLoading) return
    const ctx = gsap.context(() => {
      gsap.from('.bs-header-anim', {
        scrollTrigger: { trigger: containerRef.current, start: 'top 85%' },
        y: 35, opacity: 0, duration: 0.9, ease: 'power3.out'
      })
    }, containerRef)
    ScrollTrigger.refresh()
    return () => ctx.revert()
  }, { scope: containerRef, dependencies: [isLoading] })

  const handleMouseMove = (e) => {
    if (!sectionRef.current) return
    const rect = sectionRef.current.getBoundingClientRect()
    setCursorPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    })
  }

  return (
    <>
      <style>{`
        .bs-section {
          background-color: #030306;
          padding: 8rem 0;
          position: relative;
          overflow: hidden;
          cursor: crosshair;
        }

        .bs-section::before {
          content: '';
          display: block;
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: rgba(255, 255, 255, 0.05);
        }

        .bs-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 2rem;
          position: relative;
          z-index: 2;
        }

        /* Neon glow backdrop */
        .bs-glow-bg {
          position: absolute;
          top: 25%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 55%;
          height: 55%;
          background: radial-gradient(circle, rgba(168, 85, 247, 0.06) 0%, transparent 70%);
          pointer-events: none;
          z-index: 1;
        }

        /* Custom Floating Cursor */
        .bs-custom-cursor {
          position: absolute;
          width: 5.5rem;
          height: 5.5rem;
          background: #ffffff;
          color: #000000;
          border-radius: 50%;
          pointer-events: none;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-body, 'Inter', sans-serif);
          font-size: 0.6875rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          z-index: 99;
          transform: translate(-50%, -50%) scale(0);
          opacity: 0;
          transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.3s ease;
          box-shadow: 0 12px 30px rgba(255, 255, 255, 0.15);
        }

        .bs-section:hover .bs-custom-cursor {
          transform: translate(-50%, -50%) scale(1);
          opacity: 1;
        }

        .bs-header {
          text-align: center;
          margin-bottom: 5.5rem;
        }

        .bs-eyebrow {
          font-family: var(--font-body, 'Inter', sans-serif);
          font-size: 0.6875rem;
          font-weight: 600;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: #a855f7;
          margin-bottom: 1rem;
        }

        .bs-title {
          font-family: var(--font-display, 'Playfair Display', serif);
          font-size: clamp(2rem, 4vw, 3.5rem);
          font-weight: 900;
          line-height: 1.1;
          color: white;
          margin: 0 0 1rem;
        }

        .bs-title em {
          font-style: italic;
          color: #a855f7;
          font-weight: 400;
        }

        .bs-desc {
          font-size: 0.9375rem;
          line-height: 1.6;
          color: rgba(255, 255, 255, 0.5);
          max-width: 50ch;
          margin: 0 auto;
        }

        .bs-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.5rem;
        }

        @media (min-width: 1024px) {
          .bs-grid {
            grid-template-columns: repeat(4, 1fr);
            gap: 2.5rem;
          }
        }

        /* 3D Holographic Card styling */
        .bs-card {
          display: flex;
          flex-direction: column;
          background: rgba(255, 255, 255, 0.01);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 16px;
          position: relative;
          padding: 0.75rem;
          opacity: 0;
          animation: bsFadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          cursor: none;
          transform-style: preserve-3d;
          will-change: transform;
        }

        @keyframes bsFadeIn {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .bs-card-img-wrap {
          position: relative;
          aspect-ratio: 3 / 4;
          overflow: hidden;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.01);
          border: 1px solid rgba(255, 255, 255, 0.05);
          transform: translateZ(10px);
          transform-style: preserve-3d;
        }

        .bs-card:hover .bs-card-img-wrap {
          border-color: #a855f7;
        }

        .bs-card-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .bs-card-glare {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 5;
        }

        /* Z-indexed components */
        .bs-card-rank {
          position: absolute;
          top: 1rem;
          left: 1rem;
          background: #ffffff;
          color: #000000;
          font-family: var(--font-display, 'Playfair Display', serif);
          font-size: 0.875rem;
          font-weight: 700;
          font-style: italic;
          padding: 0.3rem 0.6rem;
          border-radius: 4px;
          z-index: 10;
          transform: translateZ(25px);
        }

        .bs-card-discount {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: #ef4444;
          color: white;
          font-family: var(--font-body, 'Inter', sans-serif);
          font-size: 0.6875rem;
          font-weight: 700;
          padding: 0.3rem 0.5rem;
          border-radius: 4px;
          z-index: 10;
          transform: translateZ(25px);
        }

        .bs-card-wishlist {
          position: absolute;
          bottom: 1rem;
          right: 1rem;
          width: 2.25rem;
          height: 2.25rem;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(255, 255, 255, 0.7);
          cursor: pointer;
          z-index: 10;
          transform: translateZ(25px);
          backdrop-filter: blur(8px);
          transition: background 0.3s, color 0.3s, transform 0.3s;
        }

        .bs-card-wishlist:hover {
          color: #ef4444;
          transform: translateZ(25px) scale(1.1);
        }

        .bs-card-wishlist.is-favorite {
          background: #ef4444;
          color: white;
          border-color: #ef4444;
        }

        /* Glassmorphic quick action menu on hover */
        .bs-card-actions {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 1.25rem;
          background: linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%);
          display: flex;
          gap: 0.5rem;
          opacity: 0;
          transform: translateY(12px) translateZ(30px);
          transition: opacity 0.4s, transform 0.4s;
          z-index: 9;
        }

        .bs-card:hover .bs-card-actions {
          opacity: 1;
          transform: translateY(0) translateZ(30px);
        }

        .bs-btn-action {
          height: 2.5rem;
          border: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-family: var(--font-body, 'Inter', sans-serif);
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          border-radius: 6px;
        }

        .bs-btn-primary-action {
          flex: 1;
          background: #ffffff;
          color: #000000;
          gap: 0.5rem;
          transition: background 0.3s, transform 0.2s;
        }

        .bs-btn-primary-action:hover {
          background: #a855f7;
          color: white;
        }

        .bs-btn-view-action {
          width: 2.5rem;
          background: rgba(255, 255, 255, 0.05);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(8px);
          transition: background 0.3s;
        }

        .bs-btn-view-action:hover {
          background: #a855f7;
          border-color: #a855f7;
        }

        .bs-card-info {
          padding: 1.5rem 0.5rem 0.5rem;
          display: flex;
          flex-direction: column;
          flex-grow: 1;
          transform: translateZ(20px);
        }

        .bs-card-meta {
          font-family: var(--font-body, 'Inter', sans-serif);
          font-size: 0.625rem;
          font-weight: 600;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: #a855f7;
          margin-bottom: 0.5rem;
        }

        .bs-card-title {
          font-family: var(--font-body, 'Inter', sans-serif);
          font-size: 0.875rem;
          font-weight: 500;
          line-height: 1.45;
          color: rgba(255, 255, 255, 0.9);
          margin: 0 0 0.75rem;
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
          transition: color 0.3s;
        }

        .bs-card:hover .bs-card-title {
          color: #a855f7;
        }

        .bs-card-rating-sizes {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
        }

        .bs-card-rating {
          display: flex;
          align-items: center;
          gap: 0.15rem;
        }

        .bs-rating-count {
          font-family: var(--font-body, 'Inter', sans-serif);
          font-size: 0.6875rem;
          color: rgba(255, 255, 255, 0.4);
          margin-left: 0.25rem;
        }

        .bs-card-sizes {
          display: flex;
          gap: 0.25rem;
          align-items: center;
        }

        .bs-size-badge {
          font-family: var(--font-body, 'Inter', sans-serif);
          font-size: 0.625rem;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.15);
          padding: 0.1rem 0.35rem;
          border-radius: 2px;
        }

        .bs-sizes-more {
          font-family: var(--font-body, 'Inter', sans-serif);
          font-size: 0.625rem;
          color: rgba(255, 255, 255, 0.4);
        }

        .bs-card-footer {
          margin-top: auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 0.75rem;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
        }

        .bs-card-price-group {
          display: flex;
          align-items: baseline;
          gap: 0.5rem;
        }

        .bs-card-price {
          font-family: var(--font-body, 'Inter', sans-serif);
          font-size: 0.9375rem;
          font-weight: 700;
          color: white;
        }

        .bs-card-price-original {
          font-family: var(--font-body, 'Inter', sans-serif);
          font-size: 0.75rem;
          text-decoration: line-through;
          color: rgba(255, 255, 255, 0.4);
        }

        .bs-card-colors {
          display: flex;
          gap: 0.25rem;
          align-items: center;
        }

        .bs-color-dot {
          width: 0.625rem;
          height: 0.625rem;
          border-radius: 50%;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .bs-colors-more {
          font-family: var(--font-body, 'Inter', sans-serif);
          font-size: 0.625rem;
          color: rgba(255, 255, 255, 0.4);
        }

        /* Action buttons bar */
        .bs-action-bar {
          text-align: center;
          margin-top: 4.5rem;
        }

        .bs-btn-all {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: #ffffff;
          color: #000000;
          font-family: var(--font-body, 'Inter', sans-serif);
          font-size: 0.8125rem;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          padding: 0.875rem 2.25rem;
          border: none;
          cursor: pointer;
          transition: background 0.3s, transform 0.15s, box-shadow 0.3s;
          text-decoration: none;
        }

        .bs-btn-all:hover {
          background: #a855f7;
          color: #ffffff;
          transform: translateY(-2px);
          box-shadow: 0 0 25px rgba(168, 85, 247, 0.35);
        }

        @media (max-width: 1023px) {
          .bs-section { cursor: default; }
          .bs-custom-cursor { display: none; }
          .bs-card { cursor: pointer; transform: none !important; }
        }
      `}</style>

      <section
        ref={sectionRef}
        className="bs-section"
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setShowCursor(true)}
        onMouseLeave={() => setShowCursor(false)}
      >
        <div className="bs-bg-glow" />

        {/* Custom cursor follower */}
        {showCursor && (
          <div
            className="bs-custom-cursor"
            style={{
              left: `${cursorPos.x}px`,
              top: `${cursorPos.y}px`
            }}
          >
            Chọn mua
          </div>
        )}

        <div className="bs-container" ref={containerRef}>
          <div className="bs-header bs-header-anim">
            <p className="bs-eyebrow">Xu hướng</p>
            <h2 className="bs-title">Sản Phẩm <em>Bán Chạy</em></h2>
            <p className="bs-desc">
              Những thiết kế thịnh hành được yêu thích nhất trong 30 ngày qua.
            </p>
          </div>

          <div className="bs-grid">
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
              : products.slice(0, 8).map((product, index) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    index={index}
                    isFavorite={favorites.includes(product._id)}
                    onToggleFavorite={toggleFavorite}
                    onAddToCart={(p) => {
                      setSelectedProduct(p)
                      setIsVariantModalOpen(true)
                    }}
                  />
                ))
            }
          </div>

          {/* Empty state */}
          {!isLoading && products.length === 0 && (
            <div className="text-center py-20 text-gray-500">
              <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-base">Chưa có sản phẩm bán chạy</p>
            </div>
          )}

          {/* View all button */}
          {!isLoading && products.length > 0 && (
            <div className="bs-action-bar">
              <Link to="/products" className="bs-btn-all" id="bs-btn-view-all">
                Xem tất cả sản phẩm
                <Sparkles size={14} />
              </Link>
            </div>
          )}
        </div>

        {/* Modals */}
        {isVariantModalOpen && selectedProduct && (
          <React.Suspense fallback={<div />}>
            <VariantSelectionModal
              product={selectedProduct}
              isOpen={isVariantModalOpen}
              onClose={() => setIsVariantModalOpen(false)}
              onSuccessAndOpenCart={() => setIsCartDrawerOpen(true)}
            />
          </React.Suspense>
        )}
        <SideCartDrawer isOpen={isCartDrawerOpen} onClose={() => setIsCartDrawerOpen(false)} />
      </section>
    </>
  )
}

export default BestSellers
