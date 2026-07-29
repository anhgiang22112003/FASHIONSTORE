/* Hallmark · macrostructure: Marquee Hero · section: Testimonials · tone: Vercel Infinite Marquee */
import React from 'react';
import { Star } from 'lucide-react';
import { testimonials } from '../../data/fashionMock';

const Testimonials = () => {
  // Repeat testimonials enough times for seamless infinite scroll on both rows
  const marqueeRow1 = [...testimonials, ...testimonials, ...testimonials, ...testimonials];
  const marqueeRow2 = [...testimonials, ...testimonials, ...testimonials, ...testimonials];

  return (
    <>
      <style>{`
        .tm-section {
          background-color: #020204;
          color: white;
          padding: 8rem 0;
          position: relative;
          overflow: hidden;
        }

        .tm-section::before {
          content: '';
          display: block;
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: rgba(255, 255, 255, 0.05);
        }

        /* Ambient Glow Blobs */
        .tm-glow-bg {
          position: absolute;
          width: 30vw;
          height: 30vw;
          background: radial-gradient(circle, rgba(168, 85, 247, 0.04) 0%, transparent 70%);
          bottom: 10%;
          left: 10%;
          pointer-events: none;
          z-index: 1;
        }

        .tm-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 2rem;
          position: relative;
          z-index: 2;
        }

        .tm-header {
          text-align: center;
          margin-bottom: 5rem;
        }

        .tm-eyebrow {
          font-family: var(--font-body, 'Inter', sans-serif);
          font-size: 0.6875rem;
          font-weight: 600;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: #a855f7;
          margin-bottom: 1rem;
        }

        .tm-title {
          font-family: var(--font-display, 'Playfair Display', serif);
          font-size: clamp(2rem, 3.5vw, 3rem);
          font-weight: 900;
          line-height: 1.1;
          color: white;
          margin: 0;
        }

        .tm-title em {
          font-style: italic;
          color: #a855f7;
          font-weight: 400;
        }

        /* Marquee layout wrappers */
        .tm-marquee-container {
          display: flex;
          flex-direction: column;
          gap: 2rem;
          position: relative;
          width: 100vw;
          left: 50%;
          transform: translateX(-50%);
          overflow: hidden;
          padding: 1rem 0;
        }

        /* Continuous scrolling track */
        .tm-marquee-track {
          display: flex;
          width: max-content;
          gap: 2rem;
          will-change: transform;
        }

        /* Infinite animation logic */
        .tm-marquee-left {
          animation: marqueeLeft 45s linear infinite;
        }

        .tm-marquee-right {
          animation: marqueeRight 45s linear infinite;
        }

        /* Pause scroll on hover */
        .tm-marquee-track:hover {
          animation-play-state: paused;
        }

        @keyframes marqueeLeft {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-50%, 0, 0); }
        }

        @keyframes marqueeRight {
          0% { transform: translate3d(-50%, 0, 0); }
          100% { transform: translate3d(0, 0, 0); }
        }

        /* Premium Glass Card */
        .tm-card {
          width: 360px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 16px;
          padding: 2.5rem;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          backdrop-filter: blur(12px);
          transition: border-color 0.3s, background 0.3s, transform 0.3s;
          box-shadow: 0 10px 30px rgba(0,0,0,0.4);
        }

        .tm-card:hover {
          border-color: #a855f7;
          background: rgba(255, 255, 255, 0.04);
          transform: translateY(-4px);
        }

        .tm-stars {
          display: flex;
          gap: 0.2rem;
          margin-bottom: 1.5rem;
        }

        .tm-star-filled { color: #a855f7; }
        .tm-star-empty { color: rgba(255, 255, 255, 0.15); }

        .tm-quote {
          font-family: var(--font-display, 'Playfair Display', serif);
          font-size: 1.0625rem;
          font-style: italic;
          font-weight: 400;
          line-height: 1.7;
          color: rgba(255, 255, 255, 0.85);
          margin: 0 0 2rem;
        }

        .tm-author {
          display: flex;
          align-items: center;
          gap: 0.875rem;
          padding-top: 1.5rem;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
        }

        /* Glowing circular outline on avatar */
        .tm-avatar-box {
          position: relative;
          width: 2.75rem;
          height: 2.75rem;
          border-radius: 50%;
          padding: 2px;
          background: linear-gradient(135deg, #a855f7, #ef4444);
          box-shadow: 0 0 10px rgba(168, 85, 247, 0.3);
        }

        .tm-avatar {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          object-fit: cover;
          display: block;
          border: 1px solid #020204;
        }

        .tm-author-name {
          font-family: var(--font-body, 'Inter', sans-serif);
          font-size: 0.875rem;
          font-weight: 600;
          color: white;
          margin: 0 0 0.15rem;
        }

        .tm-author-role {
          font-family: var(--font-body, 'Inter', sans-serif);
          font-size: 0.6875rem;
          color: rgba(255, 255, 255, 0.4);
          margin: 0;
        }

        /* Trust footer panel */
        .tm-trust {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 3rem;
          flex-wrap: wrap;
          margin-top: 5rem;
          padding-top: 3rem;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }

        .tm-trust-label {
          font-family: var(--font-body, 'Inter', sans-serif);
          font-size: 0.6875rem;
          font-weight: 600;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.4);
        }

        .tm-trust-divider {
          width: 1px;
          height: 1rem;
          background: rgba(255, 255, 255, 0.1);
          flex-shrink: 0;
        }

        @media (max-width: 639px) { .tm-trust-divider { display: none; } }

        .tm-platform {
          font-family: var(--font-body, 'Inter', sans-serif);
          font-size: 0.875rem;
          font-weight: 800;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.35);
          transition: color 0.3s;
          cursor: default;
        }

        .tm-platform:hover { color: #a855f7; }
      `}</style>

      <section className="tm-section">
        <div className="tm-glow-bg" />

        <div className="tm-container">
          <div className="tm-header">
            <p className="tm-eyebrow">Đánh giá</p>
            <h2 className="tm-title">Nhận Xét Từ <em>Khách Hàng</em></h2>
          </div>
        </div>

        {/* Double Row Infinite Marquee tracks */}
        <div className="tm-marquee-container">
          {/* First Row (moves left) */}
          <div className="tm-marquee-track tm-marquee-left">
            {marqueeRow1.map((t, i) => (
              <div key={i} className="tm-card">
                <div>
                  <div className="tm-stars">
                    {[...Array(5)].map((_, s) => (
                      <Star
                        key={s}
                        size={12}
                        className={s < t.rating ? 'tm-star-filled' : 'tm-star-empty'}
                        fill={s < t.rating ? 'currentColor' : 'none'}
                      />
                    ))}
                  </div>
                  <p className="tm-quote">"{t.content}"</p>
                </div>
                <div className="tm-author">
                  <div className="tm-avatar-box">
                    <img src={t.avatar} alt={t.name} className="tm-avatar" loading="lazy" />
                  </div>
                  <div>
                    <p className="tm-author-name">{t.name}</p>
                    <p className="tm-author-role">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Second Row (moves right) */}
          <div className="tm-marquee-track tm-marquee-right">
            {marqueeRow2.map((t, i) => (
              <div key={i} className="tm-card">
                <div>
                  <div className="tm-stars">
                    {[...Array(5)].map((_, s) => (
                      <Star
                        key={s}
                        size={12}
                        className={s < t.rating ? 'tm-star-filled' : 'tm-star-empty'}
                        fill={s < t.rating ? 'currentColor' : 'none'}
                      />
                    ))}
                  </div>
                  <p className="tm-quote">"{t.content}"</p>
                </div>
                <div className="tm-author">
                  <div className="tm-avatar-box">
                    <img src={t.avatar} alt={t.name} className="tm-avatar" loading="lazy" />
                  </div>
                  <div>
                    <p className="tm-author-name">{t.name}</p>
                    <p className="tm-author-role">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="tm-container">
          <div className="tm-trust">
            <span className="tm-trust-label">Cũng có mặt trên</span>
            <div className="tm-trust-divider" />
            {['SHOPEE', 'LAZADA', 'TIKI', 'SENDO'].map((p) => (
              <span key={p} className="tm-platform">{p}</span>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default Testimonials;
