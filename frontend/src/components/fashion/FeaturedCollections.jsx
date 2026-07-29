/* Hallmark · macrostructure: Marquee Hero · section: FeaturedCollections · tone: Vercel 3D Cover Flow */
import React, { useEffect, useState, useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '@/service/api';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Navigation, EffectCoverflow } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import 'swiper/css/effect-coverflow';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

const FeaturedCollections = () => {
  const [collection, setCollection] = useState([]);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [showCursor, setShowCursor] = useState(false);
  const containerRef = useRef(null);
  const sectionRef = useRef(null);

  const featuredCollections = async () => {
    try {
      const response = await api.get('/collection');
      const activeCollection = response?.data?.data?.filter(item => item.isActive);
      setCollection(activeCollection);
    } catch (error) {
      // silently fail
    }
  };

  useEffect(() => {
    featuredCollections();
  }, []);

  useGSAP(() => {
    if (collection.length === 0) return;

    gsap.from('.fc-heading-group', {
      scrollTrigger: { trigger: containerRef.current, start: 'top 85%' },
      y: 45,
      opacity: 0,
      duration: 0.9,
      ease: 'power3.out'
    });

    gsap.from('.fc-swiper-wrap', {
      scrollTrigger: { trigger: '.fc-swiper-wrap', start: 'top 80%' },
      opacity: 0,
      y: 50,
      duration: 1.1,
      ease: 'power4.out'
    });
  }, { scope: containerRef, dependencies: [collection] });

  const handleMouseMove = (e) => {
    if (!sectionRef.current) return;
    const rect = sectionRef.current.getBoundingClientRect();
    setCursorPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  return (
    <>
      <style>{`
        .fc-section {
          padding: 5rem 0;
          background: linear-gradient(180deg, #ffffff 0%, #fff1f2 100%);
          position: relative;
          overflow: hidden;
          cursor: crosshair;
        }

        /* Ambient glow backdrop */
        .fc-glow-bg {
          position: absolute;
          width: 40%;
          height: 40%;
          background: radial-gradient(circle, rgba(236, 72, 153, 0.08) 0%, transparent 70%);
          bottom: -10%;
          right: -5%;
          pointer-events: none;
          z-index: 1;
        }

        /* Custom Floating Cursor */
        .fc-custom-cursor {
          position: absolute;
          width: 5.5rem;
          height: 5.5rem;
          background: #ffffff;
          color: #000000;
          border-radius: 50%;
          pointer-events: none;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.6875rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          z-index: 99;
          transform: translate(-50%, -50%) scale(0);
          opacity: 0;
          box-shadow: 0 8px 25px rgba(0,0,0,0.15);
        }

        .fc-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          margin-bottom: 2.5rem;
          gap: 2rem;
          flex-wrap: wrap;
          position: relative;
          z-index: 2;
        }

        .fc-eyebrow {
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #ec4899;
          margin-bottom: 0.5rem;
        }

        .fc-title {
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          font-size: clamp(1.8rem, 3.5vw, 2.75rem);
          font-weight: 900;
          line-height: 1.15;
          color: #111827;
          margin: 0;
        }

        .fc-title em {
          font-style: normal;
          color: #db2777;
        }

        .fc-view-all-link {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.8125rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #db2777;
          text-decoration: none;
          border-bottom: 2px solid #fbcfe8;
          padding-bottom: 4px;
          transition: color 0.3s, border-color 0.3s;
          white-space: nowrap;
          flex-shrink: 0;
        }

        .fc-view-all-link:hover {
          color: #be185d;
          border-color: #be185d;
        }

        .fc-arrow {
          transition: transform 0.25s cubic-bezier(0.16,1,0.3,1);
        }
        .fc-view-all-link:hover .fc-arrow { transform: translateX(4px); }

        .fc-swiper-wrap {
          position: relative;
          padding: 1rem 0 3rem;
          overflow: visible;
        }

        /* Swiper Navigation & Pagination */
        .fc-swiper-wrap .swiper-button-next,
        .fc-swiper-wrap .swiper-button-prev {
          width: 3rem;
          height: 3rem;
          background: #ffffff;
          border: 1px solid #fbcfe8;
          border-radius: 50%;
          color: #db2777;
          transition: background 0.3s, border-color 0.3s, transform 0.3s;
          box-shadow: 0 4px 15px rgba(236, 72, 153, 0.15);
        }

        .fc-swiper-wrap .swiper-button-next:hover,
        .fc-swiper-wrap .swiper-button-prev:hover {
          background: #ec4899;
          color: #ffffff;
          border-color: #ec4899;
        }

        .fc-swiper-wrap .swiper-button-next::after,
        .fc-swiper-wrap .swiper-button-prev::after {
          font-size: 0.75rem;
          font-weight: 900;
        }

        .fc-swiper-wrap .swiper-pagination-bullet {
          background: #fbcfe8;
          opacity: 1;
          width: 24px;
          height: 3px;
          border-radius: 99px;
          transition: width 0.3s, background-color 0.3s;
        }

        .fc-swiper-wrap .swiper-pagination-bullet-active {
          background: #ec4899;
          width: 48px;
        }

        .fc-card {
          position: relative;
          overflow: hidden;
          aspect-ratio: 3 / 4;
          background: #f9fafb;
          border: 1px solid #fce7f3;
          border-radius: 20px;
          cursor: none;
          box-shadow: 0 10px 30px rgba(236, 72, 153, 0.08);
        }

        .fc-card-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 1.2s cubic-bezier(0.16, 1, 0.3, 1);
          display: block;
        }

        .swiper-slide-active .fc-card:hover .fc-card-img {
          transform: scale(1.05);
        }

        .fc-card-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(17, 24, 39, 0.75) 0%, rgba(17, 24, 39, 0.15) 55%, transparent 100%);
          pointer-events: none;
        }

        .fc-card-body {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 2.25rem;
          z-index: 3;
        }

        .fc-card-tag {
          display: inline-block;
          font-size: 0.625rem;
          font-weight: 700;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: #be185d;
          background: rgba(255, 255, 255, 0.95);
          border: 1px solid #fbcfe8;
          padding: 0.35rem 0.85rem;
          border-radius: 99px;
          margin-bottom: 0.875rem;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          transition: transform 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .fc-card:hover .fc-card-tag {
          transform: scale(1.05);
        }

        .fc-card-title {
          font-size: 1.625rem;
          font-weight: 800;
          color: #ffffff;
          margin: 0 0 0.4rem;
          line-height: 1.2;
          text-shadow: 0 2px 10px rgba(0,0,0,0.3);
        }

        .fc-card-desc {
          font-size: 0.8125rem;
          color: rgba(255, 255, 255, 0.85);
          line-height: 1.5;
          margin: 0 0 1.5rem;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-shadow: 0 1px 5px rgba(0,0,0,0.3);
        }

        .fc-card-cta {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #ffffff;
          text-decoration: none;
          background: rgba(236, 72, 153, 0.9);
          padding: 0.5rem 1.25rem;
          border-radius: 99px;
          backdrop-filter: blur(8px);
          transform: translateY(12px);
          opacity: 0;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 4px 15px rgba(236, 72, 153, 0.3);
        }

        .fc-card:hover .fc-card-cta {
          opacity: 1;
          transform: translateY(0);
        }

        .fc-card-cta:hover { background: #db2777; }

        @media (max-width: 1023px) {
          .fc-section { cursor: default; }
          .fc-custom-cursor { display: none; }
          .fc-card { cursor: pointer; }
          .fc-card-cta { opacity: 1; transform: none; }
          .fc-swiper-wrap .swiper-slide {
            transform: none !important;
            opacity: 1 !important;
          }
        }
      `}</style>

      <section
        ref={sectionRef}
        className="fc-section"
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setShowCursor(true)}
        onMouseLeave={() => setShowCursor(false)}
      >
        <div className="fc-glow-bg" />

        {/* Custom cursor follower */}
        {showCursor && (
          <div
            className="fc-custom-cursor"
            style={{
              left: `${cursorPos.x}px`,
              top: `${cursorPos.y}px`
            }}
          >
            Khám phá
          </div>
        )}

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10" ref={containerRef}>
          <div className="fc-heading-group">
            <div>
              <p className="fc-eyebrow">Collections</p>
              <h2 className="fc-title">
                Bộ Sưu Tập <em>Nổi Bật</em>
              </h2>
            </div>
            <Link to="/collection" className="fc-view-all-link fc-view-all" id="fc-view-all-top">
              Xem tất cả <ArrowRight className="fc-arrow" size={14} />
            </Link>
          </div>

          <div className="fc-swiper-wrap">
            {collection && collection.length > 0 ? (
            <Swiper
                modules={[Pagination, Navigation, EffectCoverflow]}
                effect="coverflow"
                coverflowEffect={{
                  rotate: 25,
                  stretch: 0,
                  depth: 120,
                  modifier: 1,
                  slideShadows: false
                }}
                grabCursor={true}
                centeredSlides={true}
                slidesPerView={1.2}
                spaceBetween={30}
                navigation={true}
                pagination={{ clickable: true }}
                breakpoints={{
                  640: { slidesPerView: 1.8, spaceBetween: 30 },
                  1024: { slidesPerView: 3, spaceBetween: 40 },
                }}
                className="pb-14"
              >
                {collection.map((item, index) => (
                  <SwiperSlide key={item?.id || index}>
                    <div className="fc-card">
                      <img
                        src={item?.image}
                        alt={item?.name}
                        className="fc-card-img"
                        loading="lazy"
                      />
                      <div className="fc-card-overlay" />
                      <div className="fc-card-body">
                        <div className="fc-card-tag">New</div>
                        <h3 className="fc-card-title">{item?.name}</h3>
                        <p className="fc-card-desc">{item?.description}</p>
                        <Link
                          to={`/collection/${item?.slug || 'detail'}`}
                          className="fc-card-cta"
                          id={`fc-card-cta-${index}`}
                        >
                          Khám phá <ArrowRight size={12} />
                        </Link>
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            ) : (
              <div className="text-center py-20 text-gray-500">
                <p>Chưa có bộ sưu tập nào.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default FeaturedCollections;
