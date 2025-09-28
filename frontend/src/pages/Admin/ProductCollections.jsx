import DeleteConfirmationModal from '@/components/DeleteConfirmationModal'
import api from '@/service/api'
import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { Switch } from '@headlessui/react'

const ProductCollections = () => {
    const [collections, setCollections] = useState([])
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [editCollection, setEditCollection] = useState(null)
    const [imagePreview, setImagePreview] = useState(null)
    const [isLoading, setIsLoading] = useState(false)
    const [isNewCollectionActive, setIsNewCollectionActive] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [itemToDelete, setItemToDelete] = useState(null)

    // Fetch collections
    const fetchCollections = async () => {
        try {
            setIsLoading(true)
            const res = await api.get('/collection')
            setCollections(res?.data || [])
        } catch (err) {
            toast.error('Lỗi khi lấy bộ sưu tập')
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchCollections()
    }, [])

    // Submit form
    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsLoading(true)

        const formData = {
            name: e.target.name.value,
            description: e.target.description.value,
            image: imagePreview,
            isActive: isNewCollectionActive,

        }

        try {
            if (editCollection) {
                await api.put(`/collection/${editCollection._id}`, formData)
                toast.success('Cập nhật bộ sưu tập thành công')
            } else {
                await api.post('/collection', formData)
                toast.success('Thêm bộ sưu tập thành công')
            }
            fetchCollections()
            handleCloseForm()
        } catch (err) {
            toast.error(err.response?.data?.message || 'Có lỗi xảy ra!')
        } finally {
            setIsLoading(false)
        }
    }

    // Delete
    const handleDeleteClick = (id, name) => {
        setItemToDelete({ id, name, type: 'collection' })
        setIsModalOpen(true)
    }

    const handleConfirmDelete = async () => {
        if (!itemToDelete) return
        try {
            setIsLoading(true)
            const res = await api.delete(`/collection/${itemToDelete.id}`)
            if (res.status === 200) {
                toast.success('Xóa bộ sưu tập thành công')
                fetchCollections()
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Lỗi khi xóa!')
        } finally {
            setIsLoading(false)
            setIsModalOpen(false)
            setItemToDelete(null)
        }
    }

    // Upload file
    const handleFileChange = async (e) => {
        const file = e.target.files?.[0]
        if (!file) return
        const formData = new FormData()
        formData.append('file', file)
        try {
            const res = await api.post('/upload', formData, {
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

    // Form open/close
    const handleOpenForm = (collection = null) => {
        setEditCollection(collection)
        setIsFormOpen(true)
        setImagePreview(collection?.image || null)
    }

    const handleCloseForm = () => {
        setIsFormOpen(false)
        setEditCollection(null)
        setImagePreview(null)
    }
    

    const modalTitle = itemToDelete ? `Xác nhận xóa bộ sưu tập` : ''
    const modalMessage = itemToDelete ? `Bạn có chắc muốn xóa "${itemToDelete?.name}"?` : ''

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Bộ sưu tập sản phẩm</h2>
                <button
                    onClick={() => handleOpenForm()}
                    className="px-6 py-3 bg-pink-600 text-white rounded-xl font-semibold hover:bg-pink-700 transition-colors"
                >
                    + Thêm bộ sưu tập mới
                </button>
            </div>

            {/* FORM */}
            {isFormOpen && (
                <div className="bg-white p-8 rounded-2xl shadow-xl mb-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">
                        {editCollection ? 'Chỉnh sửa bộ sưu tập' : 'Thêm bộ sưu tập mới'}
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <label className="block">
                            <span className="text-gray-600">Tên bộ sưu tập</span>
                            <input
                                type="text"
                                name="name"
                                defaultValue={editCollection?.name || ''}
                                className="w-full px-4 py-3 border border-pink-300 rounded-lg focus:ring-2 focus:ring-pink-200"
                                required
                            />
                        </label>
                        <label className="block">
                            <span className="text-gray-600">Mô tả</span>
                            <textarea
                                name="description"
                                defaultValue={editCollection?.description || ''}
                                rows="3"
                                className="w-full px-4 py-3 border border-pink-300 rounded-lg focus:ring-2 focus:ring-pink-200 resize-none"
                            />
                        </label>
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <span className="text-gray-700 font-medium">Trạng thái: {isNewCollectionActive ? 'Đang hoạt động' : 'Ngừng hoạt động'}</span>
                            <Switch
                                checked={isNewCollectionActive}
                                onChange={setIsNewCollectionActive} // 👈 Cập nhật state khi click
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
                                <img src={imagePreview} alt="Preview" className="mt-4 w-24 h-24 object-cover rounded-lg" />
                            )}
                        </div>

                        <div className="flex justify-end space-x-4 mt-6">
                            <button
                                type="button"
                                onClick={handleCloseForm}
                                className="px-6 py-3 bg-white border border-gray-300 rounded-xl"
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

            {/* TABLE */}
            <div className="bg-white p-6 rounded-2xl shadow-xl overflow-x-auto">
                {isLoading ? (
                    <div className="text-center py-6 text-gray-500">Đang tải dữ liệu...</div>
                ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-pink-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hình ảnh</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên bộ sưu tập</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mô tả</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Số sản phẩm</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {collections?.map((collection) => (
                                <tr key={collection?._id}>
                                    <td className="px-6 py-4">
                                        <img src={collection?.image} alt={collection?.name} className="w-20 h-20 object-cover rounded-md" />
                                    </td>
                                    <td className="px-6 py-4">{collection?.name}</td>
                                    <td className="px-6 py-4 max-w-xs truncate">{collection?.description}</td>
                                    <td className="px-6 py-4">{collection?.productCount}</td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        <button
                                        onClick={() => handleOpenForm(collection)}
                                        className="text-pink-600 hover:text-pink-900 transition-colors"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>
                                    </button>
                                    <button
                                         onClick={() => handleDeleteClick( collection?.id, collection?.name,'collection',)}
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

            {/* Modal confirm */}
            <DeleteConfirmationModal
                title={modalTitle}
                message={modalMessage}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={handleConfirmDelete}
            />
        </div>
    )
}

export default ProductCollections
