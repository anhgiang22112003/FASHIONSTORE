import React, { useContext, useEffect, useRef, useState } from 'react'
import { Star, ShoppingBag, Heart, Sparkles, TrendingUp, Eye } from 'lucide-react'
import { Button } from '../ui/button'
import api from '@/service/api'
import { Link } from 'react-router-dom'
import SideCartDrawer from './SideCartDrawer'
import { toast } from 'react-toastify'
import { WishlistContext } from '@/context/WishlistContext'
import { AuthContext } from '@/context/Authcontext'
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

/* ─── Skeleton card ─────────────────────────────── */
const SkeletonCard = () => (
  <div className="rounded-2xl overflow-hidden bg-white shadow-sm animate-pulse">
    <div className="aspect-[3/4] bg-gradient-to-br from-pink-50 via-gray-100 to-pink-50" />
    <div className="p-4 space-y-2.5">
      <div className="h-2 bg-pink-100 rounded w-1/4" />
      <div className="h-3.5 bg-gray-200 rounded w-4/5" />
      <div className="h-3 bg-gray-100 rounded w-3/5" />
      <div className="flex gap-1.5 mt-1">
        {[1,2,3].map(i => <div key={i} className="w-4 h-4 rounded-full bg-gray-200" />)}
      </div>
      <div className="flex items-center justify-between pt-1">
        <div className="h-5 bg-pink-100 rounded w-2/5" />
        <div className="h-8 w-8 bg-gray-100 rounded-full" />
      </div>
    </div>
  </div>
)

