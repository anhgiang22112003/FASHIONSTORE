import React from 'react'
import { ShieldCheck, FileText, RefreshCw, HelpCircle, ArrowLeft } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

const policyData = {
    '/privacy': {
        title: 'Chính Sách Bảo Mật Thông Tin',
        icon: ShieldCheck,
        updatedAt: '30/07/2026',
        content: [
            {
                heading: '1. Thu thập thông tin cá nhân',
                text: 'FashionStore cam kết bảo vệ sự riêng tư của bạn. Chúng tôi chỉ thu thập các thông tin cần thiết như họ tên, số điện thoại, địa chỉ giao hàng và email để xử lý đơn hàng và cung cấp dịch vụ tốt nhất.'
            },
            {
                heading: '2. Sử dụng thông tin',
                text: 'Thông tin cá nhân của bạn sẽ được sử dụng để: xác nhận đơn hàng, giao hàng, thông báo về trạng thái vận chuyển, và gửi ưu đãi khuyến mãi đặc biệt (nếu bạn đăng ký nhận bản tin).'
            },
            {
                heading: '3. Bảo mật dữ liệu',
                text: 'Chúng tôi áp dụng các tiêu chuẩn mã hóa SSL tiên tiến nhất để bảo vệ thông tin thanh toán và thông tin cá nhân của bạn không bị truy cập trái phép.'
            },
            {
                heading: '4. Cam kết không chia sẻ',
                text: 'FashionStore tuyệt đối không bán, chia sẻ hay trao đổi thông tin cá nhân của khách hàng cho bên thứ ba vì mục đích thương mại.'
            }
        ]
    },
    '/terms': {
        title: 'Điều Khoản Sử Dụng',
        icon: FileText,
        updatedAt: '30/07/2026',
        content: [
            {
                heading: '1. Quy định chung',
                text: 'Khi truy cập và mua hàng tại FashionStore, khách hàng mặc nhiên đồng ý tuân thủ các quy định và điều khoản dịch vụ mà chúng tôi đưa ra.'
            },
            {
                heading: '2. Đặt hàng và giá cả',
                text: 'Mọi giá sản phẩm niêm yết trên website đều là giá chính thức (đã bao gồm thuế GTGT). FashionStore có quyền điều chỉnh giá bán theo các chương trình khuyến mãi mà không cần báo trước.'
            },
            {
                heading: '3. Quyền sở hữu trí tuệ',
                text: 'Toàn bộ hình ảnh, thiết kế, logo và nội dung trên website là tài sản thuộc quyền sở hữu trí tuệ của FashionStore. Nghiêm cấm sao chép khi chưa được sự đồng ý bằng văn bản.'
            }
        ]
    },
    '/returns': {
        title: 'Chính Sách Đổi Trả Sản Phẩm',
        icon: RefreshCw,
        updatedAt: '30/07/2026',
        content: [
            {
                heading: '1. Điều kiện đổi trả',
                text: 'Sản phẩm được đổi trả trong vòng 7 ngày kể từ khi nhận hàng. Sản phẩm phải còn nguyên tem mác, chưa qua sử dụng, chưa qua giặt tẩy và không bị rách, hỏng.'
            },
            {
                heading: '2. Quy trình đổi hàng',
                text: 'Bước 1: Liên hệ hotline 1900 1234 hoặc nhắn tin qua Fanpage/Website. Bước 2: Gửi sản phẩm về cửa hàng gần nhất. Bước 3: Nhân viên kiểm tra và đổi sản phẩm mới hoặc hoàn tiền.'
            },
            {
                heading: '3. Phí đổi hàng',
                text: 'Miễn phí 100% phí vận chuyển đổi hàng nếu lỗi thuộc về nhà sản xuất hoặc giao sai mẫu/size. Trường hợp khách hàng đổi theo nhu cầu cá nhân, khách hàng thanh toán phí ship 2 chiều.'
            }
        ]
    },
    '/guide': {
        title: 'Hướng Dẫn Mua Hàng Trực Tuyến',
        icon: HelpCircle,
        updatedAt: '30/07/2026',
        content: [
            {
                heading: 'Bước 1: Tìm kiếm & Chọn sản phẩm',
                text: 'Sử dụng thanh tìm kiếm ở đầu trang hoặc duyệt theo danh mục sản phẩm (Thời trang nam, Thời trang nữ, Phụ kiện...). Chọn màu sắc, kích thước và bấm "Thêm vào giỏ hàng".'
            },
            {
                heading: 'Bước 2: Kiểm tra giỏ hàng & Thanh toán',
                text: 'Bấm vào biểu tượng Giỏ hàng để kiểm tra danh sách items. Điền đầy đủ thông tin giao hàng, số điện thoại và lựa chọn phương thức thanh toán phù hợp (COD, Mã QR/Ngân hàng).'
            },
            {
                heading: 'Bước 3: Xác nhận đơn hàng & Nhận hàng',
                text: 'Sau khi hoàn tất đặt hàng, bạn có thể theo dõi tiến trình đơn hàng trong mục "Lịch sử đơn hàng". Đơn hàng sẽ được chuyển phát nhanh tới địa chỉ của bạn trong 2-4 ngày làm việc.'
            }
        ]
    }
}

const PolicyPage = () => {
    const location = useLocation()
    const currentPolicy = policyData[location.pathname] || policyData['/privacy']
    const IconComponent = currentPolicy.icon

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8 font-sans antialiased">
            <div className="max-w-4xl mx-auto space-y-8 animate-slideUp">
                {/* Back Button */}
                <Link
                    to="/"
                    className="inline-flex items-center gap-2 text-pink-600 hover:text-purple-600 font-bold px-4 py-2 rounded-2xl bg-white/80 backdrop-blur-md shadow-sm border border-pink-100 transition-all hover:shadow-md"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span>Trở về trang chủ</span>
                </Link>

                {/* Hero Header */}
                <div className="bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 rounded-3xl p-8 sm:p-10 text-white shadow-2xl relative overflow-hidden">
                    <div className="relative z-10 flex items-center gap-5">
                        <div className="p-4 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30 shadow-lg">
                            <IconComponent className="w-10 h-10 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-black">{currentPolicy.title}</h1>
                            <p className="text-pink-100 text-sm mt-2 font-medium">Cập nhật lần cuối: {currentPolicy.updatedAt}</p>
                        </div>
                    </div>
                </div>

                {/* Content Cards */}
                <div className="bg-white/90 backdrop-blur-md rounded-3xl p-8 sm:p-10 shadow-xl border border-white/30 space-y-8">
                    {currentPolicy.content.map((item, idx) => (
                        <div key={idx} className="space-y-3 pb-6 border-b border-pink-50 last:border-0 last:pb-0">
                            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                                <span className="w-3 h-3 rounded-full bg-pink-500 inline-block"></span>
                                {item.heading}
                            </h3>
                            <p className="text-gray-600 leading-relaxed text-base pl-6 font-medium">
                                {item.text}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default PolicyPage
