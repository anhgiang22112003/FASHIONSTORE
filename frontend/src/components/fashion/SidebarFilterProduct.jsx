import { Filter, X } from 'lucide-react'
import { useState } from 'react'

const Sidebar = ({ priceRange, sortBy, setPriceRange, collection, collections, setCollection, setSortBy, isMobileOpen: mobileOpenProp, setIsMobileOpen: setMobileOpenProp }) => {
  const [internalMobileOpen, setInternalMobileOpen] = useState(false)
  const isMobileOpen = mobileOpenProp ?? internalMobileOpen
  const setIsMobileOpen = setMobileOpenProp ?? setInternalMobileOpen

  const priceRanges = [
    { value: 'all', label: 'Tất cả' },
    { value: 'under-100k', label: 'Dưới 100,000đ' },
    { value: '100k-300k', label: '100,000đ - 300,000đ' },
    { value: '300k-500k', label: '300,000đ - 500,000đ' },
    { value: 'over-500k', label: 'Trên 500,000đ' },
  ]

  const sortOptions = [
    { value: 'newest', label: 'Mới nhất' },
    { value: 'oldest', label: 'Cũ nhất' },
    { value: 'priceAsc', label: 'Giá thấp đến cao' },
    { value: 'priceDesc', label: 'Giá cao đến thấp' },
    { value: 'stockAsc', label: 'Tồn kho tăng dần' },
    { value: 'stockDesc', label: 'Tồn kho giảm dần' },
  ]

  const handleClearFilters = () => {
    setPriceRange('all')
    setCollection('all')
    setSortBy('newest')
  }

  const hasActiveFilters = priceRange !== 'all' || collection !== 'all' || sortBy !== 'newest'

  const SidebarContent = () => (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-pink-100">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-pink-500" />
          <h3 className="font-black text-xl text-gray-900">Bộ lọc</h3>
        </div>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="text-sm font-semibold text-pink-600 hover:text-pink-800 transition-colors"
            >
              Xóa lọc
            </button>
          )}
          {isMobileOpen && (
            <button
              type="button"
              onClick={() => setIsMobileOpen(false)}
              className="lg:hidden text-gray-600 hover:text-gray-900"
            >
              <X className="w-6 h-6" />
            </button>
          )}
        </div>
      </div>


      {/* Collection Filter */}
      <div className="mb-6">
        <h4 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wide">Bộ sưu tập</h4>
        <select
          value={collection}
          onChange={(e) => setCollection(e.target.value)}
          className="w-full border-2 border-pink-200 p-3 rounded-xl focus:outline-none focus:border-pink-500 transition-colors bg-white text-gray-900 font-medium hover:border-pink-300"
        >
          <option value="all">Tất cả bộ sưu tập</option>
          {collections?.map((col) => (
            <option key={col._id} value={col._id}>
              {col.name}
            </option>
          ))}
        </select>
      </div>

      {/* Price Filter */}
      <div className="mb-6">
        <h4 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wide">Khoảng giá</h4>
        <div className="space-y-2">
          {priceRanges.map((range) => (
            <label
              key={range.value}
              className="flex items-center p-3 rounded-xl hover:bg-pink-50 cursor-pointer transition-colors group"
            >
              <input
                type="radio"
                name="price"
                value={range.value}
                defaultChecked={range.value === 'all'}
                onChange={(e) => setPriceRange(e.target.value)}
                className="w-5 h-5 text-pink-500 border-2 border-pink-300 focus:ring-pink-500 focus:ring-2 cursor-pointer"
              />
              <span className="ml-3 text-gray-700 font-medium group-hover:text-pink-500 transition-colors">
                {range.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Sort Filter */}
      <div className="mb-6">
        <h4 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wide">Sắp xếp theo</h4>
        <select
          onChange={(e) => setSortBy(e.target.value)}
          value={sortBy}
          defaultValue="newest"
          className="w-full border-2 border-pink-200 p-3 rounded-xl focus:outline-none focus:border-pink-500 transition-colors bg-white text-gray-900 font-medium hover:border-pink-300"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Decorative Element */}
      <div className="mt-8 p-6 bg-pink-500 rounded-2xl text-white">
        <h4 className="font-black text-lg mb-2">💝 Ưu đãi đặc biệt</h4>
        <p className="text-pink-100 text-sm">
          Miễn phí vận chuyển cho đơn hàng trên 500,000đ
        </p>
      </div>
    </>
  )

  return (
    <>

      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-full">
        <div className="bg-white rounded-2xl shadow-lg border-2 border-pink-100 p-6 sticky top-4">
          <SidebarContent />
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div
        className={`lg:hidden fixed top-0 right-0 h-full w-80 bg-white z-50 shadow-2xl transform transition-transform duration-300 overflow-y-auto ${isMobileOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
      >
        <div className="p-6">
          <SidebarContent />
        </div>
      </div>
    </>
  )
}

export default Sidebar
