import React from 'react';
import { ArrowRight, Star, Sparkles, TrendingUp } from 'lucide-react';
import { Button } from '../ui/button';
import { useNavigate } from 'react-router-dom';

const HeroSection = () => {
  const navigate = useNavigate();
  
  return (
    <section className="relative bg-gradient-to-br from-pink-50 to-purple-50 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-pink-200/30 rounded-full blur-3xl animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="container mx-auto px-4 py-20 lg:py-28 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8 animate-slide-up">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-pink-200 shadow-lg animate-bounce-in">
                <Star className="w-4 h-4 fill-pink-500 text-pink-500" />
                <span className="text-sm font-bold text-pink-500">Thương hiệu thời trang hàng đầu</span>
                <Sparkles className="w-4 h-4 text-pink-500 animate-pulse" />
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-black leading-tight">
                Thời Trang
                <br />
                <span className="bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">Hiện Đại</span>
                <br />
                Cho Người Việt
              </h1>
              
              <p className="text-xl text-gray-600 leading-relaxed max-w-xl">
                Khám phá bộ sưu tập thời trang mới nhất với thiết kế độc đáo, 
                chất lượng cao và giá cả phù hợp. Tự tin thể hiện phong cách của bạn!
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-6 text-lg font-bold rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all group"
                onClick={() => navigate('/category/women')}
              >
                Mua sắm ngay
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <Button 
                variant="outline" 
                size="lg" 
                className="px-8 py-6 text-lg font-bold rounded-full border-2 border-pink-500 text-pink-500 hover:bg-pink-50 group"
                onClick={() => navigate('/category/women')}
              >
                Xem bộ sưu tập
                <TrendingUp className="ml-2 w-5 h-5 group-hover:scale-110 transition-transform" />
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 pt-8 border-t border-gray-200">
              <div className="text-center group cursor-pointer">
                <div className="text-3xl font-black bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent group-hover:scale-110 transition-transform">10K+</div>
                <div className="text-sm text-gray-600 font-medium">Khách hàng</div>
              </div>
              <div className="text-center group cursor-pointer">
                <div className="text-3xl font-black bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent group-hover:scale-110 transition-transform">500+</div>
                <div className="text-sm text-gray-600 font-medium">Sản phẩm</div>
              </div>
              <div className="text-center group cursor-pointer">
                <div className="text-3xl font-black bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent group-hover:scale-110 transition-transform">4.9★</div>
                <div className="text-sm text-gray-600 font-medium">Đánh giá</div>
              </div>
            </div>
          </div>

          {/* Right Content - Hero Image */}
          <div className="relative animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl hover:-translate-y-2 transition-transform duration-300">
              <img
                src="/image/anhbia.avif"
                alt="Fashion Model"
                className="w-full h-[600px] object-cover"
                loading="lazy"
              />
              
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute -top-8 -right-8 w-80 h-80 bg-pink-300/30 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute -bottom-12 -left-12 w-72 h-72 bg-purple-300/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            
            {/* Floating badge */}
            <div className="absolute top-8 left-8 bg-white/90 backdrop-blur-sm rounded-2xl px-5 py-3 shadow-xl border border-gray-100 animate-bounce-in">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-pink-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-bold text-gray-900">New Collection 2024</span>
              </div>
            </div>

            {/* Discount badge */}
            <div className="absolute bottom-8 right-8 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-2xl px-6 py-4 shadow-xl animate-bounce-in" style={{ animationDelay: '0.5s' }}>
              <div className="text-center">
                <div className="text-2xl font-black">-50%</div>
                <div className="text-xs font-medium">SALE HOT</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
