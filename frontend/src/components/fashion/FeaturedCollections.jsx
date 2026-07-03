import React, { useEffect, useState, useRef } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '../ui/button';
import { Link } from 'react-router-dom';
import api from '@/service/api';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Navigation, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

const FeaturedCollections = () => {
  const [collection, setCollection] = useState([]);
  const containerRef = useRef(null);
  
  const featuredCollections = async () => {
    try {
      const response = await api.get('/collection');
      const activeCollection = response?.data?.data?.filter(item => item.isActive);
      setCollection(activeCollection);
    } catch (error) {
      // console.log('Error fetching featured collections:', error);
    }
  };

  useEffect(() => {
    featuredCollections();
  }, []);

  useGSAP(() => {
    if (collection.length === 0) return;

    // Header reveal
    gsap.from('.collections-header-badge', {
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top 80%',
      },
      y: -30,
      opacity: 0,
      duration: 0.6,
      ease: 'power3.out'
    });

    gsap.from('.collections-title', {
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top 80%',
      },
      y: 50,
      opacity: 0,
      duration: 0.8,
      ease: 'power3.out',
      delay: 0.1
    });

    gsap.from('.collections-desc', {
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top 80%',
      },
      y: 30,
      opacity: 0,
      duration: 0.8,
      ease: 'power3.out',
      delay: 0.2
    });

    // Swiper cards entrance - 3D rotate
    gsap.from('.swiper-slide', {
      scrollTrigger: {
        trigger: '.swiper-container-wrapper',
        start: 'top 75%',
      },
      opacity: 0,
      y: 80,
      rotationY: 15,
      transformOrigin: '50% 50% -100px',
      stagger: 0.15,
      duration: 1.2,
      ease: 'power4.out'
    });

    // View all button fade-in
    gsap.from('.collections-view-all', {
      scrollTrigger: {
        trigger: '.collections-view-all',
        start: 'top 90%',
      },
      scale: 0.9,
      opacity: 0,
      duration: 0.8,
      ease: 'back.out(1.5)'
    });

  }, { scope: containerRef, dependencies: [collection] });

  return (
    <section ref={containerRef} className="py-20 bg-gradient-to-br from-pink-50 via-white to-pink-100 relative overflow-hidden perspective-1000">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-300 via-pink-400 to-pink-500"></div>
      
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="collections-header-badge inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-pink-300 mb-4 shadow-lg">
            <Sparkles className="w-4 h-4 text-pink-500 animate-pulse" />
            <span className="text-sm font-bold text-black">COLLECTIONS</span>
          </div>
          <h2 className="collections-title text-4xl lg:text-6xl font-black mb-6 text-black tracking-tight leading-none">
            Bộ Sưu Tập <span className="bg-gradient-to-r from-pink-400 to-pink-600 bg-clip-text text-transparent">Nổi Bật</span>
          </h2>
          <p className="collections-desc text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Khám phá những bộ sưu tập mới nhất với thiết kế tinh tế và chất lượng cao
          </p>
        </div>

        <div className="relative swiper-container-wrapper">
          {collection && collection.length > 0 ? (
            <Swiper
              modules={[Pagination, Navigation]}
              autoplay={{
                delay: 6000,
                disableOnInteraction: false,
              }}
              navigation={true}
              pagination={{ 
                clickable: true,
                dynamicBullets: true 
              }}
              slidesPerView={1}
              spaceBetween={32}
              breakpoints={{
                768: { slidesPerView: 2 },
                1024: { slidesPerView: 3 },
              }}
              grabCursor={true}
              className="pb-16"
            >
              {collection.map((item, index) => (
                <SwiperSlide key={item?.id || index}>
                  <div className="group relative overflow-hidden rounded-3xl shadow-xl hover:shadow-2xl hover:shadow-pink-100 transition-all duration-500 hover:-translate-y-2">
                    <div className="aspect-[4/5] overflow-hidden relative">
                      <img
                        src={item?.image}
                        alt={item?.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        loading="lazy"
                        style={{ willChange: 'transform' }}
                      />
                      
                      {/* Gradient overlays */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
                      <div className="absolute inset-0 bg-gradient-to-br from-pink-500/0 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    </div>

                    {/* Content */}
                    <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                      <div className="mb-4">
                        <div className="inline-block px-3 py-1 bg-pink-500 rounded-full text-xs font-bold mb-3 shadow-lg">
                          NEW
                        </div>
                        <h3 className="text-3xl font-black mb-3 drop-shadow-lg leading-tight">{item?.name}</h3>
                        <p className="text-white/95 mb-6 line-clamp-2 text-sm leading-relaxed">
                          {item?.description}
                        </p>
                      </div>
                      
                      <div className="flex items-center justify-between opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
                        <Link to={`/collection/${item?.slug || 'detail'}`}>
                          <Button
                            size="lg"
                            className="bg-white text-black hover:bg-gray-100 rounded-full font-bold shadow-xl"
                          >
                            Khám phá ngay
                            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </Button>
                        </Link>
                      </div>
                    </div>

                    {/* Decorative corner */}
                    <div className="absolute top-4 right-4 w-16 h-16 border-t-2 border-r-2 border-white/30 rounded-tr-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          ) : (
            <div className="text-center text-gray-600 py-16 bg-white rounded-3xl">
              <p className="text-lg">Không có bộ sưu tập nổi bật nào để hiển thị.</p>
            </div>
          )}
        </div>

        <div className="collections-view-all text-center mt-16">
          <Link to={"/collection"}>
            <Button 
              variant="outline" 
              size="lg" 
              className="border-2 border-pink-500 text-pink-500 hover:bg-pink-50 rounded-full px-8 py-6 text-lg font-bold group shadow-lg hover:shadow-pink-500/20"
            >
              Xem tất cả bộ sưu tập
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-2 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedCollections;
