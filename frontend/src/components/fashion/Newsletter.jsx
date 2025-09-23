import React, { useState } from 'react';
import { Mail, ArrowRight } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

const Newsletter = () => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle newsletter signup
    console.log('Newsletter signup:', email);
    setEmail('');
    alert('Cảm ơn bạn đã đăng ký nhận tin!');
  };

  return (
    <section className="py-16 bg-gradient-to-r from-pink-500 to-purple-600">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail className="w-8 h-8 text-white" />
            </div>
            
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Đăng Ký Nhận Tin Mới Nhất
            </h2>
            
            <p className="text-xl text-white opacity-90 mb-8">
              Nhận thông tin về các bộ sưu tập mới, khuyến mãi đặc biệt và 
              xu hướng thời trang hot nhất
            </p>
          </div>

          <form onSubmit={handleSubmit} className="max-w-md mx-auto">
            <div className="flex gap-3">
              <Input
                type="email"
                placeholder="Nhập email của bạn..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1 bg-white border-none text-gray-900 placeholder-gray-500"
              />
              <Button
                type="submit"
                className="bg-white text-pink-500 hover:bg-gray-100 px-6"
              >
                Đăng ký
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </form>

          <p className="text-white opacity-70 text-sm mt-4">
            * Chúng tôi tôn trọng quyền riêng tư của bạn. Không spam!
          </p>

          {/* Benefits */}
          <div className="grid sm:grid-cols-3 gap-6 mt-12">
            <div className="text-center">
              <div className="text-2xl mb-2">🎁</div>
              <h3 className="text-white font-semibold mb-2">Ưu đãi độc quyền</h3>
              <p className="text-white opacity-80 text-sm">
                Nhận mã giảm giá đặc biệt dành riêng cho thành viên
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-2xl mb-2">👗</div>
              <h3 className="text-white font-semibold mb-2">Xu hướng mới</h3>
              <p className="text-white opacity-80 text-sm">
                Cập nhật những xu hướng thời trang hot nhất
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-2xl mb-2">⚡</div>
              <h3 className="text-white font-semibold mb-2">Thông tin nhanh</h3>
              <p className="text-white opacity-80 text-sm">
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