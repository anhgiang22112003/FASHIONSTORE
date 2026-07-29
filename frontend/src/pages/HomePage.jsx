import React, { Suspense, lazy, useEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

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
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        setScrollProgress((window.scrollY / totalHeight) * 100);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="hm-pink-theme-wrapper">
      {/* Dynamic Scroll Progress Bar */}
      <div 
        className="hm-scroll-progress" 
        style={{ width: `${scrollProgress}%` }} 
      />

      {/* Global CSS for Pink/White/Black theme */}
      <style>{`
        .hm-pink-theme-wrapper {
          background-color: #fafafa;
          color: #111827;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          overflow-x: hidden;
          position: relative;
        }

        /* Top Scroll Progress */
        .hm-scroll-progress {
          position: fixed;
          top: 0;
          left: 0;
          height: 3px;
          background: linear-gradient(to right, #ec4899, #f43f5e, #be185d);
          z-index: 9999;
          transition: width 0.1s ease-out;
        }

        /* Smooth scrolling container animation defaults */
        .reveal-element {
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 1s cubic-bezier(0.16, 1, 0.3, 1), transform 1s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .reveal-element.is-visible {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>

      <Suspense fallback={<div className="min-h-screen bg-pink-50 flex items-center justify-center text-pink-600 font-semibold">Đang tải...</div>}>
        <HeroSection />
        <FlashSaleBanner />
        <FeaturedCollections />
        <ProductCategories />
        <BestSellers />
        <AboutSection />
        <Testimonials />
        <Newsletter />
      </Suspense>
    </div>
  );
};

export default HomePage;
