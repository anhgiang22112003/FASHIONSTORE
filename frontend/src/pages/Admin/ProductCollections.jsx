import React, { useEffect, useState } from 'react'
import AdminSpinner from '@/components/AdminSpinner'
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import { toast } from 'react-toastify'
import { Switch } from '@headlessui/react'
import { LazyLoadImage } from 'react-lazy-load-image-component'
import 'react-lazy-load-image-component/src/effects/blur.css'
import apiAdmin from '@/service/apiAdmin'
import { PageHeader, Toolbar, FilterPanel, DataTable, Pagination, StatusBadge, AdminButton, ConfirmDialog, AdminModal, AdminInput, AdminTextarea } from "@/components/admin/ui"

const ProductCollections = () => {
  const [collections, setCollections] = useState([])
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editCollection, setEditCollection] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isNewCollectionActive, setIsNewCollectionActive] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState(null)

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [filterName, setFilterName] = useState("")
  const [filterId, setFilterId] = useState("")
  const [filterActive, setFilterActive] = useState("")
  const [minProducts, setMinProducts] = useState("")
  const [maxProducts, setMaxProducts] = useState("")
  const [sortBy, setSortBy] = useState("createdAt:desc")
  const [isFilterVisible, setIsFilterVisible] = useState(false)

  const [debouncedFilterName, setDebouncedFilterName] = useState(filterName)
  const [debouncedFilterId, setDebouncedFilterId] = useState(filterId)
  const [debouncedMinProducts, setDebouncedMinProducts] = useState(minProducts)
  const [debouncedMaxProducts, setDebouncedMaxProducts] = useState(maxProducts)
  const limit = 10

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedFilterName(filterName), 500)
    return () => clearTimeout(handler)
  }, [filterName])

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedFilterId(filterId), 500)
    return () => clearTimeout(handler)
  }, [filterId])

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedMinProducts(minProducts), 500)
    return () => clearTimeout(handler)
  }, [minProducts])

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedMaxProducts(maxProducts), 500)
    return () => clearTimeout(handler)
  }, [maxProducts])

  const fetchCollections = async (paramsObj = {}) => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams()
      if (paramsObj.name) params.append("name", paramsObj.name)
      if (paramsObj.Id) params.append("Id", paramsObj.Id)
      if (paramsObj.minProducts) params.append("minProducts", paramsObj.minProducts)
      if (paramsObj.maxProducts) params.append("maxProducts", paramsObj.maxProducts)
      if (paramsObj.isActive) params.append("isActive", paramsObj.isActive)
      if (paramsObj.sortBy) params.append("sortBy", paramsObj.sortBy)
      params.append("page", paramsObj.page || 1)
      params.append("limit", paramsObj.limit || limit)

      const res = await apiAdmin.get(`/collection?${params.toString()}`)
      setCollections(res?.data?.data || [])
      setTotal(res?.data?.total || 0)
    } catch (err) {
      toast.error('Lỗi khi lấy bộ sưu tập')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCollections({
      name: debouncedFilterName || undefined,
      Id: debouncedFilterId || undefined,
      minProducts: debouncedMinProducts || undefined,
      maxProducts: debouncedMaxProducts || undefined,
      isActive: filterActive || undefined,
      sortBy: sortBy || undefined,
      page,
      limit
    })
  }, [debouncedFilterName, debouncedFilterId, debouncedMinProducts, debouncedMaxProducts, filterActive, sortBy, page])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = {
      name: name,
      description: description,
      image: imagePreview,
      isActive: isNewCollectionActive,
    }

    if (!formData.name || !formData.image) {
      toast.error("Tên và Ảnh không được để trống!")
      setIsLoading(false)
      return
    }

    try {
      if (editCollection) {
        await apiAdmin.put(`/collection/${editCollection._id}`, formData)
        toast.success('Cập nhật bộ sưu tập thành công')
      } else {
        await apiAdmin.post('/collection', formData)
        toast.success('Thêm bộ sưu tập thành công')
      }
      fetchCollections({ page, limit, sortBy })
      handleCloseForm()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra!')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteClick = (id, name) => {
    setItemToDelete({ id, name, type: 'collection' })
    setIsModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return
    try {
      setIsLoading(true)
      const res = await apiAdmin.delete(`/collection/${itemToDelete.id}`)
      if (res.status === 200) {
        toast.success('Xóa bộ sưu tập thành công')
        fetchCollections({ page, limit, sortBy })
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi khi xóa!')
    } finally {
      setIsLoading(false)
      setIsModalOpen(false)
      setItemToDelete(null)
    }
  }

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const formDataUpload = new FormData()
    formDataUpload.append('file', file)
    try {
      const res = await apiAdmin.post('/upload', formDataUpload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      if (res.status === 200 || res.status === 201) {
        setImagePreview(res.data.url)
        toast.success('Upload ảnh thành công!')
      }
    } catch (err) {
      toast.error('Upload ảnh thất bại!')
    }
  }

  const handleOpenForm = (collection = null) => {
    setEditCollection(collection)
    setIsFormOpen(true)
    setName(collection?.name || '')
    setDescription(collection?.description || '')
    setIsNewCollectionActive(collection?.isActive ?? true)
    setImagePreview(collection?.image || null)
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
    setEditCollection(null)
    setName('')
    setDescription('')
    setIsNewCollectionActive(true)
    setImagePreview(null)
  }

  const handleResetFilter = () => {
    setFilterName("")
    setFilterId("")
    setFilterActive("")
    setMinProducts("")
    setMaxProducts("")
    setSortBy("createdAt:desc")
    setPage(1)
    setDebouncedFilterName("")
    setDebouncedFilterId("")
    setDebouncedMinProducts("")
    setDebouncedMaxProducts("")
  }

  const columns = [
    {
      header: "Mã bộ sưu tập",
      render: (row) => <span className="font-semibold text-slate-600">{row?.Id}</span>
    },
    {
      header: "Hình ảnh",
      render: (row) => (
        <picture>
          <source srcSet={row?.image?.replace(/\.(jpg|jpeg|png)$/i, ".webp")} type="image/webp" />
          <LazyLoadImage
            src={row?.image || "https://placehold.co/100x100"}
            alt={row?.name}
            effect="blur"
            width={40}
            height={40}
            className="w-10 h-10 rounded-lg object-cover border border-slate-100"
          />
        </picture>
      )
    },
    {
      header: "Tên bộ sưu tập",
      render: (row) => <span className="font-bold text-slate-800">{row?.name}</span>
    },
    {
      header: "Mô tả",
      render: (row) => <p className="text-xs text-slate-500 max-w-xs truncate">{row?.description || 'N/A'}</p>
    },
    {
      header: "Số sản phẩm",
      render: (row) => <span className="font-semibold text-slate-700">{row?.productCount || 0}</span>
    },
    {
      header: "Trạng thái",
      render: (row) => (
        <StatusBadge status={row?.isActive ? 'active' : 'inactive'} />
      )
    },
    {
      header: "Thao tác",
      sticky: true,
      width: "100px",
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => handleOpenForm(row)}
            className="p-1.5 bg-slate-50 hover:bg-slate-100 text-blue-600 hover:text-blue-700 rounded-lg transition-colors border border-slate-200 shadow-sm"
            title="Chỉnh sửa"
          >
            <PencilIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDeleteClick(row?._id, row?.name)}
            className="p-1.5 bg-slate-50 hover:bg-slate-100 text-red-600 hover:text-red-700 rounded-lg transition-colors border border-slate-200 shadow-sm"
            title="Xóa"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ]

  return (
    <div className="p-6 bg-slate-50 dark:bg-slate-950 min-h-screen">
      <PageHeader
        title="Danh sách bộ sưu tập"
        description="Gộp nhóm các sản phẩm theo chủ đề hoặc chiến dịch Marketing của bạn."
        badge={`${total} bộ sưu tập`}
      />

      <Toolbar
        onFilterToggle={() => setIsFilterVisible(!isFilterVisible)}
        filterActive={isFilterVisible}
        filterCount={Object.values({ filterName, filterId, filterActive, minProducts, maxProducts, sortBy }).filter(Boolean).length}
        actions={
          <AdminButton
            variant="primary"
            size="sm"
            onClick={() => handleOpenForm()}
          >
            + Thêm bộ sưu tập mới
          </AdminButton>
        }
      />

      <AdminModal
        open={isFormOpen}
        onClose={handleCloseForm}
        title={editCollection ? 'Chỉnh sửa bộ sưu tập' : 'Thêm bộ sưu tập mới'}
        description={editCollection ? `Cập nhật: ${editCollection.name}` : 'Nhập thông tin bộ sưu tập mới'}
        size="md"
        footer={
          <>
            <AdminButton variant="ghost" size="sm" onClick={handleCloseForm} disabled={isLoading}>Hủy</AdminButton>
            <AdminButton variant="primary" size="sm" onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? 'Đang lưu…' : 'Lưu lại'}
            </AdminButton>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <AdminInput
            label="Tên bộ sưu tập"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nhập tên bộ sưu tập"
            required
          />
          <AdminTextarea
            label="Mô tả"
            name="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Nhập mô tả bộ sưu tập"
          />
          <div className="flex items-center justify-between py-3 border-y border-slate-100 dark:border-slate-800">
            <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">Trạng thái hoạt động</span>
            <Switch
              checked={isNewCollectionActive}
              onChange={setIsNewCollectionActive}
              className={`${isNewCollectionActive ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'} relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
            >
              <span className={`${isNewCollectionActive ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`} />
            </Switch>
          </div>
          <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-5 flex flex-col items-center justify-center text-center gap-2">
            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-xs text-slate-500 dark:text-slate-400">Nhấp chọn hoặc kéo thả ảnh vào đây</p>
            <label className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-lg cursor-pointer transition-colors border border-slate-200 dark:border-slate-700">
              Chọn file ảnh
              <input type="file" onChange={handleFileChange} className="hidden" />
            </label>
            {imagePreview && (
              <div className="mt-2 relative">
                <picture>
                  <source srcSet={imagePreview?.replace(/\.(jpg|jpeg|png)$/i, ".webp")} type="image/webp" />
                  <img src={imagePreview} alt="Xem trước" loading="lazy" className="w-16 h-16 object-cover rounded-xl border border-slate-200 shadow-sm" />
                </picture>
                <button type="button" onClick={() => setImagePreview(null)} className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] shadow">✕</button>
              </div>
            )}
          </div>
        </form>
      </AdminModal>

      <FilterPanel isOpen={isFilterVisible} onReset={handleResetFilter}>
        <FilterPanel.Field label="Tên bộ sưu tập">
          <input
            type="text"
            value={filterName}
            onChange={(e) => setFilterName(e.target.value)}
            placeholder="Nhập tên..."
          />
        </FilterPanel.Field>

        <FilterPanel.Field label="ID">
          <input
            type="text"
            value={filterId}
            onChange={(e) => setFilterId(e.target.value)}
            placeholder="Nhập mã ID..."
          />
        </FilterPanel.Field>

        <FilterPanel.Field label="Trạng thái">
          <select value={filterActive} onChange={(e) => setFilterActive(e.target.value)}>
            <option value="">Tất cả</option>
            <option value="true">Hoạt động</option>
            <option value="false">Không hoạt động</option>
          </select>
        </FilterPanel.Field>

        <FilterPanel.Field label="Sắp xếp">
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="createdAt:desc">Mới nhất</option>
            <option value="createdAt:asc">Cũ nhất</option>
            <option value="name:asc">Tên (A-Z)</option>
            <option value="name:desc">Tên (Z-A)</option>
            <option value="productCount:desc">Số SP (Giảm)</option>
            <option value="productCount:asc">Số SP (Tăng)</option>
          </select>
        </FilterPanel.Field>

        <div className="flex gap-2">
          <FilterPanel.Field label="Số SP từ">
            <input
              type="number"
              value={minProducts}
              onChange={(e) => setMinProducts(e.target.value)}
              placeholder="Từ"
            />
          </FilterPanel.Field>
          <FilterPanel.Field label="Số SP đến">
            <input
              type="number"
              value={maxProducts}
              onChange={(e) => setMaxProducts(e.target.value)}
              placeholder="Đến"
            />
          </FilterPanel.Field>
        </div>
      </FilterPanel>

      <DataTable
        columns={columns}
        data={collections}
        loading={isLoading}
        keyExtractor={(row) => row._id}
      />

      <Pagination
        page={page}
        total={total}
        limit={limit}
        onPageChange={setPage}
      />

      <ConfirmDialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Xác nhận xóa bộ sưu tập"
        description={`Bạn có chắc chắn muốn xóa "${itemToDelete?.name}"? Thao tác này không thể hoàn tác.`}
      />
    </div>
  )
}

export default ProductCollections