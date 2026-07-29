import React, { useEffect, useMemo, useRef, useState } from "react"
import { PencilIcon, TrashIcon, ArrowDownTrayIcon, EyeIcon } from "@heroicons/react/24/outline"
import DeleteProductModal from "../../components/DeleteProductPopup"
import { toast } from "react-toastify"
import ShowImportModal from "../../components/ShowImportModal"
import { LazyLoadImage } from 'react-lazy-load-image-component'
import 'react-lazy-load-image-component/src/effects/blur.css'
import debounce from "lodash.debounce"
import ConfirmBulkDeleteModal from "@/components/ConfirmBulkDeleteModal"
import apiAdmin from "@/service/apiAdmin"
import Switch from "@/components/ui/switch"
import { PageHeader, Toolbar, FilterPanel, DataTable, Pagination, StatusBadge, AdminButton, ConfirmDialog } from "@/components/admin/ui"

const formatCurrency = (number) => {
  if (number === "" || number === null || isNaN(Number(number))) return ""
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(number))
}

const ProductsContent = ({ setActiveTab, onEditProduct, onViewProductDetail }) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState(null)
  const [isFilterVisible, setIsFilterVisible] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [product, setProduct] = useState([])
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState([])
  const [collections, setCollections] = useState([])
  const [selectedProducts, setSelectedProducts] = useState([])
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false)

  const [displayMinPrice, setDisplayMinPrice] = useState("")
  const [displayMaxPrice, setDisplayMaxPrice] = useState("")
  const [filters, setFilters] = useState({
    category: "",
    collection: "",
    status: "",
    minPrice: "",
    maxPrice: "",
    sortBy: "newest",
  })

  const isFirstPageRender = useRef(true)

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedProducts(product.map(p => p._id))
    } else {
      setSelectedProducts([])
    }
  }

  const handleSelectOne = (id) => {
    setSelectedProducts(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const handleToggleFeatured = async (id) => {
    try {
      const res = await apiAdmin.patch(`/products/${id}/toggle-featured`)
      toast.success(
        res.data.product.isFeatured
          ? "✅ Sản phẩm đã được đánh dấu nổi bật!"
          : "❌ Đã tắt nổi bật cho sản phẩm này."
      )
      fetchProducts(page, filters, searchTerm)
    } catch (err) {
      console.error(err)
      toast.error("Không thể thay đổi trạng thái nổi bật ❌")
    }
  }

  const handleBulkUpdateStatus = async (status) => {
    if (selectedProducts.length === 0) return toast.info("Vui lòng chọn sản phẩm trước.")
    try {
      await apiAdmin.put("/products/bulk-update-status", {
        ids: selectedProducts,
        status,
      })
      toast.success("Cập nhật trạng thái hàng loạt thành công 🎉")
      fetchProducts(page, filters, searchTerm)
      setSelectedProducts([])
    } catch (err) {
      console.error(err)
      toast.error("Không thể cập nhật trạng thái ❌")
    }
  }

  const handleBulkDelete = async () => {
    if (selectedProducts.length === 0)
      return toast.info("Vui lòng chọn sản phẩm để xóa.")
    setIsBulkDeleteModalOpen(true)
  }

  const confirmBulkDelete = async () => {
    try {
      await apiAdmin.delete("/products/bulk-delete", {
        data: { ids: selectedProducts },
      })
      toast.success("Đã xóa sản phẩm được chọn ✅")
      fetchProducts(page, filters, searchTerm)
      setSelectedProducts([])
    } catch (err) {
      console.error(err)
      toast.error("Xóa sản phẩm thất bại ❌")
    } finally {
      setIsBulkDeleteModalOpen(false)
    }
  }

  const limit = 10

  const fetchFiltersData = async () => {
    try {
      const [cats, cols] = await Promise.all([
        apiAdmin.get("/categories"),
        apiAdmin.get("/collection"),
      ])
      setCategories(cats.data.data || [])
      setCollections(cols.data.data || [])
    } catch (err) {
      console.error("Lỗi tải danh mục hoặc bộ sưu tập:", err)
    }
  }

  const fetchProducts = async (pageNum = 1, filtersData = filters, keyword = searchTerm) => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: pageNum,
        limit,
        q: keyword || "",
        category: filtersData.category || "",
        collection: filtersData.collection || "",
        status: filtersData.status || "",
        minPrice: filtersData.minPrice || "",
        maxPrice: filtersData.maxPrice || "",
        sortBy: filtersData.sortBy || "newest",
      })

      const res = await apiAdmin.get(`/products?${params.toString()}`)
      setProduct(res.data.products || [])
      setTotal(res.data.total || 0)
      setPage(res.data.page || 1)
    } catch (error) {
      console.error("Lỗi tải sản phẩm:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFiltersData()
  }, [])

  const debouncedFetch = useMemo(
    () => debounce((pageNum, filtersData, keyword) => {
      fetchProducts(pageNum, filtersData, keyword)
    }, 500),
    []
  )

  useEffect(() => {
    if (page === 1) {
      debouncedFetch(1, filters, searchTerm)
    } else {
      setPage(1)
    }
    return () => debouncedFetch.cancel()
  }, [filters, searchTerm])

  useEffect(() => {
    if (isFirstPageRender.current) {
      isFirstPageRender.current = false
      return
    }
    fetchProducts(page, filters, searchTerm)
  }, [page])

  const handlePriceChange = (e) => {
    const { name, value } = e.target
    const rawValue = value.replace(/[^0-9]/g, "")

    if (name === 'minPrice') {
      setFilters(prev => ({ ...prev, minPrice: rawValue }))
      setDisplayMinPrice(rawValue)
    } else {
      setFilters(prev => ({ ...prev, maxPrice: rawValue }))
      setDisplayMaxPrice(rawValue)
    }
  }

  const handlePriceBlur = (e) => {
    const { name } = e.target
    const rawValue = filters[name]

    if (rawValue) {
      const formattedValue = new Intl.NumberFormat('vi-VN').format(Number(rawValue))
      if (name === 'minPrice') {
        setDisplayMinPrice(formattedValue)
      } else {
        setDisplayMaxPrice(formattedValue)
      }
    }
  }

  const handlePriceFocus = (e) => {
    const { name } = e.target
    const rawValue = filters[name]
    if (rawValue) {
      if (name === 'minPrice') {
        setDisplayMinPrice(rawValue)
      } else {
        setDisplayMaxPrice(rawValue)
      }
    }
  }

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value })
  }

  const handleExportExcel = async () => {
    try {
      setLoading(true)
      const res = await apiAdmin.get("/excel/products/export", {
        responseType: "blob",
      })
      const blob = new Blob([res.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `products_${new Date().toISOString().split("T")[0]}.xlsx`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      toast.success("Xuất file Excel thành công 🎉")
    } catch (err) {
      console.error(err)
      toast.error("Không thể xuất Excel ❌")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteClick = (prod) => {
    setProductToDelete(prod)
    setIsModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    try {
      await apiAdmin.delete(`/products/${productToDelete?._id}`)
      toast.success("Xóa sản phẩm thành công")
      fetchProducts(page, filters, searchTerm)
    } catch (err) {
      toast.error("Xóa sản phẩm thất bại")
    } finally {
      setIsModalOpen(false)
      setProductToDelete(null)
    }
  }

  const handleResetFilters = () => {
    setFilters({
      category: "",
      collection: "",
      status: "",
      minPrice: "",
      maxPrice: "",
      sortBy: "newest",
    })
    setDisplayMinPrice("")
    setDisplayMaxPrice("")
  }

  const columns = [
    {
      header: (
        <input
          type="checkbox"
          checked={product.length > 0 && selectedProducts.length === product.length}
          onChange={handleSelectAll}
          className="rounded text-pink-600 focus:ring-pink-500"
        />
      ),
      width: "40px",
      render: (row) => (
        <input
          type="checkbox"
          checked={selectedProducts.includes(row._id)}
          onChange={() => handleSelectOne(row._id)}
          className="rounded text-pink-600 focus:ring-pink-500"
        />
      )
    },
    {
      header: "Sản phẩm",
      render: (row) => (
        <div className="flex items-center gap-3">
          <LazyLoadImage
            src={row.mainImage || "https://placehold.co/100x100"}
            alt={row?.name}
            effect="blur"
            width={40}
            height={40}
            className="w-10 h-10 rounded-lg object-cover border border-slate-100"
          />
          <div className="min-w-0">
            <p className="font-semibold text-slate-800 truncate max-w-xs">{row?.name}</p>
            <p className="text-xs text-slate-400">SKU: {row?.sku || 'N/A'}</p>
          </div>
        </div>
      )
    },
    {
      header: "Danh mục",
      render: (row) => <span className="text-slate-600">{row?.category?.name || "N/A"}</span>
    },
    {
      header: "Bộ sưu tập",
      render: (row) => <span className="text-slate-600">{row?.collection?.name || "N/A"}</span>
    },
    {
      header: "Giá",
      render: (row) => (
        <span className="font-bold text-pink-600">
          {formatCurrency(row?.originalPrice)}
        </span>
      )
    },
    {
      header: "Tồn kho",
      render: (row) => <span className="font-semibold text-slate-700">{row?.stock}</span>
    },
    {
      header: "Nổi bật",
      render: (row) => (
        <Switch
          checked={row.isFeatured}
          onChange={() => handleToggleFeatured(row._id)}
        />
      )
    },
    {
      header: "Trạng thái",
      render: (row) => <StatusBadge status={row?.status} />
    },
    {
      header: "Thao tác",
      sticky: true,
      width: "120px",
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onViewProductDetail(row?._id)}
            className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-800 rounded-lg transition-colors border border-slate-200 shadow-sm"
            title="Xem chi tiết"
          >
            <EyeIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => onEditProduct(row?._id)}
            className="p-1.5 bg-slate-50 hover:bg-slate-100 text-blue-600 hover:text-blue-700 rounded-lg transition-colors border border-slate-200 shadow-sm"
            title="Sửa"
          >
            <PencilIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDeleteClick(row)}
            className="p-1.5 bg-slate-50 hover:bg-slate-100 text-red-600 hover:text-red-700 rounded-lg transition-colors border border-slate-200 shadow-sm"
            title="Xóa"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ]

  const bulkActions = (
    <div className="flex items-center gap-2">
      <select
        onChange={(e) => {
          handleBulkUpdateStatus(e.target.value)
          e.target.value = ""
        }}
        defaultValue=""
        className="text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
      >
        <option value="" disabled>Đổi trạng thái...</option>
        <option value="Còn hàng">Còn hàng</option>
        <option value="Hết hàng">Hết hàng</option>
        <option value="Ngừng bán">Ngừng bán</option>
      </select>
      <AdminButton
        variant="danger"
        size="xs"
        onClick={handleBulkDelete}
      >
        Xóa đã chọn
      </AdminButton>
    </div>
  )

  const additionalActions = (
    <>
      <AdminButton
        variant="secondary"
        size="sm"
        onClick={handleExportExcel}
        icon={<ArrowDownTrayIcon className="w-4 h-4" />}
      >
        Xuất báo cáo
      </AdminButton>
      <ShowImportModal fetchProducts={() => fetchProducts(page, filters, searchTerm)} />
      <AdminButton
        variant="primary"
        size="sm"
        onClick={() => setActiveTab('add-product')}
      >
        + Thêm sản phẩm
      </AdminButton>
    </>
  )

  return (
    <div className="p-6 bg-slate-50 dark:bg-slate-950 min-h-screen">
      <PageHeader
        title="Danh sách Sản phẩm"
        description="Quản lý toàn bộ danh mục sản phẩm của bạn, trạng thái tồn kho và thông tin chi tiết."
        badge={`${total} sản phẩm`}
      />

      <Toolbar
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Tìm sản phẩm theo tên, SKU..."
        onFilterToggle={() => setIsFilterVisible(!isFilterVisible)}
        filterActive={isFilterVisible}
        filterCount={Object.values(filters).filter(val => val !== "" && val !== "newest").length}
        actions={additionalActions}
        bulkActions={bulkActions}
        selectedCount={selectedProducts.length}
      />

      <FilterPanel isOpen={isFilterVisible} onReset={handleResetFilters}>
        <FilterPanel.Field label="Danh mục">
          <select name="category" value={filters.category} onChange={handleFilterChange}>
            <option value="">Tất cả danh mục</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>{cat.name}</option>
            ))}
          </select>
        </FilterPanel.Field>

        <FilterPanel.Field label="Bộ sưu tập">
          <select name="collection" value={filters.collection} onChange={handleFilterChange}>
            <option value="">Tất cả bộ sưu tập</option>
            {collections.map((col) => (
              <option key={col._id} value={col._id}>{col.name}</option>
            ))}
          </select>
        </FilterPanel.Field>

        <FilterPanel.Field label="Trạng thái">
          <select name="status" value={filters.status} onChange={handleFilterChange}>
            <option value="">Tất cả trạng thái</option>
            <option value="Còn hàng">Còn hàng</option>
            <option value="Hết hàng">Hết hàng</option>
            <option value="Ngừng bán">Ngừng bán</option>
          </select>
        </FilterPanel.Field>

        <FilterPanel.Field label="Giá tối thiểu (VND)">
          <input
            type="text"
            name="minPrice"
            placeholder="VD: 50.000"
            value={displayMinPrice}
            onChange={handlePriceChange}
            onFocus={handlePriceFocus}
            onBlur={handlePriceBlur}
          />
        </FilterPanel.Field>

        <FilterPanel.Field label="Giá tối đa (VND)">
          <input
            type="text"
            name="maxPrice"
            placeholder="VD: 500.000"
            value={displayMaxPrice}
            onChange={handlePriceChange}
            onFocus={handlePriceFocus}
            onBlur={handlePriceBlur}
          />
        </FilterPanel.Field>

        <FilterPanel.Field label="Sắp xếp theo">
          <select name="sortBy" value={filters.sortBy} onChange={handleFilterChange}>
            <option value="newest">Mới nhất</option>
            <option value="oldest">Cũ nhất</option>
            <option value="priceAsc">Giá tăng dần</option>
            <option value="priceDesc">Giá giảm dần</option>
            <option value="stockAsc">Tồn kho thấp → cao</option>
            <option value="stockDesc">Tồn kho cao → thấp</option>
          </select>
        </FilterPanel.Field>
      </FilterPanel>

      <DataTable
        columns={columns}
        data={product}
        loading={loading}
        keyExtractor={(row) => row._id}
      />

      <Pagination
        page={page}
        total={total}
        limit={limit}
        onPageChange={setPage}
      />

      {productToDelete && (
        <DeleteProductModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setProductToDelete(null)
          }}
          onConfirm={handleConfirmDelete}
          product={productToDelete}
        />
      )}

      <ConfirmBulkDeleteModal
        isOpen={isBulkDeleteModalOpen}
        onClose={() => setIsBulkDeleteModalOpen(false)}
        onConfirm={confirmBulkDelete}
        count={selectedProducts.length}
      />
    </div>
  )
}

export default ProductsContent
