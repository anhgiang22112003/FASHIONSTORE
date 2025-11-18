import React from "react"
import {
  PlusIcon,
  MinusIcon,
  TrashIcon,
  ShoppingCartIcon,
  CreditCardIcon,
  PhotoIcon,
  UserIcon,
  BanknotesIcon,
  TicketIcon
} from "@heroicons/react/24/outline"
import DiscountManager from "./DiscountManager"

const CartSidebar = ({
  cartItems,
  selectedCustomer,
  itemCount,
  subtotal,
  discountValue,
  total,
  paymentMethod,
  setPaymentMethod,
  isProcessing,
  selectedStaff,
  onChangeQuantity,
  onRemoveItem,
  onCheckout,
  // Discount props
  discountType,
  setDiscountType,
  discountPercent,
  setDiscountPercent,
  discountAmount,
  setDiscountAmount,
  selectedVoucher,
  setSelectedVoucher,
  customerVouchers,
  setShowVoucherModal,
  onRemoveDiscount
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden sticky top-4">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-purple-500 to-pink-600">
        <div className="flex items-center justify-between text-white">
          <h2 className="text-xl font-semibold">Giỏ hàng</h2>
          <div className="flex items-center gap-2">
            <ShoppingCartIcon className="w-5 h-5" />
            <span className="bg-white/20 px-2 py-1 rounded-full text-sm font-medium">
              {itemCount}
            </span>
          </div>
        </div>
        {selectedCustomer && (
          <div className="mt-3 text-white/90 text-sm">
            <div className="flex items-center gap-2">
              <UserIcon className="w-4 h-4" />
              <span>{selectedCustomer.name}</span>
            </div>
          </div>
        )}
      </div>

      <div className="p-6">
        {cartItems.length === 0 ? (
          <div className="text-center py-8">
            <ShoppingCartIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Giỏ hàng trống</p>
            <p className="text-gray-400 text-sm">Thêm sản phẩm để bắt đầu</p>
          </div>
        ) : (
          <>
            {/* Cart Items */}
            <div className="space-y-3 max-h-[200px] overflow-y-auto scrollbar-thin scrollbar-thumb-pink-300 scrollbar-track-gray-100 mb-4">
              {cartItems.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-gradient-to-r from-gray-50 to-white p-4 rounded-xl border border-gray-200 hover:border-pink-300 transition-all duration-200"
                >
                  <div className="flex gap-3 mb-3">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      {item.mainImage ? (
                        <img
                          src={item.mainImage}
                          alt={item.productName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <PhotoIcon className="w-6 h-6" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-800 text-sm truncate">
                        {item.productName}
                      </h4>
                      <div className="text-xs text-gray-500">
                        {item.price?.toLocaleString()} ₫
                      </div>
                    </div>

                    <button
                      onClick={() => onRemoveItem(idx)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded-lg transition-all duration-200 flex-shrink-0"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onChangeQuantity(idx, item.quantity - 1)}
                        className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-pink-100 text-gray-600 hover:text-pink-600 flex items-center justify-center transition-all duration-200"
                      >
                        <MinusIcon className="w-4 h-4" />
                      </button>

                      <input
                        type="number"
                        value={item.quantity}
                        min={1}
                        onChange={(e) => onChangeQuantity(idx, Number(e.target.value))}
                        className="w-16 text-black text-center py-1 px-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      />

                      <button
                        onClick={() => onChangeQuantity(idx, item.quantity + 1)}
                        className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-pink-100 text-gray-600 hover:text-pink-600 flex items-center justify-center transition-all duration-200"
                      >
                        <PlusIcon className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="text-right">
                      <div className="font-semibold text-pink-600">
                        {(item.price * item.quantity)?.toLocaleString()} ₫
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Discount Manager */}
            <DiscountManager
              subtotal={subtotal}
              discountType={discountType}
              setDiscountType={setDiscountType}
              discountValue={discountValue}
              discountPercent={discountPercent}
              setDiscountPercent={setDiscountPercent}
              discountAmount={discountAmount}
              setDiscountAmount={setDiscountAmount}
              selectedVoucher={selectedVoucher}
              setSelectedVoucher={setSelectedVoucher}
              selectedCustomer={selectedCustomer}
              customerVouchers={customerVouchers}
              setShowVoucherModal={setShowVoucherModal}
              onRemoveDiscount={onRemoveDiscount}
              staffId={selectedStaff}
            />

            {/* Total */}
            <div className="border-t border-gray-200 pt-4 mb-4 space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Tạm tính:</span>
                <span className="font-medium text-gray-800">
                  {subtotal?.toLocaleString()} ₫
                </span>
              </div>
              {discountValue > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Chiết khấu:</span>
                  <span className="font-medium text-orange-600">
                    -{discountValue?.toLocaleString()} ₫
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                <span className="text-gray-700 font-medium">Tổng cộng:</span>
                <span className="text-2xl font-bold text-pink-600">
                  {total?.toLocaleString()} ₫
                </span>
              </div>
            </div>

            {/* Payment Method */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phương thức thanh toán
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setPaymentMethod("CASH")}
                  className={`px-4 py-3 text-black rounded-lg border-2 transition-all duration-200 flex items-center justify-center gap-2 ${
                    paymentMethod === "CASH"
                      ? "border-green-500 bg-green-50 text-green-700"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <CreditCardIcon className="w-5 h-5" />
                  <span className="font-medium">Tiền mặt</span>
                </button>
                <button
                  onClick={() => setPaymentMethod("BANK")}
                  className={`px-4 py-3 text-black rounded-lg border-2 transition-all duration-200 flex items-center justify-center gap-2 ${
                    paymentMethod === "BANK"
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <BanknotesIcon className="w-5 h-5" />
                  <span className="font-medium">Chuyển khoản</span>
                </button>
              </div>
            </div>

            {/* Checkout Button */}
            <button
              onClick={onCheckout}
              disabled={isProcessing || cartItems.length === 0 || !selectedStaff}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3 shadow-lg"
            >
              {isProcessing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Đang xử lý...
                </>
              ) : (
                <>
                  {paymentMethod === "CASH" ? (
                    <>
                      <CreditCardIcon className="w-5 h-5" />
                      Thanh toán tiền mặt
                    </>
                  ) : (
                    <>
                      <BanknotesIcon className="w-5 h-5" />
                      Thanh toán chuyển khoản
                    </>
                  )}
                </>
              )}
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default CartSidebar