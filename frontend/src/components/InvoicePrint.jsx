import React from "react"
import { toast } from "react-toastify"
import { PrinterIcon } from "@heroicons/react/24/outline"

// ✅ Map trạng thái sang tiếng Việt
const ORDER_STATUS_VN = {
    PENDING: "Chờ xử lý",
    PROCESSING: "Đang xử lý",
    SHIPPED: "Đang giao hàng",
    COMPLETED: "Hoàn thành",
    CANCELLED: "Đã hủy",
}

const InvoicePrint = ({ order }) => {
    const handlePrint = () => {
        if (!order) {
            toast.error("Không có dữ liệu đơn hàng để in")
            return
        }

        const shopName = "PinkFashion"
        const shopAddress = "123 Đường Thời Trang, Quận 1, TP. HCM"
        const shopPhone = "Hotline: 0987 654 321"
        const printDate = new Date().toLocaleString("vi-VN")

        const printWindow = window.open('', '_blank', 'width=800,height=1000')
        printWindow.document.open()
        printWindow.document.write(`
      <html>
        <head>
          <title>Hóa đơn - ${shopName}</title>
          <style>
            @page { size: A4; margin: 12mm; }
            body {
              font-family: "Segoe UI", Arial, sans-serif;
              color: #222;
              font-size: 14px;
              padding: 20px;
            }
            .header { text-align: center; border-bottom: 2px solid #f472b6; margin-bottom: 12px; }
            .header h1 { color: #ec4899; font-size: 22px; margin: 0; }
            .header p { margin: 4px 0; }
            .invoice-title { text-align: center; margin: 16px 0; font-size: 18px; font-weight: bold; color: #111; }
            .info { margin-bottom: 16px; display: flex; justify-content: space-between; }
            .info div { width: 48%; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background: #fce7f3; }
            tfoot td { font-weight: bold; }
            .footer { margin-top: 30px; display: flex; justify-content: space-between; font-size: 14px; }
            .sign { text-align: center; margin-top: 40px; }
            .sign span { display: block; margin-top: 60px; border-top: 1px solid #999; width: 200px; margin: 0 auto; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${shopName}</h1>
            <p>${shopAddress}</p>
            <p>${shopPhone}</p>
          </div>

          <div class="invoice-title">HÓA ĐƠN BÁN HÀNG</div>

          <div class="info">
            <div>
              <strong>Khách hàng:</strong> ${order?.customerInfo?.name || ''}<br>
              <strong>Email:</strong> ${order?.customerInfo?.email || ''}<br>
              <strong>Số điện thoại:</strong> ${order?.customerInfo?.phone || ''}<br>
              <strong>Địa chỉ:</strong> ${order?.customerInfo?.address || ''}<br>
            </div>
            <div>
              <strong>Mã đơn hàng:</strong> ${order?.orderId || ''}<br>
              <strong>Ngày in:</strong> ${printDate}<br>
              <strong>Phương thức thanh toán:</strong> ${order?.paymentInfo?.method || ''}<br>
              <strong>Hình thức giao hàng:</strong> ${order?.shippingInfo?.type || ''}<br>
              <strong>Trạng thái:</strong> ${ORDER_STATUS_VN[order?.status] || ''}<br>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Sản phẩm</th>
                <th>Màu</th>
                <th>Size</th>
                <th>Số lượng</th>
                <th>Đơn giá</th>
                <th>Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              ${order?.productList?.map((item, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${item?.name || ''}</td>
                  <td>${item?.color || ''}</td>
                  <td>${item?.size || ''}</td>
                  <td>${item?.quantity || 1}</td>
                  <td>${item?.unitPrice?.toLocaleString('vi-VN')} ₫</td>
                  <td>${(item?.unitPrice * item?.quantity).toLocaleString('vi-VN')} ₫</td>
                </tr>
              `).join('')}
            </tbody>
            <tfoot>
              <tr><td colspan="6">Tạm tính</td><td>${order?.totals?.subtotal?.toLocaleString('vi-VN')} ₫</td></tr>
              <tr><td colspan="6">Phí vận chuyển</td><td>${order?.totals?.shippingFee?.toLocaleString('vi-VN')} ₫</td></tr>
              <tr><td colspan="6">Giảm giá</td><td>-${order?.totals?.discount?.toLocaleString('vi-VN')} ₫</td></tr>
              <tr><td colspan="6"><strong>Tổng cộng</strong></td><td><strong>${order?.totals?.total?.toLocaleString('vi-VN')} ₫</strong></td></tr>
            </tfoot>
          </table>

          <div class="footer">
            <div><em>Cảm ơn quý khách đã mua hàng tại ${shopName}!</em></div>
            <div class="sign">
              <strong>Người lập hóa đơn</strong>
              <span></span>
            </div>
          </div>
        </body>
      </html>
    `)
        printWindow.document.close()
        printWindow.focus()
        printWindow.print()
    }

    return (
        <button
            onClick={handlePrint}
            className="flex items-center space-x-1 px-4 py-2 bg-pink-100 text-pink-600 rounded-xl font-semibold hover:bg-pink-200 transition-colors"
        >
            <PrinterIcon className="w-5 h-5" />
            <span>In đơn hàng</span>
        </button>
    )
}

export default InvoicePrint
