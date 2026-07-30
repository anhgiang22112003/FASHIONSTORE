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

import ProductCard from './ProductCard'

const BestSellers = () => {
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [isVariantModalOpen, setIsVariantModalOpen] = useState(false)
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false)
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
          background: linear-gradient(180deg, #ffffff 0%, #fff1f2 100%);
          padding: 5rem 0;
          position: relative;
          overflow: hidden;
          color: #111827;
        }

        .bs-glow-bg {
          position: absolute;
          top: 25%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 55%;
          height: 55%;
          background: radial-gradient(circle, rgba(236, 72, 153, 0.08) 0%, transparent 70%);
          pointer-events: none;
          z-index: 1;
        }

        .bs-header {
          text-align: center;
          margin-bottom: 3.5rem;
        }

        .bs-eyebrow {
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #ec4899;
          margin-bottom: 0.5rem;
        }

        .bs-title {
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          font-size: clamp(1.8rem, 3.5vw, 2.75rem);
          font-weight: 900;
          line-height: 1.15;
          color: #111827;
          margin: 0 0 0.75rem;
        }

        .bs-title em {
          font-style: normal;
          color: #db2777;
        }

        .bs-desc {
          font-size: 0.9375rem;
          line-height: 1.6;
          color: #4b5563;
          max-width: 50ch;
          margin: 0 auto;
        }

        .bs-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
        }

        @media (min-width: 640px) {
          .bs-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 1.5rem;
          }
        }

        @media (min-width: 768px) {
          .bs-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 1.75rem;
          }
        }

        @media (min-width: 1024px) {
          .bs-grid {
            grid-template-columns: repeat(4, 1fr);
            gap: 2rem;
          }
        }

        .bs-card {
          display: flex;
          flex-direction: column;
          background: #ffffff;
          border: 1px solid #fce7f3;
          border-radius: 16px;
          position: relative;
          padding: 0.6rem;
          opacity: 0;
          animation: bsFadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          box-shadow: 0 4px 15px rgba(236, 72, 153, 0.05);
          transition: transform 0.3s, border-color 0.3s, box-shadow 0.3s;
        }

        .bs-card:hover {
          border-color: #f472b6;
          box-shadow: 0 15px 30px rgba(236, 72, 153, 0.15);
        }

        @keyframes bsFadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
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
          transition: transform 0.6s ease;
        }

        .bs-card:hover .bs-card-img {
          transform: scale(1.05);
        }

        /* Top Left Rank */
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

        /* Top Left Discount next to rank */
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

        /* TOP RIGHT WISHLIST HEART ICON */
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

        /* Quick action bottom bar */
        .bs-card-actions {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 0.75rem;
          background: linear-gradient(to top, rgba(17,24,39,0.8) 0%, transparent 100%);
          display: flex;
          gap: 0.4rem;
          opacity: 0;
          transform: translateY(8px);
          transition: opacity 0.3s, transform 0.3s;
          z-index: 9;
        }

        .bs-card:hover .bs-card-actions {
          opacity: 1;
          transform: translateY(0);
        }

        @media (max-width: 767px) {
          .bs-section {
            padding: 2.5rem 0 !important;
          }
          .bs-header {
            margin-bottom: 1.5rem !important;
          }
          .bs-title {
            font-size: 1.4rem !important;
          }
          .bs-desc {
            font-size: 0.8rem !important;
          }
          .bs-grid {
            gap: 0.4rem !important;
          }
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
          /* Nút giỏ hàng = icon tròn hồng góc phải dưới ảnh */
          .bs-card-actions {
            opacity: 1 !important;
            transform: none !important;
            position: absolute !important;
            bottom: 0.35rem !important;
            right: 0.35rem !important;
            left: auto !important;
            background: none !important;
            padding: 0 !important;
          }
          .bs-btn-primary-action {
            width: 1.8rem !important;
            height: 1.8rem !important;
            border-radius: 50% !important;
            padding: 0 !important;
            min-width: auto !important;
            flex: none !important;
            box-shadow: 0 2px 8px rgba(236, 72, 153, 0.4) !important;
          }
          .bs-btn-primary-action span {
            display: none !important;
          }
          .bs-btn-view-action {
            display: none !important;
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
          .bs-action-bar {
            margin-top: 1.5rem !important;
          }
          .bs-btn-all {
            font-size: 0.7rem !important;
            padding: 0.6rem 1.5rem !important;
          }
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
          transition: background 0.3s;
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
          padding: 1.5rem 0.5rem 0.5rem;
          display: flex;
          flex-direction: column;
          flex-grow: 1;
          transform: translateZ(20px);
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

        .bs-card-skeleton {
          background: #ffffff;
          border: 1px solid #fce7f3;
          border-radius: 16px;
          padding: 0.6rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          animation: pulse 1.8s infinite ease-in-out;
        }

        .bs-skeleton-img {
          width: 100%;
          aspect-ratio: 3 / 4;
          background: #fbcfe8;
          opacity: 0.35;
          border-radius: 12px;
        }

        .bs-skeleton-info {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          padding: 0.25rem;
        }

        .bs-skeleton-line {
          height: 0.75rem;
          background: #fbcfe8;
          opacity: 0.4;
          border-radius: 4px;
        }

        .bs-w-1-4 { width: 30%; }
        .bs-w-4-5 { width: 85%; height: 0.9rem; }
        .bs-w-3-5 { width: 50%; }

        .bs-colors-more {
          font-size: 0.625rem;
          color: #9ca3af;
        }

        /* Action buttons bar */
        .bs-action-bar {
          text-align: center;
          margin-top: 3.5rem;
        }

        .bs-btn-all {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: linear-gradient(135deg, #ec4899 0%, #db2777 100%);
          color: #ffffff;
          font-size: 0.8125rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          padding: 0.875rem 2.25rem;
          border-radius: 99px;
          border: none;
          cursor: pointer;
          transition: background 0.3s, transform 0.15s, box-shadow 0.3s;
          text-decoration: none;
          box-shadow: 0 8px 20px rgba(236, 72, 153, 0.25);
        }

        .bs-btn-all:hover {
          background: linear-gradient(135deg, #db2777 0%, #be185d 100%);
          transform: translateY(-2px);
          box-shadow: 0 12px 25px rgba(236, 72, 153, 0.35);
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
        <div className="bs-glow-bg" />

        {/* Custom cursor follower */}
        {/* {showCursor && (
          <div
            className="bs-custom-cursor"
            style={{
              left: `${cursorPos.x}px`,
              top: `${cursorPos.y}px`
            }}
          >
            Chọn mua
          </div>
        )} */}

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10" ref={containerRef}>
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
                  rankIndex={index}
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
