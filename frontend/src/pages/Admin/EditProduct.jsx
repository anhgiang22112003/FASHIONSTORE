import React, { useState } from 'react'
import ProductVariations from './ProductVariations'

// Dữ liệu sản phẩm giả lập, sẽ được tải từ API trong thực tế
const productData = {
    name: 'Váy xòe hoa nhí',
    shortDescription: 'Váy dáng xòe với họa tiết hoa nhí, chất liệu mềm mại',
    detailedDescription: 'Sản phẩm được làm từ vải voan cao cấp, có lót trong, phù hợp đi chơi, dạo phố. Thiết kế cổ V, tay bồng nhẹ nhàng và nữ tính.',
    originalPrice: 750000,
    sellingPrice: 590000,
    discount: 20,
    category: 'Váy & Đầm',
    brand: 'PinkFashion',
    tags: ['váy', 'váy hoa', 'váy nữ'],
    sizes: ['S', 'M', 'L'],
    colors: ['Hồng', 'Xanh dương'],
    material: 'Voan cao cấp',
    origin: 'Việt Nam',
    stock: 25,
    sku: 'PF001',
    status: 'Còn hàng',
    mainImage: 'https://via.placeholder.com/600x600.png?text=Váy+hồng+hoa+nhí',
    subImages: [
        'https://via.placeholder.com/200x200.png?text=Ảnh+phụ+1',
        'https://via.placeholder.com/200x200.png?text=Ảnh+phụ+2',
        'https://via.placeholder.com/200x200.png?text=Ảnh+phụ+3',
        null,
        null
    ],
      variations: [
        { color: 'Hồng', size: 'S', stock: 10 },
        { color: 'Hồng', size: 'M', stock: 5 },
        { color: 'Xanh dương', size: 'S', stock: 7 },
        { color: 'Xanh dương', size: 'M', stock: 3 },
    ]

}

const colors = [
    { name: 'Đỏ', hex: 'bg-red-500', ring: 'ring-red-500' },
    { name: 'Hồng', hex: 'bg-pink-500', ring: 'ring-pink-500' },
    { name: 'Xanh dương', hex: 'bg-blue-500', ring: 'ring-blue-500' },
    { name: 'Xanh lá', hex: 'bg-green-500', ring: 'ring-green-500' },
    { name: 'Vàng', hex: 'bg-yellow-500', ring: 'ring-yellow-500' },
    { name: 'Tím', hex: 'bg-purple-500', ring: 'ring-purple-500' },
    { name: 'Đen', hex: 'bg-gray-900', ring: 'ring-gray-900' },
    { name: 'Trắng', hex: 'bg-white', ring: 'ring-gray-300' },
]

