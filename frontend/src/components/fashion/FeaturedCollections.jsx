import React, { useEffect, useState } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '../ui/button';
import { Link } from 'react-router-dom';
import api from '@/service/api';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Navigation, Autoplay, EffectCards } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import 'swiper/css/effect-cards';

const FeaturedCollections = () => {
  const [collection, setCollection] = useState([]);
  
  const featuredCollections = async () => {
    try {
      const response = await api.get('/collection');
      const activeCollection = response?.data?.data?.filter(item => item.isActive);
      setCollection(activeCollection);
    } catch (error) {
      console.log('Error fetching featured collections:', error);
    }
  };

  useEffect(() => {
    featuredCollections();
  }, []);

  return (
    <section className="py-20 bg-gradient-to-br from-pink-50 via-white to-pink-100 relative overflow-hidden">
      {/* Background decoration - Giảm số lượng */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-300 via-pink-400 to-pink-500"></div>
      
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-slide-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-pink-300 mb-4 shadow-lg">
            <Sparkles className="w-4 h-4 text-pink-500 animate-pulse" />
            <span className="text-sm font-bold text-black">COLLECTIONS</span>
          </div>
          <h2 className="text-4xl lg:text-6xl font-black mb-6 text-black">
            Bộ Sưu Tập <span className="bg-gradient-to-r from-pink-400 to-pink-600 bg-clip-text text-transparent">Nổi Bật</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Khám phá những bộ sưu tập mới nhất với thiết kế tinh tế và chất lượng cao
          </p>
        </div>

        <div className="relative">
          {collection && collection.length > 0 ? (
            <Swiper
              modules={[Pagination, Navigation, Autoplay]}
              autoplay={{
                delay: 5000,  // Tăng delay để mượt hơn
                disableOnInteraction: false,
                pauseOnMouseEnter: false,  // Tắt để tránh lag
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
              grabCursor={true}  // Thêm để mượt hơn
              className="pb-16"
            >
              {collection.map((item, index) => (
                <SwiperSlide key={item?.id}>
                  <div className="group relative overflow-hidden rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 hover-scale">
                    <div className="aspect-[4/5] overflow-hidden relative">
                      <img
                        src={item?.image}
                        alt={item?.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        loading="lazy"  // Lazy load
                        style={{ willChange: 'transform' }}
                      />
                      
                      {/* Gradient overlays */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
                      <div className="absolute inset-0 bg-gradient-to-br from-pink-500/0 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    </div>

                    {/* Content */}
                    <div className="absolute bottom-0 left-0 right-0 p-8 text-white transform transition-transform duration-500 group-hover:translate-y-0">
                      <div className="mb-4">
                        <div className="inline-block px-3 py-1 bg-pink-500 rounded-full text-xs font-bold mb-3 shadow-lg">
                          NEW
                        </div>
                        <h3 className="text-3xl font-black mb-3 drop-shadow-lg">{item?.name}</h3>
                        <p className="text-white/90 mb-6 line-clamp-2 text-sm">
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

        <div className="text-center mt-16 animate-slide-up">
          <Link to={"/collection"}>
            <Button 
              variant="outline" 
              size="lg" 
              className="border-2 border-pink-500 text-pink-500 hover:bg-pink-50 rounded-full px-8 py-6 text-lg font-bold group shadow-lg hover:shadow-pink-500/30"
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
