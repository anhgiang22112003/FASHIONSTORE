import React, { useState } from "react"
import Dashboard from "./AdminDasbroad"
import Orders from "./OrdersContent"
import Products from "./ProductsContent"
import Customers from "./Customers"
import Settings from "./SettingsContent"
import Sidebar from "../../components/layoutAdmin/SliderbarAdmin"
import CustomerEdit from "./CustomerEdit"
import Statistics from "./StatisticsContent"
import ProductCategories from './ProductCategories' // Import component mới
import ProductCollections from './ProductCollections' // Import component mới
import AddProduct from './AddProduct'
import Header from "@/components/layoutAdmin/HeaderAdmin"
import EditProduct from "./EditProduct"
import OrderEditPage from "./EditOrder"
import AddCustomerPage from "./AddCustomer"
import ReviewManagementPage from "./Reviews"
import PromotionManagementPage from "./Promotions"
import AdminSettingsPage from "@/components/layoutAdmin/AdminSettingPage"

const AdminLayout = () => {
    const [activeTab, setActiveTab] = useState("dashboard")

    const [editingCustomer, setEditingCustomer] = useState(null)
    const [isSidebarOpen, setIsSidebarOpen] = useState(true) // State để quản lý việc mở/đóng Sidebar
    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen)
    }
    const renderContent = () => {
        if (activeTab === 'customerEdit' && editingCustomer) {
            return <CustomerEdit customer={editingCustomer} onBack={() => setActiveTab('customers')} />
        }

        switch (activeTab) {
            case 'dashboard':
                return <Dashboard />
            case 'products':
                return <Products setActiveTab={setActiveTab} /> // Truyền setActivePage vào Products
            case 'add-product':
                return <AddProduct />
            case 'edit-product':
                return <EditProduct />
                case 'admin-setting':
                return <AdminSettingsPage />
            case 'orders':
                return <Orders setActiveTab={setActiveTab} />
            case 'edit-order':
                return <OrderEditPage />
            case 'product-categories': // Thêm case cho danh mục sản phẩm
                return <ProductCategories />
            case 'product-collections': // Thêm case cho bộ sưu tập sản phẩm
                return <ProductCollections />
            case 'review': // Thêm case cho bộ sưu tập sản phẩm
                return <ReviewManagementPage />
            case 'promotion': // Thêm case cho bộ sưu tập sản phẩm
                return <PromotionManagementPage />
            case 'customers':
                return <Customers setEditingCustomer={setEditingCustomer} setActivePage={setActiveTab} />
            case 'add-customer':
                return <AddCustomerPage />
            case 'statistics':
                return <Statistics />
            case 'settings':
                return <Settings />
            default:
                return <Dashboard />
        }
    }

    return (
        <div className="flex h-screen bg-pink-50">
            {/* Sidebar cố định bên trái */}
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

            {/* Phần chính */}
            <div className="flex-1 flex flex-col">
                {/* Header cố định trên cùng */}
                <div className="sticky top-0 z-40 h-[80px]   px-2.5 items-center bg-white shadow">
                    <Header toggleSidebar={toggleSidebar} setActiveTab={setActiveTab} />
                </div>

                {/* Nội dung chính cuộn riêng */}
                <div className="flex-1 overflow-y-auto p-8">
                    {renderContent()}
                </div>
            </div>
        </div>
    )
}

export default AdminLayout