import React, { Suspense, lazy, useEffect, useState } from "react"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import "./index.css"
import Header from "./components/fashion/Header"
import Footer from "./components/fashion/Footer"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { AdminRoute } from "./service/AdminRoute"
import { AuthProvider } from "./context/Authcontext"
import { CartProvider, CartContext } from "./context/CartContext" // Thêm CartContext vào import
import OrderHistory from "./pages/OrderHistory"
import { socket } from "./service/socket"
import { ShoppingBag } from 'lucide-react'
import SideCartDrawer from "./components/fashion/SideCartDrawer"
import { WishlistProvider } from "./context/WishlistContext"
// Giả định SideCartDrawer nằm trong đường dẫn này

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
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"))

// Blog article inline (Giữ nguyên)
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

const FrontendLayout = ({ children, isCartDrawerOpen, setIsCartDrawerOpen }) => {
  const { cart } = React.useContext(CartContext)
  const totalCartItems = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>{children}</main>
      <Footer />
      <button
        onClick={() => setIsCartDrawerOpen(true)}
        className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-pink-600 text-white shadow-xl hover:bg-pink-700 transition-all duration-300 transform hover:scale-105"
        aria-label="Mở giỏ hàng"
      >
        <ShoppingBag className="w-6 h-6" />

        {totalCartItems > 0 && (
          <span className="absolute top-0 right-0 transform translate-x-1/4 -translate-y-1/4 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
            {totalCartItems > 99 ? '99+' : totalCartItems}
          </span>
        )}
      </button>
      <SideCartDrawer
        isOpen={isCartDrawerOpen}
        onClose={() => setIsCartDrawerOpen(false)}
      />
    </div>
  )
}

function App() {
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false)

  const currentUser = JSON.parse(localStorage.getItem("user"))

  useEffect(() => {
    socket.on("updateReview", (review) => {
      if (review?.userId?._id === currentUser?.id) {
        toast.info(`Trạng thái đánh giá của bạn #${review._id} đã đổi thành ${review.status}`)
      }
    })

    return () => socket.off("updateReview")
  }, [])


  useEffect(() => {
    socket.on("ReplyReview", (review) => {
      if (review?.userId?._id === currentUser?.id) {
        toast.info(`Đánh giá của bạn với sản phẩm #${review.productId.name} đã được phản hồi`)
      }
    })

    return () => socket.off("ReplyReview")
  }, [])
  // Hết Logic Socket

  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider> 
          {/* Suspense hiển thị fallback khi đang load component */}
          <Suspense fallback={<div className="p-8 text-center">Đang tải...</div>}>
            <ToastContainer position="top-right" autoClose={3000} />

            <Routes>
              {/* Frontend routes */}
              <Route
                path="/*"
                element={
                  // ⭐️ TRUYỀN STATE CHO LAYOUT
                  <FrontendLayout
                    isCartDrawerOpen={isCartDrawerOpen}
                    setIsCartDrawerOpen={setIsCartDrawerOpen}
                  >
                    <Routes>
                      <Route path="/" element={<HomePage />} />
                      {/* Truyền hàm mở Cart cho ProductPage để dùng sau khi thêm hàng thành công */}
                      <Route path="/product/:id" element={<ProductPage
                        setIsCartDrawerOpen={setIsCartDrawerOpen}
                      />} />
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
                      <Route path="/orders" element={<OrderHistory />} />
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
           </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </Router>
  )
}

export default App
