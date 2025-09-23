// Extended mock data for product pages

export const products = [
  {
    id: 1,
    name: "Classic White Blouse",
    price: 89000,
    originalPrice: 119000,
    category: "women",
    subcategory: "blouses",
    images: [
      "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDF8MHwxfHNlYXJjaHw0fHxmYXNoaW9ufGVufDB8fHx8MTc1ODU3MzUzMXww&ixlib=rb-4.1.0&q=85",
      "https://images.unsplash.com/photo-1571513800374-df1bbe650e56?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDF8MHwxfHNlYXJjaHwzfHxmYXNoaW9ufGVufDB8fHx8MTc1ODU3MzUzMXww&ixlib=rb-4.1.0&q=85"
    ],
    description: "Áo blouse trắng cổ điển, thiết kế thanh lịch phù hợp cho môi trường công sở và dự tiệc. Chất liệu cotton cao cấp, thoáng mát và dễ chăm sóc.",
    features: [
      "Chất liệu cotton 100% cao cấp",
      "Thiết kế cổ điển, thanh lịch", 
      "Phù hợp môi trường công sở",
      "Dễ dàng phối đồ",
      "Có thể giặt máy"
    ],
    sizes: ["S", "M", "L", "XL"],
    colors: ["Trắng", "Đen", "Xám"],
    rating: 4.8,
    reviews: 124,
    inStock: true,
    featured: true
  },
  {
    id: 2,
    name: "Premium Denim Jacket",
    price: 149000,
    originalPrice: 199000,
    category: "unisex",
    subcategory: "jackets",
    images: [
      "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njl8MHwxfHNlYXJjaHwyfHxjbG90aGluZ3xlbnwwfHx8fDE3NTg1NTc0MDh8MA&ixlib=rb-4.1.0&q=85",
      "https://images.unsplash.com/photo-1562157873-818bc0726f68?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njl8MHwxfHNlYXJjaHwzfHxjbG90aGluZ3xlbnwwfHx8fDE3NTg1NTc0MDh8MA&ixlib=rb-4.1.0&q=85"
    ],
    description: "Áo khoác denim cao cấp với thiết kế hiện đại. Chất liệu denim dày dặn, bền đẹp theo thời gian. Phù hợp cho cả nam và nữ.",
    features: [
      "Chất liệu denim cao cấp",
      "Thiết kế unisex hiện đại",
      "Độ bền cao theo thời gian",
      "Phong cách casual chic",
      "Nhiều túi tiện dụng"
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Xanh đậm", "Xanh nhạt", "Đen"],
    rating: 4.9,
    reviews: 87,
    inStock: true,
    featured: true
  },
  {
    id: 3,
    name: "Elegant Maxi Dress",
    price: 129000,
    originalPrice: 179000,
    category: "women",
    subcategory: "dresses",
    images: [
      "https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg",
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDF8MHwxfHNlYXJjaHwxfHxmYXNoaW9ufGVufDB8fHx8MTc1ODU3MzUzMXww&ixlib=rb-4.1.0&q=85"
    ],
    description: "Váy maxi thanh lịch với thiết kế dài quyến rũ. Chất liệu voan mềm mại, thoải mái khi mặc. Phù hợp cho các buổi tiệc và sự kiện đặc biệt.",
    features: [
      "Chất liệu voan mềm mại",
      "Thiết kế maxi thanh lịch",
      "Phù hợp dự tiệc, sự kiện",
      "Có thể điều chỉnh size",
      "Màu sắc sang trọng"
    ],
    sizes: ["S", "M", "L"],
    colors: ["Đen", "Đỏ", "Xanh navy"],
    rating: 4.7,
    reviews: 156,
    inStock: true,
    featured: true
  },
  {
    id: 4,
    name: "Casual Cotton Tee",
    price: 39000,
    originalPrice: 55000,
    category: "unisex",
    subcategory: "tshirts",
    images: [
      "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njl8MHwxfHNlYXJjaHw0fHxjbG90aGluZ3xlbnwwfHx8fDE3NTg1NTc0MDh8MA&ixlib=rb-4.1.0&q=85",
      "https://images.pexels.com/photos/322207/pexels-photo-322207.jpeg"
    ],
    description: "Áo thun cotton casual thoải mái cho sinh hoạt hàng ngày. Chất liệu cotton 100% mềm mại, thấm hút mồ hôi tốt.",
    features: [
      "Cotton 100% tự nhiên",
      "Thấm hút mồ hôi tốt",
      "Form áo thoải mái",
      "Nhiều màu sắc lựa chọn",
      "Giá cả phải chăng"
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Trắng", "Đen", "Xám", "Navy", "Hồng"],
    rating: 4.6,
    reviews: 203,
    inStock: true,
    featured: true
  },
  // More products for different categories
  {
    id: 5,
    name: "Business Suit Pants",
    price: 159000,
    originalPrice: 199000,
    category: "men",
    subcategory: "pants",
    images: [
      "https://images.unsplash.com/photo-1594938291221-94f18cebb486?w=500&h=500&fit=crop",
      "https://images.unsplash.com/photo-1506629905607-bb8d26db1dbc?w=500&h=500&fit=crop"
    ],
    description: "Quần tây công sở nam cao cấp, thiết kế slim fit hiện đại. Chất liệu vải cao cấp, không nhăn, phù hợp môi trường làm việc chuyên nghiệp.",
    features: [
      "Chất liệu vải cao cấp không nhăn",
      "Thiết kế slim fit hiện đại",
      "Phù hợp môi trường công sở",
      "Có thể ủi dễ dàng",
      "Độ bền cao"
    ],
    sizes: ["29", "30", "31", "32", "33", "34", "36"],
    colors: ["Đen", "Xám", "Navy"],
    rating: 4.5,
    reviews: 78,
    inStock: true,
    featured: false
  },
  {
    id: 6,
    name: "Leather Handbag",  
    price: 299000,
    originalPrice: 399000,
    category: "accessories",
    subcategory: "bags",
    images: [
      "https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg",
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500&h=500&fit=crop"
    ],
    description: "Túi xách da thật cao cấp với thiết kế thanh lịch. Kích thước vừa phải, nhiều ngăn tiện dụng, phù hợp đi làm và dạo phố.",
    features: [
      "Da thật 100% cao cấp",
      "Thiết kế thanh lịch, sang trọng",
      "Nhiều ngăn tiện dụng",
      "Dây đeo có thể điều chỉnh",
      "Bảo hành 1 năm"
    ],
    sizes: ["One Size"],
    colors: ["Đen", "Nâu", "Đỏ"],
    rating: 4.8,
    reviews: 45,
    inStock: true,
    featured: false
  }
];

export const categories = {
  women: {
    name: "Thời Trang Nữ",
    subcategories: [
      { id: "dresses", name: "Váy", count: 45 },
      { id: "blouses", name: "Áo sơ mi", count: 32 },
      { id: "pants", name: "Quần", count: 28 },
      { id: "skirts", name: "Chân váy", count: 23 }
    ]
  },
  men: {
    name: "Thời Trang Nam", 
    subcategories: [
      { id: "shirts", name: "Áo sơ mi", count: 35 },
      { id: "pants", name: "Quần", count: 40 },
      { id: "tshirts", name: "Áo thun", count: 25 },
      { id: "suits", name: "Vest", count: 18 }
    ]
  },
  accessories: {
    name: "Phụ Kiện",
    subcategories: [
      { id: "bags", name: "Túi xách", count: 22 },
      { id: "shoes", name: "Giày", count: 35 },
      { id: "jewelry", name: "Trang sức", count: 15 },
      { id: "watches", name: "Đồng hồ", count: 12 }
    ]
  }
};

export const blogPosts = [
  {
    id: 1,
    title: "Xu hướng thời trang Xuân Hè 2025",
    slug: "xu-huong-thoi-trang-xuan-he-2025",
    excerpt: "Khám phá những xu hướng thời trang hot nhất trong mùa xuân hè này với màu sắc rực rỡ và chất liệu thoáng mát...",
    content: `Mùa xuân hè 2025 đang đến gần với những xu hướng thời trang đầy màu sắc và sáng tạo. Từ màu sắc rực rỡ đến chất liệu thoáng mát, tất cả đều hướng đến sự thoải mái và phong cách cá nhân.

**Xu hướng màu sắc:**
- Màu coral và hồng pastel thống trị
- Xanh mint và xanh lá tươi mát
- Vàng sunshine đầy năng lượng

**Chất liệu hot trend:**
- Linen và cotton organic
- Vải lưới và ren tinh tế
- Denim nhẹ và thoáng khí

**Kiểu dáng nổi bật:**
- Crop top và high-waist
- Maxi dress bohemian
- Wide-leg pants thoải mái`,
    image: "https://images.pexels.com/photos/794064/pexels-photo-794064.jpeg",
    author: "Minh Anh",
    date: "2025-01-15",
    readTime: "5 min",
    tags: ["xu hướng", "mùa hè", "màu sắc"]
  },
  {
    id: 2,
    title: "Cách phối đồ công sở chuyên nghiệp cho phái nữ",
    slug: "phoi-do-cong-so-chuyen-nghiep",
    excerpt: "Bí quyết tạo nên phong cách công sở ấn tượng và chuyên nghiệp mà vẫn thể hiện được cá tính riêng...",
    content: `Phong cách công sở không còn đơn điệu và cứng nhắc như trước. Hãy cùng khám phá cách phối đồ công sở vừa chuyên nghiệp vừa thời trang.

**Nguyên tắc vàng:**
1. Lựa chọn trang phục phù hợp với môi trường làm việc
2. Đầu tư vào những item cơ bản chất lượng cao
3. Phối màu hài hòa và không quá 3 màu
4. Chú ý đến chi tiết và accessories

**Outfit suggestions:**
- Blazer + quần tây + giày oxford
- Áo sơ mi + chân váy bút chì + túi tote
- Váy shift dress + cardigan + giày mũi nhọn

**Phụ kiện quan trọng:**
- Túi xách công sở chất lượng
- Giày cao gót 3-5cm thoải mái  
- Đồng hồ đeo tay thanh lịch`,
    image: "https://images.unsplash.com/photo-1688561808434-886a6dd97b8c?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1ODF8MHwxfHNlYXJjaHwyfHxlY29tbWVyY2V8ZW58MHx8fHwxNzU4NjUzODEwfDA&ixlib=rb-4.1.0&q=85",
    author: "Thanh Hương",
    date: "2025-01-12", 
    readTime: "7 min",
    tags: ["công sở", "phối đồ", "chuyên nghiệp"]
  },
  {
    id: 3,
    title: "Chăm sóc và bảo quản quần áo đúng cách",
    slug: "cham-soc-bao-quan-quan-ao",
    excerpt: "Hướng dẫn chi tiết cách chăm sóc và bảo quản quần áo để giữ được chất lượng và độ bền lâu dài...",
    content: `Việc chăm sóc quần áo đúng cách không chỉ giúp trang phục luôn đẹp mà còn kéo dài tuổi thọ của chúng.

**Cách giặt quần áo:**
- Phân loại theo màu sắc và chất liệu
- Kiểm tra nhãn hướng dẫn giặt
- Sử dụng nước giặt phù hợp
- Không giặt quá nhiều lần không cần thiết

**Bảo quản đúng cách:**
- Treo hoặc gấp quần áo gọn gàng
- Sử dụng móc treo phù hợp
- Bảo quản trong tủ quần áo khô ráo
- Sử dụng túi chống ẩm

**Mẹo nhỏ hữu ích:**
- Ủi ở nhiệt độ phù hợp
- Loại bỏ vết bẩn ngay lập tức
- Luân phiên sử dụng để tránh hao mòn`,
    image: "https://images.pexels.com/photos/230544/pexels-photo-230544.jpeg",
    author: "Quốc Dũng",
    date: "2025-01-10",
    readTime: "4 min", 
    tags: ["chăm sóc", "bảo quản", "mẹo hay"]
  }
];