import React, { useState } from "react"
import Dashboard from "./AdminDasbroad"
import Orders from "./OrdersContent"
import Products from "./ProductsContent"
import Customers from "./Customers"
import Settings from "./SettingsContent"
import Sidebar from "../../components/layoutAdmin/SliderbarAdmin"
import CustomerEdit from "./CustomerEdit"
import Statistics from "./StatisticsContent"
import ProductCategories from './ProductCategories'
import ProductCollections from './ProductCollections'
import AddProduct from './AddProduct'
import Header from "@/components/layoutAdmin/HeaderAdmin"
import EditProduct from "./EditProduct"
import OrderEditPage from "./EditOrder"
import AddCustomerPage from "./AddCustomer"
import ReviewManagementPage from "./Reviews"
import PromotionManagementPage from "./Promotions"
import AdminSettingsPage from "@/components/layoutAdmin/AdminSettingPage"
import api from "@/service/api"

const AdminLayout = () => {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [editingCustomer, setEditingCustomer] = useState(null)
  const [editingProductId, setEditingProductId] = useState(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  // ✅ Cache data cho từng tab
  const [tabData, setTabData] = useState({
    products: null,
    orders: null,
    customers: null,
    categories: null,
    collections: null,
    reviews: null,
    promotions: null,
  })
  // AdminLayout.jsx
  const fetchCustomers = async () => {
    try {
      const res = await api.get("/users?role=customer")
      setTabData((prev) => ({ ...prev, customers: res?.data }))
    } catch (err) {
      console.error("Lỗi khi fetch customers:", err)
    }
  }
  const fetchProduct = async () => {
    try {
      const res = await api.get("/products")
      setTabData((prev) => ({ ...prev, products: res?.data }))
    } catch (err) {
      console.error("Lỗi khi fetch customers:", err)
    }
  }


  const handleEditProduct = (productId) => {
    setEditingProductId(productId)
    setActiveTab("edit-product")
  }

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  return (
    <div className="flex h-screen bg-pink-50">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
      />

      {/* Main */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-40 h-[80px] px-2.5 items-center bg-white shadow">
          <Header toggleSidebar={toggleSidebar} setActiveTab={setActiveTab} />
        </div>

        {/* Nội dung */}
        <div className="flex-1 overflow-y-auto p-8">
          {/* Thay vì unmount, mình render tất cả nhưng ẩn đi */}
          <div className={activeTab === "dashboard" ? "block" : "hidden"}>
            <Dashboard />
          </div>

          <div className={activeTab === "products" ? "block" : "hidden"}>
            <Products
              setActiveTab={setActiveTab}
              onEditProduct={handleEditProduct}
              data={tabData.products}
              setData={(data) => setTabData((prev) => ({ ...prev, products: data }))}
              fetchProducts={fetchProduct}
            />
          </div>

          <div className={activeTab === "add-product" ? "block" : "hidden"}>
            <AddProduct fetchProducts={fetchProduct} setActiveTab={setActiveTab} />
          </div>

          <div className={activeTab === "edit-product" ? "block" : "hidden"}>
            <EditProduct
              productId={editingProductId}
              onBack={() => setActiveTab("products")}
              fetchProducts={fetchProduct}
            />
          </div>

          <div className={activeTab === "orders" ? "block" : "hidden"}>
            <Orders
              setActiveTab={setActiveTab}
              data={tabData.orders}
              setData={(data) => setTabData((prev) => ({ ...prev, orders: data }))}
            />
          </div>

          <div className={activeTab === "edit-order" ? "block" : "hidden"}>
            <OrderEditPage />
          </div>

          <div className={activeTab === "product-categories" ? "block" : "hidden"}>
            <ProductCategories
              data={tabData.categories}
              setData={(data) => setTabData((prev) => ({ ...prev, categories: data }))}
            />
          </div>

          <div className={activeTab === "product-collections" ? "block" : "hidden"}>
            <ProductCollections
              data={tabData.collections}
              setData={(data) => setTabData((prev) => ({ ...prev, collections: data }))}
            />
          </div>

          <div className={activeTab === "customers" ? "block" : "hidden"}>
            <Customers
              setEditingCustomer={setEditingCustomer}
              setActivePage={setActiveTab}
              data={tabData.customers}
              setData={(data) => setTabData((prev) => ({ ...prev, customers: data }))}
              refreshCustomers={fetchCustomers}

            />
          </div>

          <div className={activeTab === "customerEdit" ? "block" : "hidden"}>
            <CustomerEdit
              customer={editingCustomer}
              refreshCustomers={fetchCustomers}
              onBack={() => setActiveTab("customers")}
            />
          </div>

          <div className={activeTab === "add-customer" ? "block" : "hidden"}>
            <AddCustomerPage refreshCustomers={fetchCustomers} onBack={() => setActiveTab("customers")} />
          </div>

          <div className={activeTab === "statistics" ? "block" : "hidden"}>
            <Statistics />
          </div>

          <div className={activeTab === "review" ? "block" : "hidden"}>
            <ReviewManagementPage
              data={tabData.reviews}
              setData={(data) => setTabData((prev) => ({ ...prev, reviews: data }))}
            />
          </div>

          <div className={activeTab === "promotion" ? "block" : "hidden"}>
            <PromotionManagementPage
              data={tabData.promotions}
              setData={(data) => setTabData((prev) => ({ ...prev, promotions: data }))}
            />
          </div>

          <div className={activeTab === "settings" ? "block" : "hidden"}>
            <Settings />
          </div>

          <div className={activeTab === "admin-setting" ? "block" : "hidden"}>
            <AdminSettingsPage />
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminLayout
