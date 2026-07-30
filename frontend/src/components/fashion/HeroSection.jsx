/* Hallmark · macrostructure: Marquee Hero · section: HeroSection · tone: Vercel Dark Luxury */
import React, { useRef, useState, useEffect } from 'react'
import { ArrowRight, Sparkles, Shield, Cpu, Compass } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

const HeroSection = () => {
  const navigate = useNavigate()
  const containerRef = useRef(null)

  // Interactive 3D Orbit States
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [targetPos, setTargetPos] = useState({ x: 0, y: 0 })
  const [isHoveredOrbit, setIsHoveredOrbit] = useState(false)
  const [activeCard, setActiveCard] = useState(null)

  // Magnetic Button Refs
  const primaryBtnRef = useRef(null)
  const secondaryBtnRef = useRef(null)

  // Continuous orbit rotation angle (radians)
  const orbitAngleRef = useRef(0)
  const [orbitAngle, setOrbitAngle] = useState(0)
  const rafRef = useRef(null)

  // Track Mouse movement for 3D parallax & orbit rotation offsets
  useEffect(() => {
    const handleMouseMove = (e) => {
      const { clientX, clientY } = e
      const width = window.innerWidth
      const height = window.innerHeight

      // Normalized coordinates (-1 to 1)
      const nx = (clientX / width - 0.5) * 2
      const ny = (clientY / height - 0.5) * 2

      setTargetPos({ x: nx, y: ny })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  // Smooth lerp inertia for mouse parallax
  useEffect(() => {
    let animId
    const updateInertia = () => {
      setMousePos(prev => {
        const dx = targetPos.x - prev.x
        const dy = targetPos.y - prev.y
        return { x: prev.x + dx * 0.08, y: prev.y + dy * 0.08 }
      })
      animId = requestAnimationFrame(updateInertia)
    }
    updateInertia()
    return () => cancelAnimationFrame(animId)
  }, [targetPos])

  // Continuous orbit animation (stops on hover)
  useEffect(() => {
    const tick = () => {
      if (!isHoveredOrbit) {
        orbitAngleRef.current += 0.004
        setOrbitAngle(orbitAngleRef.current)
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [isHoveredOrbit])

  // Entrance animations
  useGSAP(() => {
    const tl = gsap.timeline()
    tl.from('.hs-glow-radial', {
      scale: 0.5,
      opacity: 0,
      duration: 2.2,
      ease: 'power4.out'
    })
    tl.from('.hs-title-animate', {
      y: 80,
      opacity: 0,
      stagger: 0.15,
      duration: 1.2,
      ease: 'power4.out'
    }, '-=1.5')
    tl.from('.hs-desc-animate', {
      y: 30,
      opacity: 0,
      duration: 1,
      ease: 'power3.out'
    }, '-=0.9')
    tl.from('.hs-cta-animate', {
      y: 20,
      opacity: 0,
      duration: 0.8,
      ease: 'power3.out'
    }, '-=0.7')
    tl.from('.hs-orb-animate', {
      scale: 0,
      opacity: 0,
      duration: 1.5,
      ease: 'elastic.out(1, 0.75)'
    }, '-=1.2')
  }, { scope: containerRef })

  // Handle magnetic force attraction
  const handleMagneticMove = (e, btnRef) => {
    const btn = btnRef.current
    if (!btn) return
    const rect = btn.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2

    // Magnetic pull: pull button up to 15px
    gsap.to(btn, {
      x: x * 0.35,
      y: y * 0.35,
      duration: 0.3,
      ease: 'power2.out'
    })
  }

  const handleMagneticLeave = (btnRef) => {
    gsap.to(btnRef.current, {
      x: 0,
      y: 0,
      duration: 0.5,
      ease: 'elastic.out(1, 0.3)'
    })
  }

  // 4 Orbiting showcase cards
  const orbitCards = [
    { icon: Sparkles, tag: '01', title: 'Atelier Premium', desc: 'Garments crafted by master tailors with rare bespoke fabrics.' },
    { icon: Cpu, tag: '02', title: 'Smart Fit AI', desc: 'Predict sizing instantly using advanced camera scanning.' },
    { icon: Shield, tag: '03', title: 'Eco Materials', desc: '100% organic linen and upcycled fine threads.' },
    { icon: Compass, tag: '04', title: 'Bespoke Lineup', desc: 'Exclusively tailored dimensions matching Vietnamese profiles.' }
  ]

  return (
    <>
      <style>{`
        .hs-section {
          position: relative;
          min-height: 85vh;
          background: linear-gradient(135deg, #ffffff 0%, #fff1f2 50%, #fce7f3 100%);
          overflow: hidden;
          display: flex;
          align-items: center;
          color: #111827;
          padding: 3rem 0;
        }

        /* Background Video Layer */
        .hs-video-bg-wrap {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
          z-index: 0;
          pointer-events: none;
        }

        .hs-video-bg {
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: 0.85;
          filter: saturate(1.1) contrast(1.05);
          transition: opacity 0.5s ease;
        }

        .hs-video-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to right, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.65) 45%, rgba(255, 241, 242, 0.15) 80%, transparent 100%);
          pointer-events: none;
        }

        /* Subtle Background Patterns */
        .hs-grid-bg {
          position: absolute;
          inset: 0;
          background-image: 
            linear-gradient(to right, rgba(236, 72, 153, 0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(236, 72, 153, 0.05) 1px, transparent 1px);
          background-size: 40px 40px;
          mask-image: radial-gradient(circle at center, black 60%, transparent 100%);
          z-index: 1;
          pointer-events: none;
        }

        /* Shifting Pink Glow Blobs */
        .hs-glow-radial {
          position: absolute;
          width: 50vw;
          height: 50vw;
          top: -10%;
          right: -10%;
          background: radial-gradient(circle, rgba(244, 114, 182, 0.2) 0%, rgba(251, 207, 232, 0.15) 50%, transparent 70%);
          filter: blur(90px);
          z-index: 2;
          pointer-events: none;
        }

        .hs-container {
          position: relative;
          z-index: 4;
          width: 100%;
        }

        /* Left Content Column */
        .hs-content {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }

        @media (max-width: 1023px) {
          .hs-content {
            align-items: center;
            text-align: center;
          }
        }

        /* Pink Mini Badge */
        .hs-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: #ffffff;
          border: 1px solid #fbcfe8;
          border-radius: 99px;
          padding: 0.4rem 1.1rem;
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.05em;
          color: #be185d;
          margin-bottom: 1.5rem;
          box-shadow: 0 4px 15px rgba(236, 72, 153, 0.1);
        }

        .hs-badge-dot {
          width: 7px;
          height: 7px;
          background: #ec4899;
          border-radius: 50%;
          box-shadow: 0 0 8px #ec4899;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }

        .hs-title {
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          font-size: clamp(2.2rem, 4.5vw, 3.8rem);
          font-weight: 900;
          line-height: 1.15;
          letter-spacing: -0.02em;
          color: #0f172a;
          margin-bottom: 1.25rem;
        }

        .hs-title span {
          display: block;
        }

        .hs-gradient-text {
          background: linear-gradient(135deg, #ec4899 0%, #db2777 50%, #9d174d 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .hs-desc {
          font-size: 1rem;
          line-height: 1.7;
          color: #4b5563;
          max-width: 48ch;
          margin-bottom: 2rem;
        }

        .hs-cta-group {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          align-items: center;
        }

        /* Magnetic button styles */
        .hs-btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
          background: linear-gradient(135deg, #ec4899 0%, #db2777 100%);
          color: #ffffff;
          font-size: 0.8125rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          padding: 1rem 2rem;
          border: none;
          border-radius: 99px;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transition: transform 0.2s, box-shadow 0.3s;
          box-shadow: 0 10px 25px rgba(236, 72, 153, 0.3);
        }

        .hs-btn-primary:hover {
          box-shadow: 0 14px 30px rgba(236, 72, 153, 0.45);
          transform: translateY(-2px);
        }

        .hs-btn-secondary {
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
          background: #ffffff;
          color: #111827;
          font-size: 0.8125rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          padding: 1rem 2rem;
          border: 2px solid #fbcfe8;
          border-radius: 99px;
          cursor: pointer;
          transition: border-color 0.3s, background 0.3s, color 0.3s;
          box-shadow: 0 4px 15px rgba(0,0,0,0.03);
        }

        .hs-btn-secondary:hover {
          background: #fdf2f8;
          border-color: #f472b6;
          color: #db2777;
        }

        /* Showcase Column */
        .hs-showcase-column {
          position: relative;
          height: 520px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Central Fashion Model Video Card */
        .hs-model-video-box {
          position: absolute;
          width: 200px;
          height: 260px;
          border-radius: 28px;
          overflow: hidden;
          background: #ffffff;
          border: 3px solid #fbcfe8;
          box-shadow: 
            0 15px 35px rgba(236, 72, 153, 0.25),
            0 0 50px rgba(244, 114, 182, 0.2);
          z-index: 5;
          animation: orbFloat 6s ease-in-out infinite;
        }

        .hs-model-video {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .hs-video-card-badge {
          position: absolute;
          bottom: 0.75rem;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(17, 24, 39, 0.75);
          backdrop-filter: blur(8px);
          color: #ffffff;
          padding: 0.3rem 0.8rem;
          border-radius: 99px;
          font-size: 0.625rem;
          font-weight: 800;
          letter-spacing: 0.1em;
          display: flex;
          align-items: center;
          gap: 0.4rem;
          white-space: nowrap;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .hs-badge-live-dot {
          width: 6px;
          height: 6px;
          background: #ec4899;
          border-radius: 50%;
          box-shadow: 0 0 6px #ec4899;
          animation: pulse 1.5s infinite;
        }

        @keyframes orbFloat {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-12px) rotate(180deg); }
        }

        /* 3D Orbit Rotator Container */
        .hs-orbit-3d {
          position: absolute;
          width: 100%;
          height: 100%;
          transform-style: preserve-3d;
          z-index: 4;
          pointer-events: none;
        }

        /* Orbiting Card placement */
        .hs-orbit-item-wrap {
          position: absolute;
          width: 210px;
          height: 125px;
          left: calc(50% - 105px);
          top: calc(50% - 62px);
          transform-style: preserve-3d;
          pointer-events: auto;
        }

        .hs-orbit-card {
          width: 100%;
          height: 100%;
          background: rgba(255, 255, 255, 0.9);
          border: 1px solid #fbcfe8;
          border-radius: 16px;
          padding: 1.1rem;
          backdrop-filter: blur(12px);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          cursor: pointer;
          transition: border-color 0.3s, box-shadow 0.3s, transform 0.3s;
          box-shadow: 0 10px 25px rgba(236, 72, 153, 0.12);
        }

        .hs-orbit-card:hover {
          border-color: #ec4899;
          box-shadow: 0 12px 30px rgba(236, 72, 153, 0.25);
        }

        .hs-card-active {
          border-color: #db2777 !important;
          box-shadow: 0 0 25px rgba(219, 39, 119, 0.35) !important;
        }

        .hs-card-icon-box {
          width: 2.25rem;
          height: 2.25rem;
          border-radius: 10px;
          background: #fdf2f8;
          border: 1px solid #fbcfe8;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #db2777;
          transition: background 0.3s, color 0.3s;
        }

        .hs-orbit-card:hover .hs-card-icon-box {
          background: #ec4899;
          color: white;
          border-color: #ec4899;
        }

        .hs-card-title {
          font-size: 0.875rem;
          font-weight: 700;
          color: #1f2937;
          margin: 0.4rem 0 0.2rem;
        }

        .hs-card-desc {
          font-size: 0.6875rem;
          line-height: 1.4;
          color: #6b7280;
          margin: 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .hs-card-tag {
          font-size: 0.625rem;
          font-weight: 700;
          color: #ec4899;
          letter-spacing: 0.1em;
        }

        /* Detail panel */
        .hs-detail-panel {
          position: absolute;
          bottom: 1rem;
          background: #ffffff;
          border: 1px solid #fbcfe8;
          border-radius: 12px;
          padding: 0.75rem 1.25rem;
          font-size: 0.75rem;
          color: #374151;
          backdrop-filter: blur(8px);
          max-width: 320px;
          text-align: center;
          box-shadow: 0 10px 25px rgba(236, 72, 153, 0.15);
          animation: panelFade 0.3s ease-out;
        }

        @keyframes panelFade {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .hs-mobile-highlights {
          display: none;
        }

        @media (max-width: 1023px) {
          .hs-showcase-column {
            height: auto;
            min-height: 400px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 1.5rem;
            padding: 1.5rem 0;
          }
          .hs-orbit-3d {
            display: none;
          }
          .hs-model-video-box {
            position: relative;
            width: 220px;
            height: 290px;
            margin: 0 auto;
            transform: none !important;
            box-shadow: 
              0 20px 40px rgba(236, 72, 153, 0.25),
              0 0 30px rgba(244, 114, 182, 0.15);
          }
          .hs-mobile-highlights {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 0.75rem;
            width: 100%;
            max-width: 360px;
            margin: 0 auto;
          }
          .hs-mobile-chip {
            background: #ffffff;
            border: 1px solid #fbcfe8;
            border-radius: 14px;
            padding: 0.65rem 0.85rem;
            display: flex;
            align-items: center;
            gap: 0.6rem;
            box-shadow: 0 4px 12px rgba(236, 72, 153, 0.06);
          }
          .hs-mobile-chip-title {
            font-size: 0.75rem;
            font-weight: 700;
            color: #111827;
          }
        }
      `}</style>

      <section ref={containerRef} className="hs-section">
        {/* Background Grids and Pink Blobs */}
        <div className="hs-grid-bg" />
        <div className="hs-glow-radial" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 hs-container">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* LEFT: Headline copy */}
            <div className="lg:col-span-7 hs-content">
              <div className="hs-badge">
                <span className="hs-badge-dot" />
                <span>ATELIER FASHION STORE</span>
              </div>

              <h1 className="hs-title">
                <span className="hs-title-animate">Định Hình</span>
                <span className="hs-title-animate hs-gradient-text">Phong Cách</span>
                <span className="hs-title-animate">Thời Trang Mới</span>
              </h1>

              <p className="hs-desc hs-desc-animate">
                FashionStore mang đến bộ sưu tập trang phục cao cấp được thiết kế tỉ mỉ,
                chất liệu tự nhiên êm ái cùng phom dáng thời thượng giúp bạn tự tin tỏa sáng mọi khoảnh khắc.
              </p>

              <div className="hs-cta-group hs-cta-animate">
                <button
                  ref={primaryBtnRef}
                  className="hs-btn-primary"
                  onClick={() => navigate('/products')}
                  onMouseMove={(e) => handleMagneticMove(e, primaryBtnRef)}
                  onMouseLeave={() => handleMagneticLeave(primaryBtnRef)}
                  id="hero-primary-shop"
                >
                  Khám phá ngay
                  <ArrowRight size={15} />
                </button>

                <button
                  ref={secondaryBtnRef}
                  className="hs-btn-secondary"
                  onClick={() => navigate('/collection')}
                  onMouseMove={(e) => handleMagneticMove(e, secondaryBtnRef)}
                  onMouseLeave={() => handleMagneticLeave(secondaryBtnRef)}
                  id="hero-secondary-collection"
                >
                  Bộ sưu tập
                </button>
              </div>
            </div>

            {/* RIGHT: Rotating Orbiting 3D System */}
            <div
              className="lg:col-span-5 hs-showcase-column"
              onMouseEnter={() => setIsHoveredOrbit(true)}
              onMouseLeave={() => {
                setIsHoveredOrbit(false)
                setActiveCard(null)
              }}
            >
              {/* Center Model Fashion Image Showcase Card */}
              <div 
                className="hs-model-video-box hs-orb-animate"
                style={{
                  transform: `translate3d(${mousePos.x * 12}px, ${mousePos.y * 12}px, 0)`
                }}
              >
                <img
                  src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop"
                  alt="Atelier Fashion Model"
                  className="hs-model-video"
                  loading="eager"
                />
                <div className="hs-video-card-badge">
                  <span className="hs-badge-live-dot" />
                  <span>LOOKBOOK 2026</span>
                </div>
              </div>

              {/* Mobile clean highlights grid */}
              <div className="hs-mobile-highlights">
                {orbitCards.map((card, i) => (
                  <div key={i} className="hs-mobile-chip">
                    <card.icon size={16} className="text-pink-500 flex-shrink-0" />
                    <span className="hs-mobile-chip-title">{card.title}</span>
                  </div>
                ))}
              </div>

              {/* Orbiting Ring */}
              <div
                className="hs-orbit-3d"
                style={{
                  transform: `rotateX(${-mousePos.y * 15 + 10}deg) rotateY(${mousePos.x * 20}deg)`,
                  transition: 'transform 0.1s linear'
                }}
              >
                {orbitCards.map((card, i) => {
                  const baseAngle = (i * 2 * Math.PI) / orbitCards.length
                  const theta = baseAngle + orbitAngle
                  const radius = 175
                  const cx = Math.cos(theta) * radius
                  const cy = Math.sin(theta) * radius

                  return (
                    <div
                      key={i}
                      className="hs-orbit-item-wrap"
                      style={{ transform: `translate(${cx}px, ${cy}px)` }}
                      onMouseEnter={() => setActiveCard(card)}
                      onMouseLeave={() => setActiveCard(null)}
                    >
                      <div className={`hs-orbit-card ${activeCard?.tag === card.tag ? 'hs-card-active' : ''}`}>
                        <div className="flex justify-between items-center">
                          <card.icon size={16} className="hs-card-icon-box" />
                          <span className="hs-card-tag">{card.tag}</span>
                        </div>
                        <div>
                          <h3 className="hs-card-title">{card.title}</h3>
                          <p className="hs-card-desc">{card.desc}</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Showcase detail panel */}
              {activeCard && (
                <div className="hs-detail-panel">
                  <strong className="text-pink-600">{activeCard.title}</strong> — {activeCard.desc}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default HeroSection
