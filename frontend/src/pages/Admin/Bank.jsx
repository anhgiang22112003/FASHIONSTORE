import DeleteConfirmationModal from '@/components/DeleteConfirmationModal'
import React, { useEffect, useState } from 'react'
import AdminSpinner from '@/components/AdminSpinner'
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import { toast } from 'react-toastify'
import { Switch } from '@headlessui/react'
import { LazyLoadImage } from 'react-lazy-load-image-component'
import 'react-lazy-load-image-component/src/effects/blur.css'
import apiAdmin from '@/service/apiAdmin'
import { set } from 'date-fns'
const Bank = () => {
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [editBank, setEditBank] = useState(null)
    const [isNewBank, setIsNewBank] = useState(true)
    const [name, setName] = useState("")
    const [dec, setdec] = useState("")
    const [app, setApp] = useState("")
    const [sms, setSms] = useState("")
    const [bank, setBank] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [itemToDelete, setItemToDelete] = useState(null)

    useEffect(() => {
        if (editBank) {
            setName(editBank.name)
            setdec(editBank.description)
            setIsNewBank(editBank.status)
            setApp(editBank.app)
            setSms(editBank.sms)
        }
    }, [editBank])

    const fetchBank = async () => {
        try {
            setIsLoading(true) // bật loading
            const response = await apiAdmin.get("bank")
            setBank(response?.data || [])
        } catch (error) {
            toast.error("Lỗi khi lấy danh sách ngân hàng!")
        } finally {
            setIsLoading(false) // tắt loading
        }
    }

    useEffect(() => {
        fetchBank()
    }, [editBank])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsLoading(true) // bật loading khi submit

        let bankdata = {
            name: name,
            description: dec,
            app,
            sms,
            status: isNewBank
        }

        try {
            if (editBank) {
                await apiAdmin.patch(`/bank/${editBank._id}`, bankdata)
                toast.success("Cập nhật ngân hàng thành công")
            } else {
                await apiAdmin.post("/bank", bankdata)
                toast.success("Thêm ngân hàng thành công")
            }
            fetchBank()
        } catch (error) {
            toast.error(error.response?.data?.message || "Có lỗi xảy ra!")
        } finally {
            setIsLoading(false)
        }

        setIsFormOpen(false)
        setEditBank(null)
    }

    const handleDeleteClick = (type, id, name) => {
        setItemToDelete({ type, id, name })
        setIsModalOpen(true)
    }


    const handleConfirmDelete = async () => {
        if (itemToDelete) {
            try {
                setIsLoading(true)
                if (itemToDelete.type === 'bank') {
                    const res = await apiAdmin.delete(`/bank/${itemToDelete.id}`)
                    if (res.status === 200) {
                        toast.success("Xóa ngân hàng thành công")
                        fetchBank()
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

    const modalTitle = itemToDelete ? `Xác nhận xóa ${itemToDelete.type === 'bank' ? 'ngân hàng' : 'bộ sưu tập'}` : ''
    const modalMessage = itemToDelete ? `Bạn có chắc chắn muốn xóa "${itemToDelete.name}"? Thao tác này không thể hoàn tác.` : ''

    const handleOpenForm = (bank = null) => {
        setEditBank(bank)
        setIsFormOpen(true)
    }

    const handleCloseForm = () => {
        setIsFormOpen(false)
        setEditBank(null)
        setName('')
        setdec('')
        setApp('')
        setSms('')
        setIsNewBank(true)
    }

    return (
        <div style={{ backgroundColor: "var(--bg-color)", color: "var(--text-color)" }} className=" min-h-screen  font-sans antialiased">

            <div className="space-y-6 p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-var(--text-color)">Danh sách ngân hàng</h2>
                    <button
                        onClick={() => handleOpenForm()}
                        className="px-6 py-3 bg-pink-600 text-white rounded-xl font-semibold hover:bg-pink-700 transition-colors"
                    >
                        + Thêm ngân hàng mới
                    </button>
                </div>

                {/* FORM */}
                {isFormOpen && (
                    <div className=" p-8 rounded-2xl shadow-xl mb-6">
                        <h3 className="text-xl font-bold  mb-4">
                            {editBank ? 'Chỉnh sửa ngân hàng' : 'Thêm ngân hàng mới'}
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* inputs ... */}
                            <label className="block">
                                <span className="">Tên ngân hàng</span>
                                <input
                                    type="text"
                                    name="name"
                                    onChange={(e) => setName(e.target.value)}
                                    defaultValue={editBank?.name || ''}
                                    className="w-full text-black px-4 py-3 border border-pink-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-200"
                                    required
                                />
                            </label>
                            <label className="block">
                                <span className="">Mô tả</span>
                                <textarea
                                    name="description"
                                    onChange={(e) => setdec(e.target.value)}
                                    defaultValue={editBank?.description || ''}
                                    rows="3"
                                    className="w-full text-black px-4 py-3 border border-pink-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-200 resize-none"
                                ></textarea>
                            </label>

                            <label className="block">
                                <span className="">App</span>
                                <textarea
                                    name="app"
                                    onChange={(e) => setApp(e.target.value)}
                                    defaultValue={editBank?.app || ''}
                                    rows="3"
                                    className="w-full text-black px-4 py-3 border border-pink-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-200 resize-none"
                                ></textarea>
                            </label>
                            <label className="block">
                                <span className="">SMS</span>
                                <textarea
                                    name="sms"
                                    onChange={(e) => setSms(e.target.value)}
                                    defaultValue={editBank?.sms || ''}
                                    rows="3"
                                    className="w-full text-black px-4 py-3 border border-pink-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-200 resize-none"
                                ></textarea>
                            </label>
                            <div className="flex items-center justify-between p-4 rounded-lg">
                                <span className=" font-medium">Trạng thái: {isNewBank ? 'Đang hoạt động' : 'Ngừng hoạt động'}</span>
                                <Switch
                                    checked={isNewBank}
                                    onChange={setIsNewBank} // 👈 Cập nhật state khi click
                                    className={`${isNewBank ? 'bg-pink-600' : 'bg-gray-200'
                                        } relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
                                >
                                    <span className="sr-only">Bật/tắt trạng thái danh mục</span>
                                    <span
                                        className={`${isNewBank ? 'translate-x-6' : 'translate-x-1'
                                            } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                                    />
                                </Switch>
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
                                    {isLoading ? "Đang xử lý..." : editBank ? 'Lưu thay đổi' : 'Thêm ngân hàng'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* TABLE */}
                <div className=" p-6 rounded-2xl shadow-xl overflow-x-auto">
                    {isLoading ? (
                        <AdminSpinner />
                    ) : (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-pink-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Id</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên ngân hàng</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">App(pagkage)</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Chi tiết ngân hàng</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Hành động</th>
                                </tr>
                            </thead>
                            <tbody className=" divide-y divide-gray-200">
                                {bank.map(bank => (
                                    <tr className='hover:bg-pink-50 hover:text-black' key={bank._id}>
                                        {/* Trong bảng */}
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{bank?._id}</td>

                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium ">{bank?.name}</td>
                                        <td className="px-6 py-4 text-sm  max-w-xs truncate">{bank?.app}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm ">{bank?.description}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm ">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${bank?.status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {bank?.status ? "Hoạt động" : "Ngừng hoạt động"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                            <button
                                                onClick={() => handleOpenForm(bank)}
                                                className="p-1.5 text-pink-600 hover:text-pink-900 hover:bg-pink-50 rounded-lg transition-colors"
                                                title="Chỉnh sửa"
                                            >
                                                <PencilIcon className="h-5 w-5" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteClick('bank', bank._id, bank.name)}
                                                className="p-1.5 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Xóa"
                                            >
                                                <TrashIcon className="h-5 w-5" />
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

export default Bank
