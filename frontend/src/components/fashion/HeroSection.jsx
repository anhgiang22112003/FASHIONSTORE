import React from 'react';
import { ArrowRight, Star } from 'lucide-react';
import { Button } from '../ui/button';
import { useNavigate } from 'react-router-dom';

const HeroSection = () => {
  const navigate = useNavigate();
  
  return (
    <section className="relative bg-gradient-to-r from-pink-50 to-purple-50 overflow-hidden">
      <div className="container mx-auto px-4 py-16 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-pink-500">
                <Star className="w-5 h-5 fill-current" />
                <span className="text-sm font-medium">Thương hiệu thời trang hàng đầu</span>
              </div>
              
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Thời Trang
                <span className="text-pink-500"> Hiện Đại</span>
                <br />
                Cho Người Việt
              </h1>
              
              <p className="text-xl text-gray-600 leading-relaxed">
                Khám phá bộ sưu tập thời trang mới nhất với thiết kế độc đáo, 
                chất lượng cao và giá cả phù hợp. Tự tin thể hiện phong cách của bạn!
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="bg-pink-500 hover:bg-pink-600 text-white px-8 py-3"
                onClick={() => navigate('/category/women')}
              >
                Mua sắm ngay
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              
              <Button 
                variant="outline" 
                size="lg" 
                className="border-gray-300 px-8 py-3"
                onClick={() => navigate('/category/women')}
              >
                Xem bộ sưu tập
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 pt-8 border-t border-gray-200">
              <div className="text-center">
                <div className="text-2xl font-bold text-pink-500">10K+</div>
                <div className="text-sm text-gray-600">Khách hàng</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-pink-500">500+</div>
                <div className="text-sm text-gray-600">Sản phẩm</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-pink-500">4.9★</div>
                <div className="text-sm text-gray-600">Đánh giá</div>
              </div>
            </div>
          </div>

          {/* Right Content - Hero Image */}
          <div className="relative">
            <div className="relative z-10">
              <img
                src="/image/anhbia.avif"
                alt="Fashion Model"
                className="w-full h-[600px] object-cover rounded-2xl shadow-2xl"
                loading="lazy"
              />
            </div>
            
            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 w-72 h-72 bg-pink-200 rounded-full opacity-20 blur-3xl"></div>
            <div className="absolute -bottom-8 -left-8 w-64 h-64 bg-purple-200 rounded-full opacity-20 blur-3xl"></div>
            
            {/* Floating badge */}
            <div className="absolute top-8 left-8 bg-white rounded-full px-4 py-2 shadow-lg">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium">New Collection</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;