const EditProduct = () => {
    const [name, setName] = useState(productData.name)
    const [shortDesc, setShortDesc] = useState(productData.shortDescription)
    const [detailedDesc, setDetailedDesc] = useState(productData.detailedDescription)
    const [originalPrice, setOriginalPrice] = useState(productData.originalPrice)
    const [sellingPrice, setSellingPrice] = useState(productData.sellingPrice)
    const [discount, setDiscount] = useState(productData.discount)
    const [category, setCategory] = useState(productData.category)
    const [brand, setBrand] = useState(productData.brand)
    const [stock, setStock] = useState(productData.stock)
    const [sku, setSku] = useState(productData.sku)
    const [status, setStatus] = useState(productData.status)
    // const [selectedSize, setSelectedSize] = useState(productData.sizes)
    // const [selectedColor, setSelectedColor] = useState(productData.colors)
    const [mainImage, setMainImage] = useState(productData.mainImage)
    const [subImages, setSubImages] = useState(productData.subImages)
  // const [mainImage, setMainImage] = useState(null); // hoặc useState(productData.mainImage)
    const [variations, setVariations] = useState(productData.variations);

    // Hàm xóa ảnh chính
    const handleRemoveMainImage = () => {
        setMainImage(null);
    };

    // Hàm tải ảnh chính
    const handleMainImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setMainImage(URL.createObjectURL(file));
        }
    };

    // Hàm xóa ảnh phụ
    const handleRemoveSubImage = (index) => {
        const newSubImages = [...subImages];
        newSubImages[index] = null;
        setSubImages(newSubImages);
    };

    // Hàm tải ảnh phụ
    const handleSubImageChange = (e, index) => {
        const file = e.target.files[0];
        if (file) {
            const newSubImages = [...subImages];
            newSubImages[index] = URL.createObjectURL(file);
            setSubImages(newSubImages);
        }
    };

    ////////////////
    const handleSizeClick = (size) => {
        setSelectedSize(prev =>
            prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
        )
    }

    const handleColorClick = (colorName) => {
        setSelectedColor(prev =>
            prev.includes(colorName) ? prev.filter(c => c !== colorName) : [...prev, colorName]
        )
    }

    // const handleMainImageChange = (e) => {
    //     const file = e.target.files[0]
    //     if (file) {
    //         setMainImage(URL.createObjectURL(file))
    //     }
    // }

    // const handleSubImageChange = (e, index) => {
    //     const file = e.target.files[0]
    //     if (file) {
    //         const newSubImages = [...subImages]
    //         newSubImages[index] = URL.createObjectURL(file)
    //         setSubImages(newSubImages)
    //     }
    // }

    // ... (Phần JSX tương tự AddProduct.jsx nhưng thay đổi tiêu đề và nút)

    return (
        <div className="flex flex-col lg:flex-row lg:space-x-8 h-full">
            {/* Main content - Left side with scroll on desktop, full on mobile */}
            <div className="flex-1 lg:overflow-y-auto lg:pr-4 space-y-8 pb-8 scrollbar-hidden">
                <div className="bg-white p-8 rounded-2xl shadow-xl space-y-6">
                    <h3 className="text-xl font-bold text-gray-800">Thông tin cơ bản</h3>
                    <label className="block space-y-2">
                        <span className="text-gray-600">Tên sản phẩm</span>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nhập tên sản phẩm" className="w-full px-4 py-3 border border-pink-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-200" />
                    </label>
                    <label className="block space-y-2">
                        <span className="text-gray-600">Mô tả ngắn gọn về sản phẩm</span>
                        <input type="text" value={shortDesc} onChange={(e) => setShortDesc(e.target.value)} placeholder="Mô tả ngắn gọn" className="w-full px-4 py-3 border border-pink-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-200" />
                    </label>
                    <label className="block space-y-2">
                        <span className="text-gray-600">Mô tả chi tiết</span>
                        <textarea value={detailedDesc} onChange={(e) => setDetailedDesc(e.target.value)} placeholder="Mô tả chi tiết sản phẩm, chất liệu, cách sử dụng..." rows="5" className="w-full px-4 py-3 border border-pink-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-200 resize-none"></textarea>
                    </label>
                </div>

                {/* Price & Finance Section */}
                <div className="bg-white p-8 rounded-2xl shadow-xl space-y-6">
                    <h3 className="text-xl font-bold text-gray-800">Giá cả và tài chính</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <label className="block space-y-2">
                            <span className="text-gray-600">Giá gốc</span>
                            <input type="number" value={originalPrice} onChange={(e) => setOriginalPrice(e.target.value)} placeholder="₫" className="w-full px-4 py-3 border border-pink-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-200" />
                        </label>
                        <label className="block space-y-2">
                            <span className="text-gray-600">Giá bán</span>
                            <input type="number" value={sellingPrice} onChange={(e) => setSellingPrice(e.target.value)} placeholder="₫" className="w-full px-4 py-3 border border-pink-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-200" />
                        </label>
                        <label className="block space-y-2">
                            <span className="text-gray-600">Phần trăm giảm giá</span>
                            <input type="number" value={discount} onChange={(e) => setDiscount(e.target.value)} placeholder="%" className="w-full px-4 py-3 border border-pink-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-200" />
                        </label>
                    </div>
                </div>

                {/* Product Type Section */}
                <div className="bg-white p-8 rounded-2xl shadow-xl space-y-6">
                    <h3 className="text-xl font-bold text-gray-800">Phân loại sản phẩm</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <label className="block space-y-2">
                            <span className="text-gray-600">Danh mục</span>
                            <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-4 py-3 border border-pink-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-200">
                                <option>Chọn danh mục</option>
                                <option>Váy & Đầm</option>
                                <option>Áo</option>
                                <option>Quần</option>
                                <option>Phụ kiện</option>
                            </select>
                        </label>
                        <label className="block space-y-2">
                            <span className="text-gray-600">Thương hiệu</span>
                            <input type="text" value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="Nhập thương hiệu" className="w-full px-4 py-3 border border-pink-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-200" />
                        </label>
                    </div>
                    {/* ... (Phần Tags tương tự AddProduct) */}
                </div>

                {/* Product Attributes Section */}
                                <ProductVariations variations={variations} setVariations={setVariations} />


                {/* Stock Management Section */}
                <div className="bg-white p-8 rounded-2xl shadow-xl space-y-6">
                    <h3 className="text-xl font-bold text-gray-800">Quản lý kho hàng</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <label className="block space-y-2">
                            <span className="text-gray-600">Số lượng tồn kho</span>
                            <input type="number" value={stock} onChange={(e) => setStock(e.target.value)} placeholder="0" className="w-full px-4 py-3 border border-pink-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-200" />
                        </label>
                        <label className="block space-y-2">
                            <span className="text-gray-600">Mã (SKU) sản phẩm</span>
                            <input type="text" value={sku} onChange={(e) => setSku(e.target.value)} placeholder="PF001" className="w-full px-4 py-3 border border-pink-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-200" />
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
                        {mainImage ? (
                            <>
                                <img src={mainImage} alt="Main Preview" className="w-48 h-48 object-cover rounded-lg" />
                                <button
                                    onClick={handleRemoveMainImage}
                                    className="absolute top-2 right-2 p-1 bg-white rounded-full text-gray-600 hover:bg-gray-200 transition-colors"
                                    aria-label="Xóa ảnh chính"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                                <label className="cursor-pointer text-pink-600 hover:underline">
                                    Thay đổi ảnh
                                    <input type="file" onChange={handleMainImageChange} className="hidden" accept="image/*" />
                                </label>
                            </>
                        ) : (
                            <>
                                <svg className="w-12 h-12 text-pink-600" fill="currentColor" viewBox="0 0 24 24"><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4c-3.72 0-6.85 2.59-7.46 6.04-.32 1.94.49 3.82 1.83 5.06L7 16h10.42c1.78-.11 3.25-1.4 3.5-3.17.2-1.46-.23-2.91-1.57-3.79zM15 13l-3-3-3 3h2v4h2v-4h2z"></path></svg>
                                <p className="text-gray-600">Kéo thả hình ảnh vào đây hoặc</p>
                                <label className="px-6 py-3 bg-pink-600 text-white rounded-lg font-semibold cursor-pointer hover:bg-pink-700 transition-colors">
                                    Chọn file
                                    <input type="file" onChange={handleMainImageChange} className="hidden" accept="image/*" />
                                </label>
                            </>
                        )}
                        <p className="text-sm text-gray-500">PNG, JPG, JPEG tối đa 5MB</p>
                    </div>

                    <h4 className="text-lg font-semibold text-gray-700 mt-8">Hình ảnh phụ <span className="text-gray-500 text-sm">(tối đa 5 ảnh)</span></h4>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {subImages.map((image, index) => (
                            <div key={index} className="relative border border-dashed border-gray-300 p-4 rounded-lg flex flex-col items-center justify-center space-y-2 h-32">
                                {image ? (
                                    <>
                                        <img src={image} alt={`Sub image ${index + 1}`} className="w-full h-full object-cover rounded-lg" />
                                        <button
                                            onClick={() => {
                                                const newSubImages = [...subImages]
                                                newSubImages[index] = null // Đặt ảnh tại vị trí này về null
                                                setSubImages(newSubImages)
                                            }}
                                            className="absolute top-2 right-2 p-1 bg-white rounded-full text-gray-600 hover:bg-gray-200 transition-colors"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                            <span className="text-sm text-gray-500">Thêm ảnh</span>
                                            <input type="file" onChange={(e) => handleSubImageChange(e, index)} className="hidden" />
                                        </label>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Action Buttons */}
                 <div className="flex flex-col md:flex-row justify-start space-y-4 md:space-y-0 md:space-x-4 mt-8">
                    <button className="px-6 py-3 bg-pink-600 text-white rounded-xl font-semibold hover:bg-pink-700 transition-colors">
                        <span className="flex items-center space-x-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M5 2a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V4a2 2 0 00-2-2H5zM10 5a1 1 0 00-1 1v3H6a1 1 0 100 2h3v3a1 1 0 102 0v-3h3a1 1 0 100-2h-3V6a1 1 0 00-1-1z" /></svg>
                            <span>Cập nhật sản phẩm</span>
                        </span>
                    </button>
                    <button className="px-6 py-3 bg-white text-gray-600 rounded-xl font-semibold border border-gray-300 hover:bg-gray-100 transition-colors">
                        Hủy
                    </button>
                </div>
            </div>

            {/* Preview Section - Right side, fixed on desktop */}
            <div className="w-full lg:w-96 flex-shrink-0 space-y-6 mt-8 lg:mt-0">
                <div className="bg-white p-8 rounded-2xl shadow-xl space-y-4">
                    <h3 className="text-xl font-bold text-gray-800">Xem trước sản phẩm</h3>
                    <div className="w-full h-64 bg-gray-200 rounded-xl flex items-center justify-center">
                        {mainImage ? (
                            <>
                                <img src={mainImage} alt="Main Preview" className="w-48 h-48 object-cover rounded-lg" />
                                <button
                                    onClick={() => setMainImage(null)} // Xử lý xóa ảnh
                                    className="absolute top-2 right-2 p-1 bg-white rounded-full text-gray-600 hover:bg-gray-200 transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </>
                        ) : (
                            <span className="text-gray-400">Hình ảnh sản phẩm</span>
                        )}

                    </div>
                    <div className="space-y-1">
                        <p className="font-semibold text-gray-800">{name}</p>
                        <p className="text-sm text-gray-500">{shortDesc}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <p className="text-lg font-bold text-pink-600">{sellingPrice}₫</p>
                        <p className="text-sm text-gray-400 line-through">{originalPrice}₫</p>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>Tồn kho: </span>
                        <span>0</span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>SKU: </span>
                        <span>-</span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>Trạng thái: </span>
                        <span className="text-green-600">Còn hàng</span>
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

export default EditProduct