import React, { useRef } from 'react';
import { ArrowRight, Star, Sparkles, TrendingUp } from 'lucide-react';
import { Button } from '../ui/button';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

const HeroSection = () => {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const titleLine1Ref = useRef(null);
  const titleLine2Ref = useRef(null);
  const titleLine3Ref = useRef(null);
  const imageRef = useRef(null);
  const imageWrapperRef = useRef(null);

  useGSAP(() => {
    const tl = gsap.timeline();

    // Fade and slide badge in
    tl.from('.hero-badge', {
      y: -30,
      opacity: 0,
      scale: 0.8,
      duration: 0.8,
      ease: 'back.out(1.7)'
    });

    // Reveal text lines elegantly with skew
    tl.from([titleLine1Ref.current, titleLine2Ref.current, titleLine3Ref.current], {
      y: 80,
      opacity: 0,
      skewY: 5,
      stagger: 0.15,
      duration: 1,
      ease: 'power4.out'
    }, '-=0.4');

    // Description text reveal
    tl.from('.hero-desc', {
      y: 30,
      opacity: 0,
      duration: 0.8,
      ease: 'power3.out'
    }, '-=0.6');

    // CTA Buttons slide-in
    tl.from('.hero-cta-btn', {
      x: -30,
      opacity: 0,
      stagger: 0.15,
      duration: 0.8,
      ease: 'power3.out'
    }, '-=0.5');

    // Stats items staggered
    tl.from('.hero-stat-item', {
      y: 20,
      opacity: 0,
      stagger: 0.1,
      duration: 0.6,
      ease: 'power2.out'
    }, '-=0.4');

    // Image reveal using clipPath inset
    gsap.from(imageWrapperRef.current, {
      clipPath: 'inset(100% 0 0 0)',
      y: 80,
      duration: 1.5,
      ease: 'power4.inOut'
    });

    // Image scale animation on load
    gsap.from(imageRef.current, {
      scale: 1.3,
      duration: 2,
      ease: 'power4.out'
    });

    // Parallax scrolling effect on the main image
    gsap.to(imageRef.current, {
      yPercent: 12,
      ease: 'none',
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top top',
        end: 'bottom top',
        scrub: true
      }
    });

    // Floating animation for decorative badges
    gsap.to('.hero-float-badge-1', {
      y: 12,
      repeat: -1,
      yoyo: true,
      duration: 3,
      ease: 'sine.inOut'
    });

    gsap.to('.hero-float-badge-2', {
      y: -12,
      repeat: -1,
      yoyo: true,
      duration: 2.5,
      ease: 'sine.inOut'
    });

  }, { scope: containerRef });
  
  return (
    <section ref={containerRef} className="relative bg-gradient-to-br from-pink-50 to-purple-50 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-pink-200/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 py-20 lg:py-28 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-6 overflow-hidden">
              <div className="hero-badge inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-pink-200 shadow-lg">
                <Star className="w-4 h-4 fill-pink-500 text-pink-500" />
                <span className="text-sm font-bold text-pink-500">Thương hiệu thời trang hàng đầu</span>
                <Sparkles className="w-4 h-4 text-pink-500 animate-pulse" />
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-black leading-tight tracking-tight">
                <div className="overflow-hidden py-1">
                  <div ref={titleLine1Ref} className="will-change-transform">Thời Trang</div>
                </div>
                <div className="overflow-hidden py-1">
                  <div ref={titleLine2Ref} className="bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent will-change-transform">Hiện Đại</div>
                </div>
                <div className="overflow-hidden py-1">
                  <div ref={titleLine3Ref} className="will-change-transform">Cho Người Việt</div>
                </div>
              </h1>
              
              <p className="hero-desc text-xl text-gray-600 leading-relaxed max-w-xl">
                Khám phá bộ sưu tập thời trang mới nhất với thiết kế độc đáo, 
                chất lượng cao và giá cả phù hợp. Tự tin thể hiện phong cách của bạn!
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="hero-cta-btn">
                <Button 
                  size="lg" 
                  className="w-full sm:w-auto bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-6 text-lg font-bold rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all group"
                  onClick={() => navigate('/products')}
                >
                  Mua sắm ngay
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
              
              <div className="hero-cta-btn">
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="w-full sm:w-auto px-8 py-6 text-lg font-bold rounded-full border-2 border-pink-500 text-pink-500 hover:bg-pink-50 group"
                  onClick={() => navigate('/products')}
                >
                  Xem bộ sưu tập
                  <TrendingUp className="ml-2 w-5 h-5 group-hover:scale-110 transition-transform" />
                </Button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 pt-8 border-t border-gray-200">
              <div className="hero-stat-item text-center group cursor-pointer">
                <div className="text-3xl font-black bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent group-hover:scale-110 transition-transform">10K+</div>
                <div className="text-sm text-gray-600 font-medium">Khách hàng</div>
              </div>
              <div className="hero-stat-item text-center group cursor-pointer">
                <div className="text-3xl font-black bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent group-hover:scale-110 transition-transform">500+</div>
                <div className="text-sm text-gray-600 font-medium">Sản phẩm</div>
              </div>
              <div className="hero-stat-item text-center group cursor-pointer">
                <div className="text-3xl font-black bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent group-hover:scale-110 transition-transform">4.9★</div>
                <div className="text-sm text-gray-600 font-medium">Đánh giá</div>
              </div>
            </div>
          </div>

          {/* Right Content - Hero Image */}
          <div ref={imageWrapperRef} className="relative will-change-transform">
            <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl hover:shadow-pink-200/50 transition-shadow duration-300">
              <img
                ref={imageRef}
                src="/image/anhbia.avif"
                alt="Fashion Model"
                className="w-full h-[600px] object-cover scale-105 will-change-transform"
                style={{ backfaceVisibility: 'hidden' }}
              />
              
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
            </div>
            
            {/* Floating badges */}
            <div className="hero-float-badge-1 absolute top-8 left-8 bg-white/95 backdrop-blur-sm rounded-2xl px-5 py-3 shadow-2xl border border-pink-100 z-20">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-pink-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-bold text-gray-900">New Collection 2026</span>
              </div>
            </div>

            <div className="hero-float-badge-2 absolute bottom-8 right-8 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-2xl px-6 py-4 shadow-2xl z-20">
              <div className="text-center">
                <div className="text-2xl font-black">-50%</div>
                <div className="text-xs font-semibold uppercase tracking-wider">SALE HOT</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
