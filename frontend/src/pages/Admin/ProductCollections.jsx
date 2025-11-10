import DeleteConfirmationModal from '@/components/DeleteConfirmationModal'
import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { Switch } from '@headlessui/react'
import { LazyLoadImage } from 'react-lazy-load-image-component'
import 'react-lazy-load-image-component/src/effects/blur.css'
import apiAdmin from '@/service/apiAdmin'
import {
  FunnelIcon
} from '@heroicons/react/24/outline'
const ProductCollections = () => {
    const [collections, setCollections] = useState([])
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [editCollection, setEditCollection] = useState(null)
    const [imagePreview, setImagePreview] = useState(null)
    const [isLoading, setIsLoading] = useState(false)
    const [isNewCollectionActive, setIsNewCollectionActive] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [itemToDelete, setItemToDelete] = useState(null)

    // --- State cho tìm kiếm, lọc và phân trang ---
    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [page, setPage] = useState(1)
    const [total, setTotal] = useState(0)
    const [filterName, setFilterName] = useState("")
    const [filterId, setFilterId] = useState("")
    const [filterActive, setFilterActive] = useState("")
    const [minProducts, setMinProducts] = useState("")
    const [maxProducts, setMaxProducts] = useState("")
    const [sortBy, setSortBy] = useState("createdAt:desc") // Sắp xếp mặc định
    const [isFilterVisible, setIsFilterVisible] = useState(false)

    // Debounce states
    const [debouncedFilterName, setDebouncedFilterName] = useState(filterName)
    const [debouncedFilterId, setDebouncedFilterId] = useState(filterId)
    const [debouncedMinProducts, setDebouncedMinProducts] = useState(minProducts)
    const [debouncedMaxProducts, setDebouncedMaxProducts] = useState(maxProducts)
    const limit = 10 // Số lượng mục mỗi trang

    // --- Debounce Logic ---
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedFilterName(filterName)
        }, 500)
        return () => clearTimeout(handler)
    }, [filterName])

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedFilterId(filterId)
        }, 500)
        return () => clearTimeout(handler)
    }, [filterId])

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedMinProducts(minProducts)
        }, 500)
        return () => clearTimeout(handler)
    }, [minProducts])

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedMaxProducts(maxProducts)
        }, 500)
        return () => clearTimeout(handler)
    }, [maxProducts])

    // --- Fetch collections ---
    const fetchCollections = async (paramsObj = {}) => {
        try {
            setIsLoading(true)
            const params = new URLSearchParams()

            // Chỉ append khi có giá trị
            if (paramsObj.name) params.append("name", paramsObj.name)
            if (paramsObj.Id) params.append("Id", paramsObj.Id)
            if (paramsObj.minProducts) params.append("minProducts", paramsObj.minProducts)
            if (paramsObj.maxProducts) params.append("maxProducts", paramsObj.maxProducts)
            if (paramsObj.isActive) params.append("isActive", paramsObj.isActive)
            if (paramsObj.sortBy) params.append("sortBy", paramsObj.sortBy)
            params.append("page", paramsObj.page || 1)
            params.append("limit", paramsObj.limit || limit)


            const res = await apiAdmin.get(`/collection?${params.toString()}`) // 👈 Cập nhật API endpoint
            setCollections(res?.data?.data || [])
            setTotal(res?.data?.total || 0)
        } catch (err) {
            toast.error('Lỗi khi lấy bộ sưu tập')
        } finally {
            setIsLoading(false)
        }
    }

    // Lắng nghe thay đổi của các filter/page để fetch dữ liệu mới
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

    // console.log(collections);

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsLoading(true)

        const formData = {
            name: name,
            description: description,
            image: imagePreview,
            isActive: isNewCollectionActive,
        }

        // Kiểm tra validation cơ bản
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
            fetchCollections({ page, limit, sortBy }) // Fetch lại dữ liệu với phân trang và sắp xếp hiện tại
            handleCloseForm()
        } catch (err) {
            toast.error(err.response?.data?.message || 'Có lỗi xảy ra!')
        } finally {
            setIsLoading(false)
        }
    }

    // --- Delete ---
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

    // --- Upload file ---
    const handleFileChange = async (e) => {
        const file = e.target.files?.[0]
        if (!file) return
        const formDataUpload = new FormData()
        formDataUpload.append('file', file)
        try {
            const res = await apiAdmin.post('/upload', formDataUpload, { // Sử dụng formDataUpload
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

    // --- Form open/close ---
    const handleOpenForm = (collection = null) => {
        setEditCollection(collection)
        setIsFormOpen(true)
        // Đặt state cho form
        setName(collection?.name || '')
        setDescription(collection?.description || '')
        setIsNewCollectionActive(collection?.isActive ?? true)
        setImagePreview(collection?.image || null)
    }

    const handleCloseForm = () => {
        setIsFormOpen(false)
        setEditCollection(null)
        // Reset form state
        setName('')
        setDescription('')
        setIsNewCollectionActive(true)
        setImagePreview(null)
    }

    // --- Filter logic ---
    const handleResetFilter = () => {
        setFilterName("")
        setFilterId("")
        setFilterActive("")
        setMinProducts("")
        setMaxProducts("")
        setSortBy("createdAt:desc") // Reset về mặc định
        setPage(1)
        // Cần reset cả debounced state nếu muốn hành động ngay
        setDebouncedFilterName("")
        setDebouncedFilterId("")
        setDebouncedMinProducts("")
        setDebouncedMaxProducts("")
    }
    const toggleFilterDropdown = () => {
        setIsFilterVisible(!isFilterVisible)
    }


    const modalTitle = itemToDelete ? `Xác nhận xóa bộ sưu tập` : ''
    const modalMessage = itemToDelete ? `Bạn có chắc muốn xóa "${itemToDelete?.name}"? Thao tác này không thể hoàn tác.` : ''

    return (
        <div style={{ backgroundColor: "var(--bg-color)", color: "var(--text-color)" }} className="min-h-screen  font-sans antialiased">
            <div className="space-y-6  p-5">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center space-x-4">
                         <h1 className="text-3xl font-bold">Danh sách bộ sưu tập</h1>
                        {/* Nút Bộ lọc */}
                        <button
                            onClick={toggleFilterDropdown}
                            className={`px-4 py-2 rounded-xl flex items-center space-x-1 font-medium transition-all ${isFilterVisible
                                ? 'bg-pink-600 text-white hover:bg-pink-700'
                                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'}`}
                        >
                           <FunnelIcon className="w-5 h-5" />
                            <span>Bộ lọc</span>
                        </button>
                    </div>

                    <button
                        onClick={() => handleOpenForm()}
                        className="px-6 py-3 bg-pink-600 text-white rounded-xl font-semibold hover:bg-pink-700 transition-colors"
                    >
                        + Thêm bộ sưu tập mới
                    </button>
                </div>
                {isFormOpen && (
                    <div className=" p-8 rounded-2xl shadow-xl mb-6">
                        <h3 className="text-xl font-bold  mb-4">
                            {editCollection ? 'Chỉnh sửa bộ sưu tập' : 'Thêm bộ sưu tập mới'}
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <label className="block">
                                <span className="">Tên bộ sưu tập</span>
                                <input
                                    type="text"
                                    name="name"
                                    value={name} // Sử dụng state value
                                    onChange={(e) => setName(e.target.value)} // Cập nhật state
                                    className="w-full px-4 text-black py-3 border border-pink-300 rounded-lg focus:ring-2 focus:ring-pink-200"
                                    required
                                />
                            </label>
                            <label className="block">
                                <span className="">Mô tả</span>
                                <textarea
                                    name="description"
                                    value={description} // Sử dụng state value
                                    onChange={(e) => setDescription(e.target.value)} // Cập nhật state
                                    rows="3"
                                    className="w-full text-black px-4 py-3 border border-pink-300 rounded-lg focus:ring-2 focus:ring-pink-200 resize-none"
                                />
                            </label>
                            <div className="flex items-center justify-between p-4  rounded-lg">
                                <span className=" font-medium">Trạng thái: {isNewCollectionActive ? 'Đang hoạt động' : 'Ngừng hoạt động'}</span>
                                <Switch
                                    checked={isNewCollectionActive}
                                    onChange={setIsNewCollectionActive}
                                    className={`${isNewCollectionActive ? 'bg-pink-600' : 'bg-gray-200'
                                        } relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
                                >
                                    <span className="sr-only">Bật/tắt trạng thái bộ sưu tập</span>
                                    <span
                                        className={`${isNewCollectionActive ? 'translate-x-6' : 'translate-x-1'
                                            } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                                    />
                                </Switch>
                            </div>

                            {/* Upload ảnh */}
                            <div className="border border-dashed border-pink-400 p-8 rounded-lg flex flex-col items-center text-center space-y-4">
                                <svg className="w-12 h-12 text-pink-600" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4c-3.72 0-6.85 2.59-7.46 6.04-.32 1.94.49 3.82 1.83 5.06L7 16h10.42c1.78-.11 3.25-1.4 3.5-3.17.2-1.46-.23-2.91-1.57-3.79zM15 13l-3-3-3 3h2v4h2v-4h2z"></path>
                                </svg>
                                <p className="text-gray-600">Kéo thả hình ảnh hoặc chọn file</p>
                                <label className="px-6 py-3 bg-pink-600 text-white rounded-lg cursor-pointer">
                                    Chọn file
                                    <input type="file" onChange={handleFileChange} className="hidden" />
                                </label>
                                {imagePreview && (
                                    <picture>
                                        <source srcSet={imagePreview?.replace(/\.(jpg|jpeg|png)$/i, ".webp")} type="image/webp" />
                                        <img
                                            src={imagePreview}
                                            alt="Xem trước"
                                            loading="lazy"
                                            className="mt-4 w-24 h-24 object-cover rounded-lg"
                                        />
                                    </picture>
                                )}
                            </div>

                            <div className="flex justify-end space-x-4 mt-6">
                                <button
                                    type="button"
                                    onClick={handleCloseForm}
                                    className="px-6 py-3  border border-gray-300 rounded-xl"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className={`px-6 py-3 rounded-xl font-semibold ${isLoading
                                        ? 'bg-gray-400 text-white cursor-not-allowed'
                                        : 'bg-pink-600 text-white hover:bg-pink-700'
                                        }`}
                                >
                                    {isLoading ? 'Đang xử lý...' : editCollection ? 'Lưu thay đổi' : 'Thêm bộ sưu tập'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}
                {/* Bộ lọc nâng cao */}
                {isFilterVisible && (
                    <div className="mt-4 p-5 border rounded-2xl shadow-lg ">
                        {/* Đã đổi tiêu đề để phản ánh nội dung ban đầu (nếu cần) hoặc giữ nguyên như mẫu */}
                        <h4 className="text-lg font-semibold mb-4 border-b pb-2">Bộ lọc</h4>
                        {/* Dùng grid-cols-4 cho màn hình lớn để chứa 4 cột chính, tương tự mẫu */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                            {/* Tìm theo Tên */}
                            <div>
                                <label className="block text-sm font-medium mb-1">Tên</label>
                                <input
                                    type="text"
                                    value={filterName}
                                    placeholder="Nhập tên..."
                                    onChange={(e) => { setFilterName(e.target.value); setPage(1) }}
                                    className="w-full text-black px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/50"
                                />
                            </div>

                            {/* Tìm theo ID */}
                            <div>
                                <label className="block text-sm font-medium mb-1">ID</label>
                                <input
                                    type="text"
                                    value={filterId}
                                    placeholder="Nhập mã ID..."
                                    onChange={(e) => { setFilterId(e.target.value); setPage(1) }}
                                    className="w-full text-black px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/50"
                                />
                            </div>

                            {/* Trạng thái */}
                            <div>
                                <label className="block text-sm font-medium mb-1">Trạng thái</label>
                                <select
                                    value={filterActive}
                                    onChange={(e) => { setFilterActive(e.target.value); setPage(1) }}
                                    className="w-full text-black px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/50 bg-white"
                                >
                                    <option value="">Tất cả</option>
                                    <option value="true">Hoạt động</option>
                                    <option value="false">Không hoạt động</option>
                                </select>
                            </div>

                            {/* Sắp xếp */}
                            <div>
                                <label className="block text-sm font-medium mb-1">Sắp xếp</label>
                                <select
                                    value={sortBy}
                                    onChange={(e) => { setSortBy(e.target.value); setPage(1) }}
                                    className="w-full text-black px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/50 bg-white"
                                >
                                    <option value="createdAt:desc">Mới nhất</option>
                                    <option value="createdAt:asc">Cũ nhất</option>
                                    <option value="name:asc">Tên (A-Z)</option>
                                    <option value="name:desc">Tên (Z-A)</option>
                                    <option value="productCount:desc">Số SP (Giảm dần)</option>
                                    <option value="productCount:asc">Số SP (Tăng dần)</option>
                                </select>
                            </div>

                            {/* Bộ lọc số lượng sản phẩm Min */}
                            <div>
                                <label className="block text-sm font-medium mb-1">Số SP tối thiểu</label>
                                <input
                                    type="number"
                                    value={minProducts}
                                    placeholder="Nhỏ nhất"
                                    onChange={(e) => { setMinProducts(e.target.value); setPage(1) }}
                                    className="w-full text-black px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/50"
                                />
                            </div>

                            {/* Bộ lọc số lượng sản phẩm Max */}
                            <div>
                                <label className="block text-sm font-medium mb-1">Số SP tối đa</label>
                                <input
                                    type="number"
                                    value={maxProducts}
                                    placeholder="Lớn nhất"
                                    onChange={(e) => { setMaxProducts(e.target.value); setPage(1) }}
                                    className="w-full text-black px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/50"
                                />
                            </div>

                            {/* Ô trống để căn chỉnh nút Đặt lại/Xóa bộ lọc */}
                            <div className="hidden lg:block"></div>

                            {/* Nút Đặt lại/Xóa bộ lọc */}
                            <div className="flex items-end justify-end">
                                <button
                                    onClick={handleResetFilter}
                                    className="w-full md:w-auto px-6 py-2 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
                                >
                                    Xóa bộ lọc
                                </button>
                            </div>

                        </div>
                    </div>
                )}

                {/* TABLE */}
                <div className=" p-6 rounded-2xl shadow-xl overflow-x-auto">
                    {isLoading ? (
                        <div className="text-center py-6 text-gray-500">Đang tải dữ liệu...</div>
                    ) : (
                        <>
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-pink-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th> {/* Thêm ID */}
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hình ảnh</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên bộ sưu tập</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mô tả</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Số sản phẩm</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Hành động</th>
                                    </tr>
                                </thead>
                                <tbody className=" divide-y divide-gray-200">
                                    {collections.length > 0 ? (
                                        collections.map((collection) => (
                                            <tr className='hover:bg-pink-50 hover:text-black' key={collection?._id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm ">{collection?.Id}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <picture>
                                                        <source srcSet={collection?.image?.replace(/\.(jpg|jpeg|png)$/i, ".webp")} type="image/webp" />
                                                        <LazyLoadImage
                                                            src={collection?.image || "https://placehold.co/100x100"}
                                                            alt={collection?.name}
                                                            effect="blur"
                                                            width={48}
                                                            height={48}
                                                            className="w-12 h-12 rounded-lg object-cover"
                                                        />
                                                    </picture>
                                                </td>
                                                <td className="px-6 py-4">{collection?.name}</td>
                                                <td className="px-6 py-4 max-w-xs truncate">{collection?.description}</td>
                                                <td className="px-6 py-4">{collection?.productCount || 0}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${collection?.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                        {collection?.isActive ? "Hoạt động" : "Ngừng hoạt động"}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right space-x-2">
                                                    <button
                                                        onClick={() => handleOpenForm(collection)}
                                                        className="text-pink-600 hover:text-pink-900 transition-colors"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteClick(collection?._id, collection?.name)} // Sửa thành _id
                                                        className="text-red-600 hover:text-red-900 transition-colors"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                                                Không tìm thấy bộ sưu tập nào.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                            {/* Pagination */}
                            {total > limit && (
                                <div className="flex justify-center items-center mt-6 space-x-2">
                                    <button
                                        onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                                        disabled={page === 1}
                                        className="px-3 py-1 border rounded-lg  hover:bg-pink-200 disabled:opacity-50"
                                    >
                                        ← Trước
                                    </button>

                                    {Array.from({ length: Math.ceil(total / limit) }, (_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setPage(i + 1)}
                                            className={`px-3 py-1 border rounded-lg font-semibold ${page === i + 1
                                                ? "bg-pink-600 text-white"
                                                : "hover:bg-gray-100"
                                                }`}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}

                                    <button
                                        onClick={() => setPage(prev => prev + 1)}
                                        disabled={page >= Math.ceil(total / limit)}
                                        className="px-3 text-black py-1 border rounded-lg  hover:bg-pink-200 disabled:opacity-50"
                                    >
                                        Sau →
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Modal confirm */}
                <DeleteConfirmationModal
                    title={modalTitle}
                    message={modalMessage}
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onConfirm={handleConfirmDelete}
                />
            </div>
        </div>
    )
}

export default ProductCollections