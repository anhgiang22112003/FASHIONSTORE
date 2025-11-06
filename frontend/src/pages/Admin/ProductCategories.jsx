import DeleteConfirmationModal from '@/components/DeleteConfirmationModal'
import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { Switch } from '@headlessui/react'
import { LazyLoadImage } from 'react-lazy-load-image-component'
import 'react-lazy-load-image-component/src/effects/blur.css'
import apiAdmin from '@/service/apiAdmin'
const ProductCategories = () => {
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [editCategory, setEditCategory] = useState(null)
    const [imagePreview, setImagePreview] = useState(null)
    const [isNewCategoryActive, setIsNewCategoryActive] = useState(true)
    const [name, setName] = useState("")
    const [dec, setdec] = useState("")
    const [category, setCategory] = useState([])
    const [isLoading, setIsLoading] = useState(false) // 👈 STATE loading

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [itemToDelete, setItemToDelete] = useState(null)

    useEffect(() => {
        if (editCategory) {
            setName(editCategory.name)
            setdec(editCategory.description)
            setIsNewCategoryActive(editCategory.isActive)
            setImagePreview(editCategory.image || null)
        }
    }, [editCategory])

    const fetchCategories = async () => {
        try {
            setIsLoading(true) // bật loading
            const response = await apiAdmin.get("categories")
            setCategory(response?.data || [])
        } catch (error) {
            toast.error("Lỗi khi lấy danh mục")
        } finally {
            setIsLoading(false) // tắt loading
        }
    }

    useEffect(() => {
        fetchCategories()
    }, [editCategory])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsLoading(true) // bật loading khi submit

        let categorydata = {
            name: name,
            description: dec,
            image: imagePreview,
            isActive: isNewCategoryActive
        }

        try {
            if (editCategory) {
                await apiAdmin.put(`/categories/${editCategory._id}`, categorydata)
                toast.success("Cập nhật danh mục thành công")
            } else {
                await apiAdmin.post("/categories", categorydata)
                toast.success("Thêm danh mục thành công")
            }
            fetchCategories()
        } catch (error) {
            toast.error(error.response?.data?.message || "Có lỗi xảy ra!")
        } finally {
            setIsLoading(false)
        }

        setIsFormOpen(false)
        setImagePreview(null)
        setEditCategory(null)
    }

    const handleDeleteClick = (type, id, name) => {
        setItemToDelete({ type, id, name })
        setIsModalOpen(true)
    }
    const handleFileChange = async (event, index = null) => {
        const file = event.target?.files?.[0]  // Get the first file
        if (!file) return  // Exit if no file is selected
        const formDataUpload = new FormData()
        formDataUpload.append("file", file)

        try {
            const res = await apiAdmin.post("/upload", formDataUpload, {
                headers: { "Content-Type": "multipart/form-data" },
            })

            if (res.status === 201 || res.status === 200) {
                const url = res.data.url // URL from server

                if (index === null) {
                    // If no index provided, upload the main category image
                    setImagePreview(url)
                } else {
                    // Otherwise, upload the additional product images (if any)
                    const newImages = [...images]
                    newImages[index] = url
                    setImages(newImages)
                }

                toast.success("Upload ảnh thành công!")
            } else {
                toast.error("Upload ảnh thất bại!")
            }
        } catch (error) {
            console.error(error)
            toast.error("Lỗi khi upload ảnh!")
        }
    }


    const handleConfirmDelete = async () => {
        if (itemToDelete) {
            try {
                setIsLoading(true)
                if (itemToDelete.type === 'category') {
                    const res = await apiAdmin.delete(`/categories/${itemToDelete.id}`)
                    if (res.status === 200) {
                        toast.success("Xóa danh mục thành công")
                        fetchCategories()
                    }
                }
            } catch (err) {
                toast.error(err.response?.data?.message || "Lỗi khi xóa!")
            } finally {
                setIsLoading(false)
            }
        }
        setIsModalOpen(false)
        setItemToDelete(null)
    }

    const handleCloseModal = () => {
        setIsModalOpen(false)
        setItemToDelete(null)
    }

    const modalTitle = itemToDelete ? `Xác nhận xóa ${itemToDelete.type === 'category' ? 'danh mục' : 'bộ sưu tập'}` : ''
    const modalMessage = itemToDelete ? `Bạn có chắc chắn muốn xóa "${itemToDelete.name}"? Thao tác này không thể hoàn tác.` : ''

    const handleOpenForm = (category = null) => {
        setEditCategory(category)
        setIsFormOpen(true)
        setImagePreview(category?.image || null)
    }

    const handleCloseForm = () => {
        setIsFormOpen(false)
        setEditCategory(null)
        setName('')
        setdec('')
        setIsNewCategoryActive(true)
        setImagePreview(null)
    }

    return (
        <div style={{ backgroundColor: "var(--bg-color)", color: "var(--text-color)" }} className=" min-h-screen  font-sans antialiased">

            <div className="space-y-6 p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-var(--text-color)">Danh mục sản phẩm</h2>
                    <button
                        onClick={() => handleOpenForm()}
                        className="px-6 py-3 bg-pink-600 text-white rounded-xl font-semibold hover:bg-pink-700 transition-colors"
                    >
                        + Thêm danh mục mới
                    </button>
                </div>

                {/* FORM */}
                {isFormOpen && (
                    <div className="bg-white p-8 rounded-2xl shadow-xl mb-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">
                            {editCategory ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* inputs ... */}
                            <label className="block">
                                <span className="text-gray-600">Tên danh mục</span>
                                <input
                                    type="text"
                                    name="name"
                                    onChange={(e) => setName(e.target.value)}
                                    defaultValue={editCategory?.name || ''}
                                    className="w-full px-4 py-3 border border-pink-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-200"
                                    required
                                />
                            </label>
                            <label className="block">
                                <span className="text-gray-600">Mô tả</span>
                                <textarea
                                    name="description"
                                    onChange={(e) => setdec(e.target.value)}
                                    defaultValue={editCategory?.description || ''}
                                    rows="3"
                                    className="w-full px-4 py-3 border border-pink-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-200 resize-none"
                                ></textarea>
                            </label>
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <span className="text-gray-700 font-medium">Trạng thái: {isNewCategoryActive ? 'Đang hoạt động' : 'Ngừng hoạt động'}</span>
                                <Switch
                                    checked={isNewCategoryActive}
                                    onChange={setIsNewCategoryActive} // 👈 Cập nhật state khi click
                                    className={`${isNewCategoryActive ? 'bg-pink-600' : 'bg-gray-200'
                                        } relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
                                >
                                    <span className="sr-only">Bật/tắt trạng thái danh mục</span>
                                    <span
                                        className={`${isNewCategoryActive ? 'translate-x-6' : 'translate-x-1'
                                            } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                                    />
                                </Switch>
                            </div>

                            {/* Drag and Drop Image Uploader */}
                            <div className="border border-dashed border-pink-400 p-8 rounded-lg flex flex-col items-center justify-center text-center space-y-4">
                                <svg className="w-12 h-12 text-pink-600" fill="currentColor" viewBox="0 0 24 24"><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4c-3.72 0-6.85 2.59-7.46 6.04-.32 1.94.49 3.82 1.83 5.06L7 16h10.42c1.78-.11 3.25-1.4 3.5-3.17.2-1.46-.23-2.91-1.57-3.79zM15 13l-3-3-3 3h2v4h2v-4h2z"></path></svg>
                                <p className="text-gray-600">Kéo thả hình ảnh vào đây hoặc</p>
                                <label className="px-6 py-3 bg-pink-600 text-white rounded-lg font-semibold cursor-pointer hover:bg-pink-700 transition-colors">
                                    Chọn file
                                    <input
                                        type="file"
                                        onChange={(e) => handleFileChange(e)}  // Correct handler here
                                        className="hidden"
                                    />
                                </label>
                                <p className="text-sm text-gray-500">PNG, JPG, JPEG tối đa 5MB</p>
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
                                    className="px-6 py-3 bg-white text-gray-600 rounded-xl font-semibold border border-gray-300 hover:bg-gray-100 transition-colors"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading} // disable khi đang loading
                                    className={`px-6 py-3 rounded-xl font-semibold transition-colors ${isLoading
                                        ? 'bg-gray-400 text-white cursor-not-allowed'
                                        : 'bg-pink-600 text-white hover:bg-pink-700'
                                        }`}
                                >
                                    {isLoading ? "Đang xử lý..." : editCategory ? 'Lưu thay đổi' : 'Thêm danh mục'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* TABLE */}
                <div className="bg-white p-6 rounded-2xl shadow-xl overflow-x-auto">
                    {isLoading ? (
                        <div className="text-center py-6 text-gray-500">Đang tải dữ liệu...</div>
                    ) : (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-pink-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hình ảnh</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên danh mục</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mô tả</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Số sản phẩm</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Hành động</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {category.map(category => (
                                    <tr key={category._id}>
                                        {/* Trong bảng */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <picture>
                                                <source srcSet={category.image?.replace(/\.(jpg|jpeg|png)$/i, ".webp")} type="image/webp" />
                                             
                                                <LazyLoadImage
                                                    src={category.image|| "https://placehold.co/100x100"}
                                                    alt={category.name}
                                                    effect="blur"
                                                    width={48}
                                                    height={48}
                                                    className="w-12 h-12 rounded-lg object-cover"
                                                />
                                            </picture>
                                        </td>

                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{category?.name}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{category?.description}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{category?.productCount}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{category?.isActive ? "Hoạt động" : "Không hoạt động"}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                            <button
                                                onClick={() => handleOpenForm(category)}
                                                className="text-pink-600 hover:text-pink-900 transition-colors"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>
                                            </button>
                                            <button
                                                onClick={() => handleDeleteClick('category', category._id, category.name)}

                                                className="text-red-600 hover:text-red-900 transition-colors"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                <DeleteConfirmationModal
                    title={modalTitle}
                    message={modalMessage}
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    onConfirm={handleConfirmDelete}
                    id={itemToDelete?.id}
                />
            </div>
        </div>
    )
}

export default ProductCategories
