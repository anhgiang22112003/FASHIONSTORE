import React, { Suspense, lazy } from 'react';

// Lazy load components
const HeroSection = lazy(() => import('../components/fashion/HeroSection'));
const FeaturedCollections = lazy(() => import('../components/fashion/FeaturedCollections'));
const ProductCategories = lazy(() => import('../components/fashion/ProductCategories'));
const BestSellers = lazy(() => import('../components/fashion/BestSellers'));
const AboutSection = lazy(() => import('../components/fashion/AboutSection'));
const Testimonials = lazy(() => import('../components/fashion/Testimonials'));
const Newsletter = lazy(() => import('../components/fashion/Newsletter'));
const FlashSaleBanner = lazy(() => import('@/components/fashion/FlashSaleBanner'));

const HomePage = () => {
  return (
    <div>
      {/* Thêm CSS cho scroll mượt và tối ưu performance */}
      <style>{`
        /* Làm mượt scroll toàn trang */
        html {
          scroll-behavior: smooth;
        }
        body {
          overflow-anchor: auto; /* Tránh giật khi dynamic content load */
        }
        /* Tối ưu animations */
        .animate-float {
          animation: float 6s ease-in-out infinite;
          will-change: transform;
        }
        .animate-slide-up {
          animation: slideUp 0.8s ease-out forwards;
          will-change: transform, opacity;
        }
        .animate-bounce-in {
          animation: bounceIn 0.6s ease-out forwards;
          will-change: transform, opacity;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes slideUp {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes bounceIn {
          0% { transform: scale(0.3); opacity: 0; }
          50% { transform: scale(1.05); }
          70% { transform: scale(0.9); }
          100% { transform: scale(1); opacity: 1; }
        }
        /* Tối ưu hover effects */
        .hover-scale {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          will-change: transform, box-shadow;
        }
        .hover-scale:hover {
          transform: translateY(-4px) scale(1.02);
        }
      `}</style>
      <HeroSection />
      <FlashSaleBanner />
      <FeaturedCollections />
      <ProductCategories />
      <BestSellers />
      <AboutSection />
      <Testimonials />
      <Newsletter />
    </div>
  );
};

export default HomePage;
