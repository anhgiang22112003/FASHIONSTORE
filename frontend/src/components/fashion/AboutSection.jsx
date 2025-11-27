import React from 'react';
import { Shield, Truck, HeadphonesIcon, RefreshCw } from 'lucide-react';
import { brandStats } from '../../data/fashionMock';

const AboutSection = () => {
  const features = [
    {
      icon: Shield,
      title: "Chất lượng đảm bảo",
      description: "Tất cả sản phẩm đều được kiểm tra chất lượng nghiêm ngặt"
    },
    {
      icon: Truck,
      title: "Giao hàng nhanh",
      description: "Miễn phí vận chuyển toàn quốc cho đơn hàng từ 500K"
    },
    {
      icon: HeadphonesIcon,
      title: "Hỗ trợ 24/7",
      description: "Đội ngũ tư vấn nhiệt tình, chuyên nghiệp"
    },
    {
      icon: RefreshCw,
      title: "Đổi trả dễ dàng",
      description: "Chính sách đổi trả trong vòng 30 ngày"
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-pink-50 to-purple-50">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                Về FashionStore
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed mb-6">
                Với hơn 5 năm kinh nghiệm trong ngành thời trang, chúng tôi cam kết 
                mang đến những sản phẩm chất lượng cao với thiết kế hiện đại, 
                phù hợp với xu hướng và phong cách của người Việt Nam.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                Từ trang phục công sở thanh lịch đến những bộ đồ casual năng động, 
                chúng tôi có đầy đủ các lựa chọn để bạn tự tin thể hiện cá tính riêng.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {brandStats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl font-bold text-pink-500 mb-2">
                    {stat.number}
                  </div>
                  <div className="text-sm text-gray-600">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Content - Image */}
          <div className="relative">
            <img
              src="/image/anhabout.avif"
              alt="Fashion Store"
              className="w-full h-[500px] object-cover rounded-2xl shadow-2xl"
              loading="lazy"
            />
            <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-pink-500 rounded-full opacity-20 blur-2xl"></div>
            <div className="absolute -top-6 -right-6 w-32 h-32 bg-purple-500 rounded-full opacity-20 blur-3xl"></div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-16">
          {features.map((feature, index) => (
            <div
              key={index}
              className="text-center p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <feature.icon className="w-6 h-6 text-pink-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 text-sm">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default React.memo(AboutSection);
