/* Hallmark · macrostructure: Marquee Hero · section: HeroSection · tone: Vercel Dark Luxury */
import React, { useRef, useState, useEffect } from 'react';
import { ArrowRight, Sparkles, Shield, Cpu, Compass } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

const HeroSection = () => {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  
  // Interactive 3D Orbit States
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [targetPos, setTargetPos] = useState({ x: 0, y: 0 });
  const [isHoveredOrbit, setIsHoveredOrbit] = useState(false);
  const [activeCard, setActiveCard] = useState(null);

  // Magnetic Button Refs
  const primaryBtnRef = useRef(null);
  const secondaryBtnRef = useRef(null);

  // Continuous orbit rotation angle (radians)
  const orbitAngleRef = useRef(0);
  const [orbitAngle, setOrbitAngle] = useState(0);
  const rafRef = useRef(null);

  // Track Mouse movement for 3D parallax & orbit rotation offsets
  useEffect(() => {
    const handleMouseMove = (e) => {
      const { clientX, clientY } = e;
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      // Normalized coordinates (-1 to 1)
      const nx = (clientX / width - 0.5) * 2;
      const ny = (clientY / height - 0.5) * 2;
      
      setTargetPos({ x: nx, y: ny });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Smooth lerp inertia for mouse parallax
  useEffect(() => {
    let animId;
    const updateInertia = () => {
      setMousePos(prev => {
        const dx = targetPos.x - prev.x;
        const dy = targetPos.y - prev.y;
        return { x: prev.x + dx * 0.08, y: prev.y + dy * 0.08 };
      });
      animId = requestAnimationFrame(updateInertia);
    };
    updateInertia();
    return () => cancelAnimationFrame(animId);
  }, [targetPos]);

  // Continuous orbit animation (stops on hover)
  useEffect(() => {
    const tick = () => {
      if (!isHoveredOrbit) {
        orbitAngleRef.current += 0.004;
        setOrbitAngle(orbitAngleRef.current);
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [isHoveredOrbit]);

  // Entrance animations
  useGSAP(() => {
    const tl = gsap.timeline();
    tl.from('.hs-glow-radial', {
      scale: 0.5,
      opacity: 0,
      duration: 2.2,
      ease: 'power4.out'
    });
    tl.from('.hs-title-animate', {
      y: 80,
      opacity: 0,
      stagger: 0.15,
      duration: 1.2,
      ease: 'power4.out'
    }, '-=1.5');
    tl.from('.hs-desc-animate', {
      y: 30,
      opacity: 0,
      duration: 1,
      ease: 'power3.out'
    }, '-=0.9');
    tl.from('.hs-cta-animate', {
      y: 20,
      opacity: 0,
      duration: 0.8,
      ease: 'power3.out'
    }, '-=0.7');
    tl.from('.hs-orb-animate', {
      scale: 0,
      opacity: 0,
      duration: 1.5,
      ease: 'elastic.out(1, 0.75)'
    }, '-=1.2');
  }, { scope: containerRef });

  // Handle magnetic force attraction
  const handleMagneticMove = (e, btnRef) => {
    const btn = btnRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    
    // Magnetic pull: pull button up to 15px
    gsap.to(btn, {
      x: x * 0.35,
      y: y * 0.35,
      duration: 0.3,
      ease: 'power2.out'
    });
  };

  const handleMagneticLeave = (btnRef) => {
    gsap.to(btnRef.current, {
      x: 0,
      y: 0,
      duration: 0.5,
      ease: 'elastic.out(1, 0.3)'
    });
  };

  // 4 Orbiting showcase cards
  const orbitCards = [
    { icon: Sparkles, tag: '01', title: 'Atelier Premium', desc: 'Garments crafted by master tailors with rare bespoke fabrics.' },
    { icon: Cpu, tag: '02', title: 'Smart Fit AI', desc: 'Predict sizing instantly using advanced camera scanning.' },
    { icon: Shield, tag: '03', title: 'Eco Materials', desc: '100% organic linen and upcycled fine threads.' },
    { icon: Compass, tag: '04', title: 'Bespoke Lineup', desc: 'Exclusively tailored dimensions matching Vietnamese profiles.' }
  ];

  return (
    <>
      <style>{`
        .hs-section {
          position: relative;
          min-height: 100svh;
          background: #020204;
          overflow: hidden;
          display: flex;
          align-items: center;
          color: white;
          padding: 8rem 2rem 4rem;
        }

        /* Vercel Grid Background with Parallax */
        .hs-grid-bg {
          position: absolute;
          inset: 0;
          background-image: 
            linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
          background-size: 50px 50px;
          background-position: center center;
          transform: perspective(1000px) rotateX(60deg) translateY(-200px) translateZ(-100px);
          mask-image: linear-gradient(to bottom, transparent, black 40%, black 85%, transparent);
          z-index: 1;
          pointer-events: none;
        }

        /* Shifting Aurora / Neon Glow Blobs */
        .hs-glow-radial {
          position: absolute;
          width: 60vw;
          height: 60vw;
          top: -20%;
          left: 50%;
          transform: translateX(-50%);
          background: radial-gradient(circle, rgba(168, 85, 247, 0.15) 0%, rgba(6, 182, 212, 0.1) 40%, rgba(239, 68, 68, 0.05) 70%, transparent 100%);
          filter: blur(120px);
          z-index: 2;
          pointer-events: none;
        }

        /* SVG Noise overlay for texture */
        .hs-noise-texture {
          position: absolute;
          inset: 0;
          opacity: 0.02;
          pointer-events: none;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
          z-index: 3;
        }

        .hs-container {
          max-width: 1400px;
          width: 100%;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr;
          gap: 4rem;
          position: relative;
          z-index: 4;
        }

        @media (min-width: 1024px) {
          .hs-container {
            grid-template-columns: 1.1fr 0.9fr;
            align-items: center;
          }
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

        /* Vercel-style glowing mini badge */
        .hs-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 99px;
          padding: 0.35rem 1rem;
          font-size: 0.75rem;
          font-weight: 500;
          letter-spacing: 0.05em;
          color: rgba(255, 255, 255, 0.85);
          margin-bottom: 2rem;
          box-shadow: 0 4px 20px rgba(0,0,0,0.5);
          backdrop-filter: blur(8px);
        }

        .hs-badge-dot {
          width: 6px;
          height: 6px;
          background: oklch(62% 0.12 18);
          border-radius: 50%;
          box-shadow: 0 0 10px oklch(62% 0.12 18);
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }

        .hs-title {
          font-family: var(--font-display, 'Playfair Display', serif);
          font-size: clamp(2.5rem, 5.5vw, 4.5rem);
          font-weight: 900;
          line-height: 1.05;
          letter-spacing: -0.02em;
          margin-bottom: 1.5rem;
        }

        .hs-title span {
          display: block;
        }

        .hs-gradient-text {
          background: linear-gradient(135deg, #ffffff 30%, #a855f7 65%, #ef4444 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          font-style: italic;
        }

        .hs-desc {
          font-size: 1rem;
          line-height: 1.7;
          color: rgba(255, 255, 255, 0.6);
          max-width: 48ch;
          margin-bottom: 2.5rem;
        }

        .hs-cta-group {
          display: flex;
          flex-wrap: wrap;
          gap: 1.25rem;
          align-items: center;
        }

        /* Magnetic button styles */
        .hs-btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
          background: #ffffff;
          color: #000000;
          font-size: 0.8125rem;
          font-weight: 600;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          padding: 1.1rem 2.25rem;
          border: none;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transition: background 0.3s, box-shadow 0.3s;
          box-shadow: 0 0 0 rgba(255,255,255,0);
        }

        .hs-btn-primary:hover {
          background: #ffffff;
          box-shadow: 0 0 30px rgba(255, 255, 255, 0.25);
        }

        .hs-btn-secondary {
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
          background: rgba(255, 255, 255, 0.04);
          color: #ffffff;
          font-size: 0.8125rem;
          font-weight: 600;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          padding: 1.1rem 2.25rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
          cursor: pointer;
          transition: border-color 0.3s, background 0.3s;
          backdrop-filter: blur(8px);
        }

        .hs-btn-secondary:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.3);
        }

        /* Interactive Showcase Column (Orb and Orbiting Cards) */
        .hs-showcase-column {
          position: relative;
          height: 600px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Central Glowing Orb */
        .hs-orb-core {
          position: absolute;
          width: 140px;
          height: 140px;
          border-radius: 50%;
          background: radial-gradient(circle at 30% 30%, #ffffff 0%, #a855f7 30%, #ef4444 70%, #000 100%);
          box-shadow: 
            0 0 60px rgba(168, 85, 247, 0.5),
            0 0 120px rgba(6, 182, 212, 0.3),
            inset 0 0 20px rgba(255, 255, 255, 0.6);
          filter: brightness(1.2);
          z-index: 5;
          animation: orbFloat 8s ease-in-out infinite;
        }

        @keyframes orbFloat {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(180deg); }
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
          width: 220px;
          height: 130px;
          left: calc(50% - 110px);
          top: calc(50% - 65px);
          transform-style: preserve-3d;
          pointer-events: auto;
        }

        .hs-orbit-card {
          width: 100%;
          height: 100%;
          background: rgba(10, 10, 12, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          padding: 1.25rem;
          backdrop-filter: blur(12px);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          cursor: pointer;
          transition: border-color 0.3s, box-shadow 0.3s, transform 0.3s;
          box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        }

        .hs-orbit-card:hover {
          border-color: #a855f7;
          box-shadow: 0 0 30px rgba(168, 85, 247, 0.3), 0 10px 40px rgba(0,0,0,0.8);
        }

        .hs-card-active {
          border-color: #ef4444 !important;
          box-shadow: 0 0 30px rgba(239, 68, 68, 0.4) !important;
        }

        .hs-card-icon-box {
          width: 2.25rem;
          height: 2.25rem;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255,255,255,0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(255,255,255,0.8);
          transition: background 0.3s;
        }

        .hs-orbit-card:hover .hs-card-icon-box {
          background: #a855f7;
          color: white;
          border-color: #a855f7;
        }

        .hs-card-title {
          font-size: 0.875rem;
          font-weight: 700;
          color: white;
          margin: 0.5rem 0 0.25rem;
        }

        .hs-card-desc {
          font-size: 0.6875rem;
          line-height: 1.4;
          color: rgba(255, 255, 255, 0.5);
          margin: 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .hs-card-tag {
          font-size: 0.625rem;
          font-weight: 700;
          color: #a855f7;
          letter-spacing: 0.1em;
        }

        /* Floating dynamic description box below */
        .hs-detail-panel {
          position: absolute;
          bottom: 2rem;
          background: rgba(2, 2, 4, 0.9);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 8px;
          padding: 0.75rem 1.5rem;
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(8px);
          max-width: 320px;
          text-align: center;
          box-shadow: 0 10px 30px rgba(0,0,0,0.6);
          animation: panelFade 0.3s ease-out;
        }

        @keyframes panelFade {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 1023px) {
          .hs-showcase-column {
            height: 480px;
          }
          .hs-orbit-item-wrap {
            width: 170px;
            height: 110px;
            left: calc(50% - 85px);
            top: calc(50% - 55px);
          }
          .hs-orb-core {
            width: 100px;
            height: 100px;
          }
        }
      `}</style>

      <section ref={containerRef} className="hs-section">
        {/* Vercel Grids and Auroras */}
        <div className="hs-grid-bg" />
        <div className="hs-glow-radial" />
        <div className="hs-noise-texture" />

        <div className="hs-container">
          {/* LEFT: Headline copy */}
          <div className="hs-content">
            <div className="hs-badge">
              <span className="hs-badge-dot" />
              <span>THE FUTURE OF WEARABLES</span>
            </div>

            <h1 className="hs-title">
              <span className="hs-title-animate">Định Hình</span>
              <span className="hs-title-animate hs-gradient-text">Thời Trang</span>
              <span className="hs-title-animate">Kỷ Nguyên Mới</span>
            </h1>

            <p className="hs-desc hs-desc-animate">
              Atelier tích hợp thiết kế may đo cao cấp cùng quy trình may tỉ mỉ, 
              sử dụng vải sợi tự nhiên bền vững để thiết lập phong thái đỉnh cao cho bạn.
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
                Mua sắm ngay
                <ArrowRight size={14} />
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
            className="hs-showcase-column"
            onMouseEnter={() => setIsHoveredOrbit(true)}
            onMouseLeave={() => {
              setIsHoveredOrbit(false);
              setActiveCard(null);
            }}
          >
            {/* Center Orb */}
            <div 
              className="hs-orb-core hs-orb-animate"
              style={{
                transform: `translate3d(${mousePos.x * 20}px, ${mousePos.y * 20}px, 0)`
              }}
            />

            {/* Orbiting Ring */}
            <div 
              className="hs-orbit-3d"
              style={{
                transform: `rotateX(${-mousePos.y * 20 + 15}deg) rotateY(${mousePos.x * 30}deg)`,
                transition: 'transform 0.1s linear'
              }}
            >
              {orbitCards.map((card, i) => {
                // Even 2D circle positioning with rAF-driven angle
                const baseAngle = (i * 2 * Math.PI) / orbitCards.length;
                const theta = baseAngle + orbitAngle;
                const radius = 190;
                const cx = Math.cos(theta) * radius;
                const cy = Math.sin(theta) * radius;

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
                );
              })}
            </div>

            {/* Showcase detail panel */}
            {activeCard && (
              <div className="hs-detail-panel">
                <strong>{activeCard.title}</strong> — {activeCard.desc}
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default HeroSection;
