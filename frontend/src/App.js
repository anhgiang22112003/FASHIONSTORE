import React from "react";
import "./index.css";
import Header from "./components/fashion/Header";
import HeroSection from "./components/fashion/HeroSection";
import FeaturedCollections from "./components/fashion/FeaturedCollections";
import ProductCategories from "./components/fashion/ProductCategories";
import BestSellers from "./components/fashion/BestSellers";
import AboutSection from "./components/fashion/AboutSection";
import Testimonials from "./components/fashion/Testimonials";
import Newsletter from "./components/fashion/Newsletter";
import Footer from "./components/fashion/Footer";

function App() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <HeroSection />
      <FeaturedCollections />
      <ProductCategories />
      <BestSellers />
      <AboutSection />
      <Testimonials />
      <Newsletter />
      <Footer />
    </div>
  );
}

export default App;