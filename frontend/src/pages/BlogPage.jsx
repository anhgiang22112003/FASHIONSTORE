import React, { useState } from 'react';
import { Calendar, Clock, User, ArrowRight, TrendingUp, BookOpen, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from 'components/ui/skeleton';
import { Button } from 'components/ui/button';
import { Input } from 'components/ui/input';
import { toast } from 'react-toastify';

const BlogPage = () => {
  const navigate = useNavigate();
  const [loadedImages, setLoadedImages] = useState({});
  const [email, setEmail] = useState('');

  const handleImageLoad = (key) => {
    setLoadedImages(prev => ({ ...prev, [key]: true }));
  };

  const blogPosts = [
    {
      id: 1,
      slug: "xu-huong-thoi-trang-2024",
      title: "10 Xu Hướng Thời Trang 2024 Không Thể Bỏ Lỡ",
      excerpt: "Khám phá những xu hướng thời trang hot nhất năm 2024 từ các sàn diễn hàng đầu thế giới. Từ màu sắc pastel đến họa tiết vintage...",
      image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&h=600&fit=crop",
      author: "Mai Linh",
      date: "2024-01-15",
      readTime: "5 phút đọc",
      tags: ["Xu hướng", "Thời trang 2024"]
    },
    {
      id: 2,
      slug: "phoi-do-cong-so",
      title: "Bí Quyết Phối Đồ Công Sở Thanh Lịch và Chuyên Nghiệp",
      excerpt: "Hướng dẫn chi tiết cách mix & match trang phục công sở để luôn tự tin và nổi bật tại nơi làm việc...",
      image: "https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=800&h=600&fit=crop",
      author: "Thu Hà",
      date: "2024-01-10",
      readTime: "7 phút đọc",
      tags: ["Công sở", "Phối đồ"]
    },
    {
      id: 3,
      slug: "chon-ao-theo-dang-nguoi",
      title: "Cách Chọn Áo Phù Hợp Với Từng Dáng Người",
      excerpt: "Mỗi dáng người đều có những điểm mạnh riêng. Học cách chọn áo để tôn lên ưu điểm và che khuyết điểm...",
      image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&h=600&fit=crop",
      author: "Minh Anh",
      date: "2024-01-05",
      readTime: "6 phút đọc",
      tags: ["Hướng dẫn", "Styling"]
    }
  ];

  const featuredPost = blogPosts[0];
  const otherPosts = blogPosts.slice(1);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      toast.success('Đăng ký thành công! Chúng tôi sẽ gửi bài viết mới đến ' + email + ' 💌');
      setEmail('');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section - Optimized */}
      <section className="relative bg-gradient-to-br from-pink-50 via-purple-50 to-background py-20 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyMzYsMTI2LDE3NywwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40"></div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-3xl mx-auto animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-pink-100 text-pink-600 rounded-full text-sm font-medium mb-6">
              <BookOpen className="w-4 h-4" />
              <span>Blog Thời Trang</span>
            </div>
            
            <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6">
              Blog Thời Trang
            </h1>
            
            <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed">
              Khám phá những xu hướng mới nhất, mẹo phối đồ và bí quyết thời trang
              từ các chuyên gia hàng đầu
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16 lg:py-20">
        {/* Featured Post - Enhanced with loading */}
        <div className="mb-20">
          <div className="flex items-center gap-2 mb-8 animate-fade-in">
            <TrendingUp className="w-5 h-5 text-pink-600" />
            <h2 className="text-2xl font-bold text-foreground">Bài viết nổi bật</h2>
          </div>
          
          <div className="group bg-background rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-border hover:border-pink-200 animate-fade-in">
            <div className="grid lg:grid-cols-2 gap-0">
              {/* Image with loading state */}
              <div className="relative aspect-[16/10] lg:aspect-auto overflow-hidden bg-muted">
                {!loadedImages['featured'] && (
                  <Skeleton className="absolute inset-0 w-full h-full" />
                )}
                <img
                  src={featuredPost.image}
                  alt={featuredPost.title}
                  loading="eager"
                  onLoad={() => handleImageLoad('featured')}
                  className={`w-full h-full object-cover transition-all duration-700 ${
                    loadedImages['featured'] ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                  } group-hover:scale-110`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              
              {/* Content */}
              <div className="p-8 lg:p-12 flex flex-col justify-center">
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
                  <div className="flex items-center gap-2 bg-muted px-3 py-1.5 rounded-full">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(featuredPost.date).toLocaleDateString('vi-VN')}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-muted px-3 py-1.5 rounded-full">
                    <Clock className="w-4 h-4" />
                    <span>{featuredPost.readTime}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-muted px-3 py-1.5 rounded-full">
                    <User className="w-4 h-4" />
                    <span>{featuredPost.author}</span>
                  </div>
                </div>
                
                <h3 className="text-2xl lg:text-3xl font-bold text-foreground mb-4 group-hover:text-pink-600 transition-colors line-clamp-2">
                  {featuredPost.title}
                </h3>
                
                <p className="text-muted-foreground leading-relaxed mb-6 line-clamp-3">
                  {featuredPost.excerpt}
                </p>

                <div className="flex items-center gap-3 mb-8">
                  {featuredPost.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-4 py-1.5 bg-gradient-to-r from-pink-100 to-purple-100 text-pink-600 text-sm font-medium rounded-full border border-pink-200"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                <Button
                  onClick={() => navigate(`/blog/${featuredPost.slug}`)}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold w-fit group/btn"
                >
                  Đọc tiếp
                  <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Other Posts - Grid with staggered animation */}
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-8 animate-fade-in">
            Bài viết khác
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8 lg:gap-10">
            {otherPosts.map((post, index) => (
              <article
                key={post.id}
                className="group bg-background rounded-2xl shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden border border-border hover:border-pink-200 cursor-pointer animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
                onClick={() => navigate(`/blog/${post.slug}`)}
              >
                {/* Image with loading */}
                <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                  {!loadedImages[`post-${post.id}`] && (
                    <Skeleton className="absolute inset-0 w-full h-full" />
                  )}
                  <img
                    src={post.image}
                    alt={post.title}
                    loading="lazy"
                    onLoad={() => handleImageLoad(`post-${post.id}`)}
                    className={`w-full h-full object-cover transition-all duration-700 ${
                      loadedImages[`post-${post.id}`] ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                    } group-hover:scale-110`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                
                {/* Content */}
                <div className="p-6 lg:p-8">
                  <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(post.date).toLocaleDateString('vi-VN')}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      <span>{post.readTime}</span>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-pink-600 transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  
                  <p className="text-muted-foreground leading-relaxed mb-6 line-clamp-3">
                    {post.excerpt}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-sm font-medium text-foreground">{post.author}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {post.tags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1 bg-muted text-muted-foreground text-xs font-medium rounded-full"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* Newsletter Subscription - Enhanced */}
        <div className="mt-20 relative overflow-hidden rounded-3xl animate-fade-in" style={{ animationDelay: '400ms' }}>
          <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-600 to-pink-500"></div>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>
          
          <div className="relative z-10 p-12 lg:p-16 text-center text-white">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl mb-6">
              <Mail className="w-8 h-8 text-white" />
            </div>
            
            <h3 className="text-2xl lg:text-3xl font-bold mb-4">
              Đăng ký nhận bài viết mới
            </h3>
            <p className="text-lg mb-8 opacity-95 max-w-2xl mx-auto">
              Nhận thông báo về những bài viết mới nhất về thời trang và xu hướng
            </p>
            
            <form onSubmit={handleSubscribe} className="max-w-md mx-auto">
              <div className="flex gap-3">
                <Input
                  type="email"
                  placeholder="Nhập email của bạn..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 bg-white/95 backdrop-blur-sm border-white/20 text-foreground placeholder:text-muted-foreground h-12"
                  required
                />
                <Button 
                  type="submit"
                  className="bg-white text-pink-600 hover:bg-white/90 font-semibold px-8 h-12 shadow-lg hover:shadow-xl transition-all"
                >
                  Đăng ký
                </Button>
              </div>
            </form>
            
            <p className="text-sm text-white/70 mt-4">
              Không spam, chỉ những nội dung chất lượng cao 💌
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogPage;
