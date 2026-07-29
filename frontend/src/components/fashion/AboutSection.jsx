/* Hallmark · macrostructure: Marquee Hero · section: AboutSection · tone: Vercel Scroll Timeline */
import React, { useRef } from 'react';
import { Shield, Truck, HeadphonesIcon, RefreshCw, Layers, Award, Sparkles } from 'lucide-react';
import { brandStats } from '../../data/fashionMock';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

const features = [
  {
    icon: Shield,
    title: 'Chất lượng đảm bảo',
    description: 'Tất cả sản phẩm được kiểm tra nghiêm ngặt trước khi đến tay khách hàng.'
  },
  {
    icon: Truck,
    title: 'Giao hàng nhanh',
    description: 'Miễn phí vận chuyển toàn quốc cho đơn hàng từ 500.000₫.'
  },
  {
    icon: HeadphonesIcon,
    title: 'Hỗ trợ 24/7',
    description: 'Đội ngũ tư vấn nhiệt tình, sẵn sàng hỗ trợ mọi lúc.'
  },
  {
    icon: RefreshCw,
    title: 'Đổi trả dễ dàng',
    description: 'Chính sách đổi trả linh hoạt trong vòng 30 ngày.'
  }
];

const AboutSection = () => {
  const containerRef = useRef(null);
  const triggerRef = useRef(null);

  useGSAP(() => {
    // Word-by-word reveal for title
    gsap.from('.ab-heading-word', {
      scrollTrigger: {
        trigger: '.ab-heading',
        start: 'top 85%',
      },
      opacity: 0,
      filter: 'blur(10px)',
      y: 20,
      stagger: 0.1,
      duration: 0.8,
      ease: 'power3.out'
    });

    // Animate stats counting up from 0
    brandStats.forEach((stat, index) => {
      const targetVal = parseFloat(stat.number.replace(/[^0-9.]/g, ''));
      const suffix = stat.number.replace(/[0-9.]/g, '');
      const obj = { value: 0 };
      
      gsap.to(obj, {
        scrollTrigger: {
          trigger: '.ab-stats',
          start: 'top 90%',
        },
        value: targetVal,
        duration: 2,
        ease: 'power2.out',
        onUpdate: () => {
          const el = document.getElementById(`stat-num-${index}`);
          if (el) {
            el.innerText = Math.floor(obj.value) + suffix;
          }
        }
      });
    });

    // Timeline line progress filling up on scroll
    gsap.to('.ab-timeline-line-fill', {
      scrollTrigger: {
        trigger: '.ab-timeline-container',
        start: 'top 70%',
        end: 'bottom 40%',
        scrub: true
      },
      height: '100%',
      ease: 'none'
    });

    // Timeline card reveals
    gsap.from('.ab-timeline-step', {
      scrollTrigger: {
        trigger: '.ab-timeline-container',
        start: 'top 75%',
        end: 'bottom 50%',
        scrub: 1
      },
      opacity: 0.2,
      y: 40,
      stagger: 0.2
    });
  }, { scope: containerRef });

  return (
    <>
      <style>{`
        .ab-section {
          background-color: #020204;
          color: white;
          position: relative;
          overflow: hidden;
          padding: 8rem 0 4rem;
        }

        .ab-section::before {
          content: '';
          display: block;
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: rgba(255, 255, 255, 0.05);
        }

        /* Ambient glows */
        .ab-glow-bg {
          position: absolute;
          width: 35vw;
          height: 35vw;
          background: radial-gradient(circle, rgba(168, 85, 247, 0.05) 0%, transparent 70%);
          top: 10%;
          right: -10%;
          pointer-events: none;
          z-index: 1;
        }

        .ab-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 2rem;
          position: relative;
          z-index: 2;
        }

        /* Upper Grid: Story + Image Showcase */
        .ab-story {
          display: grid;
          grid-template-columns: 1fr;
          gap: 4rem;
          margin-bottom: 6rem;
        }

        @media (min-width: 1024px) {
          .ab-story {
            grid-template-columns: 1fr 1fr;
            align-items: center;
          }
        }

        .ab-eyebrow {
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

        .ab-eyebrow::before {
          content: '';
          display: block;
          width: 1.5rem;
          height: 1px;
          background: #a855f7;
        }

        .ab-heading {
          font-family: var(--font-display, 'Playfair Display', serif);
          font-size: clamp(2rem, 3.5vw, 3rem);
          font-weight: 700;
          line-height: 1.1;
          color: white;
          margin-bottom: 1.75rem;
        }

        .ab-heading-word {
          display: inline-block;
          margin-right: 0.3em;
        }

        .ab-body {
          font-family: var(--font-body, 'Inter', sans-serif);
          font-size: 1rem;
          line-height: 1.8;
          color: rgba(255, 255, 255, 0.6);
          margin-bottom: 1.5rem;
          max-width: 48ch;
        }

        .ab-stats {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.5rem 2rem;
          margin-top: 3rem;
          padding-top: 2.5rem;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
        }

        @media (min-width: 640px) {
          .ab-stats { grid-template-columns: repeat(4, 1fr); }
        }

        .ab-stat-num {
          font-family: var(--font-display, 'Playfair Display', serif);
          font-size: 2.25rem;
          font-weight: 900;
          color: white;
          line-height: 1;
          margin-bottom: 0.5rem;
        }

        .ab-stat-label {
          font-family: var(--font-body, 'Inter', sans-serif);
          font-size: 0.6875rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.4);
        }

        /* Image Side with glass frame overlay */
        .ab-image-frame {
          position: relative;
          aspect-ratio: 4 / 3;
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 30px 60px rgba(0,0,0,0.6);
        }

        .ab-story-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        /* Scroll-linked Timeline section */
        .ab-timeline-section {
          margin-bottom: 6rem;
        }

        .ab-timeline-title-wrap {
          text-align: center;
          margin-bottom: 4rem;
        }

        .ab-timeline-container {
          position: relative;
          max-width: 800px;
          margin: 0 auto;
          padding: 2rem 0;
        }

        /* Vertical Timeline Center Gauge Line */
        .ab-timeline-line {
          position: absolute;
          left: 50%;
          top: 0;
          bottom: 0;
          width: 2px;
          background: rgba(255, 255, 255, 0.05);
          transform: translateX(-50%);
        }

        .ab-timeline-line-fill {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          height: 0%;
          background: linear-gradient(to bottom, #a855f7, #ef4444);
        }

        .ab-timeline-step {
          display: grid;
          grid-template-columns: 1fr;
          gap: 2rem;
          margin-bottom: 4rem;
          position: relative;
        }

        @media (min-width: 768px) {
          .ab-timeline-step {
            grid-template-columns: 1fr 1fr;
            gap: 4rem;
          }
          
          .ab-timeline-step:nth-child(even) .ab-timeline-content {
            grid-column: 2;
            text-align: left;
          }
          
          .ab-timeline-step:nth-child(odd) .ab-timeline-content {
            grid-column: 1;
            text-align: right;
          }
        }

        /* Node dot in center of gauge */
        .ab-timeline-node {
          position: absolute;
          left: 50%;
          top: 1.5rem;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #020204;
          border: 2px solid rgba(255, 255, 255, 0.3);
          transform: translateX(-50%);
          z-index: 3;
          box-shadow: 0 0 10px rgba(0,0,0,0.8);
        }

        .ab-timeline-step:hover .ab-timeline-node {
          border-color: #a855f7;
          box-shadow: 0 0 10px #a855f7;
        }

        .ab-timeline-content {
          background: rgba(255, 255, 255, 0.01);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          padding: 1.5rem;
          backdrop-filter: blur(10px);
          transition: border-color 0.3s, background-color 0.3s;
        }

        .ab-timeline-step:hover .ab-timeline-content {
          border-color: rgba(255, 255, 255, 0.15);
          background: rgba(255, 255, 255, 0.03);
        }

        .ab-timeline-tag {
          font-family: var(--font-body, 'Inter', sans-serif);
          font-size: 0.625rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #a855f7;
          margin-bottom: 0.5rem;
        }

        .ab-timeline-step-title {
          font-family: var(--font-body, 'Inter', sans-serif);
          font-size: 1.0625rem;
          font-weight: 600;
          color: white;
          margin-bottom: 0.5rem;
        }

        .ab-timeline-step-desc {
          font-family: var(--font-body, 'Inter', sans-serif);
          font-size: 0.8125rem;
          line-height: 1.6;
          color: rgba(255, 255, 255, 0.5);
          margin: 0;
        }

        /* Feature tiles (Grid of 4) */
        .ab-features {
          display: grid;
          grid-template-columns: 1fr;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }

        @media (min-width: 640px) {
          .ab-features { grid-template-columns: repeat(2, 1fr); }
        }

        @media (min-width: 1024px) {
          .ab-features { grid-template-columns: repeat(4, 1fr); }
        }

        .ab-feature-tile {
          padding: 3rem 2rem;
          border-right: 1px solid rgba(255, 255, 255, 0.05);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          background: transparent;
          transition: background 0.3s;
        }

        .ab-feature-tile:last-child { border-right: none; }

        @media (max-width: 1023px) {
          .ab-feature-tile:nth-child(even) { border-right: none; }
        }

        .ab-feature-tile:hover {
          background: rgba(255, 255, 255, 0.01);
        }

        .ab-feature-icon {
          width: 2.25rem;
          height: 2.25rem;
          color: #a855f7;
          margin-bottom: 1.5rem;
          filter: drop-shadow(0 0 5px rgba(168,85,247,0.3));
        }

        .ab-feature-title {
          font-family: var(--font-body, 'Inter', sans-serif);
          font-size: 0.9375rem;
          font-weight: 600;
          color: white;
          margin-bottom: 0.5rem;
        }

        .ab-feature-desc {
          font-family: var(--font-body, 'Inter', sans-serif);
          font-size: 0.8125rem;
          line-height: 1.65;
          color: rgba(255, 255, 255, 0.5);
          margin: 0;
        }
      `}</style>

      <section className="ab-section" ref={containerRef}>
        <div className="ab-glow-bg" />

        <div className="ab-container">
          {/* Upper Grid */}
          <div className="ab-story">
            <div>
              <p className="ab-eyebrow">Về chúng tôi</p>
              <h2 className="ab-heading">
                {("FashionStore — Bản lĩnh tiên phong định hình tương lai").split(' ').map((word, idx) => (
                  <span key={idx} className="ab-heading-word">{word}</span>
                ))}
              </h2>
              
              <p className="ab-body">
                Với hơn 5 năm kinh nghiệm trong ngành thời trang, chúng tôi cam kết
                mang đến những sản phẩm chất lượng cao với thiết kế hiện đại,
                phù hợp với xu hướng và phong cách người Việt Nam.
              </p>
              <p className="ab-body">
                Từ trang phục công sở thanh lịch đến những bộ đồ casual năng động,
                mỗi sản phẩm là một lựa chọn để bạn tự tin thể hiện cá tính riêng.
              </p>

              <div className="ab-stats">
                {brandStats.map((stat, i) => (
                  <div key={i}>
                    <div className="ab-stat-num" id={`stat-num-${i}`}>0</div>
                    <div className="ab-stat-label">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Image Frame with hover parallax offset */}
            <div className="ab-image-frame">
              <img
                src="/image/anhabout.avif"
                alt="FashionStore — không gian thời trang"
                className="ab-story-img animate-float"
                loading="lazy"
              />
            </div>
          </div>

          {/* Core Timeline Scroll-linked */}
          <div className="ab-timeline-section">
            <div className="ab-timeline-title-wrap">
              <p className="ab-eyebrow">Quy trình sản xuất</p>
              <h3 className="ab-heading">Hành Trình Kiến Tạo Sản Phẩm</h3>
            </div>

            <div className="ab-timeline-container" ref={triggerRef}>
              <div className="ab-timeline-line">
                <div className="ab-timeline-line-fill" />
              </div>

              <div className="ab-timeline-step">
                <div className="ab-timeline-node" />
                <div className="ab-timeline-content">
                  <div className="ab-timeline-tag">BƯỚC 01</div>
                  <h4 className="ab-timeline-step-title">Phác thảo ý tưởng & Thiết kế 3D</h4>
                  <p className="ab-timeline-step-desc">
                    Đội ngũ thiết kế sử dụng mô hình hóa vải ảo 3D để tối ưu hóa phom dáng chuẩn nhất cho người Việt Nam.
                  </p>
                </div>
              </div>

              <div className="ab-timeline-step">
                <div className="ab-timeline-node" />
                <div className="ab-timeline-content">
                  <div className="ab-timeline-tag">BƯỚC 02</div>
                  <h4 className="ab-timeline-step-title">Tuyển chọn chất liệu Organic</h4>
                  <p className="ab-timeline-step-desc">
                    Tuyển lọc nghiêm ngặt các sợi bông hữu cơ thô, đũi tự nhiên có đặc tính thoáng khí và thân thiện làn da.
                  </p>
                </div>
              </div>

              <div className="ab-timeline-step">
                <div className="ab-timeline-node" />
                <div className="ab-timeline-content">
                  <div className="ab-timeline-tag">BƯỚC 03</div>
                  <h4 className="ab-timeline-step-title">Cắt may & Gia công thủ công</h4>
                  <p className="ab-timeline-step-desc">
                    Các nghệ nhân giàu kinh nghiệm gia công chi tiết cúc áo, đường viền may vạt bằng kỹ thuật thủ công gia truyền.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Lower Grid Feature tiles */}
          <div className="ab-features">
            {features.map((f, i) => (
              <div key={i} className="ab-feature-tile">
                <f.icon className="ab-feature-icon" strokeWidth={1.5} />
                <h3 className="ab-feature-title">{f.title}</h3>
                <p className="ab-feature-desc">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default React.memo(AboutSection);
