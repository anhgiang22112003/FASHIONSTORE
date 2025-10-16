import React, { Suspense, lazy } from "react"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import "./index.css"
import Header from "./components/fashion/Header"
import Footer from "./components/fashion/Footer"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { AdminRoute } from "./service/AdminRoute"
import { AuthProvider } from "./context/Authcontext"
import { CartProvider } from "./context/CartContext"
const AdminLoginForm = lazy(() => import("./pages/Admin/LoginAdmin"))
// Lazy load các page
const HomePage = lazy(() => import("./pages/HomePage"))
const ProductPage = lazy(() => import("./pages/ProductPage"))
const CategoryPage = lazy(() => import("./pages/CategoryPage"))
const CartPage = lazy(() => import("./pages/CartPage"))
const AboutPage = lazy(() => import("./pages/AboutPage"))
const ContactPage = lazy(() => import("./pages/ContactPage"))
const BlogPage = lazy(() => import("./pages/BlogPage"))
const Checkout = lazy(() => import("./pages/Checkout"))
const Wishlist = lazy(() => import("./pages/Wishlist"))
const AuthPage = lazy(() => import("./pages/AuthPage"))
const CollectionPage = lazy(() => import("./pages/Collection"))
const ProductCategoryPage = lazy(() => import("./pages/Category"))
const AdminLayout = lazy(() => import("./pages/Admin/Adminlayout"))
const UserProfile = lazy(() => import("./pages/UserProfile"))
const ResetPassword = lazy(() => import("./pages/ResetPassword"))
const ForgotPassword = lazy(()=> import ("./pages/ForgotPassword"))  

// Blog article inline
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
  )
}

// Layout Frontend có Header & Footer
const FrontendLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>{children}</main>
      <Footer />
    </div>
  )
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
        {/* Suspense hiển thị fallback khi đang load component */}
        <Suspense fallback={<div className="p-8 text-center">Đang tải...</div>}>
          <ToastContainer position="top-right" autoClose={3000} />

          <Routes>
            {/* Frontend routes */}
            <Route
              path="/*"
              element={
                <FrontendLayout>
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/product/:id" element={<ProductPage />} />
                    <Route path="/category/:category" element={<CategoryPage />} />
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/contact" element={<ContactPage />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/wishlist" element={<Wishlist />} />
                    <Route path="/login" element={<AuthPage />} />
                    <Route path="/collection" element={<CollectionPage />} />
                    <Route path="/category" element={<ProductCategoryPage />} />
                    <Route path="/blog" element={<BlogPage />} />
                    <Route path="/blog/:slug" element={<BlogArticlePage />} />
                    <Route path="/profile" element={<UserProfile />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password/:token" element={<ResetPassword />} />
                  </Routes>
                </FrontendLayout>
              }
            />

            {/* Admin routes */}
            <Route path="/admin/*"
              element={
                <AdminRoute>
                  <AdminLayout />
                </AdminRoute>
              } />
            <Route path="/login/admin" element={<AdminLoginForm />} />
          </Routes>
        </Suspense>
        </CartProvider>
      </AuthProvider>
    </Router>
  )
}

export default App
