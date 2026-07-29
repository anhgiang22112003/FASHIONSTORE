/* Hallmark · macrostructure: Marquee Hero · section: Newsletter · tone: Vercel Particles */
import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Gift, TrendingUp, Zap } from 'lucide-react';
import gsap from 'gsap';

const perks = [
  { icon: Gift, label: 'Ưu đãi độc quyền', desc: 'Mã giảm giá dành riêng cho thành viên đăng ký.' },
  { icon: TrendingUp, label: 'Xu hướng mới', desc: 'Cập nhật bộ sưu tập và xu hướng thời trang sớm nhất.' },
  { icon: Zap, label: 'Thông báo nhanh', desc: 'Nhận thông tin sản phẩm mới ngay khi ra mắt.' },
];

const Newsletter = () => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  
  const canvasRef = useRef(null);
  const submitBtnRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
    setEmail('');
    setTimeout(() => setSent(false), 4000);
  };

  // Draw high-fidelity moving particle nodes background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Create drifting nodes particles
    const particles = [];
    const particleCount = 45;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 1.5 + 0.5,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        alpha: Math.random() * 0.5 + 0.1
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'rgba(168, 85, 247, 0.4)';

      particles.forEach((p, idx) => {
        // Move particle
        p.x += p.vx;
        p.y += p.vy;

        // Bounce boundaries
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
        ctx.fill();

        // Connect nearby nodes
        for (let j = idx + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (dist < 80) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(168, 85, 247, ${0.12 * (1 - dist / 80)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Magnetic button logic
  const handleMagneticMove = (e) => {
    const btn = submitBtnRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    gsap.to(btn, {
      x: x * 0.3,
      y: y * 0.3,
      duration: 0.3,
      ease: 'power2.out'
    });
  };

  const handleMagneticLeave = () => {
    gsap.to(submitBtnRef.current, {
      x: 0,
      y: 0,
      duration: 0.5,
      ease: 'elastic.out(1, 0.4)'
    });
  };

  return (
    <>
      <style>{`
        .nl-section {
          background-color: #020204;
          padding: 8rem 0;
          position: relative;
          overflow: hidden;
        }

        .nl-section::before {
          content: '';
          display: block;
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: rgba(255, 255, 255, 0.05);
        }

        /* Interactive Particle Canvas background */
        .nl-canvas {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 1;
        }

        /* Ambient neon blobs shifting */
        .nl-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(100px);
          pointer-events: none;
        }

        .nl-blob-1 {
          width: 25rem; height: 25rem;
          background: #a855f7;
          opacity: 0.06;
          top: -5rem; right: -5rem;
        }

        .nl-blob-2 {
          width: 20rem; height: 20rem;
          background: #ef4444;
          opacity: 0.04;
          bottom: -5rem; left: -5rem;
        }

        .nl-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 2rem;
          position: relative;
          z-index: 2;
        }

        .nl-inner {
          display: grid;
          grid-template-columns: 1fr;
          gap: 4rem;
          align-items: start;
        }

        @media (min-width: 1024px) {
          .nl-inner {
            grid-template-columns: 1fr 1fr;
            gap: 6rem;
            align-items: center;
          }
        }

        .nl-eyebrow {
          font-family: var(--font-body, 'Inter', sans-serif);
          font-size: 0.6875rem;
          font-weight: 600;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: #a855f7;
          margin-bottom: 1.25rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .nl-eyebrow::before {
          content: '';
          display: block;
          width: 1.5rem;
          height: 1px;
          background: #a855f7;
        }

        .nl-heading {
          font-family: var(--font-display, 'Playfair Display', serif);
          font-size: clamp(2rem, 3.5vw, 3rem);
          font-weight: 900;
          line-height: 1.1;
          color: white;
          margin: 0 0 1rem;
        }

        .nl-heading em {
          font-style: italic;
          color: #a855f7;
          font-weight: 400;
        }

        .nl-sub {
          font-family: var(--font-body, 'Inter', sans-serif);
          font-size: 0.9375rem;
          line-height: 1.7;
          color: rgba(255, 255, 255, 0.5);
          margin: 0 0 2.5rem;
          max-width: 40ch;
        }

        .nl-form {
          display: flex;
          gap: 0.5rem;
          max-width: 28rem;
        }

        /* Glassmorphic input field */
        .nl-input {
          flex: 1;
          min-width: 0;
          font-family: var(--font-body, 'Inter', sans-serif);
          font-size: 0.9375rem;
          color: white;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 6px;
          padding: 0.875rem 1.25rem;
          outline: none;
          transition: border-color 0.3s, background-color 0.3s;
        }

        .nl-input::placeholder { color: rgba(255, 255, 255, 0.3); }

        .nl-input:focus {
          border-color: #a855f7;
          background: rgba(255, 255, 255, 0.04);
        }

        /* Magnetic button overlay styles */
        .nl-submit {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          background: #ffffff;
          color: #000000;
          font-family: var(--font-body, 'Inter', sans-serif);
          font-size: 0.8125rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          padding: 0.875rem 1.75rem;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          flex-shrink: 0;
          transition: background 0.3s, box-shadow 0.3s;
        }

        .nl-submit:hover {
          background: #a855f7;
          color: #ffffff;
          box-shadow: 0 0 25px rgba(168, 85, 247, 0.35);
        }

        .nl-submit-arrow {
          transition: transform 0.2s cubic-bezier(0.16,1,0.3,1);
        }

        .nl-submit:hover .nl-submit-arrow { transform: translateX(3px); }

        .nl-success {
          margin-top: 0.875rem;
          font-family: var(--font-body, 'Inter', sans-serif);
          font-size: 0.8125rem;
          font-weight: 500;
          color: #a855f7;
        }

        .nl-privacy {
          margin-top: 1.25rem;
          font-family: var(--font-body, 'Inter', sans-serif);
          font-size: 0.6875rem;
          color: rgba(255, 255, 255, 0.35);
        }

        /* Perks sidebar listing */
        .nl-perks {
          display: flex;
          flex-direction: column;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }

        .nl-perk {
          display: flex;
          gap: 1.25rem;
          align-items: flex-start;
          padding: 1.75rem 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .nl-perk-icon {
          width: 2rem;
          height: 2rem;
          color: #a855f7;
          flex-shrink: 0;
          margin-top: 0.1rem;
          filter: drop-shadow(0 0 5px rgba(168,85,247,0.3));
        }

        .nl-perk-title {
          font-family: var(--font-body, 'Inter', sans-serif);
          font-size: 0.9375rem;
          font-weight: 600;
          color: white;
          margin-bottom: 0.25rem;
        }

        .nl-perk-desc {
          font-family: var(--font-body, 'Inter', sans-serif);
          font-size: 0.8125rem;
          line-height: 1.6;
          color: rgba(255, 255, 255, 0.5);
          margin: 0;
        }

        @media (max-width: 639px) {
          .nl-form { flex-direction: column; gap: 0.75rem; }
          .nl-submit { width: 100%; justify-content: center; }
        }
      `}</style>

      <section className="nl-section">
        <canvas ref={canvasRef} className="nl-canvas" />
        
        <div className="nl-blob nl-blob-1" aria-hidden="true" />
        <div className="nl-blob nl-blob-2" aria-hidden="true" />

        <div className="nl-container">
          <div className="nl-inner">
            {/* Left */}
            <div>
              <p className="nl-eyebrow">Newsletter</p>
              <h2 className="nl-heading">
                Đón Đầu <em>Xu Hướng</em>
              </h2>
              <p className="nl-sub">
                Đăng ký để nhận thông tin bộ sưu tập mới, ưu đãi độc quyền
                và xu hướng thời trang trước mọi người.
              </p>

              <form className="nl-form" onSubmit={handleSubmit} noValidate>
                <input
                  id="nl-email-input"
                  type="email"
                  className="nl-input"
                  placeholder="email@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  aria-label="Địa chỉ email"
                />
                
                <button 
                  ref={submitBtnRef}
                  type="submit" 
                  className="nl-submit" 
                  id="nl-submit-btn"
                  onMouseMove={handleMagneticMove}
                  onMouseLeave={handleMagneticLeave}
                >
                  Đăng ký
                  <ArrowRight className="nl-submit-arrow" size={14} />
                </button>
              </form>

              {sent && (
                <p className="nl-success">✓ Cảm ơn bạn đã đăng ký! Chúng tôi sẽ liên hệ sớm.</p>
              )}

              <p className="nl-privacy">Chúng tôi tôn trọng quyền riêng tư của bạn. Không spam.</p>
            </div>

            {/* Right — perks */}
            <div className="nl-perks">
              {perks.map((p, i) => (
                <div key={i} className="nl-perk">
                  <p.icon className="nl-perk-icon" strokeWidth={1.5} />
                  <div>
                    <h3 className="nl-perk-title">{p.label}</h3>
                    <p className="nl-perk-desc">{p.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Newsletter;
