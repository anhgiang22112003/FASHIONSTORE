import React, { useState } from 'react';
import { Users, Award, Heart, Truck, TrendingUp, Package, Shield, Zap } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const AboutPage = () => {
  const [loadedImages, setLoadedImages] = useState({});

  const handleImageLoad = (key) => {
    setLoadedImages(prev => ({ ...prev, [key]: true }));
  };

  const brandStats = [
    { number: "10K+", label: "Khách hàng tin tưởng" },
    { number: "5K+", label: "Sản phẩm chất lượng" },
    { number: "50+", label: "Đối tác uy tín" },
    { number: "99%", label: "Khách hàng hài lòng" }
  ];

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
      description: "Chúng tôi cam kết mang đến những sản phẩm chất lượng cao nhất với giá cả hợp lý",
      gradient: "from-pink-500 to-rose-500"
    },
    {
      icon: Users,
      title: "Khách hàng là trung tâm",
      description: "Sự hài lòng của khách hàng là thước đo thành công của chúng tôi",
      gradient: "from-purple-500 to-indigo-500"
    },
    {
      icon: Award,
      title: "Đổi mới không ngừng",
      description: "Luôn cập nhật xu hướng mới và cải tiến sản phẩm, dịch vụ",
      gradient: "from-pink-500 to-purple-500"
    },
    {
      icon: Truck,
      title: "Trách nhiệm xã hội",
      description: "Đóng góp tích cực cho cộng đồng và bảo vệ môi trường",
      gradient: "from-violet-500 to-purple-500"
    }
  ];

  return (
    <div className="min-h-screen">
      <section className="relative bg-gradient-to-br from-pink-50 via-purple-50 to-background py-20 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyMzYsMTI2LDE3NywwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-[1550px] mx-auto text-center animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-pink-100 text-pink-600 rounded-full text-sm font-medium mb-6">
              <Zap className="w-4 h-4" />
              <span>Câu chuyện thương hiệu</span>
            </div>
            
            <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6">
              Câu chuyện của{' '}
              <span className="bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                FashionStore
              </span>
            </h1>
            
            <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
              Từ năm 2020, chúng tôi đã không ngừng nỗ lực để mang đến những sản phẩm 
              thời trang chất lượng cao, phù hợp với phong cách và ngân sách của người Việt Nam.
            </p>
          </div>
        </div>
      </section>

      {/* Story Section - Image with loading state */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center max-w-[1550px] mx-auto">
            <div className="space-y-6 animate-fade-in">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-muted rounded-full text-sm font-medium text-muted-foreground mb-2">
                <TrendingUp className="w-4 h-4" />
                <span>Hành trình phát triển</span>
              </div>
              
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
                Hành trình của chúng tôi
              </h2>
              
              <div className="space-y-4 text-muted-foreground leading-relaxed">
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

              <div className="flex gap-4 pt-4">
                <div className="flex-1 p-4 bg-gradient-to-br from-pink-50 to-pink-100/50 rounded-xl border border-pink-200/50">
                  <Package className="w-6 h-6 text-pink-600 mb-2" />
                  <div className="text-2xl font-bold text-foreground">5K+</div>
                  <div className="text-sm text-muted-foreground">Sản phẩm</div>
                </div>
                <div className="flex-1 p-4 bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl border border-purple-200/50">
                  <Shield className="w-6 h-6 text-purple-600 mb-2" />
                  <div className="text-2xl font-bold text-foreground">100%</div>
                  <div className="text-sm text-muted-foreground">Chính hãng</div>
                </div>
              </div>
            </div>
            
            <div className="relative group">
              <div className="relative overflow-hidden rounded-2xl">
                {!loadedImages['hero'] && (
                  <Skeleton className="absolute inset-0 w-full h-[450px]" />
                )}
                <img
                  src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njl8MHwxfHNlYXJjaHwyfHxjbG90aGluZ3xlbnwwfHx8fDE3NTg1NTc0MDh8MA&ixlib=rb-4.1.0&q=85"
                  alt="Fashion Store"
                  loading="lazy"
                  onLoad={() => handleImageLoad('hero')}
                  className={`w-full h-[450px] object-cover transition-all duration-700 ${
                    loadedImages['hero'] ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                  } group-hover:scale-105`}
                />
              </div>
              
              {/* Decorative elements */}
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-gradient-to-br from-pink-500 to-pink-600 rounded-full opacity-20 blur-3xl"></div>
              <div className="absolute -top-6 -right-6 w-40 h-40 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full opacity-20 blur-3xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section - Staggered animation */}
      <section className="py-20 bg-gradient-to-br from-muted/30 to-muted/10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Thành tựu của chúng tôi
            </h2>
            <p className="text-muted-foreground text-lg">
              Những con số nói lên sự tin tưởng của khách hàng
            </p>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-[1550px] mx-auto">
            {brandStats.map((stat, index) => (
              <div
                key={index}
                className="group relative bg-background rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-border hover:border-pink-200 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-purple-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10 text-center">
                  <div className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent mb-3">
                    {stat.number}
                  </div>
                  <div className="text-muted-foreground font-medium">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section - Enhanced cards */}
      <section className="py-20 bg-background">
        <div className="container max-w-[1550px] mx-auto px-4">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Giá trị cốt lõi
            </h2>
            <p className="text-muted-foreground text-lg">
              Những nguyên tắc định hướng mọi hoạt động của chúng tôi
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-[1550px] mx-auto">
            {values.map((value, index) => (
              <div
                key={index}
                className="group text-center animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`relative w-20 h-20 bg-gradient-to-br ${value.gradient} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-2xl group-hover:scale-110 transition-all duration-300`}>
                  <value.icon className="w-10 h-10 text-white" />
                  <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                
                <h3 className="text-lg font-bold text-foreground mb-3 group-hover:text-pink-600 transition-colors">
                  {value.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section - Image loading optimization */}
      <section className="py-20 bg-gradient-to-br from-muted/30 to-muted/10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Đội ngũ của chúng tôi
            </h2>
            <p className="text-muted-foreground text-lg">
              Những con người đứng sau thành công của FashionStore
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-[1550px]  mx-auto">
            {team.map((member, index) => (
              <div
                key={index}
                className="group bg-background rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-border hover:border-pink-200 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="relative w-32 h-32 mx-auto mb-6">
                  {!loadedImages[`team-${index}`] && (
                    <Skeleton className="absolute inset-0 w-32 h-32 rounded-full" />
                  )}
                  <img
                    src={member.image}
                    alt={member.name}
                    loading="lazy"
                    onLoad={() => handleImageLoad(`team-${index}`)}
                    className={`w-32 h-32 rounded-full object-cover border-4 border-pink-100 group-hover:border-pink-300 transition-all duration-300 ${
                      loadedImages[`team-${index}`] ? 'opacity-100' : 'opacity-0'
                    }`}
                  />
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-pink-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                
                <h3 className="text-xl font-bold text-foreground mb-2 text-center">
                  {member.name}
                </h3>
                <p className="text-pink-600 font-semibold mb-4 text-center">
                  {member.role}
                </p>
                <p className="text-muted-foreground text-sm text-center leading-relaxed">
                  {member.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section - Optimized gradient */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-600 to-pink-500"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-4xl mx-auto animate-fade-in">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full mb-8 group hover:scale-110 transition-transform duration-300">
              <Heart className="w-10 h-10 text-white group-hover:scale-110 transition-transform duration-300" />
            </div>
            
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
              Sứ mệnh của chúng tôi
            </h2>
            
            <p className="text-xl lg:text-2xl leading-relaxed text-white/95 mb-8 font-light">
              "Mang đến cho mọi người cơ hội thể hiện phong cách cá nhân thông qua những 
              sản phẩm thời trang chất lượng cao, với mức giá phù hợp và dịch vụ tận tâm."
            </p>
            
            <div className="flex items-center justify-center gap-8 text-white/90">
              <div className="text-center">
                <div className="text-3xl font-bold mb-1">4+</div>
                <div className="text-sm">Năm kinh nghiệm</div>
              </div>
              <div className="w-px h-12 bg-white/30"></div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-1">10K+</div>
                <div className="text-sm">Khách hàng</div>
              </div>
              <div className="w-px h-12 bg-white/30"></div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-1">50+</div>
                <div className="text-sm">Đối tác</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
