import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./index.css";
import Header from "./components/fashion/Header";
import Footer from "./components/fashion/Footer";
import HomePage from "./pages/HomePage";
import ProductPage from "./pages/ProductPage";
import CategoryPage from "./pages/CategoryPage";
import CartPage from "./pages/CartPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import BlogPage from "./pages/BlogPage";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-white">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/product/:id" element={<ProductPage />} />
            <Route path="/category/:category" element={<CategoryPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:slug" element={<BlogArticlePage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

// Simple Blog Article Page Component
const BlogArticlePage = () => {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Bài viết blog sẽ được hiển thị ở đây
          </h1>
          <p className="text-gray-600">
            Nội dung chi tiết của bài viết sẽ được load từ database
          </p>
        </div>
        <div className="bg-gray-100 rounded-lg p-8 text-center">
          <p className="text-gray-500">Content placeholder</p>
        </div>
      </div>
    </div>
  );
};

export default App;