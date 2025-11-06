import React, { useEffect, useState } from "react"
import {
  ArrowLeftIcon,
  PencilIcon,
  TagIcon,
  CurrencyDollarIcon,
  CubeIcon,
  InformationCircleIcon,
  PhotoIcon,
  CalendarIcon,
  GlobeAsiaAustraliaIcon,
  PercentBadgeIcon
} from "@heroicons/react/24/outline"
import apiAdmin from "@/service/apiAdmin"
import { toast } from "react-toastify"
import { LazyLoadImage } from "react-lazy-load-image-component"
import "react-lazy-load-image-component/src/effects/blur.css"

const formatCurrency = (number) => {
  if (!number) return "0 VNĐ"
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(Number(number))
}

const statusColors = {
  "Còn hàng": "bg-green-100 text-green-700 border-green-300",
  "Hết hàng": "bg-red-100 text-red-700 border-red-300",
  "Ngừng bán": "bg-blue-100 text-blue-700 border-blue-300",
}

const ProductDetailContent = ({ onBack, productId, onEditProduct }) => {
  const [productDetail, setProductDetail] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchProductDetail = async () => {
    if (!productId) return
    try {
      setLoading(true)
      const res = await apiAdmin.get(`/products/${productId}`)
      setProductDetail(res.data)
    } catch (error) {
      console.error("Lỗi tải chi tiết sản phẩm:", error)
      toast.error("Không thể tải chi tiết sản phẩm.")
      onBack()
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProductDetail()
  }, [productId])

  if (loading)
    return (
      <div className="p-6 text-center text-pink-600 font-medium">
        Đang tải chi tiết sản phẩm...
      </div>
    )

  if (!productDetail)
    return (
      <div className="p-6 text-center text-red-500 font-medium">
        Không tìm thấy sản phẩm hoặc có lỗi xảy ra.
      </div>
    )

  return (
    <div style={{ backgroundColor: "var(--bg-color)", color: "var(--text-color)" }} className="p-6  min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <button
            onClick={onBack}
            className=" hover:text-pink-600 flex items-center space-x-1 font-medium transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            <span>Quay lại Danh sách Sản phẩm</span>
          </button>
          <button
            onClick={() => onEditProduct(productDetail._id)}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl flex items-center space-x-1 font-semibold hover:bg-blue-700 transition-colors"
          >
            <PencilIcon className="w-5 h-5" />
            <span>Chỉnh sửa Sản phẩm</span>
          </button>
        </div>

        <h1 className="text-3xl font-bold  mb-6">
          {productDetail.name}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cột trái */}
          <div className="lg:col-span-2 space-y-6">
            <div className="p-6 rounded-xl shadow-lg">
              <h2 className="text-xl font-semibold  mb-4 flex items-center space-x-2">
                <InformationCircleIcon className="w-6 h-6 text-pink-500" />
                <span>Thông tin Sản phẩm</span>
              </h2>
              <div className="space-y-3">
                <DetailItem label="Mã ID" value={productDetail.Id || productDetail._id} />
                <DetailItem label="SKU" value={productDetail.sku} />
                <DetailItem label="Danh mục" value={productDetail?.category?.name || "N/A"} />
                <DetailItem label="Bộ sưu tập" value={productDetail?.collection?.name || "N/A"} />
                <DetailItem label="Xuất xứ" value={productDetail.origin} icon={GlobeAsiaAustraliaIcon} />
                <DetailItem label="Giảm giá" value={`${productDetail.discount}%`} icon={PercentBadgeIcon} />
                <DetailItem label="Giá gốc" value={formatCurrency(productDetail.originalPrice)} icon={CurrencyDollarIcon} />
                <DetailItem label="Giá bán" value={formatCurrency(productDetail.sellingPrice)} icon={CurrencyDollarIcon} valueColor="text-pink-600" />
                <DetailItem label="Tồn kho" value={`${productDetail.stock} sản phẩm`} icon={CubeIcon} />
                <DetailItem
                  label="Trạng thái"
                  customValue={
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${statusColors[productDetail.status]}`}>
                      {productDetail.status}
                    </span>
                  }
                />
                <DetailItem label="Đã bán" value={`${productDetail.soldCount} sản phẩm`} />
                <DetailItem label="Tag" value={productDetail.tags?.join(", ") || "Không có"} />
              </div>
            </div>

            {/* Mô tả */}
            <div className=" p-6 rounded-xl shadow-lg">
              <h2 className="text-xl font-semibold  mb-4">Mô tả chi tiết</h2>
              <p className="">{productDetail.detailedDescription || "Chưa có mô tả chi tiết."}</p>
              <div
                className="prose max-w-none text-gray-600 mt-4"
                dangerouslySetInnerHTML={{
                  __html: productDetail.description || "",
                }}
              />
            </div>

            {/* Biến thể sản phẩm */}
            <div className=" p-6 rounded-xl shadow-lg">
              <h2 className="text-xl font-semibold  mb-4">Phân loại (Màu / Size)</h2>
              {productDetail.variations?.length > 0 ? (
                <table className="w-full text-sm text-left border">
                  <thead className="">
                    <tr>
                      <th className="py-2 px-4 border">Màu sắc</th>
                      <th className="py-2 px-4 border">Kích thước</th>
                      <th className="py-2 px-4 border">Tồn kho</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productDetail.variations.map((v, idx) => (
                      <tr key={idx} className="border-t">
                        <td className="py-2 px-4 border">{v.color}</td>
                        <td className="py-2 px-4 border">{v.size}</td>
                        <td className="py-2 px-4 border">{v.stock}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-gray-500 italic">Chưa có biến thể nào.</p>
              )}
            </div>
          </div>

          {/* Cột phải */}
          <div>
            {/* Ảnh chính */}
            <div className="p-6 rounded-xl shadow-lg mb-6">
              <h2 className="text-xl font-semibold t mb-4 flex items-center space-x-2">
                <PhotoIcon className="w-6 h-6 text-pink-500" />
                <span>Ảnh chính</span>
              </h2>
              <LazyLoadImage
                src={productDetail.mainImage || "https://placehold.co/400x400?text=No+Image"}
                alt={productDetail.name}
                effect="blur"
                className="w-full h-auto object-cover rounded-lg shadow-md"
              />
            </div>

            {/* Ảnh phụ */}
            {productDetail.subImages?.length > 0 && (
              <div className=" p-6 rounded-xl shadow-lg mb-6">
                <h2 className="text-xl font-semibold  mb-4">Ảnh phụ</h2>
                <div className="grid grid-cols-2 gap-3">
                  {productDetail.subImages.map((img, idx) => (
                    <LazyLoadImage
                      key={idx}
                      src={img}
                      alt={`sub-${idx}`}
                      effect="blur"
                      className="w-full h-32 object-cover rounded-lg shadow-sm"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Lịch sử */}
            <div className=" p-6 rounded-xl shadow-lg">
              <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2">
                <CalendarIcon className="w-6 h-6 " />
                <span>Lịch sử</span>
              </h2>
              <div className="space-y-3">
                <DetailItem label="Ngày tạo" value={new Date(productDetail.createdAt).toLocaleString("vi-VN")} />
                <DetailItem label="Cập nhật cuối" value={new Date(productDetail.updatedAt).toLocaleString("vi-VN")} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const DetailItem = ({ label, value, icon: Icon, valueColor = "text-var(--text-color)", customValue }) => (
  <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
    <div className="flex items-center space-x-2 ">
      {Icon && <Icon className="w-5 h-5 text-pink-400" />}
      <span className="font-medium  ">{label}:</span>
    </div>
    {customValue || <span className={`font-semibold ${valueColor}`}>{value}</span>}
  </div>
)

export default ProductDetailContent