/* ─── Product card ──────────────────────────────── */
const ProductCard = ({ product, isFavorite, onToggleFavorite, onAddToCart, index }) => {
  const [hovered, setHovered] = useState(false)
  const [tilt, setTilt]       = useState({ x: 0, y: 0 })
  const [glare, setGlare]     = useState({ x: 50, y: 50 })
  const [imgShift, setImgShift] = useState({ x: 0, y: 0 })
  const cardRef = useRef(null)

  const colors = Array.from(new Set((product?.variations || []).map(v => v.color).filter(Boolean)))
  const sizes  = Array.from(new Set((product?.variations || []).map(v => v.size).filter(Boolean)))
  const hasDiscount = product?.originalPrice > product?.sellingPrice
  const discountPct = hasDiscount
    ? Math.round(((product.originalPrice - product.sellingPrice) / product.originalPrice) * 100) : 0

  const rankLabels = ['🥇', '🥈', '🥉', '4', '5', '6', '7', '8']

  const handleMouseMove = (e) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const cx = rect.width / 2
    const cy = rect.height / 2
    const rY =  ((x - cx) / cx) * 10
    const rX = -((y - cy) / cy) * 10
    setTilt({ x: rX, y: rY })
    setGlare({ x: (x / rect.width) * 100, y: (y / rect.height) * 100 })
    // Parallax ảnh ngược chiều nhẹ
    setImgShift({ x: -rY * 0.8, y: rX * 0.8 })
  }

  const handleMouseLeave = () => {
    setHovered(false)
    setTilt({ x: 0, y: 0 })
    setGlare({ x: 50, y: 50 })
    setImgShift({ x: 0, y: 0 })
  }

  return (
    <div
      ref={cardRef}
      className="bestseller-card group relative rounded-3xl overflow-hidden cursor-pointer"
      style={{
        animation: `fadeSlideUp 0.65s cubic-bezier(0.22,1,0.36,1) forwards`,
        animationDelay: `${index * 90}ms`,
        opacity: 0,
        transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${hovered ? 1.025 : 1})`,
        transition: hovered
          ? 'transform 0.08s linear, box-shadow 0.25s ease'
          : 'transform 0.55s cubic-bezier(0.23,1,0.32,1), box-shadow 0.55s ease',
        boxShadow: hovered
          ? '0 32px 56px -12px rgba(236,72,153,0.3), 0 12px 24px -6px rgba(0,0,0,0.15)'
          : '0 2px 12px rgba(0,0,0,0.08)',
        willChange: 'transform',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={() => {}}
    >
      {/* ── Full-bleed image ── */}
      <div className="aspect-[3/4] relative overflow-hidden bg-gray-100">
        <img
          src={product?.mainImage}
          alt={product?.name}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            transform: `scale(${hovered ? 1.08 : 1.02}) translate(${imgShift.x * 0.4}px, ${imgShift.y * 0.4}px)`,
            transition: hovered ? 'transform 0.08s linear' : 'transform 0.6s cubic-bezier(0.23,1,0.32,1)',
          }}
        />

        {/* Glare */}
        <div
          className="absolute inset-0 pointer-events-none z-20"
          style={{
            background: hovered
              ? `radial-gradient(ellipse at ${glare.x}% ${glare.y}%, rgba(255,255,255,0.18) 0%, transparent 60%)`
              : 'none',
          }}
        />

        {/* Persistent dark gradient at bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent z-10" />

        {/* ── Rank badge top-left ── */}
        <div className="absolute top-3 left-3 z-30">
          <div className="bg-black/70 backdrop-blur-md text-white text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1">
            <span>{rankLabels[index] || index + 1}</span>
            <span className="uppercase tracking-wider opacity-80">Best</span>
          </div>
        </div>

        {/* Discount badge top-right */}
        {hasDiscount && (
          <div className="absolute top-3 right-3 z-30">
            <div className="bg-rose-500 text-white text-[10px] font-black px-2.5 py-1.5 rounded-full shadow-lg">
              -{discountPct}%
            </div>
          </div>
        )}

        {/* Wishlist — always visible */}
        <button
          onClick={(e) => { e.stopPropagation(); onToggleFavorite(product._id) }}
          className={`absolute z-30 transition-all duration-300 ${
            hasDiscount ? 'top-12 right-3' : 'top-3 right-3'
          } w-8 h-8 rounded-full flex items-center justify-center shadow-lg ${
            isFavorite
              ? 'bg-pink-500 text-white scale-110'
              : 'bg-white/80 backdrop-blur-sm text-gray-600 hover:bg-pink-500 hover:text-white'
          }`}
        >
          <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-white' : ''}`} />
        </button>

        {/* ── Hover reveal: info overlay ── */}
        <div
          className="absolute bottom-0 left-0 right-0 z-20 p-4"
          style={{
            transform: hovered ? 'translateY(0)' : 'translateY(12px)',
            opacity: hovered ? 1 : 0,
            transition: 'transform 0.35s cubic-bezier(0.22,1,0.36,1), opacity 0.3s ease',
          }}
        >
          {/* Action row */}
          <div className="flex gap-2 mb-3">
            <button
              onClick={(e) => { e.stopPropagation(); onAddToCart(product) }}
              className="flex-1 bg-white text-black text-[11px] font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5 hover:bg-pink-500 hover:text-white transition-colors duration-200 shadow-xl"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              Thêm vào giỏ
            </button>
            <Link
              to={`/product/${product?._id}`}
              className="w-10 h-10 bg-white/90 rounded-xl flex items-center justify-center hover:bg-pink-500 hover:text-white transition-colors duration-200 shadow-xl text-gray-600 flex-shrink-0"
              onClick={e => e.stopPropagation()}
            >
              <Eye className="w-4 h-4" />
            </Link>
          </div>

          {/* Color swatches */}
          {colors.length > 0 && (
            <div className="flex items-center gap-1.5">
              {colors.slice(0, 6).map((c, idx) => (
                <span
                  key={idx}
                  title={c}
                  className="w-4 h-4 rounded-full border-2 border-white/60 shadow-sm hover:scale-125 transition-transform cursor-pointer"
                  style={{ backgroundColor: colorMap[c] || '#CBD5E1' }}
                />
              ))}
              {colors.length > 6 && (
                <span className="text-[9px] text-white/70 font-bold">+{colors.length - 6}</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Info panel below image ── */}
      <div className="bg-white p-3.5">
        {/* Brand */}
        <p className="text-[9px] font-black uppercase tracking-widest text-pink-400 mb-1">
          {product?.brand || 'PinkFashion'}{product?.material ? ` · ${product.material}` : ''}
        </p>

        {/* Name */}
        <Link to={`/product/${product?._id}`} onClick={e => e.stopPropagation()}>
          <h3 className="text-[13px] font-semibold text-gray-900 leading-snug line-clamp-1 mb-2 hover:text-pink-500 transition-colors">
            {product?.name}
          </h3>
        </Link>

        {/* Rating + Sizes row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className={`w-3 h-3 ${i < Math.floor(product?.ratingAverage || 0) ? 'fill-amber-400 text-amber-400' : 'text-gray-200 fill-gray-200'}`} />
            ))}
            <span className="text-[10px] text-gray-400 ml-0.5">({product?.reviewCount ?? 0})</span>
          </div>
          {sizes.length > 0 && (
            <div className="flex gap-0.5">
              {sizes.slice(0, 3).map((s, i) => (
                <span key={i} className="text-[9px] text-gray-400 border border-gray-100 px-1.5 py-0.5 rounded-md font-medium">{s}</span>
              ))}
              {sizes.length > 3 && <span className="text-[9px] text-gray-300">+{sizes.length - 3}</span>}
            </div>
          )}
        </div>

        {/* Price row */}
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-50">
          <div className="flex items-baseline gap-2">
            <span className="text-base font-black text-gray-900">
              {product?.sellingPrice?.toLocaleString('vi-VN')}đ
            </span>
            {hasDiscount && (
              <span className="text-[10px] text-gray-400 line-through">
                {product?.originalPrice?.toLocaleString('vi-VN')}đ
              </span>
            )}
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onAddToCart(product) }}
            className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center hover:bg-pink-500 transition-colors duration-200 shadow-sm"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─── Main section ──────────────────────────────── */
const BestSellers = () => {
  const [products, setProducts]   = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [isVariantModalOpen, setIsVariantModalOpen] = useState(false)
  const [isCartDrawerOpen, setIsCartDrawerOpen]   = useState(false)
  const [favorites, setFavorites] = useState([])
  const { fetchWishlist } = useContext(WishlistContext)
  const { user } = useContext(AuthContext)
  const containerRef = useRef(null)

  /* ── Fetch ── */
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

  /* ── Favorite toggle ── */
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

  /* ── GSAP — chỉ cho header, KHÔNG cho cards (dùng CSS animation) ── */
  useGSAP(() => {
    if (isLoading) return
    const ctx = gsap.context(() => {
      gsap.from('.bs-header', {
        scrollTrigger: { trigger: containerRef.current, start: 'top 85%' },
        y: 40, opacity: 0, duration: 0.9, ease: 'power4.out'
      })
    }, containerRef)
    ScrollTrigger.refresh()
    return () => ctx.revert()
  }, { scope: containerRef, dependencies: [isLoading] })

  return (
    <>
      {/* Inject keyframe CSS */}
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(32px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)    scale(1); }
        }
      `}</style>

      <section ref={containerRef} className="py-24 bg-[#FAFAFA] relative overflow-hidden">
        {/* Subtle bg blob */}
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-pink-100/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-[400px] h-[400px] bg-purple-100/30 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          {/* ── Header ── */}
          <div className="bs-header text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-pink-50 border border-pink-200 rounded-full mb-4 shadow-sm">
              <TrendingUp className="w-3.5 h-3.5 text-pink-500" />
              <span className="text-xs font-black uppercase tracking-widest text-pink-500">Best Sellers</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-black text-gray-900 mb-3 tracking-tight leading-none">
              Sản Phẩm{' '}
              <span className="bg-gradient-to-r from-pink-500 to-rose-400 bg-clip-text text-transparent">
                Bán Chạy
              </span>
            </h2>
            <p className="text-gray-500 text-base max-w-xl mx-auto">
              Những món đồ được khách hàng yêu thích nhất trong 30 ngày qua
            </p>
          </div>

          {/* ── Grid ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
              : products.map((product, index) => (
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

          {/* ── Empty state ── */}
          {!isLoading && products.length === 0 && (
            <div className="text-center py-20 text-gray-400">
              <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-base">Chưa có sản phẩm bán chạy</p>
            </div>
          )}

          {/* ── CTA ── */}
          {!isLoading && products.length > 0 && (
            <div className="text-center mt-14">
              <Link to="/products">
                <button className="group inline-flex items-center gap-2 px-8 py-3.5 bg-gray-900 hover:bg-pink-500 text-white text-sm font-bold rounded-full shadow-lg hover:shadow-pink-500/30 transition-all duration-300 hover:-translate-y-0.5">
                  Xem tất cả sản phẩm
                  <Sparkles className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                </button>
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
