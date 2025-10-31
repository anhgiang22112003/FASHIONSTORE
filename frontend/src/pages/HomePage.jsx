import React from 'react';
import HeroSection from '../components/fashion/HeroSection';
import FeaturedCollections from '../components/fashion/FeaturedCollections';
import ProductCategories from '../components/fashion/ProductCategories';
import BestSellers from '../components/fashion/BestSellers';
import AboutSection from '../components/fashion/AboutSection';
import Testimonials from '../components/fashion/Testimonials';
import Newsletter from '../components/fashion/Newsletter';
import FlashSaleBanner from '@/components/fashion/FlashSaleBanner';

const HomePage = () => {
  return (
    <div>
      <HeroSection />
      <FlashSaleBanner/>
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