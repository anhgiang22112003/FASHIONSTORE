import React, { useState } from 'react';
import { Mail, ArrowRight, Sparkles, Gift, TrendingUp, Zap } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

const Newsletter = () => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setEmail('');
    alert('Cảm ơn bạn đã đăng ký nhận tin!');
  };

  return (
    <section className="py-20 bg-gradient-to-r from-pink-500 to-purple-600 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/5 to-transparent"></div>
        <div className="absolute top-10 right-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }}></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-10 animate-slide-up">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl hover:scale-110 transition-transform animate-bounce-in">
              <Mail className="w-10 h-10 text-white" />
            </div>
            
            <h2 className="text-4xl lg:text-6xl font-black text-white mb-6 drop-shadow-lg">
              Đăng Ký Nhận Tin Mới Nhất
            </h2>
            
            <p className="text-xl text-white/90 mb-10 leading-relaxed">
              Nhận thông tin về các bộ sưu tập mới, khuyến mãi đặc biệt và 
              xu hướng thời trang hot nhất
            </p>
          </div>

          <form onSubmit={handleSubmit} className="max-w-md mx-auto mb-12 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="email"
                  placeholder="Nhập email của bạn..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-12 pr-4 py-6 w-full bg-white border-none text-gray-900 placeholder:text-gray-500 rounded-2xl text-lg font-medium shadow-xl"
                />
              </div>
              <Button
                type="submit"
                size="lg"
                className="bg-gray-900 text-white hover:bg-gray-800 hover:scale-105 px-8 py-6 rounded-2xl shadow-xl font-bold group"
              >
                Đăng ký
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </form>

          <p className="text-white/70 text-sm mb-16 animate-slide-up flex items-center justify-center gap-2" style={{ animationDelay: '0.3s' }}>
            <Sparkles className="w-4 h-4" />
            * Chúng tôi tôn trọng quyền riêng tư của bạn. Không spam!
            <Sparkles className="w-4 h-4" />
          </p>

          {/* Benefits */}
          <div className="grid sm:grid-cols-3 gap-8 animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <div className="group text-center p-8 bg-white/10 backdrop-blur-sm rounded-3xl border border-white/20 hover:bg-white/20 transition-all hover:-translate-y-1">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Gift className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-white font-black mb-3 text-xl">Ưu đãi độc quyền</h3>
              <p className="text-white/80 text-sm leading-relaxed">
                Nhận mã giảm giá đặc biệt dành riêng cho thành viên
              </p>
            </div>
            
            <div className="group text-center p-8 bg-white/10 backdrop-blur-sm rounded-3xl border border-white/20 hover:bg-white/20 transition-all hover:-translate-y-1">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-white font-black mb-3 text-xl">Xu hướng mới</h3>
              <p className="text-white/80 text-sm leading-relaxed">
                Cập nhật những xu hướng thời trang hot nhất
              </p>
            </div>
            
            <div className="group text-center p-8 bg-white/10 backdrop-blur-sm rounded-3xl border border-white/20 hover:bg-white/20 transition-all hover:-translate-y-1">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-white font-black mb-3 text-xl">Thông tin nhanh</h3>
              <p className="text-white/80 text-sm leading-relaxed">
                Nhận thông báo sớm nhất về sản phẩm mới
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
