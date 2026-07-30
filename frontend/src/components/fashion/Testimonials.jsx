import React, { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import api from '@/service/api';
import { testimonials } from '../../data/fashionMock';

const Testimonials = () => {
  const [reviewsList, setReviewsList] = useState([]);

  useEffect(() => {
    const fetchFiveStarReviews = async () => {
      try {
        const response = await api.get('/reviews');
        const data = response?.data?.data || response?.data || [];
        const fiveStarReviews = Array.isArray(data)
          ? data.filter(r => (r.rating === 5 || r.rating >= 4) && (r.comment || r.content))
          : [];

        if (fiveStarReviews.length > 0) {
          const formatted = fiveStarReviews.map((r, index) => ({
            name: r.user?.name || r.userName || r.user?.email?.split('@')[0] || `Khách hàng Atelier #${index + 1}`,
            role: 'Khách hàng đã xác thực',
            content: r.comment || r.content || 'Sản phẩm rất đẹp, phom dáng chuẩn tạc và chất liệu tuyệt vời!',
            rating: r.rating || 5,
            avatar: r.user?.avatar || `https://images.unsplash.com/photo-${1534528741775 + index * 1000}?w=150&auto=format&fit=crop&q=80`
          }));
          setReviewsList(formatted);
        }
      } catch (err) {
        // fallback to default testimonials
      }
    };
    fetchFiveStarReviews();
  }, []);

  const activeList = reviewsList.length > 0 ? reviewsList : testimonials;
  const marqueeRow1 = [...activeList, ...activeList, ...activeList, ...activeList];
  const marqueeRow2 = [...activeList, ...activeList, ...activeList, ...activeList];

  return (
    <>
      <style>{`
        .tm-section {
          background: linear-gradient(180deg, #fff1f2 0%, #ffffff 100%);
          color: #111827;
          padding: 5rem 0;
          position: relative;
          overflow: hidden;
        }

        .tm-glow-bg {
          position: absolute;
          width: 30vw;
          height: 30vw;
          background: radial-gradient(circle, rgba(236, 72, 153, 0.08) 0%, transparent 70%);
          bottom: 10%;
          left: 10%;
          pointer-events: none;
          z-index: 1;
        }

        .tm-header {
          text-align: center;
          margin-bottom: 3.5rem;
        }

        .tm-eyebrow {
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #ec4899;
          margin-bottom: 0.5rem;
        }

        .tm-title {
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          font-size: clamp(1.8rem, 3.5vw, 2.75rem);
          font-weight: 900;
          line-height: 1.15;
          color: #111827;
          margin: 0;
        }

        .tm-title em {
          font-style: normal;
          color: #db2777;
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

        /* Card */
        .tm-card {
          width: 360px;
          flex-shrink: 0;
          background: #ffffff;
          border: 1px solid #fce7f3;
          border-radius: 20px;
          padding: 2rem;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          transition: border-color 0.3s, transform 0.3s, box-shadow 0.3s;
          box-shadow: 0 10px 25px rgba(236, 72, 153, 0.06);
        }

        .tm-card:hover {
          border-color: #f472b6;
          box-shadow: 0 15px 35px rgba(236, 72, 153, 0.15);
          transform: translateY(-4px);
        }

        .tm-stars {
          display: flex;
          gap: 0.2rem;
          margin-bottom: 1.25rem;
        }

        .tm-star-filled { color: #f59e0b; }
        .tm-star-empty { color: #e5e7eb; }

        .tm-quote {
          font-size: 0.95rem;
          line-height: 1.6;
          color: #374151;
          margin: 0 0 1.5rem;
          font-weight: 500;
        }

        .tm-author {
          display: flex;
          align-items: center;
          gap: 0.875rem;
          padding-top: 1.25rem;
          border-top: 1px solid #fce7f3;
        }

        .tm-avatar-box {
          position: relative;
          width: 2.75rem;
          height: 2.75rem;
          border-radius: 50%;
          padding: 2px;
          background: linear-gradient(135deg, #ec4899, #ef4444);
          box-shadow: 0 0 10px rgba(236, 72, 153, 0.3);
        }

        .tm-avatar {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          object-fit: cover;
          display: block;
          border: 1px solid #ffffff;
        }

        .tm-author-name {
          font-size: 0.875rem;
          font-weight: 700;
          color: #111827;
          margin: 0 0 0.15rem;
        }

        .tm-author-role {
          font-size: 0.6875rem;
          color: #6b7280;
          margin: 0;
        }

        /* Trust footer panel */
        .tm-trust {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 3rem;
          flex-wrap: wrap;
          margin-top: 4rem;
          padding-top: 2.5rem;
          border-top: 1px solid #fce7f3;
        }

        .tm-trust-label {
          font-size: 0.6875rem;
          font-weight: 700;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: #9ca3af;
        }

        .tm-trust-divider {
          width: 1px;
          height: 1rem;
          background: #e5e7eb;
          flex-shrink: 0;
        }

        @media (max-width: 639px) { .tm-trust-divider { display: none; } }

        .tm-platform {
          font-size: 0.875rem;
          font-weight: 800;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #d1d5db;
          transition: color 0.3s;
          cursor: default;
        }

        .tm-platform:hover { color: #ec4899; }
      `}</style>

      <section className="tm-section">
        <div className="tm-glow-bg" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
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

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
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
