/* Hallmark · macrostructure: Marquee Hero · section: ProductCategories · tone: Vercel 3D Circular Hub */
import api from '@/service/api'
import React, { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Pagination, Navigation, Autoplay } from 'swiper/modules'
import { ArrowRight, Disc, Layers } from 'lucide-react'
import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/navigation'

const ProductCategories = () => {
  const [category, setCategory] = useState([])
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 })
  const [showCursor, setShowCursor] = useState(false)
  
  // Desktop Wheel Orbit States
  const [activeCircleIndex, setActiveCircleIndex] = useState(0)
  const [wheelRotation, setWheelRotation] = useState(0)

  const navigate = useNavigate()
  const sectionRef = useRef(null)

  const Category = async () => {
    try {
      const response = await api.get('/categories')
      const activeCategories = response?.data?.data.filter(item => item.isActive)
      setCategory(activeCategories)
    } catch (error) {
      console.error('Error fetching product categories:', error)
    }
  }

  useEffect(() => {
    Category()
  }, [])

  const handleMouseMove = (e) => {
    if (!sectionRef.current) return
    const rect = sectionRef.current.getBoundingClientRect()
    setCursorPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    })
  }

  // Handle active item in circle wheel selection
  const handleItemHover = (index) => {
    setActiveCircleIndex(index)
    // Rotate wheel so selected item is at the top (-90 deg offset)
    const targetAngle = -index * (360 / category.length)
    setWheelRotation(targetAngle)
  }

  return (
    <>
      <style>{`
        .pc-section {
          padding: 8rem 0;
          background-color: #020204;
          position: relative;
          overflow: hidden;
          cursor: crosshair;
        }

        .pc-section::before {
          content: '';
          display: block;
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: rgba(255, 255, 255, 0.05);
        }

        .pc-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 2rem;
          position: relative;
          z-index: 2;
        }

        /* Ambient Glow backdrop */
        .pc-glow-bg {
          position: absolute;
          width: 40%;
          height: 40%;
          background: radial-gradient(circle, rgba(6, 182, 212, 0.08) 0%, transparent 70%);
          top: 20%;
          left: 5%;
          pointer-events: none;
          z-index: 1;
        }

        /* Custom Floating Cursor */
        .pc-custom-cursor {
          position: absolute;
          width: 5rem;
          height: 5rem;
          background: #a855f7;
          color: white;
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
          box-shadow: 0 10px 25px rgba(168, 85, 247, 0.3);
        }

        .pc-section:hover .pc-custom-cursor {
          transform: translate(-50%, -50%) scale(1);
          opacity: 1;
        }

        .pc-heading-group {
          margin-bottom: 4rem;
        }

        .pc-eyebrow {
          font-family: var(--font-body, 'Inter', sans-serif);
          font-size: 0.6875rem;
          font-weight: 600;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: #a855f7;
          margin-bottom: 0.75rem;
        }

        .pc-title {
          font-family: var(--font-display, 'Playfair Display', serif);
          font-size: clamp(2rem, 4vw, 3.5rem);
          font-weight: 900;
          line-height: 1.05;
          color: white;
          margin: 0;
        }

        .pc-title em {
          font-style: italic;
          color: #a855f7;
          font-weight: 400;
        }

        /* Desktop layout - 2-col grid: spotlight | wheel */
        .pc-wheel-layout {
          display: none;
          grid-template-columns: 300px 1fr;
          align-items: center;
          gap: 3rem;
          margin-top: 2rem;
          min-height: 600px;
        }

        @media (min-width: 1024px) {
          .pc-wheel-layout {
            display: grid;
          }
        }

        /* Wheel arena: self-contained relative container for node positioning */
        .pc-wheel-arena {
          position: relative;
          width: 100%;
          height: 520px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Center Hub */
        .pc-wheel-center-hub {
          position: absolute;
          width: 160px;
          height: 160px;
          border-radius: 50%;
          background: rgba(10, 10, 12, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(12px);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 5;
          box-shadow: 0 0 50px rgba(0,0,0,0.8), inset 0 0 20px rgba(255,255,255,0.05);
        }

        .pc-hub-glow {
          position: absolute;
          inset: -10px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(168, 85, 247, 0.15) 0%, transparent 70%);
          animation: hubPulse 3s infinite alternate;
          z-index: -1;
        }

        @keyframes hubPulse {
          0% { transform: scale(0.95); opacity: 0.5; }
          100% { transform: scale(1.05); opacity: 1; }
        }

        .pc-hub-title {
          font-family: var(--font-display, 'Playfair Display', serif);
          font-size: 1.125rem;
          font-weight: 700;
          color: white;
          margin-top: 0.5rem;
        }

        /* Decorative orbit ring (purely visual) */
        .pc-orbit-ring {
          position: absolute;
          width: 460px;
          height: 460px;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          border: 1px dashed rgba(255, 255, 255, 0.07);
          border-radius: 50%;
          pointer-events: none;
          z-index: 0;
        }

        /* Circular Orbit Cards — absolutely placed relative to .pc-wheel-layout */
        .pc-wheel-node {
          position: absolute;
          width: 110px;
          height: 110px;
          border-radius: 50%;
          overflow: hidden;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.08);
          cursor: pointer;
          transition: border-color 0.4s, box-shadow 0.4s, transform 0.4s;
          box-shadow: 0 10px 30px rgba(0,0,0,0.5);
          z-index: 2;
        }

        .pc-wheel-node:hover {
          border-color: #a855f7;
          box-shadow: 0 0 25px rgba(168, 85, 247, 0.25);
          transform: scale(1.08);
        }

        .pc-node-active {
          border-color: #a855f7 !important;
          box-shadow: 0 0 30px rgba(168, 85, 247, 0.4) !important;
          transform: scale(1.18) !important;
        }

        .pc-node-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: 0.6;
          transition: opacity 0.4s, transform 0.8s;
        }

        .pc-wheel-node:hover .pc-node-img,
        .pc-node-active .pc-node-img {
          opacity: 1;
          transform: scale(1.08);
        }

        /* Spotlight display card */
        .pc-spotlight-display {
          width: 100%;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(16px);
          border-radius: 16px;
          padding: 2rem;
          display: flex;
          flex-direction: column;
          z-index: 4;
          box-shadow: 0 25px 60px rgba(0,0,0,0.6);
          align-self: center;
        }

        .pc-spotlight-img {
          width: 100%;
          aspect-ratio: 4 / 3;
          object-fit: cover;
          border-radius: 8px;
          margin-bottom: 1.5rem;
          border: 1px solid rgba(255, 255, 255, 0.08);
        }

        .pc-spotlight-name {
          font-family: var(--font-display, 'Playfair Display', serif);
          font-size: 1.5rem;
          font-weight: 700;
          color: white;
          margin-bottom: 0.5rem;
        }

        .pc-spotlight-count {
          font-family: var(--font-body, 'Inter', sans-serif);
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.4);
          margin-bottom: 1.5rem;
        }

        .pc-spotlight-btn {
          align-self: flex-start;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: white;
          color: black;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: background 0.3s, transform 0.2s;
        }

        .pc-spotlight-btn:hover {
          background: #a855f7;
          color: white;
          transform: translateY(-2px);
        }

        /* Mobile swiper slider layout */
        .pc-mobile-layout {
          display: block;
        }

        @media (min-width: 1024px) {
          .pc-mobile-layout {
            display: none;
          }
        }

        .pc-mobile-card {
          position: relative;
          overflow: hidden;
          aspect-ratio: 3 / 4;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 12px;
          cursor: pointer;
        }

        .pc-mobile-card-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .pc-mobile-card-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, #000000 0%, rgba(0,0,0,0.1) 60%, transparent 100%);
          pointer-events: none;
        }

        .pc-mobile-card-body {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 1.5rem;
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          z-index: 3;
        }

        .pc-mobile-card-name {
          font-family: var(--font-display, 'Playfair Display', serif);
          font-size: 1.25rem;
          font-weight: 700;
          color: white;
          margin: 0;
        }

        /* Swiper styles */
        .pc-mobile-layout .swiper-pagination-bullet {
          background: rgba(255, 255, 255, 0.2);
          opacity: 1;
        }

        .pc-mobile-layout .swiper-pagination-bullet-active {
          background: #a855f7;
        }
      `}</style>

      <section
        ref={sectionRef}
        className="pc-section"
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setShowCursor(true)}
        onMouseLeave={() => setShowCursor(false)}
      >
        <div className="pc-glow-bg" />
        
        {/* Custom cursor follower */}
        {showCursor && (
          <div
            className="pc-custom-cursor"
            style={{
              left: `${cursorPos.x}px`,
              top: `${cursorPos.y}px`
            }}
          >
            Xem ngay
          </div>
        )}

        <div className="pc-container">
          <div className="pc-heading-group">
            <p className="pc-eyebrow">Danh mục</p>
            <h2 className="pc-title">Tìm kiếm theo <em>Phong cách</em></h2>
          </div>

          {/* DESKTOP 3D CIRCULAR WHEEL */}
          {category.length > 0 && (
            <div className="pc-wheel-layout">
              {/* Col 1: Spotlight panel */}
              {category[activeCircleIndex] && (
                <div className="pc-spotlight-display">
                  <img
                    src={category[activeCircleIndex]?.image}
                    alt={category[activeCircleIndex]?.name}
                    className="pc-spotlight-img"
                  />
                  <h3 className="pc-spotlight-name">{category[activeCircleIndex]?.name}</h3>
                  <p className="pc-spotlight-count">{category[activeCircleIndex]?.productCount || 0} sản phẩm</p>
                  <button
                    className="pc-spotlight-btn"
                    onClick={() => navigate(
                      `/category/${category[activeCircleIndex].slug || category[activeCircleIndex].name.replace(/\s+/g, '-').toLowerCase()}`,
                      { state: { id: category[activeCircleIndex]._id } }
                    )}
                  >
                    Khám phá ngay
                    <ArrowRight size={12} />
                  </button>
                </div>
              )}

              {/* Col 2: Wheel arena — all nodes & hub positioned relative to this */}
              <div className="pc-wheel-arena">
                {/* Decorative orbit ring */}
                <div className="pc-orbit-ring" />

                {/* Center Hub */}
                <div className="pc-wheel-center-hub">
                  <div className="pc-hub-glow" />
                  <Layers size={24} className="text-purple-500" />
                  <span className="pc-hub-title">ATELIER</span>
                </div>

                {/* Nodes — positions are relative to pc-wheel-arena center */}
                {category.map((cat, index) => {
                  const angleDeg = index * (360 / category.length) - 90;
                  const angleRad = (angleDeg * Math.PI) / 180;
                  const radius = 185;
                  const px = Math.cos(angleRad) * radius;
                  const py = Math.sin(angleRad) * radius;

                  return (
                    <div
                      key={cat._id || index}
                      className={`pc-wheel-node ${activeCircleIndex === index ? 'pc-node-active' : ''}`}
                      style={{
                        left: `calc(50% + ${px}px - 55px)`,
                        top: `calc(50% + ${py}px - 55px)`
                      }}
                      onMouseEnter={() => setActiveCircleIndex(index)}
                      onClick={() => navigate(
                        `/category/${cat.slug || cat.name.replace(/\s+/g, '-').toLowerCase()}`,
                        { state: { id: cat._id } }
                      )}
                    >
                      <img src={cat?.image} alt={cat?.name} className="pc-node-img" />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* MOBILE SWIPER */}
          <div className="pc-mobile-layout">
            <Swiper
              modules={[Pagination, Navigation, Autoplay]}
              autoplay={{ delay: 4000, disableOnInteraction: false }}
              pagination={{ clickable: true }}
              slidesPerView={1.5}
              spaceBetween={16}
              breakpoints={{
                480: { slidesPerView: 2, spaceBetween: 20 },
                640: { slidesPerView: 3, spaceBetween: 20 },
              }}
              grabCursor={true}
              className="pb-12"
            >
              {category?.map((cat, index) => (
                <SwiperSlide key={cat?.id || index}>
                  <div
                    className="pc-mobile-card"
                    onClick={() => navigate(
                      `/category/${cat.slug || cat.name.replace(/\s+/g, '-').toLowerCase()}`,
                      { state: { id: cat._id } }
                    )}
                  >
                    <img
                      src={cat?.image}
                      alt={cat?.name}
                      className="pc-mobile-card-img"
                      loading="lazy"
                    />
                    <div className="pc-mobile-card-overlay" />
                    <div className="pc-mobile-card-body">
                      <h3 className="pc-mobile-card-name">{cat?.name}</h3>
                      <ArrowRight size={14} className="text-white" />
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </section>
    </>
  )
}

export default ProductCategories
