import React, { useEffect, useState } from 'react'
import ProductVariations from './ProductVariations'
import { toast } from 'react-toastify'
import apiAdmin from 'service/apiAdmin'
import { AdminInput, AdminSelect, AdminTextarea, AdminButton, AdminCard } from 'components/admin/ui'

const EditProduct = ({ productId, onBack, fetchProducts }) => {
    const [productName, setProductName] = useState('')
    const [shortDesc, setShortDesc] = useState('')
    const [detailedDesc, setDetailedDesc] = useState('')
    const [originalPrice, setOriginalPrice] = useState('')
    const [sellingPrice, setSellingPrice] = useState('')
    const [discount, setDiscount] = useState('')
    const [category, setCategory] = useState('')
    const [categories, setCategories] = useState([])
    const [origin, setOrigin] = useState('')
    const [tags, setTags] = useState([])
    const [tagInput, setTagInput] = useState('')
    const [stock, setStock] = useState('')
    const [sku, setSku] = useState('')
    const [status, setStatus] = useState('Còn hàng')
    const [mainImageFile, setMainImageFile] = useState(null)
    const [mainImagePreview, setMainImagePreview] = useState(null)
    const [subImageFiles, setSubImageFiles] = useState([])
    const [variations, setVariations] = useState([])
    const [collection, setCollection] = useState('')
    const [collections, setCollections] = useState([])
    const getTotalStock = () => {
        if (!variations || variations.length === 0) return stock || 0
        return variations.reduce((sum, v) => sum + (Number(v.stock) || 0), 0)
    }

    useEffect(() => {
        const getProductById = async (productId) => {
            try {
                const res = await apiAdmin.get(`/products/${productId}`)
                const data = res.data
                setCollection(data.collection?._id || data.collection || '')
                setProductName(data.name)
                setShortDesc(data.shortDescription)
                setDetailedDesc(data.detailedDescription)
                setOriginalPrice(data.originalPrice)
                setSellingPrice(data.sellingPrice)
                setDiscount(data.discount)
                setCategory(data.category?._id || data.category)
                setOrigin(data.origin)
                setStock(data.stock)
                setSku(data.sku)
                setStatus(data.status)
                setMainImageFile(data.mainImage)
                setMainImagePreview(data.mainImage)
                setSubImageFiles(data.subImages)
                setTags(data.tags || [])
                setVariations(data.variations || [])
            } catch (err) {
                console.error('Error fetching product:', err)
            }
        }

        if (productId) getProductById(productId)
    }, [productId])


    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await apiAdmin.get("/categories")
                setCategories(res.data.data||[])
                const collRes = await apiAdmin.get("/collection")
                setCollections(collRes.data.data||[])
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
    const handleRemoveSubImage = (index) => {
        const newSubImages = [...subImageFiles]
        newSubImages.splice(index, 1)
        setSubImageFiles(newSubImages)
    }

    // Hàm tải ảnh chính
    const handleFileChange = async (event, index = null) => {
        const file = event.target.files[0]
        if (!file) return
        const formDataUpload = new FormData()
        formDataUpload.append("file", file)

        try {
            const res = await apiAdmin.post("/upload", formDataUpload, {
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

                const res = await apiAdmin.post("/upload", formData, {
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
    
            const productData = {
                sku,
                name: productName,
                shortDescription: shortDesc,
                detailedDescription: detailedDesc,
                originalPrice: Number(originalPrice),
                sellingPrice: Number(sellingPrice),
                discount: Number(discount),
                category: category,
                collection: collection || null,
                origin,
                tags,
                stock: Number(stock),
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
                if (!stock || Number(stock) <= 0) {
                    toast.error("Vui lòng nhập tồn kho sản phẩm hoặc thêm biến thể!")
                    return
                }
                productData.stock = Number(stock)
            }

            const response = await apiAdmin.put(`/products/${productId}`, productData)

            if (response.status !== 201) {
                toast.success("Sửa sản phẩm thành công!")
                await fetchProducts()
                onBack()
            }

        } catch (error) {

            toast.error(error?.response?.data?.message || "Lỗi khi sửa sản phẩm!")
        }
    }

    const formatCurrency = (number) => {
        if (number === '' || number === null || number === undefined) return ''
        const num = Number(number)
        if (isNaN(num)) return ''
        return num.toLocaleString('en-US')
    }
    const parseCurrency = (string) => {
        if (string === '' || string === null || string === undefined) return ''
        const cleanString = String(string).replace(/[^0-9]/g, '')
        const num = Number(cleanString)
        return isNaN(num) ? '' : num
    }


    return (
        <div className="flex flex-col lg:flex-row lg:space-x-8 h-full p-6 lg:p-8 bg-slate-50 dark:bg-slate-950 min-h-screen text-slate-800 dark:text-slate-100">
            {/* Main content - Left side with scroll on desktop, full on mobile */}
            <div className="flex-1 lg:overflow-y-auto lg:pr-4 space-y-8 pb-8 scrollbar-hidden">
                <AdminCard title="Thông tin cơ bản" className="space-y-6">
                    <AdminInput
                        label="Tên sản phẩm"
                        type="text"
                        value={productName}
                        onChange={(e) => setProductName(e.target.value)}
                        placeholder="Nhập tên sản phẩm"
                    />
                    <AdminInput
                        label="Mô tả ngắn gọn về sản phẩm"
                        type="text"
                        value={shortDesc}
                        onChange={(e) => setShortDesc(e.target.value)}
                        placeholder="Mô tả ngắn gọn"
                    />
                    <AdminTextarea
                        label="Mô tả chi tiết"
                        value={detailedDesc}
                        onChange={(e) => setDetailedDesc(e.target.value)}
                        placeholder="Mô tả chi tiết sản phẩm, chất liệu, cách sử dụng..."
                        rows={5}
                    />
                </AdminCard>

                {/* Price & Finance Section */}
                <AdminCard title="Giá cả và tài chính" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <AdminInput
                            label="Giá gốc"
                            type="text"
                            value={formatCurrency(originalPrice)}
                            onChange={(e) => setOriginalPrice(parseCurrency(e.target.value))}
                            placeholder="₫"
                        />
                        <AdminInput
                            label="Giá bán"
                            type="text"
                            value={formatCurrency(sellingPrice)}
                            onChange={(e) => setSellingPrice(parseCurrency(e.target.value))}
                            placeholder="₫"
                        />
                        <AdminInput
                            label="Phần trăm giảm giá"
                            type="number"
                            value={discount}
                            onChange={(e) => setDiscount(e.target.value)}
                            placeholder="%"
                        />
                    </div>
                </AdminCard>

                {/* Product Type Section */}
                <AdminCard title="Phân loại sản phẩm" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <AdminSelect
                            label="Danh mục"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                        >
                            <option value="">Chọn danh mục</option>
                            {categories.map((item) => (
                                <option key={item._id} value={item._id}>
                                    {item.name}
                                </option>
                            ))}
                        </AdminSelect>
                        <AdminSelect
                            label="Bộ sưu tập (Collection)"
                            value={collection}
                            onChange={(e) => setCollection(e.target.value)}
                        >
                            <option value="">Không</option>
                            {collections.map((item) => (
                                <option key={item._id} value={item._id}>
                                    {item.name}
                                </option>
                            ))}
                        </AdminSelect>
                        <AdminInput
                            label="Xuất xứ"
                            type="text"
                            value={origin}
                            onChange={(e) => setOrigin(e.target.value)}
                            placeholder="Nhập Xuất xứ"
                        />
                    </div>
                    {/* Tags */}
                    <div>
                        <span className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Tags</span>
                        <div className="flex flex-wrap gap-2 mb-3">
                            {tags.map((tag, index) => (
                                <span key={index} className="flex items-center space-x-1 px-3 py-1 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-650 dark:text-indigo-405 rounded-full text-sm border border-indigo-100 dark:border-indigo-900/30">
                                    <span>{tag}</span>
                                    <button onClick={() => handleRemoveTag(tag)} className="text-indigo-500 hover:text-indigo-700" aria-label={`Xóa tag ${tag}`}>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
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
                                className="w-full px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                            />
                            <button onClick={handleAddTag} className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-sm">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                            </button>
                        </div>
                    </div>
                </AdminCard>

                {/* Product Attributes Section */}
                <ProductVariations setStock={setStock} variations={variations} setVariations={setVariations} />


                {/* Stock Management Section */}
                <AdminCard title="Quản lý kho hàng" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <AdminInput
                            label="Số lượng tồn kho"
                            type="number"
                            value={stock}
                            onChange={(e) => setStock(e.target.value)}
                            placeholder="0"
                        />
                        <AdminInput
                            label="Mã (SKU) sản phẩm"
                            type="text"
                            value={sku}
                            onChange={(e) => setSku(e.target.value)}
                            placeholder="PF001"
                        />
                    </div>
                    <div className="space-y-2">
                        <span className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Trạng thái</span>
                        <div className="flex items-center space-x-6">
                            <label className="inline-flex items-center space-x-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
                                <input type="radio" name="status" value="Còn hàng" checked={status === 'Còn hàng'} onChange={(e) => setStatus(e.target.value)} className="text-indigo-600 focus:ring-indigo-500 bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700" />
                                <span>Còn hàng</span>
                            </label>
                            <label className="inline-flex items-center space-x-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
                                <input type="radio" name="status" value="Hết hàng" checked={status === 'Hết hàng'} onChange={(e) => setStatus(e.target.value)} className="text-indigo-600 focus:ring-indigo-500 bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700" />
                                <span>Hết hàng</span>
                            </label>
                            <label className="inline-flex items-center space-x-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
                                <input type="radio" name="status" value="Ngừng bán" checked={status === 'Ngừng bán'} onChange={(e) => setStatus(e.target.value)} className="text-indigo-600 focus:ring-indigo-500 bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700" />
                                <span>Ngừng bán</span>
                            </label>
                        </div>
                    </div>
                </AdminCard>

                {/* Image Section */}
                <AdminCard title="Hình ảnh sản phẩm" className="space-y-6">
                    <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Hình ảnh chính</h4>
                    <div className="border border-dashed border-slate-300 dark:border-slate-700 p-8 rounded-2xl flex flex-col items-center justify-center text-center space-y-4 relative bg-slate-50/50 dark:bg-slate-900/50">
                        {mainImagePreview ? (
                            <>
                                <img src={mainImagePreview} alt="Main Preview" className="w-48 h-48 object-cover rounded-xl shadow-md" />
                                <button
                                    onClick={handleRemoveMainImage}
                                    className="absolute top-4 right-4 p-1.5 bg-white dark:bg-slate-800 rounded-full text-slate-500 hover:text-slate-750 dark:hover:text-slate-300 shadow-md transition-colors"
                                    aria-label="Xóa ảnh chính"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                                <label className="cursor-pointer text-indigo-600 dark:text-indigo-400 hover:underline text-sm font-semibold">
                                    Thay đổi ảnh
                                    <input type="file" onChange={handleFileChange} className="hidden" accept="image/*" />
                                </label>
                            </>
                        ) : (
                            <>
                                <svg className="w-12 h-12 text-slate-400 dark:text-slate-600" fill="currentColor" viewBox="0 0 24 24"><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4c-3.72 0-6.85 2.59-7.46 6.04-.32 1.94.49 3.82 1.83 5.06L7 16h10.42c1.78-.11 3.25-1.4 3.5-3.17.2-1.46-.23-2.91-1.57-3.79zM15 13l-3-3-3 3h2v4h2v-4h2z"></path></svg>
                                <p className="text-sm text-slate-500">Kéo thả hình ảnh vào đây hoặc</p>
                                <label className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold cursor-pointer hover:bg-indigo-700 transition-colors text-xs shadow-sm">
                                    Chọn file
                                    <input type="file" onChange={handleFileChange} className="hidden" accept="image/*" />
                                </label>
                            </>
                        )}
                        <p className="text-xs text-slate-400">PNG, JPG, JPEG tối đa 5MB</p>
                    </div>

                    <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mt-8">Hình ảnh phụ <span className="text-slate-400 text-xs">(tối đa 5 ảnh)</span></h4>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {subImageFiles.map((image, index) => (
                            <div
                                key={index}
                                className="relative border border-slate-200 dark:border-slate-800 p-2 rounded-2xl flex flex-col items-center justify-center space-y-2 h-32 bg-slate-50/50 dark:bg-slate-900/50 overflow-hidden group"
                            >
                                <img
                                    src={image}
                                    alt={`Sub image ${index + 1}`}
                                    className="w-full h-full object-cover rounded-xl"
                                />
                                <button
                                    onClick={() => handleRemoveSubImage(index)}
                                    className="absolute top-2.5 right-2.5 p-1 bg-white dark:bg-slate-800 rounded-full text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
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
                            <label className="border border-dashed border-slate-300 dark:border-slate-700 p-4 rounded-2xl flex flex-col items-center justify-center space-y-1.5 h-32 cursor-pointer bg-slate-50/30 dark:bg-slate-900/30 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-400 dark:text-slate-600" fill="none"
                                    viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M12 4v16m8-8H4" />
                                </svg>
                                <span className="text-xs font-semibold text-slate-500">Thêm ảnh</span>
                                <input type="file" onChange={handleSubImagesUpload} className="hidden" />
                            </label>
                        )}
                    </div>
                </AdminCard>

                {/* Action Buttons */}
                <div className="flex flex-col md:flex-row justify-start gap-4 mt-8">
                    <AdminButton onClick={handldeSubmitProduct} variant="primary" size="md">
                        <span className="flex items-center space-x-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M5 2a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V4a2 2 0 00-2-2H5zM10 5a1 1 0 00-1 1v3H6a1 1 0 100 2h3v3a1 1 0 102 0v-3h3a1 1 0 100-2h-3V6a1 1 0 00-1-1z" /></svg>
                            <span>Cập nhật sản phẩm</span>
                        </span>
                    </AdminButton>
                    <AdminButton onClick={onBack} variant="ghost" size="md">
                        Hủy
                    </AdminButton>
                </div>
            </div>

            {/* Preview Section - Right side, fixed on desktop */}
            <div className="w-full lg:w-96 flex-shrink-0 space-y-6 mt-8 lg:mt-0">
                <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                    <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">Xem trước sản phẩm</h3>
                    <div className="w-full h-64 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center border border-slate-200/60 dark:border-slate-700/60 relative">
                        {mainImagePreview ? (
                            <>
                                <img src={mainImagePreview} alt="Main Preview" className="w-full h-full object-cover rounded-xl" />
                            </>
                        ) : (
                            <span className="text-sm text-slate-400">Hình ảnh sản phẩm</span>
                        )}
                    </div>
                    <div className="space-y-1">
                        <p className="font-bold text-slate-800 dark:text-slate-200">{productName || 'Tên sản phẩm'}</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 line-clamp-2">{shortDesc || 'Mô tả ngắn'}</p>
                    </div>
                    <div className="flex items-center space-x-2 pt-2 border-t border-slate-100 dark:border-slate-850">
                        <p className="text-base font-extrabold text-indigo-600 dark:text-indigo-400">{formatCurrency(sellingPrice)}₫</p>
                        <p className="text-xs text-slate-400 line-through">{formatCurrency(originalPrice)}₫</p>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500 pt-2">
                        <span>Tồn kho: </span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{getTotalStock()}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>SKU: </span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{sku || '-'}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>Trạng thái: </span>
                        <span className={`font-bold ${status === 'Còn hàng' ? 'text-green-600 dark:text-green-400' : 'text-red-650 dark:text-red-400'}`}>
                            {status}
                        </span>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                    <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">Hướng dẫn</h3>
                    <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-2.5">
                        <li className="flex items-start space-x-2">
                            <span className="text-indigo-600 font-bold">&#x2022;</span>
                            <span>Điền đầy đủ thông tin cơ bản của sản phẩm.</span>
                        </li>
                        <li className="flex items-start space-x-2">
                            <span className="text-indigo-600 font-bold">&#x2022;</span>
                            <span>Thiết lập giá bán và giá gốc hợp lý.</span>
                        </li>
                        <li className="flex items-start space-x-2">
                            <span className="text-indigo-600 font-bold">&#x2022;</span>
                            <span>Chọn danh mục và thêm tags phù hợp.</span>
                        </li>
                        <li className="flex items-start space-x-2">
                            <span className="text-indigo-600 font-bold">&#x2022;</span>
                            <span>Cung cấp hình ảnh chất lượng cao.</span>
                        </li>
                        <li className="flex items-start space-x-2">
                            <span className="text-indigo-600 font-bold">&#x2022;</span>
                            <span>Kiểm tra lại thông tin trước khi lưu.</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    )
}

export default EditProduct