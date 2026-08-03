import React, { useState, useRef, useEffect } from 'react'
import { useFlashSale } from '@/context/FlashSaleContext'
import { Star, Heart, ShoppingBag, Eye, Zap } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

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

const ProductCard = ({
  product,
  isFavorite = false,
  onToggleFavorite,
  onAddToCart,
  index = 0,
  rankIndex,
  viewMode = 'grid',
  onClick
}) => {
  const [hovered, setHovered] = useState(false)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const [glare, setGlare] = useState({ x: 50, y: 50 })
  const cardRef = useRef(null)
  const navigate = useNavigate()

  const colors = Array.from(new Set((product?.variations || []).map(v => v.color).filter(Boolean)))
  const sizes = Array.from(new Set((product?.variations || []).map(v => v.size).filter(Boolean)))
  const price = product?.sellingPrice || 0
  const originalPrice = product?.originalPrice || 0
  const hasDiscount = originalPrice > price
  const discountPct = hasDiscount ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0

  // Flash sale info
  const { getFlashInfo, version } = useFlashSale()
  const [flashInfo, setFlashInfo] = useState(() => getFlashInfo(product?._id))
  const [flashCountdown, setFlashCountdown] = useState('')

  useEffect(() => {
    const info = getFlashInfo(product?._id)
    setFlashInfo(info)
  }, [getFlashInfo, version, product?._id])

  function computeCountdown(endMs) {
    if (!endMs) return ''
    const diff = new Date(endMs).getTime() - Date.now()
    if (isNaN(diff) || diff <= 0) return ''
    const h = Math.floor(diff / 3600000)
    const m = Math.floor((diff % 3600000) / 60000)
    const s = Math.floor((diff % 60000) / 1000)
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
  }

  useEffect(() => {
    if (!flashInfo?.endTime) { setFlashCountdown(''); return }
    setFlashCountdown(computeCountdown(flashInfo.endTime))
    const id = setInterval(() => setFlashCountdown(computeCountdown(flashInfo.endTime)), 1000)
    return () => clearInterval(id)
  }, [flashInfo?.endTime, product?._id])

  const displayPrice = flashInfo ? flashInfo.salePrice : price
  const displayOriginal = flashInfo ? price : originalPrice
  const showDiscount = flashInfo || hasDiscount
  const displayDiscountPct = flashInfo ? Math.round(((price - flashInfo.salePrice) / price) * 100) : discountPct

  const handleCardClick = (e) => {
    if (onClick) {
      onClick(e)
    } else if (product?._id) {
      navigate(`/product/${product._id}`)
    }
  }

  const handleMouseMove = (e) => {
    if (!cardRef.current || viewMode === 'list') return
    if (typeof window !== 'undefined' && window.innerWidth < 768) return // disable tilt on small screens
    const rect = cardRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const cx = rect.width / 2
    const cy = rect.height / 2

    const rY = ((x - cx) / cx) * 8
    const rX = -((y - cy) / cy) * 8
    setTilt({ x: rX, y: rY })
    setGlare({ x: (x / rect.width) * 100, y: (y / rect.height) * 100 })
  }

  const handleMouseLeave = () => {
    setHovered(false)
    setTilt({ x: 0, y: 0 })
    setGlare({ x: 50, y: 50 })
  }

  // List mode view
  if (viewMode === 'list') {
    return (
      <div className="bs-card-list-mode flex flex-col sm:flex-row gap-4 bg-white rounded-2xl border border-pink-100 p-4 hover:shadow-xl transition-all duration-300 group relative">
        <div className="w-full sm:w-44 h-44 flex-shrink-0 relative overflow-hidden rounded-xl">
          <img
            src={product?.mainImage}
            alt={product?.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 cursor-pointer"
            onClick={handleCardClick}
          />
          {hasDiscount && (
            <span className="absolute top-2 left-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
              -{discountPct}%
            </span>
          )}
        </div>

        <div className="flex-1 flex flex-col justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-pink-500 mb-1">
              {product?.brand || 'FASHIONSTORE'} {product?.material && `· ${product.material}`}
            </div>
            <h3
              className="font-bold text-gray-900 text-base mb-1.5 cursor-pointer hover:text-pink-600 transition-colors line-clamp-2"
              onClick={handleCardClick}
            >
              {product?.name}
            </h3>
            {product?.shortDescription && (
              <p className="text-xs text-gray-500 mb-2 line-clamp-2">{product.shortDescription}</p>
            )}

            <div className="flex items-center gap-1 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={12}
                  className={i < Math.floor(product?.ratingAverage || 0) ? 'text-amber-400 fill-current' : 'text-gray-300'}
                />
              ))}
              <span className="text-xs text-gray-500 font-medium ml-1">
                {product?.ratingAverage?.toFixed(1) ?? 0} ({product?.reviewCount ?? 0})
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-black text-pink-600">
                {price?.toLocaleString('vi-VN')}₫
              </span>
              {hasDiscount && (
                <span className="text-xs text-gray-400 line-through">
                  {originalPrice?.toLocaleString('vi-VN')}₫
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {onToggleFavorite && (
                <button
                  onClick={(e) => { e.stopPropagation(); onToggleFavorite(product?._id) }}
                  className={`p-2 rounded-full border border-pink-200 transition-colors ${isFavorite ? 'bg-pink-50 text-pink-600 border-pink-400' : 'text-gray-400 hover:text-pink-600'}`}
                >
                  <Heart size={16} className={isFavorite ? 'fill-current' : ''} />
                </button>
              )}
              {onAddToCart && (
                <button
                  onClick={(e) => { e.stopPropagation(); onAddToCart(product) }}
                  className="px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold text-xs rounded-full shadow hover:opacity-90 transition-opacity flex items-center gap-1.5"
                >
                  <ShoppingBag size={14} />
                  <span>Thêm vào giỏ</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Standard Grid view
  return (
    <>
      <style>{`
        .bs-card {
          display: flex;
          flex-direction: column;
          background: #ffffff;
          border: 1px solid #fce7f3;
          border-radius: 16px;
          position: relative;
          padding: 0.6rem;
          opacity: 1;
          box-shadow: 0 4px 15px rgba(236, 72, 153, 0.05);
          transition: transform 0.3s, border-color 0.3s, box-shadow 0.3s;
          cursor: pointer;
        }

        .bs-card:hover {
          border-color: #f472b6;
          box-shadow: 0 8px 20px rgba(236, 72, 153, 0.08);
        }

        .bs-card-img-wrap {
          position: relative;
          aspect-ratio: 3 / 4;
          overflow: hidden;
          border-radius: 12px;
          background: #f9fafb;
        }

        .bs-card-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.25s ease;
        }

        /* subtler hover zoom on desktop only */
        @media (min-width: 768px) {
          .bs-card:hover .bs-card-img { transform: scale(1.03); }
        }

        .bs-card-glare {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 5;
        }

        .bs-card-rank {
          position: absolute;
          top: 0.75rem;
          left: 0.75rem;
          background: #111827;
          color: #ffffff;
          font-size: 0.75rem;
          font-weight: 800;
          padding: 0.2rem 0.5rem;
          border-radius: 6px;
          z-index: 10;
        }

        .bs-card-discount {
          position: absolute;
          top: 0.75rem;
          left: 2.75rem;
          background: #ef4444;
          color: white;
          font-size: 0.6875rem;
          font-weight: 700;
          padding: 0.2rem 0.5rem;
          border-radius: 6px;
          z-index: 10;
        }

        .bs-card-wishlist {
          position: absolute;
          top: 0.75rem;
          right: 0.75rem;
          width: 2.25rem;
          height: 2.25rem;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.9);
          border: 1px solid #fbcfe8;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #6b7280;
          cursor: pointer;
          z-index: 10;
          backdrop-filter: blur(8px);
          box-shadow: 0 4px 10px rgba(0,0,0,0.08);
          transition: background 0.3s, color 0.3s, transform 0.2s;
        }

        .bs-card-wishlist:hover {
          color: #ef4444;
          background: #ffffff;
          transform: scale(1.1);
        }

        .bs-card-wishlist.is-favorite {
          background: #ef4444;
          color: white;
          border-color: #ef4444;
        }

        .bs-card-actions {
          position: absolute;
          bottom: 0.5rem;
          left: 0.5rem;
          right: 0.5rem;
          padding: 0.5rem;
          background: linear-gradient(to top, rgba(17,24,39,0.6) 0%, transparent 100%);
          display: flex;
          gap: 0.5rem;
          opacity: 0;
          transform: translateY(6px);
          transition: opacity 0.2s, transform 0.2s;
          z-index: 9;
        }

        .bs-card:hover .bs-card-actions {
          opacity: 1;
          transform: translateY(0);
        }

        .bs-btn-action {
          height: 2.25rem;
          border: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 0.75rem;
          font-weight: 700;
          border-radius: 8px;
        }

        .bs-btn-primary-action {
          flex: 1;
          background: linear-gradient(135deg, #ec4899 0%, #db2777 100%);
          color: #ffffff;
          gap: 0.4rem;
          transition: background 0.18s;
        }

        .bs-btn-primary-action:hover {
          background: linear-gradient(135deg, #db2777 0%, #be185d 100%);
        }

        .bs-btn-view-action {
          width: 2.25rem;
          background: #ffffff;
          color: #111827;
          border: 1px solid #e5e7eb;
          transition: background 0.3s;
        }

        .bs-btn-view-action:hover {
          background: #ec4899;
          color: #ffffff;
          border-color: #ec4899;
        }

        .bs-card-info {
          padding: 1.25rem 0.4rem 0.4rem;
          display: flex;
          flex-direction: column;
          flex-grow: 1;
        }

        .bs-card-meta {
          font-size: 0.625rem;
          font-weight: 700;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: #ec4899;
          margin-bottom: 0.35rem;
        }

        .bs-card-title {
          font-size: 0.875rem;
          font-weight: 600;
          line-height: 1.4;
          color: #111827;
          margin: 0.4rem 0 0.5rem;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          transition: color 0.3s;
        }

        .bs-card:hover .bs-card-title {
          color: #be185d;
        }

        .bs-card-rating-sizes {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .bs-card-rating {
          display: flex;
          align-items: center;
          gap: 0.15rem;
        }

        .bs-rating-count {
          font-size: 0.6875rem;
          color: #6b7280;
          margin-left: 0.25rem;
        }

        .bs-card-sizes {
          display: flex;
          gap: 0.25rem;
          align-items: center;
        }

        .bs-size-badge {
          font-size: 0.625rem;
          font-weight: 600;
          color: #374151;
          border: 1px solid #e5e7eb;
          background: #f9fafb;
          padding: 0.1rem 0.35rem;
          border-radius: 4px;
        }

        .bs-sizes-more {
          font-size: 0.625rem;
          color: #9ca3af;
        }

        .bs-card-footer {
          margin-top: auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 0.5rem;
          border-top: 1px solid #fce7f3;
        }

        .bs-card-price-group {
          display: flex;
          align-items: baseline;
          gap: 0.4rem;
        }

        .bs-card-price {
          font-size: 0.9375rem;
          font-weight: 800;
          color: #be185d;
        }

        .bs-card-price-original {
          font-size: 0.75rem;
          text-decoration: line-through;
          color: #9ca3af;
        }

        .bs-card-colors {
          display: flex;
          gap: 0.25rem;
          align-items: center;
        }

        .bs-color-dot {
          width: 0.75rem;
          height: 0.75rem;
          border-radius: 50%;
          border: 1px solid rgba(0, 0, 0, 0.15);
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .bs-colors-more {
          font-size: 0.625rem;
          color: #9ca3af;
        }

        @media (max-width: 767px) {
          .bs-card {
            padding: 0 !important;
            border-radius: 10px !important;
            transform: none !important;
            border: 1px solid #fce7f3 !important;
          }
          .bs-card-img-wrap {
            aspect-ratio: 1 / 1 !important;
            border-radius: 10px 10px 0 0 !important;
          }
          /* make actions accessible and tappable on mobile: full-width primary button */
          .bs-card-actions {
            opacity: 1 !important;
            transform: none !important;
            position: relative !important;
            bottom: auto !important;
            right: auto !important;
            left: auto !important;
            background: none !important;
            padding: 0.5rem 0 !important;
            display: flex !important;
            flex-direction: column !important;
            gap: 0.5rem !important;
          }
          .bs-btn-primary-action {
            width: 100% !important;
            height: 2.8rem !important;
            border-radius: 12px !important;
            padding: 0 0.75rem !important;
            min-width: auto !important;
            flex: none !important;
            box-shadow: 0 6px 18px rgba(236, 72, 153, 0.12) !important;
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
          }
          .bs-btn-primary-action span {
            display: inline-block !important;
          }
          .bs-btn-view-action {
            width: 40px !important;
            height: 40px !important;
            border-radius: 8px !important;
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            margin: 0 auto !important;
          }
          .bs-card-rank {
            font-size: 0.55rem !important;
            padding: 0.1rem 0.3rem !important;
            top: 0.3rem !important;
            left: 0.3rem !important;
            border-radius: 4px !important;
          }
          .bs-card-discount {
            font-size: 0.5rem !important;
            padding: 0.08rem 0.2rem !important;
            top: 0.3rem !important;
            left: 1.7rem !important;
          }
          .bs-card-wishlist {
            top: 0.3rem !important;
            right: 0.3rem !important;
            width: 1.4rem !important;
            height: 1.4rem !important;
          }
          .bs-card-info {
            padding: 0.35rem 0.4rem 0.3rem !important;
            transform: none !important;
          }
          .bs-card-meta {
            font-size: 0.5rem !important;
            letter-spacing: 0.04em !important;
            margin-bottom: 0.05rem !important;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
          .bs-card-title {
            font-size: 0.7rem !important;
            line-height: 1.25 !important;
            margin: 0 0 0.1rem !important;
            -webkit-line-clamp: 2 !important;
          }
          .bs-card-rating-sizes {
            margin-bottom: 0.1rem !important;
          }
          .bs-card-rating {
            gap: 0.05rem !important;
          }
          .bs-rating-count {
            font-size: 0.5rem !important;
          }
          .bs-card-sizes {
            gap: 0.15rem !important;
          }
          .bs-size-badge {
            font-size: 0.45rem !important;
            padding: 0.02rem 0.15rem !important;
          }
          .bs-sizes-more {
            font-size: 0.4rem !important;
          }
          .bs-card-footer {
            gap: 0 !important;
          }
          .bs-card-price {
            font-size: 0.75rem !important;
          }
          .bs-card-price-original {
            font-size: 0.55rem !important;
          }
          .bs-color-dot {
            width: 0.45rem !important;
            height: 0.45rem !important;
          }
          .bs-colors-more {
            font-size: 0.4rem !important;
          }
        }
      `}</style>

      <div
        ref={cardRef}
        className={`bs-card group ${hovered ? 'is-hovered' : ''}`}
        onMouseEnter={() => setHovered(true)}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleCardClick}
        style={{
          animationDelay: `${index * 60}ms`,
          transform: (typeof window !== 'undefined' && window.innerWidth >= 768 && viewMode === 'grid' && hovered)
            ? `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(1.02)`
            : 'none',
          transition: hovered ? 'transform 0.12s linear, border-color 0.2s' : 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.2s'
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

          {hovered && (
            <div
              className="bs-card-glare"
              style={{
                background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255,255,255,0.18) 0%, transparent 60%)`
              }}
            />
          )}

          {/* Rank indicator */}
          {rankIndex !== undefined && rankIndex !== null && (
            <div className="bs-card-rank">
              <span>{typeof rankIndex === 'number' ? String(rankIndex + 1).padStart(2, '0') : rankIndex}</span>
            </div>
          )}

          {/* Flash Sale tag */}
          {flashInfo && (
            <div className="flash-sale-badge" style={{ background: 'linear-gradient(135deg, #ec4899, #ef4444)', color: '#fff', position: 'absolute', zIndex: 10, left: '0.6rem', bottom: '0.6rem', top: 'auto', right: 'auto', display: 'flex', alignItems: 'center', gap: '0.3rem', borderRadius: '999px', boxShadow: '0 2px 8px rgba(236,72,153,0.4)', animation: 'flashPulse 1.5s ease-in-out infinite' }}>
              <Zap className="w-4 h-4 md:w-5 md:h-5" /> <span className="text-[11px] md:text-sm font-black">FLASH SALE -{displayDiscountPct}%</span>
            </div>
          )}

          {/* Discount tag */}
          {hasDiscount && (
            <div className="bs-card-discount">
              -{discountPct}%
            </div>
          )}

          {/* Wishlist heart */}
          {onToggleFavorite && (
            <button
              onClick={(e) => { e.stopPropagation(); onToggleFavorite(product?._id) }}
              className={`bs-card-wishlist ${isFavorite ? 'is-favorite' : ''}`}
              aria-label="Thêm vào yêu thích"
            >
              <Heart size={14} className={isFavorite ? 'fill-current' : ''} />
            </button>
          )}

          {/* Quick action bottom panel */}
          {onAddToCart && (
            <div className="bs-card-actions">
              <button
                onClick={(e) => { e.stopPropagation(); onAddToCart(product) }}
                className="bs-btn-action bs-btn-primary-action"
              >
                <ShoppingBag size={14} />
                <span>Thêm vào giỏ</span>
              </button>
              <span
                className="bs-btn-action bs-btn-view-action"
                onClick={e => { e.stopPropagation(); handleCardClick(e) }}
              >
                <Eye size={14} />
              </span>
            </div>
          )}
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
          {flashInfo && flashCountdown && (
            <div className="flash-countdown-line" style={{ marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.25rem 0.5rem', background: 'linear-gradient(135deg, #fef2f2, #fff1f2)', borderRadius: '8px', border: '1px solid #fecdd3' }}>
              <Zap className="w-3.5 h-3.5 md:w-4 md:h-4 text-red-500" />
              <span className="text-[11px] md:text-sm font-black text-red-500 tracking-tight whitespace-nowrap">{flashCountdown}</span>
            </div>
          )}
          <div className="bs-card-footer">
            <div className="bs-card-price-group">
              <span className="bs-card-price">
                {displayPrice?.toLocaleString('vi-VN')}₫
              </span>
              {showDiscount && (
                <span className="bs-card-price-original">
                  {displayOriginal?.toLocaleString('vi-VN')}₫
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
    </>
  )
}

export default ProductCard
