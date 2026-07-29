import apiAdmin from 'service/apiAdmin'
import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { Search, Package, TrendingUp, TrendingDown, RefreshCw, X, Plus, ShoppingCart, Truck, FileText } from 'lucide-react'
import QuickCreateProduct from 'components/QuickCreateProduct'
import { AdminButton } from "components/admin/ui"

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

export default function StockImportExport({ tab, onSuccess }) {
  // Product search
  const [products, setProducts] = useState([])
  const [q, setQ] = useState('')
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [searchLoading, setSearchLoading] = useState(false)
  const debouncedQ = useDebounce(q, 500)
  const [cartItems, setCartItems] = useState([])
  const [color, setColor] = useState('')
  const [size, setSize] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [note, setNote] = useState('')
  const [suppliers, setSuppliers] = useState([])
  const [selectedSupplier, setSelectedSupplier] = useState(null)
  const [saving, setSaving] = useState(false)
  const [showAddVariant, setShowAddVariant] = useState(false)
  const [newColor, setNewColor] = useState('')
  const [newSize, setNewSize] = useState('')
  const [newStock, setNewStock] = useState(0)
  const [showQuickCreate, setShowQuickCreate] = useState(false)

  useEffect(() => {
    fetchSuppliers()
  }, [])

  useEffect(() => {
    if (debouncedQ.trim()) {
      searchProducts(debouncedQ)
    } else {
      setProducts([])
    }
  }, [debouncedQ])

  async function fetchSuppliers() {
    try {
      const res = await apiAdmin.get('/supplier')
      setSuppliers(res.data.data || [])
    } catch (e) {
      console.error(e)
    }
  }

  async function addVariant() {
    if (!selectedProduct) return toast.error("Chưa chọn sản phẩm")

    try {
      const res = await apiAdmin.post(`/stock/${selectedProduct._id}/add-variant`, {
        color: newColor,
        size: newSize,
        stock: newStock
      })

      toast.success("Đã thêm biến thể")
      setSelectedProduct(res.data.product)
      setShowAddVariant(false)
      setNewColor('')
      setNewSize('')
      setNewStock(0)
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi thêm biến thể")
    }
  }

  async function searchProducts(term) {
    if (!term.trim()) {
      setProducts([])
      return
    }
    setSearchLoading(true)
    try {
      const res = await apiAdmin.get('/products?search=' + encodeURIComponent(term))
      setProducts(res.data.products || [])
    } catch (e) {
      console.error(e)
      toast.error('Lỗi khi tìm kiếm sản phẩm')
    } finally {
      setSearchLoading(false)
    }
  }

  function onPickProduct(p) {
    setSelectedProduct(p)
    setColor('')
    setSize('')
    if (p?.variations?.length === 1) {
      setColor(p.variations[0].color)
      setSize(p.variations[0].size)
    }
  }

  function addToCart() {
    if (!selectedProduct) return toast.info('Vui lòng chọn sản phẩm')
    if (!color || !size) return toast.info('Vui lòng chọn biến thể (màu/size)')

    const existingIndex = cartItems.findIndex(
      item => item.productId === selectedProduct._id && item.color === color && item.size === size
    )

    if (existingIndex >= 0) {
      const updated = [...cartItems]
      updated[existingIndex].quantity += Number(quantity)
      setCartItems(updated)
      toast.success('Đã cập nhật số lượng trong giỏ')
    } else {
      setCartItems([
        ...cartItems,
        {
          productId: selectedProduct._id,
          productName: selectedProduct.name,
          sku: selectedProduct.sku,
          color,
          size,
          quantity: Number(quantity),
        }
      ])
      toast.success('Đã thêm vào giỏ')
    }

    setColor('')
    setSize('')
    setQuantity(1)
  }

  function removeFromCart(index) {
    setCartItems(cartItems.filter((_, i) => i !== index))
  }

  function updateCartQuantity(index, newQty) {
    const updated = [...cartItems]
    updated[index].quantity = Math.max(1, Number(newQty))
    setCartItems(updated)
  }

  async function submitImport(e) {
    e.preventDefault()
    if (cartItems.length === 0) return toast.info('Vui lòng thêm sản phẩm vào giỏ')
    if (!selectedSupplier) return toast.info('Chọn nhà cung cấp')

    setSaving(true)
    try {
      const body = {
        supplierId: selectedSupplier._id,
        note,
        items: cartItems.map(item => ({
          productId: item.productId,
          color: item.color,
          size: item.size,
          quantity: item.quantity,
        }))
      }
      await apiAdmin.post('/stock/import', body)
      toast.success('Nhập kho thành công')
      resetForm()
      if (onSuccess) onSuccess()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi khi nhập kho')
    } finally {
      setSaving(false)
    }
  }

  async function submitExport(e) {
    e.preventDefault()
    if (cartItems.length === 0) return toast.info('Vui lòng thêm sản phẩm vào giỏ')

    setSaving(true)
    try {
      const body = {
        note,
        items: cartItems.map(item => ({
          productId: item.productId,
          color: item.color,
          size: item.size,
          quantity: item.quantity,
        }))
      }
      await apiAdmin.post('/stock/export', body)
      toast.success('Xuất kho thành công')
      resetForm()
      if (onSuccess) onSuccess()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi khi xuất kho')
    } finally {
      setSaving(false)
    }
  }

  function resetForm() {
    setSelectedProduct(null)
    setProducts([])
    setQ('')
    setColor('')
    setSize('')
    setQuantity(1)
    setNote('')
    setSelectedSupplier(null)
    setCartItems([])
  }

  return (
    <div className="p-5 bg-slate-50 dark:bg-slate-950 min-h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-full mx-auto">
        
        {/* Left Panel - Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col gap-6">
          <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
            <div className={`p-2.5 rounded-xl text-white ${tab === 'import' ? 'bg-emerald-600' : 'bg-orange-600'}`}>
              {tab === 'import' ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                {tab === 'import' ? 'Tạo phiếu nhập kho' : 'Tạo phiếu xuất kho'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {tab === 'import' ? 'Thêm số lượng tồn kho sản phẩm từ nhà cung cấp' : 'Giảm số lượng tồn kho sản phẩm khỏi hệ thống'}
              </p>
            </div>
          </div>

          <form onSubmit={tab === 'import' ? submitImport : submitExport} className="space-y-4">
            
            {/* Product Search */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tìm kiếm sản phẩm</label>
                <button
                  type="button"
                  onClick={() => setShowQuickCreate(true)}
                  className="text-xs font-bold text-pink-600 hover:text-pink-700 hover:underline"
                >
                  + Thêm nhanh sản phẩm mới
                </button>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  value={q}
                  onChange={e => setQ(e.target.value)}
                  placeholder="Nhập tên sản phẩm hoặc mã SKU..."
                  className="w-full pl-9 pr-9 py-2 text-sm text-slate-700 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/20"
                />
                {searchLoading && (
                  <RefreshCw className="absolute right-3 top-1/2 -translate-y-1/2 text-pink-600 w-4 h-4 animate-spin" />
                )}
              </div>

              {/* Search Results dropdown list */}
              {q.trim() && (
                <div className="border border-slate-200 rounded-xl bg-white shadow-lg max-h-60 overflow-y-auto divide-y divide-slate-100 z-10 relative">
                  {searchLoading ? (
                    <div className="p-4 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Đang tìm kiếm...
                    </div>
                  ) : products.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400">Không tìm thấy sản phẩm phù hợp.</div>
                  ) : (
                    products.map((p) => (
                      <button
                        key={p._id}
                        type="button"
                        onClick={() => onPickProduct(p)}
                        className={`w-full p-3 text-left hover:bg-slate-50 flex justify-between items-center transition-colors ${
                          selectedProduct?._id === p._id ? 'bg-pink-50/50' : ''
                        }`}
                      >
                        <div>
                          <p className="font-bold text-xs text-slate-700">{p.name}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">SKU: {p.sku}</p>
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200/50">
                          Tồn: {p.stock ?? 0}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {selectedProduct && (
              <div className="space-y-4 pt-2 animate-in fade-in duration-200">
                
                {/* Variant selection details */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-700">🧬 Chọn biến thể màu sắc & size</span>
                    <button
                      type="button"
                      onClick={() => setShowAddVariant(true)}
                      className="text-[11px] font-bold text-pink-600 hover:text-pink-700"
                    >
                      + Tạo biến thể mới
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Màu sắc</label>
                      <select
                        value={color}
                        onChange={e => setColor(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs text-slate-700 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500/20"
                      >
                        <option value="">Chọn màu</option>
                        {[...new Set(selectedProduct.variations?.map(v => v.color))].map((c, i) => (
                          <option key={i} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Kích thước</label>
                      <select
                        value={size}
                        onChange={e => setSize(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs text-slate-700 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500/20"
                      >
                        <option value="">Chọn size</option>
                        {[...new Set(selectedProduct.variations?.map(v => v.size))].map((s, i) => (
                          <option key={i} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-1/3">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Số lượng</label>
                      <input
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={e => setQuantity(Number(e.target.value))}
                        className="w-full px-3 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500/20 text-center"
                      />
                    </div>
                    <div className="w-2/3 flex items-end h-full pt-5">
                      <AdminButton
                        type="button"
                        variant="secondary"
                        onClick={addToCart}
                        className="w-full py-1.5 text-xs"
                      >
                        Thêm vào phiếu
                      </AdminButton>
                    </div>
                  </div>
                </div>

                {/* Import specific details: supplier */}
                {tab === 'import' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Nhà cung cấp <span className="text-red-500">*</span></label>
                    <select
                      value={selectedSupplier?._id || ''}
                      onChange={e => setSelectedSupplier(suppliers.find(s => s._id === e.target.value))}
                      className="w-full px-3 py-2 text-sm text-slate-700 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/20"
                      required
                    >
                      <option value="">Chọn đối tác nhà cung cấp</option>
                      {suppliers.map((s) => (
                        <option value={s._id} key={s._id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Note */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Ghi chú phiếu</label>
                  <textarea
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    placeholder="Nhập lý do nhập xuất kho, số chứng từ liên quan..."
                    rows="2"
                    className="w-full px-3 py-2 text-sm text-slate-700 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/20 resize-none"
                  />
                </div>

                {/* Cart list items */}
                {cartItems.length > 0 && (
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Danh sách sản phẩm trong phiếu</label>
                    <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100 bg-slate-50/50">
                      {cartItems.map((item, index) => (
                        <div key={index} className="p-3 bg-white flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors">
                          <div className="min-w-0 flex-grow">
                            <p className="font-bold text-xs text-slate-700 truncate">{item.productName}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              Màu: {item.color} | Size: {item.size}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={e => updateCartQuantity(index, e.target.value)}
                              className="w-16 px-1.5 py-1 text-center font-bold text-xs text-slate-700 border border-slate-200 rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => removeFromCart(index)}
                              className="p-1 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Save button and clear */}
                <div className="flex gap-2 pt-4 border-t border-slate-100">
                  <AdminButton
                    type="submit"
                    variant="primary"
                    loading={saving}
                    className="flex-grow py-2.5"
                  >
                    {tab === 'import' ? '📥 Hoàn tất nhập kho' : '📤 Hoàn tất xuất kho'}
                  </AdminButton>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors border border-slate-200 shadow-sm"
                    title="Xóa phiếu nháp"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

              </div>
            )}

          </form>
        </div>

        {/* Right Panel - Product Details */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col gap-6">
          <div className="pb-4 border-b border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Package className="w-5 h-5 text-pink-600" />
              Chi tiết tồn kho sản phẩm
            </h3>
          </div>

          {!selectedProduct ? (
            <div className="flex flex-col items-center justify-center py-20 text-center text-slate-400">
              <Package className="w-12 h-12 text-slate-300 mb-3" />
              <p className="font-bold text-sm text-slate-500">Chưa chọn sản phẩm</p>
              <p className="text-xs text-slate-400 mt-1 max-w-[240px]">
                Tìm kiếm và lựa chọn sản phẩm ở thanh tìm kiếm bên trái để xem chi tiết các biến thể và số lượng tồn.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-2">
                <h4 className="font-extrabold text-sm text-slate-800">{selectedProduct.name}</h4>
                <div className="flex gap-4 text-xs text-slate-500">
                  <p>SKU: <strong className="text-slate-700">{selectedProduct.sku}</strong></p>
                  <p>Tổng tồn: <strong className="text-pink-600">{selectedProduct.stock ?? 0}</strong></p>
                </div>
              </div>

              <div className="space-y-2">
                <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Danh sách biến thể hiện tại</h5>
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white max-h-[400px] overflow-y-auto">
                  {selectedProduct.variations?.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400">Sản phẩm này chưa có biến thể nào.</div>
                  ) : (
                    selectedProduct.variations?.map((v, i) => (
                      <div key={i} className="p-3 flex justify-between items-center text-xs hover:bg-slate-50 transition-colors">
                        <div>
                          <p className="font-bold text-slate-800">Màu: {v.color} | Size: {v.size}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">Mã vạch riêng biệt</p>
                        </div>
                        <div className="flex gap-2">
                          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-bold border border-emerald-100 rounded-lg">
                            Tồn: {v.stock}
                          </span>
                          <span className="px-2 py-0.5 bg-amber-50 text-amber-700 font-bold border border-amber-100 rounded-lg">
                            Khóa: {v.lockedStock}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Add Variant Modal */}
      {showAddVariant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200">
            <h3 className="text-base font-bold text-slate-800 mb-4">✨ Thêm biến thể mới</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Màu sắc</label>
                <input
                  type="text"
                  placeholder="VD: Đỏ, Xanh lá..."
                  value={newColor}
                  onChange={e => setNewColor(e.target.value)}
                  className="w-full px-3 py-2 text-sm text-slate-700 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Kích thước</label>
                <input
                  type="text"
                  placeholder="VD: S, M, L, XL..."
                  value={newSize}
                  onChange={e => setNewSize(e.target.value)}
                  className="w-full px-3 py-2 text-sm text-slate-700 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Tồn kho ban đầu</label>
                <input
                  type="number"
                  placeholder="0"
                  value={newStock}
                  onChange={e => setNewStock(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm text-slate-700 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/20"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <AdminButton variant="secondary" onClick={() => setShowAddVariant(false)}>
                  Hủy
                </AdminButton>
                <AdminButton variant="primary" onClick={addVariant}>
                  Xác nhận
                </AdminButton>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Create Product Modal */}
      {showQuickCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6 border border-slate-100 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-800">📦 Thêm sản phẩm nhanh</h3>
              <button
                onClick={() => setShowQuickCreate(false)}
                className="p-1 rounded-full text-slate-400 hover:bg-slate-50 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <QuickCreateProduct
              setShowQuickCreate={setShowQuickCreate}
              onSuccess={product => {
                toast.success('Đã thêm sản phẩm mới thành công!')
                setSelectedProduct(product)
                setProducts(prev => [product, ...prev])
                setShowQuickCreate(false)
              }}
            />
          </div>
        </div>
      )}

    </div>
  )
}
