import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Clock, User, ArrowLeft, Share2, Heart, Bookmark, Facebook, Twitter, Link as LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

const BlogArticlePage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [loadedImages, setLoadedImages] = useState({});
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [likeCount, setLikeCount] = useState(127);

  const handleImageLoad = (key) => {
    setLoadedImages(prev => ({ ...prev, [key]: true }));
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
    toast.success(isLiked ? 'Đã bỏ thích bài viết' : 'Đã thích bài viết');
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    toast.success(isBookmarked ? 'Đã bỏ lưu bài viết' : 'Đã lưu bài viết');
  };

  const handleShare = (platform) => {
    toast.success(`Đã sao chép link chia sẻ`);
  };

  // Mock article data
  const article = {
    title: "10 Xu Hướng Thời Trang 2024 Không Thể Bỏ Lỡ",
    excerpt: "Khám phá những xu hướng thời trang hot nhất năm 2024 từ các sàn diễn hàng đầu thế giới",
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&h=600&fit=crop",
    author: "Mai Linh",
    authorImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
    date: "2024-01-15",
    readTime: "5 phút đọc",
    tags: ["Xu hướng", "Thời trang 2024", "Street Style"],
    content: `
      <p class="lead">Năm 2024 hứa hẹn sẽ là một năm đầy sôi động trong làng thời trang với sự trở lại của nhiều xu hướng vintage kết hợp với những phong cách hiện đại.</p>
      
      <h2>1. Màu Pastel Nhẹ Nhàng</h2>
      <p>Các tông màu pastel như hồng phấn, xanh mint, tím lavender đang thống trị các bộ sưu tập mùa xuân. Đây là sự lựa chọn hoàn hảo cho những ai yêu thích phong cách nữ tính và nhẹ nhàng.</p>
      
      <h2>2. Oversized Everything</h2>
      <p>Xu hướng oversized tiếp tục phát triển mạnh mẽ với áo blazer rộng, quần baggy và áo len oversize. Phong cách này không chỉ thoải mái mà còn rất thời thượng.</p>
      
      <h2>3. Họa Tiết Vintage</h2>
      <p>Các họa tiết từ những năm 70-80 như kẻ sọc, hoa cúc, và paisley đang quay trở lại mạnh mẽ. Kết hợp với các item hiện đại, bạn sẽ có một outfit vừa retro vừa trendy.</p>
      
      <h2>4. Sustainable Fashion</h2>
      <p>Thời trang bền vững không còn là xu hướng mà đã trở thành tiêu chuẩn. Các thương hiệu đang chuyển sang sử dụng vật liệu thân thiện với môi trường và quy trình sản xuất có trách nhiệm.</p>
      
      <h2>5. Phụ Kiện Statement</h2>
      <p>Túi xách to bản, kính mát oversized, và trang sức chunky đang là must-have items. Một chiếc phụ kiện statement có thể biến một outfit đơn giản thành nổi bật.</p>
    `
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Back Button - Sticky */}
      <div className="sticky top-20 z-40 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/blog')}
            className="inline-flex items-center gap-2 hover:gap-3 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Về trang blog</span>
          </Button>
        </div>
      </div>

      {/* Hero Image - Optimized loading */}
      <div className="relative w-full h-[50vh] lg:h-[60vh] overflow-hidden bg-muted">
        {!loadedImages['hero'] && (
          <Skeleton className="absolute inset-0 w-full h-full" />
        )}
        <img
          src={article.image}
          alt={article.title}
          loading="eager"
          onLoad={() => handleImageLoad('hero')}
          className={`w-full h-full object-cover transition-all duration-700 ${
            loadedImages['hero'] ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
        
        {/* Floating tags */}
        <div className="absolute bottom-8 left-0 right-0">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap gap-2">
              {article.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-4 py-2 bg-white/90 backdrop-blur-sm text-foreground text-sm font-medium rounded-full border border-white/20"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Article Content */}
      <div className="container mx-auto px-4 -mt-20 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Article Header Card */}
          <div className="bg-background rounded-3xl shadow-2xl p-8 lg:p-12 mb-8 border border-border animate-fade-in">
            <h1 className="text-3xl lg:text-5xl font-bold text-foreground mb-6 leading-tight">
              {article.title}
            </h1>
            
            <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed mb-8">
              {article.excerpt}
            </p>

            {/* Author Info & Actions */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-8 border-b border-border">
              <div className="flex items-center gap-4">
                <div className="relative">
                  {!loadedImages['author'] && (
                    <Skeleton className="w-14 h-14 rounded-full" />
                  )}
                  <img
                    src={article.authorImage}
                    alt={article.author}
                    loading="lazy"
                    onLoad={() => handleImageLoad('author')}
                    className={`w-14 h-14 rounded-full object-cover border-2 border-pink-200 transition-opacity duration-500 ${
                      loadedImages['author'] ? 'opacity-100' : 'opacity-0'
                    }`}
                  />
                </div>
                
                <div>
                  <div className="font-semibold text-foreground mb-1">{article.author}</div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(article.date).toLocaleDateString('vi-VN')}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      <span>{article.readTime}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleLike}
                  className={`transition-all ${isLiked ? 'text-pink-600 border-pink-600 bg-pink-50' : ''}`}
                >
                  <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                </Button>
                <span className="text-sm font-medium text-muted-foreground">{likeCount}</span>
                
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleBookmark}
                  className={`transition-all ${isBookmarked ? 'text-purple-600 border-purple-600 bg-purple-50' : ''}`}
                >
                  <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
                </Button>
                
                <div className="relative group">
                  <Button variant="outline" size="icon">
                    <Share2 className="w-5 h-5" />
                  </Button>
                  
                  {/* Share Dropdown */}
                  <div className="absolute right-0 top-full mt-2 bg-background border border-border rounded-xl shadow-xl p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 min-w-[180px]">
                    <button
                      onClick={() => handleShare('facebook')}
                      className="flex items-center gap-3 w-full px-4 py-2 hover:bg-muted rounded-lg transition-colors"
                    >
                      <Facebook className="w-4 h-4 text-blue-600" />
                      <span className="text-sm">Facebook</span>
                    </button>
                    <button
                      onClick={() => handleShare('twitter')}
                      className="flex items-center gap-3 w-full px-4 py-2 hover:bg-muted rounded-lg transition-colors"
                    >
                      <Twitter className="w-4 h-4 text-sky-500" />
                      <span className="text-sm">Twitter</span>
                    </button>
                    <button
                      onClick={() => handleShare('copy')}
                      className="flex items-center gap-3 w-full px-4 py-2 hover:bg-muted rounded-lg transition-colors"
                    >
                      <LinkIcon className="w-4 h-4 text-gray-600" />
                      <span className="text-sm">Sao chép link</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Article Body */}
          <div className="bg-background rounded-3xl shadow-lg p-8 lg:p-12 mb-8 border border-border animate-fade-in" style={{ animationDelay: '100ms' }}>
            <div 
              className="prose prose-lg max-w-none
                prose-headings:font-bold prose-headings:text-foreground
                prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-6 prose-h2:pb-3 prose-h2:border-b prose-h2:border-border
                prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:mb-6
                prose-p:first-of-type:text-lg prose-p:first-of-type:text-foreground
                prose-a:text-pink-600 prose-a:no-underline hover:prose-a:underline
                prose-strong:text-foreground prose-strong:font-semibold
                prose-ul:text-muted-foreground prose-ul:my-6
                prose-li:my-2"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          </div>

          {/* Author Bio */}
          <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-3xl p-8 lg:p-10 border border-pink-200/50 animate-fade-in" style={{ animationDelay: '200ms' }}>
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="relative">
                {!loadedImages['author-bio'] && (
                  <Skeleton className="w-24 h-24 rounded-full" />
                )}
                <img
                  src={article.authorImage}
                  alt={article.author}
                  loading="lazy"
                  onLoad={() => handleImageLoad('author-bio')}
                  className={`w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg transition-opacity duration-500 ${
                    loadedImages['author-bio'] ? 'opacity-100' : 'opacity-0'
                  }`}
                />
              </div>
              
              <div className="flex-1 text-center sm:text-left">
                <h3 className="text-xl font-bold text-foreground mb-2">
                  Về tác giả: {article.author}
                </h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Fashion blogger với hơn 5 năm kinh nghiệm trong ngành thời trang. 
                  Đam mê chia sẻ những xu hướng mới và bí quyết phối đồ cho phái đẹp.
                </p>
                <Button variant="outline" className="border-pink-600 text-pink-600 hover:bg-pink-50">
                  Xem thêm bài viết
                </Button>
              </div>
            </div>
          </div>

          {/* Related Articles Placeholder */}
          <div className="mt-16 mb-8 animate-fade-in" style={{ animationDelay: '300ms' }}>
            <h3 className="text-2xl font-bold text-foreground mb-6">Bài viết liên quan</h3>
            <div className="grid md:grid-cols-2 gap-6">
              {[1, 2].map((i) => (
                <div key={i} className="bg-muted rounded-2xl p-6 text-center">
                  <p className="text-muted-foreground">Bài viết liên quan sẽ được hiển thị ở đây</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogArticlePage;
