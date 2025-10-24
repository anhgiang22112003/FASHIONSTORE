import { Filter } from 'lucide-react'

const Sidebar = ({ setSelectedSubcategory, setPriceRange, categories, collections, setCategory, setCollection, setSortBy }) => {
  return (
    <div className="w-64 flex-shrink-0">
      <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-4">
        <div className="flex items-center gap-2 mb-6">
          <Filter className="w-5 h-5" />
          <h3 className="font-semibold">Bộ lọc</h3>
        </div>

        {/* Category Filter */}
        <div className="mb-6">
          <h4 className="font-medium mb-3">Danh mục</h4>
          <select onChange={(e) => setCategory(e.target.value)} className="w-full border p-2 rounded">
            <option value="">Tất cả</option>
            {categories?.map((category) => (
              <option key={category._id} value={category._id}>{category.name}</option>
            ))}
          </select>
        </div>

        {/* Collection Filter */}
        <div className="mb-6">
          <h4 className="font-medium mb-3">Bộ sưu tập</h4>
          <select onChange={(e) => setCollection(e.target.value)} className="w-full border p-2 rounded">
            <option value="">Tất cả</option>
            {collections?.map((collection) => (
              <option key={collection._id} value={collection._id}>{collection.name}</option>
            ))}
          </select>
        </div>

        {/* Subcategory Filter */}
        <div className="mb-6">
          <h4 className="font-medium mb-3">Danh mục con</h4>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="subcategory"
                value="all"
                onChange={(e) => setSelectedSubcategory(e.target.value)}
                className="mr-2"
              />
              Tất cả
            </label>
            {/* Map other subcategories */}
            <label className="flex items-center">
              <input
                type="radio"
                name="subcategory"
                value="subcategory-1"
                onChange={(e) => setSelectedSubcategory(e.target.value)}
                className="mr-2"
              />
              Subcategory 1
            </label>
          </div>
        </div>

        {/* Price Filter */}
        <div className="mb-6">
          <h4 className="font-medium mb-3">Khoảng giá</h4>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="price"
                value="all"
                onChange={(e) => setPriceRange(e.target.value)}
                className="mr-2"
              />
              Tất cả
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="price"
                value="under-100k"
                onChange={(e) => setPriceRange(e.target.value)}
                className="mr-2"
              />
              Dưới 100,000đ
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="price"
                value="100k-300k"
                onChange={(e) => setPriceRange(e.target.value)}
                className="mr-2"
              />
              100,000đ - 300,000đ
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="price"
                value="over-300k"
                onChange={(e) => setPriceRange(e.target.value)}
                className="mr-2"
              />
              Trên 300,000đ
            </label>
          </div>
        </div>

        {/* Sort Filter */}
        <div className="mb-6">
          <h4 className="font-medium mb-3">Sắp xếp theo</h4>
          <select onChange={(e) => setSortBy(e.target.value)} className="w-full border p-2 rounded">
            <option value="newest">Mới nhất</option>
            <option value="oldest">Cũ nhất</option>
            <option value="priceAsc">Giá thấp đến cao</option>
            <option value="priceDesc">Giá cao đến thấp</option>
            <option value="stockAsc">Tồn kho tăng dần</option>
            <option value="stockDesc">Tồn kho giảm dần</option>
          </select>
        </div>
      </div>
    </div>
  )
}

export default Sidebar
