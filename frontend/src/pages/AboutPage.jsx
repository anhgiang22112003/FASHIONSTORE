import React from 'react';
import { Users, Award, Heart, Truck } from 'lucide-react';
import { brandStats } from '../data/fashionMock';

const AboutPage = () => {
  const team = [
    {
      name: "Nguyễn Minh Anh",
      role: "CEO & Founder", 
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b277?w=300&h=300&fit=crop&crop=face",
      description: "10 năm kinh nghiệm trong ngành thời trang và kinh doanh"
    },
    {
      name: "Trần Thanh Hương",
      role: "Creative Director",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop&crop=face", 
      description: "Chuyên gia thiết kế với tầm nhìn sáng tạo độc đáo"
    },
    {
      name: "Lê Quốc Dũng",
      role: "Operations Manager",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face",
      description: "Đảm bảo chất lượng và quy trình vận hành hoàn hảo"
    }
  ];

  const values = [
    {
      icon: Heart,
      title: "Chất lượng là ưu tiên hàng đầu",
      description: "Chúng tôi cam kết mang đến những sản phẩm chất lượng cao nhất với giá cả hợp lý"
    },
    {
      icon: Users,
      title: "Khách hàng là trung tâm",
      description: "Sự hài lòng của khách hàng là thước đo thành công của chúng tôi"
    },
    {
      icon: Award,
      title: "Đổi mới không ngừng",
      description: "Luôn cập nhật xu hướng mới và cải tiến sản phẩm, dịch vụ"
    },
    {
      icon: Truck,
      title: "Trách nhiệm xã hội",
      description: "Đóng góp tích cực cho cộng đồng và bảo vệ môi trường"
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-pink-50 to-purple-50 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Câu chuyện của <span className="text-pink-500">FashionStore</span>
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              Từ năm 2020, chúng tôi đã không ngừng nỗ lực để mang đến những sản phẩm 
              thời trang chất lượng cao, phù hợp với phong cách và ngân sách của người Việt Nam.
            </p>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Hành trình của chúng tôi</h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  FashionStore được thành lập vào năm 2020 bởi nhóm bạn trẻ yêu thích thời trang 
                  và mong muốn mang đến những sản phẩm chất lượng với giá cả phải chăng cho người 
                  tiêu dùng Việt Nam.
                </p>
                <p>
                  Bắt đầu từ một cửa hàng nhỏ, chúng tôi đã phát triển thành một thương hiệu 
                  được tin tưởng với hơn 10,000 khách hàng trên toàn quốc. Bí quyết thành công 
                  của chúng tôi là luôn lắng nghe và đặt khách hàng làm trung tâm.
                </p>
                <p>
                  Với tầm nhìn trở thành thương hiệu thời trang hàng đầu Việt Nam, chúng tôi 
                  không ngừng đổi mới và cải tiến để mang đến trải nghiệm mua sắm tuyệt vời nhất.
                </p>
              </div>
            </div>
            
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njl8MHwxfHNlYXJjaHwyfHxjbG90aGluZ3xlbnwwfHx8fDE3NTg1NTc0MDh8MA&ixlib=rb-4.1.0&q=85"
                alt="Fashion Store"
                className="w-full h-[400px] object-cover rounded-2xl shadow-lg"
              />
              <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-pink-500 rounded-full opacity-20 blur-2xl"></div>
              <div className="absolute -top-6 -right-6 w-32 h-32 bg-purple-500 rounded-full opacity-20 blur-3xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Thành tựu của chúng tôi</h2>
            <p className="text-gray-600">Những con số nói lên sự tin tưởng của khách hàng</p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {brandStats.map((stat, index) => (
              <div key={index} className="text-center bg-white rounded-xl p-8 shadow-sm">
                <div className="text-4xl font-bold text-pink-500 mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Giá trị cốt lõi</h2>
            <p className="text-gray-600">Những nguyên tắc định hướng mọi hoạt động của chúng tôi</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <value.icon className="w-8 h-8 text-pink-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Đội ngũ của chúng tôi</h2>
            <p className="text-gray-600">Những con người đứng sau thành công của FashionStore</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {team.map((member, index) => (
              <div key={index} className="text-center bg-white rounded-xl p-6 shadow-sm">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{member.name}</h3>
                <p className="text-pink-500 font-medium mb-3">{member.role}</p>
                <p className="text-gray-600 text-sm">{member.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 bg-gradient-to-r from-pink-500 to-purple-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Sứ mệnh của chúng tôi</h2>
          <p className="text-xl leading-relaxed max-w-3xl mx-auto mb-8">
            "Mang đến cho mọi người cơ hội thể hiện phong cách cá nhân thông qua những 
            sản phẩm thời trang chất lượng cao, với mức giá phù hợp và dịch vụ tận tâm."
          </p>
          <div className="flex justify-center">
            <div className="bg-white bg-opacity-20 rounded-full p-4">
              <Heart className="w-8 h-8" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;