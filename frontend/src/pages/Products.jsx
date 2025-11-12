import React, { useState, useEffect, useContext } from 'react'
import { Star, ShoppingBag, Heart, Filter, X, ChevronDown, Grid, List } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination'
import api from '@/service/api'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { WishlistContext } from '@/context/WishlistContext'
import { AuthContext } from '@/context/Authcontext'
import SideCartDrawer from '@/components/fashion/SideCartDrawer'
import VariantSelectionModal from '@/components/fashion/VariantSelectionModal'


const Products = () => {
    const [products, setProducts] = useState([])
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [loading, setLoading] = useState(false)

    // Filters
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('')
    const [selectedCollection, setSelectedCollection] = useState('')
    const [sortBy, setSortBy] = useState('newest')
    const [priceRange, setPriceRange] = useState([0, 10000000])
    const [showFilters, setShowFilters] = useState(false)
    const [viewMode, setViewMode] = useState('grid')

    // Categories and collections
    const [categories, setCategories] = useState([])
    const [collections, setCollections] = useState([])

    // Cart & favorites
    const [selectedProduct, setSelectedProduct] = useState(null)
    const [isVariantModalOpen, setIsVariantModalOpen] = useState(false)
    const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false)
    const [favorites, setFavorites] = useState([])
    const { fetchWishlist } = useContext(WishlistContext)
    const { user } = useContext(AuthContext)

    const fetchProducts = async () => {
        setLoading(true)
        try {
            const params = {
                page,
                limit: 12,
                sortBy,
            }

            if (searchQuery) params.q = searchQuery
            if (selectedCategory) params.category = selectedCategory
            if (selectedCollection) params.collection = selectedCollection
            if (priceRange[0] > 0) params.minPrice = priceRange[0]
            if (priceRange[1] < 10000000) params.maxPrice = priceRange[1]

            const response = await api.get('/products', { params })
            setProducts(response.data.products)
            setTotal(response.data.total)
            setTotalPages(response.data.totalPages)
        } catch (error) {
            console.error('Error fetching products:', error)
            toast.error('Không thể tải sản phẩm')
        } finally {
            setLoading(false)
        }
    }

    const fetchCategories = async () => {
        try {
            const response = await api.get('/categories')
            setCategories(response.data.data || [])
        } catch (error) {
            console.error('Error fetching categories:', error)
        }
    }

    const fetchCollections = async () => {
        try {
            const response = await api.get('/collection')
            setCollections(response.data.data || [])
        } catch (error) {
            console.error('Error fetching collections:', error)
        }
    }

    const getFavorites = async () => {
        try {
            const res = await api.get('/users/favorites')
            const ids = (res.data || []).map((p) => p._id ?? p.id)
            setFavorites(ids)
        } catch (error) {
            console.error('Error fetching favorites:', error)
        }
    }

    const toggleFavorite = async (productId) => {
        try {
            const already = favorites.includes(productId)
            setFavorites(prev => already ? prev.filter(id => id !== productId) : [...prev, productId])
            if (already) {
                await api.delete(`/users/favorites/${productId}`)
                toast.info('Đã xóa khỏi danh sách yêu thích 💔')
                fetchWishlist()
            } else {
                await api.post(`/users/favorites/${productId}`, {})
                toast.success('Đã thêm vào danh sách yêu thích ❤️')
                fetchWishlist()
            }
            await getFavorites()
        } catch (error) {
            console.error('Error toggling favorite:', error)
            toast.error('Có lỗi xảy ra, vui lòng thử lại')
            await getFavorites()
        }
    }

    useEffect(() => {
        fetchCategories()
        fetchCollections()
    }, [])

    useEffect(() => {
        fetchProducts()
    }, [page, sortBy, selectedCategory, selectedCollection, searchQuery])

    useEffect(() => {
        if (user) {
            getFavorites()
        }
    }, [user])

    const handleApplyFilters = () => {
        setPage(1)
        fetchProducts()
        setShowFilters(false)
    }

    const handleResetFilters = () => {
        setSearchQuery('')
        setSelectedCategory('')
        setSelectedCollection('')
        setSortBy('newest')
        setPriceRange([0, 10000000])
        setPage(1)
    }

    return (
        <div className="min-h-screen bg-[#FFF5F7]">
            {/* Header */}
            <div className="bg-white border-b border-pink-100">
                <div className="container mx-auto px-4 py-8">
                    <h4 className=" lg:text-5xl font-black text-black mb-2">
                        Tất Cả <span className="bg-gradient-to-r from-pink-400 to-pink-600 bg-clip-text text-transparent">Sản Phẩm</span>
                    </h4>
                    <p className="text-gray-600">Tìm thấy {total} sản phẩm</p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar Filters - Desktop */}
                    <aside className="hidden lg:block w-80 flex-shrink-0">
                        <div className="bg-white rounded-3xl shadow-lg p-6 sticky top-4">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-black text-black flex items-center gap-2">
                                    <Filter className="w-5 h-5 text-pink-500" />
                                    Bộ Lọc
                                </h3>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleResetFilters}
                                    className="text-pink-500 hover:text-pink-600 hover:bg-pink-50"
                                >
                                    Xóa
                                </Button>
                            </div>

                            {/* Search */}
                            <div className="mb-6">
                                <label className="text-sm font-bold text-black mb-2 block">Tìm kiếm</label>
                                <Input
                                    placeholder="Nhập tên sản phẩm..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="border-pink-200 focus:border-pink-400"
                                />
                            </div>

                            {/* Category */}
                            <div className="mb-6">
                                <label className="text-sm font-bold text-black mb-2 block">Danh mục</label>
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="w-full border border-pink-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-pink-400"
                                >
                                    <option value="all">Tất cả</option>
                                    {categories.map((cat) => (
                                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                                    ))}
                                </select>

                            </div>

                            {/* Collection */}
                            <div className="mb-6">
                                <label className="text-sm font-bold text-black mb-2 block">Bộ sưu tập</label>
                                <select
                                    value={selectedCollection}
                                    onChange={(e) => setSelectedCollection(e.target.value)}
                                    className="w-full border border-pink-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-pink-400"
                                >
                                    <option value="all">Tất cả</option>
                                    {collections.map((col) => (
                                        <option key={col._id} value={col._id}>
                                            {col.name}
                                        </option>
                                    ))}
                                </select>

                            </div>

                            {/* Price Range */}
                            <div className="mb-6">
                                <label className="text-sm font-bold text-black mb-2 block">
                                    Khoảng giá: {priceRange[0].toLocaleString('vi-VN')}đ - {priceRange[1].toLocaleString('vi-VN')}đ
                                </label>
                                <Slider
                                    min={0}
                                    max={10000000}
                                    step={100000}
                                    value={priceRange}
                                    onValueChange={setPriceRange}
                                    className="my-4"
                                />
                            </div>

                            <Button
                                onClick={handleApplyFilters}
                                className="w-full bg-gradient-to-r from-pink-400 to-pink-600 text-white font-bold rounded-full shadow-lg hover:shadow-pink-500/50"
                            >
                                Áp dụng
                            </Button>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <div className="flex-1">
                        {/* Mobile Filter Button & Sort */}
                        <div className="flex items-center justify-between mb-6 bg-white rounded-2xl p-4 shadow-lg">
                            <Button
                                onClick={() => setShowFilters(!showFilters)}
                                className="lg:hidden bg-pink-500 text-white font-bold rounded-full"
                            >
                                <Filter className="w-4 h-4 mr-2" />
                                Lọc
                            </Button>

                            <div className="flex items-center gap-4 ml-auto">
                                <div className="flex items-center gap-2 bg-pink-50 rounded-full p-1">
                                    <Button
                                        size="sm"
                                        variant={viewMode === 'grid' ? 'default' : 'ghost'}
                                        className={`rounded-full ${viewMode === 'grid' ? 'bg-pink-500 text-white' : 'text-gray-600'}`}
                                        onClick={() => setViewMode('grid')}
                                    >
                                        <Grid className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant={viewMode === 'list' ? 'default' : 'ghost'}
                                        className={`rounded-full ${viewMode === 'list' ? 'bg-pink-500 text-white' : 'text-gray-600'}`}
                                        onClick={() => setViewMode('list')}
                                    >
                                        <List className="w-4 h-4" />
                                    </Button>
                                </div>

                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="w-full border border-pink-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-pink-400"
                                >
                                    <option value="newest">Mới nhất</option>
                                    <option value="oldest">Cũ nhất</option>
                                    <option value="priceAsc">Giá thấp đến cao</option>
                                    <option value="priceDesc">Giá cao đến thấp</option>
                                </select>

                            </div>
                        </div>

                        {/* Mobile Filters Drawer */}
                        {showFilters && (
                            <div className="lg:hidden fixed inset-0 bg-black/50 z-50" onClick={() => setShowFilters(false)}>
                                <div className="absolute right-0 top-0 bottom-0 w-80 bg-white p-6 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-xl font-black text-black">Bộ Lọc</h3>
                                        <Button variant="ghost" size="sm" onClick={() => setShowFilters(false)}>
                                            <X className="w-5 h-5" />
                                        </Button>
                                    </div>

                                    {/* Same filters as sidebar */}
                                    <div className="mb-6">
                                        <label className="text-sm font-bold text-black mb-2 block">Tìm kiếm</label>
                                        <Input
                                            placeholder="Nhập tên sản phẩm..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="border-pink-200"
                                        />
                                    </div>

                                    <div className="mb-6">
                                        <label className="text-sm font-bold text-black mb-2 block">Danh mục</label>
                                        <select
                                            value={selectedCategory}
                                            onChange={(e) => setSelectedCategory(e.target.value)}
                                            className="w-full border border-pink-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-pink-400"
                                        >
                                            <option value="all">Tất cả</option>
                                            {categories.map((cat) => (
                                                <option key={cat._id} value={cat._id}>{cat.name}</option>
                                            ))}
                                        </select>

                                    </div>

                                    <div className="mb-6">
                                        <label className="text-sm font-bold text-black mb-2 block">Bộ sưu tập</label>
                                        <select
                                            value={selectedCollection}
                                            onChange={(e) => setSelectedCollection(e.target.value)}
                                            className="w-full border border-pink-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-pink-400"
                                        >
                                            <option value="all">Tất cả</option>
                                            {collections.map((col) => (
                                                <option key={col._id} value={col._id}>
                                                    {col.name}
                                                </option>
                                            ))}
                                        </select>

                                    </div>

                                    <div className="mb-6">
                                        <label className="text-sm font-bold text-black mb-2 block">
                                            Khoảng giá: {priceRange[0].toLocaleString('vi-VN')}đ - {priceRange[1].toLocaleString('vi-VN')}đ
                                        </label>
                                        <Slider
                                            min={0}
                                            max={10000000}
                                            step={100000}
                                            value={priceRange}
                                            onValueChange={setPriceRange}
                                            className="my-4"
                                        />
                                    </div>

                                    <div className="flex gap-3">
                                        <Button
                                            onClick={handleResetFilters}
                                            variant="outline"
                                            className="flex-1 border-pink-500 text-pink-500"
                                        >
                                            Xóa
                                        </Button>
                                        <Button
                                            onClick={handleApplyFilters}
                                            className="flex-1 bg-gradient-to-r from-pink-400 to-pink-600 text-white"
                                        >
                                            Áp dụng
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Products Grid/List */}
                        {loading ? (
                            <div className="flex items-center justify-center py-20">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
                            </div>
                        ) : (
                            <>
                                <div className={viewMode === 'grid'
                                    ? 'grid sm:grid-cols-2 lg:grid-cols-3 gap-6'
                                    : 'flex flex-col gap-6'
                                }>
                                    {products?.map((product) => (
                                        <div
                                            key={product?._id}
                                            className={`group relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden hover:-translate-y-2 ${viewMode === 'list' ? 'flex flex-row' : ''
                                                }`}
                                        >
                                            <div className={`${viewMode === 'list' ? 'w-64' : 'aspect-[4/5]'} overflow-hidden relative`}>
                                                <img
                                                    src={product?.mainImage}
                                                    alt={product?.name}
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                />

                                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                                                {product?.originalPrice > product?.sellingPrice && (
                                                    <div className="absolute top-4 left-4 bg-gradient-to-r from-pink-400 to-pink-600 text-white px-3 py-2 rounded-full text-xs font-black shadow-lg">
                                                        -{Math.round(((product?.originalPrice - product?.sellingPrice) / product?.originalPrice) * 100)}% OFF
                                                    </div>
                                                )}

                                                <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                                                    <Button
                                                        size="sm"
                                                        className={`w-10 h-10 p-0 rounded-full shadow-xl ${favorites.includes(product._id)
                                                            ? 'bg-gradient-to-r from-pink-400 to-pink-600'
                                                            : 'bg-white hover:bg-gray-50'
                                                            }`}
                                                        onClick={(e) => {
                                                            e.preventDefault()
                                                            toggleFavorite(product._id)
                                                        }}
                                                    >
                                                        <Heart
                                                            className={`w-4 h-4 ${favorites.includes(product._id)
                                                                ? 'fill-white text-white'
                                                                : 'text-black'
                                                                }`}
                                                        />
                                                    </Button>
                                                </div>

                                                {viewMode === 'grid' && (
                                                    <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                                                        <Button
                                                            size="lg"
                                                            className="w-full bg-gradient-to-r from-pink-400 to-pink-600 text-white font-bold rounded-full shadow-xl"
                                                            onClick={() => {
                                                                setSelectedProduct(product)
                                                                setIsVariantModalOpen(true)
                                                            }}
                                                        >
                                                            <ShoppingBag className="w-4 h-4 mr-2" />
                                                            Thêm vào giỏ
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>

                                            <div className={`p-6 bg-white ${viewMode === 'list' ? 'flex-1 flex flex-col justify-between' : ''}`}>
                                                <div>
                                                    <Link to={`/product/${product?._id}`}>
                                                        <h3 className="font-bold text-black mb-3 line-clamp-2 text-lg group-hover:text-pink-500 transition-colors">
                                                            {product?.name}
                                                        </h3>
                                                    </Link>

                                                    <div className="flex items-center gap-2 mb-3">
                                                        <div className="flex items-center">
                                                            {[...Array(5)].map((_, i) => (
                                                                <Star
                                                                    key={i}
                                                                    className={`w-4 h-4 ${i < Math.floor(product?.ratingAverage || 0)
                                                                        ? 'text-pink-500 fill-pink-500'
                                                                        : 'text-gray-300'
                                                                        }`}
                                                                />
                                                            ))}
                                                        </div>
                                                        <span className="text-sm text-gray-600 font-semibold">
                                                            {product?.ratingAverage?.toFixed(1) ?? 0} ({product?.reviewCount ?? 0})
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className={viewMode === 'list' ? 'flex items-end justify-between' : ''}>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-2xl font-black bg-gradient-to-r from-pink-400 to-pink-600 bg-clip-text text-transparent">
                                                            {product?.sellingPrice?.toLocaleString('vi-VN')}đ
                                                        </span>
                                                        {product.originalPrice > product.sellingPrice && (
                                                            <span className="text-sm text-gray-500 line-through font-medium">
                                                                {product?.originalPrice?.toLocaleString('vi-VN')}đ
                                                            </span>
                                                        )}
                                                    </div>

                                                    {viewMode === 'list' && (
                                                        <Button
                                                            size="lg"
                                                            className="bg-gradient-to-r from-pink-400 to-pink-600 text-white font-bold rounded-full"
                                                            onClick={() => {
                                                                setSelectedProduct(product)
                                                                setIsVariantModalOpen(true)
                                                            }}
                                                        >
                                                            <ShoppingBag className="w-4 h-4 mr-2" />
                                                            Thêm vào giỏ
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none"></div>
                                        </div>
                                    ))}
                                </div>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="mt-12">
                                        <Pagination>
                                            <PaginationContent>
                                                <PaginationItem>
                                                    <PaginationPrevious
                                                        onClick={() => setPage(Math.max(1, page - 1))}
                                                        className={page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                                    />
                                                </PaginationItem>
                                                {[...Array(totalPages)].map((_, i) => (
                                                    <PaginationItem key={i}>
                                                        <PaginationLink
                                                            onClick={() => setPage(i + 1)}
                                                            isActive={page === i + 1}
                                                            className="cursor-pointer"
                                                        >
                                                            {i + 1}
                                                        </PaginationLink>
                                                    </PaginationItem>
                                                ))}
                                                <PaginationItem>
                                                    <PaginationNext
                                                        onClick={() => setPage(Math.min(totalPages, page + 1))}
                                                        className={page === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                                    />
                                                </PaginationItem>
                                            </PaginationContent>
                                        </Pagination>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            {isVariantModalOpen && selectedProduct && (
                <React.Suspense fallback={<div>Đang tải...</div>}>
                    <VariantSelectionModal
                        product={selectedProduct}
                        isOpen={isVariantModalOpen}
                        onClose={() => setIsVariantModalOpen(false)}
                        onSuccessAndOpenCart={() => setIsCartDrawerOpen(true)}
                    />
                </React.Suspense>
            )}
            <SideCartDrawer
                isOpen={isCartDrawerOpen}
                onClose={() => setIsCartDrawerOpen(false)}
            />
        </div>
    )
}

export default Products
