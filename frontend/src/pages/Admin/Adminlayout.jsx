import React, { useEffect, useState, Suspense } from "react"
import Sidebar from "../../components/layoutAdmin/SliderbarAdmin"
import Header from "@/components/layoutAdmin/HeaderAdmin"
import { toast } from "react-toastify"
import ProductDetailContent from "@/components/ProductDetailContent"
import apiAdmin from "@/service/apiAdmin"
import { io } from 'socket.io-client'
import { socket } from "@/service/socket"
import { ThemeProvider } from "@/context/ThemeContext"

const Suppliers = React.lazy(() => import("./Suppliers"))
const StaffPage = React.lazy(() => import("./StaffPage"))
const Bank = React.lazy(() => import("./Bank"))
const PosPage = React.lazy(() => import("./PosPage"))
const Dashboard = React.lazy(() => import("./AdminDasbroad"))
const Orders = React.lazy(() => import("./OrdersContent"))
const Products = React.lazy(() => import("./ProductsContent"))
const Customers = React.lazy(() => import("./Customers"))
const CustomerEdit = React.lazy(() => import("./CustomerEdit"))
const Statistics = React.lazy(() => import("./StatisticsContent"))
const ProductCategories = React.lazy(() => import("./ProductCategories"))
const ProductCollections = React.lazy(() => import("./ProductCollections"))
const AddProduct = React.lazy(() => import("./AddProduct"))
const EditProduct = React.lazy(() => import("./EditProduct"))
const OrderEditPage = React.lazy(() => import("./EditOrder"))
const AddCustomerPage = React.lazy(() => import("./AddCustomer"))
const ReviewManagementPage = React.lazy(() => import("./Reviews"))
const PromotionManagementPage = React.lazy(() => import("./Promotions"))
const Settings = React.lazy(() => import("./SettingsContent"))
const AdminSettingsPage = React.lazy(() => import("@/components/layoutAdmin/AdminSettingPage"))
const AdminChatDashboard = React.lazy(() => import("./AdminChatDashboard"))
const AddFlashSalePage = React.lazy(() => import("./AddFlashSalePage"))
const FlashSaleListPage = React.lazy(() => import("./FlashSaleListPage"))

