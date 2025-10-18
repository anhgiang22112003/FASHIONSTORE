import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import api from "../../service/api"
import ProductVariations from './ProductVariations.jsx'

const AddProduct = ({ setActiveTab, fetchProducts }) => {
    const [productName, setProductName] = useState('')
    const [shortDescription, setShortDescription] = useState('')
    const [detailedDescription, setDetailedDescription] = useState('')
    const [originalPrice, setOriginalPrice] = useState('')
    const [sellingPrice, setSellingPrice] = useState('')
    const [discountPercentage, setDiscountPercentage] = useState('')
    const [category, setCategory] = useState('')
    const [categories, setCategories] = useState([])   // mảng danh mục
    const [brand, setBrand] = useState('')
    const [tags, setTags] = useState([])
    const [tagInput, setTagInput] = useState('')
    const [stock, setStock] = useState('')
    const [sku, setSku] = useState('')
    const [status, setStatus] = useState('Còn hàng')
    const [collection, setCollection] = useState("")
    const [collections, setCollections] = useState([]) // load từ API hoặc dữ liệu có sẵn
    const [isloading, setIsLoading] = useState(false)
    // State để lưu trữ File object của hình ảnh, không phải URL
    const [mainImageFile, setMainImageFile] = useState(null)
    // State để hiển thị preview hình ảnh
    const [mainImagePreview, setMainImagePreview] = useState(null)
    const [subImageFiles, setSubImageFiles] = useState([]) // KHÔNG để [null]
    const [variations, setVariations] = useState([])
    useEffect(() => {
        const fetchCollections = async () => {
            try {
                const res = await api.get("/collection")
                setCollections(res.data) // gán mảng collections
            }
            catch (error) {
                toast.error("Lỗi khi load collections:", error)
            }
        }
        fetchCollections()
    }, [])
    // Cập nhật URL preview khi File thay đổi
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await api.get("/categories") // đổi endpoint đúng backend bạn
                setCategories(res.data) // gán mảng categories
            } catch (error) {
                console.error("Lỗi khi load categories:", error)
            }
        }
        fetchCategories()
    }, [])

    useEffect(() => {
        if (mainImageFile instanceof File) {
            const objectUrl = URL.createObjectURL(mainImageFile)
            setMainImagePreview(objectUrl)
            // cleanup tránh memory leak
            return () => URL.revokeObjectURL(objectUrl)
        } else if (typeof mainImageFile === "string") {
            setMainImagePreview(mainImageFile) // link từ server
        } else {
            setMainImagePreview(null)
        }
    }, [mainImageFile])


    // Hàm xóa ảnh chính
    const handleRemoveMainImage = () => {
        setMainImageFile(null)
    }

    // Hàm tải ảnh chính
    const handleFileChange = async (event, index = null) => {
        const file = event.target.files[0]
        if (!file) return

        const formDataUpload = new FormData()
        formDataUpload.append("file", file)

        try {
            const res = await api.post("/upload", formDataUpload, {
                headers: { "Content-Type": "multipart/form-data" },
            })

            if (res.status === 201 || res.status === 200) {
                const url = res.data.url // URL server trả về

                if (index === null) {
                    // ảnh chính
                    setMainImageFile(url)
                } else {
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

    const handleSubImagesUpload = async (e) => {
        const files = e.target.files
        if (!files || files.length === 0) return

        try {
            const uploadedUrls = []

            for (let i = 0; i < files.length; i++) {
                const formData = new FormData()
                formData.append("file", files[i])

                const res = await api.post("/upload", formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                })
                uploadedUrls.push(res.data.url)
                toast.success("Upload ảnh thành công!")
            }

            setSubImageFiles((prev) => [...prev, ...uploadedUrls])
        } catch (err) {
            console.error("Lỗi tải ảnh phụ:", err)
        }
    }

    // Xóa ảnh phụ
    const handleRemoveSubImage = (index) => {
        setSubImageFiles((prev) => prev.filter((_, i) => i !== index))
    }

    // Thêm tags
    const handleAddTag = () => {
        if (tagInput.trim() !== '') {
            setTags([...tags, tagInput.trim()])
            setTagInput('')
        }
    }

    // Xóa tag
    const handleRemoveTag = (tagToRemove) => {
        setTags(tags.filter(tag => tag !== tagToRemove))
    }

    const handldeSubmitProduct = async () => {
        try {
            if (!productName.trim()) {
                toast.error("Vui lòng nhập tên sản phẩm!")
                return
            }
            if (!shortDescription.trim()) {
                toast.error("Vui lòng nhập mô tả ngắn gọn!")
                return
            }
            if (!detailedDescription.trim()) {
                toast.error("Vui lòng nhập mô tả chi tiết!")
                return
            }
            if (!originalPrice || Number(originalPrice) <= 0) {
                toast.error("Giá gốc phải lớn hơn 0!")
                return
            }
            if (!sellingPrice || Number(sellingPrice) <= 0) {
                toast.error("Giá bán phải lớn hơn 0!")
                return
            }
            if (!category) {
                toast.error("Vui lòng chọn danh mục!")
                return
            }
            if (!brand.trim()) {
                toast.error("Vui lòng nhập thương hiệu!")
                return
            }
            if (!stock || Number(stock) < 0) {
                toast.error("Số lượng tồn kho không hợp lệ!")
                return
            }
            if (!sku.trim()) {
                toast.error("Vui lòng nhập mã SKU!")
                return
            }
            if (!mainImageFile) {
                toast.error("Vui lòng tải lên hình ảnh chính!")
                return
            }

            const productData = {
                sku,
                name: productName,
                shortDescription,
                detailedDescription,
                originalPrice: Number(originalPrice),
                sellingPrice: Number(sellingPrice),
                discount: Number(discountPercentage),
                category: category, // 1 id duy nhất
                collection,
                brand,    // id từ backend (chọn trong select brand)
                tags,
                stock: Number(stock),
                 soldCount: 0,
                status,
                mainImage: mainImageFile, // link ảnh chính
                subImages: subImageFiles.filter(img => img),
                variations,
                origin: "Việt Nam", // tạm thời hardcode
            }
            if (variations.length > 0) {
                const totalStock = variations.reduce((sum, v) => sum + (Number(v.stock) || 0), 0)
                if (totalStock <= 0) {
                    toast.error("Tổng tồn kho của các biến thể phải lớn hơn 0!")
                    return
                }
                productData.stock = totalStock
                productData.variations = variations
            } else {
                toast.error("Vui lòng nhập biến thể sản phẩm!")
                return

            }

            const response = await api.post('/products', productData)

            if (response.status !== 201) {
                toast.error(error?.response?.data?.message || "Lỗi khi thêm sản phẩm!")
            }
            toast.success("Thêm sản phẩm thành công!")
            await fetchProducts() // gọi hàm fetchProducts để load lại danh sách sản phẩm
            setActiveTab('products')
        } catch (error) {
            console.error(error)
            toast.error(error?.response?.data?.message || "Lỗi khi thêm sản phẩm!")
        }
    }

    return (
        <div className="flex flex-col lg:flex-row lg:space-x-8 h-full">
            {/* Main content - Left side with scroll on desktop, full on mobile */}
            <div className="flex-1 lg:overflow-y-auto lg:pr-4 space-y-8 pb-8 scrollbar-hidden">
                {/* Product Info Section */}
                <div className="bg-white p-8 rounded-2xl shadow-xl space-y-6">
                    <h3 className="text-xl font-bold text-gray-800">Thông tin cơ bản</h3>
                    <label className="block space-y-2">
                        <span className="text-gray-600">Tên sản phẩm</span>
                        <input type="text" placeholder="Nhập tên sản phẩm" value={productName} onChange={(e) => setProductName(e.target.value)} className="w-full px-4 py-3 border border-pink-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-200" />
                    </label>
                    <label className="block space-y-2">
                        <span className="text-gray-600">Mô tả ngắn gọn về sản phẩm</span>
                        <input type="text" placeholder="Mô tả ngắn gọn" value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} className="w-full px-4 py-3 border border-pink-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-200" />
                    </label>
                    <label className="block space-y-2">
                        <span className="text-gray-600">Mô tả chi tiết</span>
                        <textarea placeholder="Mô tả chi tiết sản phẩm, chất liệu, cách sử dụng..." rows="5" value={detailedDescription} onChange={(e) => setDetailedDescription(e.target.value)} className="w-full px-4 py-3 border border-pink-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-200 resize-none"></textarea>
                    </label>
                </div>

                {/* Price & Finance Section */}
                <div className="bg-white p-8 rounded-2xl shadow-xl space-y-6">
                    <h3 className="text-xl font-bold text-gray-800">Giá cả và tài chính</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <label className="block space-y-2">
                            <span className="text-gray-600">Giá gốc</span>
                            <input type="number" placeholder="₫" value={originalPrice} onChange={(e) => setOriginalPrice(e.target.value)} className="w-full px-4 py-3 border border-pink-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-200" />
                        </label>
                        <label className="block space-y-2">
                            <span className="text-gray-600">Giá bán</span>
                            <input type="number" placeholder="₫" value={sellingPrice} onChange={(e) => setSellingPrice(e.target.value)} className="w-full px-4 py-3 border border-pink-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-200" />
                        </label>
                        <label className="block space-y-2">
                            <span className="text-gray-600">Phần trăm giảm giá</span>
                            <input type="number" placeholder="%" value={discountPercentage} onChange={(e) => setDiscountPercentage(e.target.value)} className="w-full px-4 py-3 border border-pink-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-200" />
                        </label>
                    </div>
                </div>

                {/* Product Type Section */}
                <div className="bg-white p-8 rounded-2xl shadow-xl space-y-6">
                    <h3 className="text-xl font-bold text-gray-800">Phân loại sản phẩm</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Danh mục */}
                        <label className="block space-y-2">
                            <span className="text-gray-600">Danh mục</span>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full px-4 py-3 border border-pink-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-200"
                            >
                                <option value="">Chọn danh mục</option>
                                {categories?.map((item) => (
                                    <option key={item._id} value={item._id}>
                                        {item.name}
                                    </option>
                                ))}
                            </select>
                        </label>

                        {/* Thương hiệu */}
                        <label className="block space-y-2">
                            <span className="text-gray-600">Thương hiệu</span>
                            <input
                                type="text"
                                placeholder="Nhập thương hiệu"
                                value={brand}
                                onChange={(e) => setBrand(e.target.value)}
                                className="w-full px-4 py-3 border border-pink-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-200"
                            />
                        </label>

                        {/* Bộ sưu tập */}
                        <label className="block space-y-2">
                            <span className="text-gray-600">Bộ sưu tập</span>
                            <select
                                value={collection}
                                onChange={(e) => setCollection(e.target.value)}
                                className="w-full px-4 py-3 border border-pink-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-200"
                            >
                                <option value="">Chọn bộ sưu tập</option>
                                {collections.map((item) => (
                                    <option key={item._id} value={item._id}>
                                        {item.name}
                                    </option>
                                ))}
                            </select>
                        </label>
                    </div>

                    {/* Tags */}
                    <label className="block space-y-2">
                        <span className="text-gray-600">Tags</span>
                        <div className="flex flex-wrap gap-2 mb-2">
                            {tags.map((tag, index) => (
                                <span
                                    key={index}
                                    className="flex items-center space-x-1 px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-sm"
                                >
                                    <span>{tag}</span>
                                    <button
                                        onClick={() => handleRemoveTag(tag)}
                                        className="text-pink-500 hover:text-pink-800"
                                        aria-label={`Xóa tag ${tag}`}
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-3 w-3"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </span>
                            ))}
                        </div>
                        <div className="flex items-center space-x-2">
                            <input
                                type="text"
                                placeholder="Thêm tag mới"
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault()
                                        handleAddTag()
                                    }
                                }}
                                className="w-full px-4 py-3 border border-pink-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-200"
                            />
                            <button
                                onClick={handleAddTag}
                                className="p-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-6 w-6"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                            </button>
                        </div>
                    </label>
                </div>


                {/* Product Attributes Section */}
                <ProductVariations setStock={setStock} variations={variations} setVariations={setVariations} />


                {/* Stock Management Section */}
                <div className="bg-white p-8 rounded-2xl shadow-xl space-y-6">
                    <h3 className="text-xl font-bold text-gray-800">Quản lý kho hàng</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <label className="block space-y-2">
                            <span className="text-gray-600">Số lượng tồn kho</span>
                            <input type="number" placeholder="0" value={stock} onChange={(e) => setStock(e.target.value)} className="w-full px-4 py-3 border border-pink-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-200" />
                        </label>
                        <label className="block space-y-2">
                            <span className="text-gray-600">Mã (SKU) sản phẩm</span>
                            <input type="text" placeholder="PF001" value={sku} onChange={(e) => setSku(e.target.value)} className="w-full px-4 py-3 border border-pink-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-200" />
                        </label>
                    </div>
                    <div className="space-y-2">
                        <span className="text-gray-600">Trạng thái</span>
                        <div className="flex items-center space-x-6">
                            <label className="inline-flex items-center space-x-2">
                                <input type="radio" name="status" value="Còn hàng" checked={status === 'Còn hàng'} onChange={(e) => setStatus(e.target.value)} className="text-pink-600 focus:ring-pink-500" />
                                <span>Còn hàng</span>
                            </label>
                            <label className="inline-flex items-center space-x-2">
                                <input type="radio" name="status" value="Hết hàng" checked={status === 'Hết hàng'} onChange={(e) => setStatus(e.target.value)} className="text-pink-600 focus:ring-pink-500" />
                                <span>Hết hàng</span>
                            </label>
                            <label className="inline-flex items-center space-x-2">
                                <input type="radio" name="status" value="Ngừng bán" checked={status === 'Ngừng bán'} onChange={(e) => setStatus(e.target.value)} className="text-pink-600 focus:ring-pink-500" />
                                <span>Ngừng bán</span>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Image Section */}
                <div className="bg-white p-8 rounded-2xl shadow-xl space-y-6">
                    <h3 className="text-xl font-bold text-gray-800">Hình ảnh sản phẩm</h3>
                    <h4 className="text-lg font-semibold text-gray-700">Hình ảnh chính</h4>
                    <div className="border border-dashed border-pink-400 p-8 rounded-lg flex flex-col items-center justify-center text-center space-y-4 relative">
                        {mainImagePreview ? (
                            <>
                                <img src={mainImagePreview} alt="Main Preview" className="w-48 h-48 object-cover rounded-lg" />
                                <button
                                    onClick={handleRemoveMainImage}
                                    className="absolute top-2 right-2 p-1 bg-white rounded-full text-gray-600 hover:bg-gray-200 transition-colors"
                                    aria-label="Xóa ảnh chính"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                                <label className="cursor-pointer text-pink-600 hover:underline">
                                    Thay đổi ảnh
                                    <input type="file" onChange={handleFileChange} className="hidden" accept="image/*" />
                                </label>
                            </>
                        ) : (
                            <>
                                <svg className="w-12 h-12 text-pink-600" fill="currentColor" viewBox="0 0 24 24"><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4c-3.72 0-6.85 2.59-7.46 6.04-.32 1.94.49 3.82 1.83 5.06L7 16h10.42c1.78-.11 3.25-1.4 3.5-3.17.2-1.46-.23-2.91-1.57-3.79zM15 13l-3-3-3 3h2v4h2v-4h2z"></path></svg>
                                <p className="text-gray-600">Kéo thả hình ảnh vào đây hoặc</p>
                                <label className="px-6 py-3 bg-pink-600 text-white rounded-lg font-semibold cursor-pointer hover:bg-pink-700 transition-colors">
                                    Chọn file
                                    <input type="file" onChange={handleFileChange} className="hidden" accept="image/*" />
                                </label>
                            </>
                        )}
                        <p className="text-sm text-gray-500">PNG, JPG, JPEG tối đa 5MB</p>
                    </div>

                    <h4 className="text-lg font-semibold text-gray-700 mt-8">Hình ảnh phụ</h4>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {subImageFiles.map((image, index) => (
                            <div
                                key={index}
                                className="relative border border-dashed border-gray-300 p-4 rounded-lg flex flex-col items-center justify-center space-y-2 h-32"
                            >
                                <img
                                    src={image}
                                    alt={`Sub image ${index + 1}`}
                                    className="w-full h-full object-cover rounded-lg"
                                />
                                <button
                                    onClick={() => handleRemoveSubImage(index)}
                                    className="absolute top-2 right-2 p-1 bg-white rounded-full text-gray-600 hover:bg-gray-200 transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none"
                                        viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                            d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        ))}

                        {/* Ô upload ảnh luôn hiển thị nếu chưa đạt 5 ảnh */}
                        {subImageFiles.length < 5 && (
                            <label className="border border-dashed border-gray-300 p-4 rounded-lg flex flex-col items-center justify-center space-y-2 h-32 cursor-pointer">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none"
                                    viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M12 4v16m8-8H4" />
                                </svg>
                                <span className="text-sm text-gray-500">Thêm ảnh</span>
                                <input type="file" onChange={handleSubImagesUpload} className="hidden" />
                            </label>
                        )}
                    </div>


                </div>

                {/* Action Buttons */}
                <div className="flex flex-col md:flex-row justify-start space-y-4 md:space-y-0 md:space-x-4 mt-8">
                    <button onClick={handldeSubmitProduct} className="px-6 py-3 bg-pink-600 text-white rounded-xl font-semibold hover:bg-pink-700 transition-colors">
                        <span className="flex items-center space-x-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M5 2a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V4a2 2 0 00-2-2H5zM10 5a1 1 0 00-1 1v3H6a1 1 0 100 2h3v3a1 1 0 102 0v-3h3a1 1 0 100-2h-3V6a1 1 0 00-1-1z" /></svg>
                            <span>Lưu sản phẩm</span>
                        </span>
                    </button>
                    <button className="px-6 py-3 bg-white text-gray-600 rounded-xl font-semibold border border-gray-300 hover:bg-gray-100 transition-colors">
                        Hủy
                    </button>
                </div>
            </div>

            {/* Preview Section - Right side, fixed on desktop */}
            <div className="w-full lg:w-96 flex-shrink-0 space-y-6 lg:mt-0">
                <div className="bg-white p-8 rounded-2xl shadow-xl space-y-4 sticky ">
                    <h3 className="text-xl font-bold text-gray-800">Xem trước sản phẩm</h3>
                    <div className="w-full h-64 bg-gray-200 rounded-xl flex items-center justify-center">
                        {mainImagePreview ? (
                            <>
                                <img src={mainImagePreview} alt="Main Preview" className="w-48 h-48 object-cover rounded-lg" />
                            </>
                        ) : (
                            <span className="text-gray-400">Hình ảnh sản phẩm</span>
                        )}
                    </div>
                    <div className="space-y-1">
                        <p className="font-semibold text-gray-800">{productName || 'Tên sản phẩm'}</p>
                        <p className="text-sm text-gray-500">{shortDescription || 'Mô tả ngắn gọn sẽ hiển thị ở đây'}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <p className="text-lg font-bold text-pink-600">{sellingPrice ? `${sellingPrice}₫` : '0₫'}</p>
                        <p className="text-sm text-gray-400 line-through">{originalPrice ? `${originalPrice}₫` : '0₫'}</p>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>Tồn kho: </span>
                        <span>{stock || 0}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>SKU: </span>
                        <span>{sku || '-'}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>Trạng thái: </span>
                        <span className={status === 'Còn hàng' ? 'text-green-600' : 'text-red-600'}>{status}</span>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-2xl shadow-xl space-y-4 mt-8">
                    <h3 className="text-xl font-bold text-gray-800">Hướng dẫn</h3>
                    <ul className="text-sm text-gray-600 space-y-2">
                        <li className="flex items-start space-x-2">
                            <span className="text-pink-600 font-bold">&#x2022;</span>
                            <span>Điền đầy đủ thông tin cơ bản của sản phẩm.</span>
                        </li>
                        <li className="flex items-start space-x-2">
                            <span className="text-pink-600 font-bold">&#x2022;</span>
                            <span>Thiết lập giá bán và giá gốc hợp lý.</span>
                        </li>
                        <li className="flex items-start space-x-2">
                            <span className="text-pink-600 font-bold">&#x2022;</span>
                            <span>Chọn danh mục và thêm tags phù hợp.</span>
                        </li>
                        <li className="flex items-start space-x-2">
                            <span className="text-pink-600 font-bold">&#x2022;</span>
                            <span>Cung cấp hình ảnh chất lượng cao.</span>
                        </li>
                        <li className="flex items-start space-x-2">
                            <span className="text-pink-600 font-bold">&#x2022;</span>
                            <span>Kiểm tra lại thông tin trước khi lưu.</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    )
}

export default AddProduct
