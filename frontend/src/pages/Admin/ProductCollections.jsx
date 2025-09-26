import DeleteConfirmationModal from '@/components/DeleteConfirmationModal'
import React, { useState } from 'react'

const collectionsData = [
    { id: 1, name: 'Bộ sưu tập mùa hè', description: 'Các sản phẩm mới nhất và phù hợp với mùa hè.', products: 50, image: 'https://via.placeholder.com/60' },
    { id: 2, name: 'Giảm giá cuối mùa', description: 'Các sản phẩm giảm giá mạnh để xả kho.', products: 120, image: 'https://via.placeholder.com/60' },
    { id: 3, name: 'Sản phẩm nổi bật', description: 'Các sản phẩm bán chạy nhất trong tháng.', products: 30, image: 'https://via.placeholder.com/60' },
]

const ProductCollections = () => {
    const [collections, setCollections] = useState(collectionsData)
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [editCollection, setEditCollection] = useState(null)
    const [imagePreview, setImagePreview] = useState(null)


    const [isModalOpen, setIsModalOpen] = useState(false)
    // State lưu trữ loại và ID của đối tượng cần xóa
    const [itemToDelete, setItemToDelete] = useState(null)

    // Mở modal với thông tin cụ thể
    const handleDeleteClick = (type, id, name) => {
        setItemToDelete({ type, id, name })
        setIsModalOpen(true)
    }

    // Hàm xử lý khi xác nhận xóa
    const handleConfirmDelete = () => {
        if (itemToDelete) {
            console.log(`Đang xóa ${itemToDelete.type} với ID: ${itemToDelete.id}`)
            // Thực hiện logic xóa thực tế ở đây (ví dụ: gọi API)
            // Ví dụ: xóa danh mục
            if (itemToDelete.type === 'category') {
                // ... logic xóa danh mục
            }
            // Ví dụ: xóa bộ sưu tập
            else if (itemToDelete.type === 'collection') {
                // ... logic xóa bộ sưu tập
            }
        }
        setIsModalOpen(false)
        setItemToDelete(null)
    }

    // Hàm đóng modal
    const handleCloseModal = () => {
        setIsModalOpen(false)
        setItemToDelete(null)
    }
    const modalTitle = itemToDelete ? `Xác nhận xóa ${itemToDelete.type === 'category' ? 'danh mục' : 'bộ sưu tập'}` : ''
    const modalMessage = itemToDelete ? `Bạn có chắc chắn muốn xóa "${itemToDelete.name}"? Thao tác này không thể hoàn tác.` : ''

    const handleOpenForm = (collection = null) => {
        setEditCollection(collection)
        setIsFormOpen(true)
        setImagePreview(collection?.image || null)
    }

    

    const handleFileChange = (file) => {
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setImagePreview(reader.result)
            }
            reader.readAsDataURL(file)
        } else {
            setImagePreview(null)
        }
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        const formData = new FormData(e.target)
        const newCollection = {
            id: editCollection ? editCollection.id : collections.length > 0 ? Math.max(...collections.map(c => c.id)) + 1 : 1,
            name: formData.get('name'),
            description: formData.get('description'),
            products: editCollection ? editCollection.products : 0,
            image: imagePreview || 'https://via.placeholder.com/60',
        }

        if (editCollection) {
            setCollections(collections.map(col => col.id === newCollection.id ? newCollection : col))
        } else {
            setCollections([...collections, newCollection])
        }
        setIsFormOpen(false)
        setImagePreview(null)
    }

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
                                className="w-full px-4 py-3 border border-pink-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-200"
                                required
                            />
                        </label>
                        <label className="block">
                            <span className="text-gray-600">Mô tả</span>
                            <textarea
                                name="description"
                                defaultValue={editCollection?.description || ''}
                                rows="3"
                                className="w-full px-4 py-3 border border-pink-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-200 resize-none"
                            ></textarea>
                        </label>

                        {/* Drag and Drop Image Uploader */}
                        <div className="border border-dashed border-pink-400 p-8 rounded-lg flex flex-col items-center justify-center text-center space-y-4">
                            <svg className="w-12 h-12 text-pink-600" fill="currentColor" viewBox="0 0 24 24"><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4c-3.72 0-6.85 2.59-7.46 6.04-.32 1.94.49 3.82 1.83 5.06L7 16h10.42c1.78-.11 3.25-1.4 3.5-3.17.2-1.46-.23-2.91-1.57-3.79zM15 13l-3-3-3 3h2v4h2v-4h2z"></path></svg>
                            <p className="text-gray-600">Kéo thả hình ảnh vào đây hoặc</p>
                            <label className="px-6 py-3 bg-pink-600 text-white rounded-lg font-semibold cursor-pointer hover:bg-pink-700 transition-colors">
                                Chọn file
                                <input
                                    type="file"
                                    onChange={(e) => handleFileChange(e.target.files[0])}
                                    className="hidden"
                                />
                            </label>
                            <p className="text-sm text-gray-500">PNG, JPG, JPEG tối đa 5MB</p>
                            {imagePreview && (
                                <img src={imagePreview} alt="Xem trước" className="mt-4 w-24 h-24 object-cover rounded-lg" />
                            )}
                        </div>

                        <div className="flex justify-end space-x-4 mt-6">
                            <button
                                type="button"
                                onClick={() => setIsFormOpen(false)}
                                className="px-6 py-3 bg-white text-gray-600 rounded-xl font-semibold border border-gray-300 hover:bg-gray-100 transition-colors"
                            >
                                Hủy
                            </button>
                            <button
                                type="submit"
                                className="px-6 py-3 bg-pink-600 text-white rounded-xl font-semibold hover:bg-pink-700 transition-colors"
                            >
                                {editCollection ? 'Lưu thay đổi' : 'Thêm bộ sưu tập'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white p-6 rounded-2xl shadow-xl overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-pink-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hình ảnh</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên bộ sưu tập</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mô tả</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số sản phẩm</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {collections.map(collection => (
                            <tr key={collection.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <img src={collection.image} alt={collection.name} className="w-10 h-10 object-cover rounded-md" />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{collection.name}</td>
                                <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{collection.description}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{collection.products}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                    <button
                                        onClick={() => handleOpenForm(collection)}
                                        className="text-pink-600 hover:text-pink-900 transition-colors"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>
                                    </button>
                                    <button
                                         onClick={() => handleDeleteClick('collection', collection.id, collection.name)}
                                        className="text-red-600 hover:text-red-900 transition-colors"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
                 <DeleteConfirmationModal
                title={modalTitle}
                message={modalMessage}
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onConfirm={handleConfirmDelete}
            />
        </div>
    )
}

export default ProductCollections