const AdminLayout = () => {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [editingCustomer, setEditingCustomer] = useState(null)
  const [editingProductId, setEditingProductId] = useState(null)
  const [viewProductId, setViewProductId] = useState(null)
  const [editingOrder, setEditingOrder] = useState(null)
  const [editData, setEditData] = useState(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  const userId = JSON.parse(sessionStorage.getItem("user"))

  useEffect(() => {
    if (!userId) return

    const handleNoti = (noti) => {
      if (noti.userId === userId || !noti.userId) {
        // setNotifications(prev => [noti, ...prev])
        toast.info(`🔔 Có thông báo mới: ${noti.message}`)
      }
    }

    socket.on('notification', handleNoti)
    return () => {
      socket.off('notification', handleNoti)
    }
  }, [userId])
  // ✅ Dữ liệu cache từng tab
  const [tabData, setTabData] = useState({
    products: null,
    orders: null,
    customers: null,
    categories: null,
    collections: null,
    reviews: null,
    promotions: null,
  })

  // ---- FETCH DATA ----
  const fetchCustomers = async () => {
    try {
      const res = await apiAdmin.get("/users?role=customer")
      setTabData((prev) => ({ ...prev, customers: res?.data }))
    } catch (err) {
      console.error("Lỗi khi fetch customers:", err)
    }
  }

  const fetchProducts = async () => {
    try {
      const res = await apiAdmin.get("/products")
      setTabData((prev) => ({ ...prev, products: res?.data }))
    } catch (err) {
      console.error("Lỗi khi fetch products:", err)
    }
  }

  const fetchOrders = async () => {
    try {
      const res = await apiAdmin.get("/orders/all")
      setTabData((prev) => ({ ...prev, orders: res?.data?.data }))
    } catch (err) {
      console.error("Lỗi khi fetch orders:", err)
    }
  }

  useEffect(() => {
    socket.on("admin_payment_success", (newOrder) => {
      toast.info(`🆕 đơn hàng mới  ${newOrder.user?.name || "khách hàng"} thanh toán thành công`)
      fetchOrders()
    })
    return () => socket.off("newOrder")
  }, [])
  useEffect(() => {
    socket.on("newOrder", (newOrder) => {
      toast.info(`🆕 Có đơn hàng mới từ ${newOrder.user?.name || "khách hàng"}`)
      fetchOrders()
    })
    return () => socket.off("newOrder")
  }, [])

  useEffect(() => {
    if (activeTab === "products" && !tabData.products) fetchProducts()
    if (activeTab === "orders" && !tabData.orders) fetchOrders()
    if (activeTab === "customers" && !tabData.customers) fetchCustomers()
  }, [activeTab])

  // ---- ACTION HANDLERS ----
  const handleEditProduct = (productId) => {
    setEditingProductId(productId)
    setActiveTab("edit-product")
  }
  const handleViewProduct = (productId) => {
    setViewProductId(productId)
    setActiveTab("view-product")
  }

  const handleEditOrder = (orderId) => {
    setEditingOrder(orderId)
    setActiveTab("edit-order")
  }

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen)

  return (
    <ThemeProvider>
      <div className="flex h-screen">


        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
        />
        <div className="flex-1 flex flex-col">
          <div className="sticky  h-[70px]  items-center  shadow-sm sticky top-0 z-40 ">
            <Header toggleSidebar={toggleSidebar} setActiveTab={setActiveTab} setEditingProductId={setEditingProductId} setEditingOrder={setEditingOrder} />

          </div>

          {/* Nội dung chính */}
          <div className="flex-1  overflow-y-auto">
            <Suspense fallback={<div className="text-center p-10">⏳ Đang tải...</div>}>
              {activeTab === "dashboard" && <Dashboard />}
              {activeTab === "chat" && <AdminChatDashboard adminId={userId?.id} />}

              {activeTab === "products" && (
                <Products
                  setActiveTab={setActiveTab}
                  onEditProduct={handleEditProduct}
                  onViewProductDetail={handleViewProduct}
                  data={tabData.products}
                />
              )}

              {activeTab === "add-product" && (
                <AddProduct fetchProducts={fetchProducts} setActiveTab={setActiveTab} />
              )}

              {activeTab === "edit-product" && (
                <EditProduct
                  productId={editingProductId}
                  onBack={() => setActiveTab("products")}
                  fetchProducts={fetchProducts}
                />
              )}

              {activeTab === "view-product" && (
                <ProductDetailContent
                  productId={viewProductId}
                  onEditProduct={handleEditProduct}
                  onBack={() => setActiveTab("products")}
                  fetchProducts={fetchProducts}
                />
              )}

              {activeTab === "orders" && (
                <Orders
                  setActiveTab={setActiveTab}
                  data={tabData.orders}
                  onEditOrder={handleEditOrder}
                  setData={(data) => setTabData((prev) => ({ ...prev, orders: data }))}
                  fetchOrders={fetchOrders}
                />
              )}
              {activeTab === "orders-pos" && (
                <PosPage
                  setActiveTab={setActiveTab}
                  data={tabData.orders}
                  onEditOrder={handleEditOrder}
                  setData={(data) => setTabData((prev) => ({ ...prev, orders: data }))}
                  fetchOrders={fetchOrders}
                />
              )}

              {activeTab === "edit-order" && (
                <OrderEditPage
                  orderId={editingOrder}
                  onBack={() => setActiveTab("orders")}
                  fetchOrders={fetchOrders}
                />
              )}

              {activeTab === "product-categories" && (
                <ProductCategories
                  data={tabData.categories}
                  setData={(data) => setTabData((prev) => ({ ...prev, categories: data }))}
                />
              )}

              {activeTab === "product-collections" && (
                <ProductCollections
                  data={tabData.collections}
                  setData={(data) => setTabData((prev) => ({ ...prev, collections: data }))}
                />
              )}

              {activeTab === "customers" && (
                <Customers
                  setEditingCustomer={setEditingCustomer}
                  setActivePage={setActiveTab}
                  data={tabData.customers}
                  setData={(data) => setTabData((prev) => ({ ...prev, customers: data }))}
                  refreshCustomers={fetchCustomers}
                />
              )}

              {activeTab === "customerEdit" && (
                <CustomerEdit
                  customer={editingCustomer}
                  refreshCustomers={fetchCustomers}
                  onEditOrder={handleEditOrder}
                  onBack={() => setActiveTab("customers")}
                />
              )}

              {activeTab === "add-customer" && (
                <AddCustomerPage
                  refreshCustomers={fetchCustomers}
                  onBack={() => setActiveTab("customers")}
                />
              )}

              {activeTab === "staff" && (
                <StaffPage
                  setActivePage={setActiveTab}

                />
              )}
              {activeTab === "supplier" && (
                <Suppliers
                 setActivePage={setActiveTab}
                />
              )}

              {activeTab === "statistics" && <Statistics />}

              {activeTab === "review" && (
                <ReviewManagementPage
                  data={tabData.reviews}
                  setData={(data) => setTabData((prev) => ({ ...prev, reviews: data }))}
                />
              )}
              {activeTab === "add-flashsale" && (
                <AddFlashSalePage setActiveTab={setActiveTab} editData={editData} />
              )}

              {activeTab === "flash-sale" && <FlashSaleListPage setActiveTab={setActiveTab} setEditData={setEditData} />}



              {activeTab === "promotion" && (
                <PromotionManagementPage
                  data={tabData.promotions}
                  setData={(data) => setTabData((prev) => ({ ...prev, promotions: data }))}
                />
              )}

              {activeTab === "settings" && <Settings />}
              {activeTab === "bank" && <Bank />}
              {activeTab === "admin-setting" && <AdminSettingsPage />}
            </Suspense>
          </div>
        </div>
      </div>
    </ThemeProvider>
  )
}

export default React.memo(AdminLayout)
