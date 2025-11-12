import React from 'react';
import { Star, Quote, Sparkles } from 'lucide-react';
import { testimonials } from '../../data/fashionMock';

const Testimonials = () => {
  return (
    <section className="py-20 bg-white relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-pink-50/30 to-transparent"></div>
      <div className="absolute top-20 right-20 w-72 h-72 bg-pink-100/50 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-purple-100/50 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16 animate-slide-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-pink-50 rounded-full border border-pink-200 mb-4 shadow-sm">
            <Sparkles className="w-4 h-4 text-pink-500 animate-pulse" />
            <span className="text-sm font-bold text-pink-500">TESTIMONIALS</span>
          </div>
          <h2 className="text-4xl lg:text-6xl font-black mb-6">
            Khách Hàng <span className="bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">Nói Gì</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Những phản hồi tích cực từ khách hàng là động lực để chúng tôi phát triển
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.id}
              className="group relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 p-8 border border-gray-100 hover:border-pink-300 hover:-translate-y-2 animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Quote Icon */}
              <div className="absolute -top-4 left-8 w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Quote className="w-6 h-6 text-white" />
              </div>

              {/* Rating */}
              <div className="flex items-center gap-1 mb-6 mt-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < testimonial.rating
                        ? 'text-pink-500 fill-pink-500'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>

              {/* Content */}
              <p className="text-gray-700 mb-8 leading-relaxed text-lg">
                "{testimonial.content}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-4 pt-6 border-t border-gray-200">
                <div className="relative">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-14 h-14 rounded-full object-cover ring-4 ring-pink-100"
                  />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-xs text-white font-bold">✓</span>
                  </div>
                </div>
                <div>
                  <h4 className="font-black text-gray-900 text-lg">
                    {testimonial.name}
                  </h4>
                  <p className="text-sm text-gray-600 font-medium">
                    {testimonial.role}
                  </p>
                </div>
              </div>

              {/* Decorative corner */}
              <div className="absolute bottom-4 right-4 w-16 h-16 border-b-2 border-r-2 border-pink-200 rounded-br-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
          ))}
        </div>

        {/* Trust badges */}
        <div className="text-center animate-slide-up">
          <p className="text-sm text-gray-600 font-bold mb-8 flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-pink-500" />
            Được tin tưởng bởi hơn 10,000 khách hàng
            <Sparkles className="w-4 h-4 text-pink-500" />
          </p>
          <div className="flex justify-center items-center gap-12 flex-wrap">
            {['SHOPEE', 'LAZADA', 'TIKI', 'SENDO'].map((brand, index) => (
              <div 
                key={brand} 
                className="group cursor-pointer"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="text-2xl font-black text-gray-400 group-hover:bg-gradient-to-r group-hover:from-pink-500 group-hover:to-purple-600 group-hover:bg-clip-text group-hover:text-transparent transition-all group-hover:scale-110 transform">
                  {brand}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
