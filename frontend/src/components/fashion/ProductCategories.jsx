import api from '@/service/api'
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Pagination, Navigation, Autoplay } from 'swiper/modules'
import { Sparkles, ArrowRight } from 'lucide-react'
import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/navigation'

const ProductCategories = () => {
    const [category, setCategory] = useState([])

    const Category = async () => {
        try {
            const response = await api.get('/categories')
            const activeCategories = response?.data?.data.filter(item => item.isActive)
            setCategory(activeCategories)
        } catch (error) {
            console.error('Error fetching product categories:', error)
        }
    }

    useEffect(() => {
        Category()
    }, [])

    return (
        <section className="py-20 bg-gradient-to-br from-pink-100 via-pink-50 to-white relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-20 left-10 w-72 h-72 bg-pink-200/40 rounded-full blur-3xl animate-float"></div>
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-200/40 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }}></div>
            
            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-16 animate-slide-up">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full border border-pink-300 mb-4 shadow-lg">
                        <Sparkles className="w-4 h-4 text-pink-500 animate-pulse" />
                        <span className="text-sm font-bold text-black">CATEGORIES</span>
                    </div>
                    <h2 className="text-4xl lg:text-6xl font-black mb-6 text-black">
                        Danh Mục <span className="bg-gradient-to-r from-pink-400 to-pink-600 bg-clip-text text-transparent">Sản Phẩm</span>
                    </h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Tìm kiếm sản phẩm theo từng danh mục phù hợp với nhu cầu của bạn
                    </p>
                </div>

                <div className="relative">
                    <Swiper
                        modules={[Pagination, Navigation, Autoplay]}
                        autoplay={{
                            delay: 3000,
                            disableOnInteraction: false,
                            pauseOnMouseEnter: true,
                        }}
                        navigation={true}
                        pagination={{ 
                            clickable: true,
                            dynamicBullets: true 
                        }}
                        slidesPerView={2}
                        spaceBetween={24}
                        breakpoints={{
                            640: { slidesPerView: 3 },
                            1024: { slidesPerView: 4 },
                        }}
                        className="pb-16"
                    >
                        {category?.map((category, index) => (
                            <SwiperSlide key={category?.id}>
                                <Link to={`/category/${category?.slug || 'category'}`}>
                                    <div className="group relative overflow-hidden rounded-3xl bg-white shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer">
                                        <div className="aspect-[4/3] overflow-hidden relative">
                                            <img
                                                src={category?.image}
                                                alt={category?.name}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            />
                                            
                                            {/* Gradient overlay */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent group-hover:from-pink-600/80 group-hover:via-pink-500/30 transition-all duration-500"></div>
                                            
                                            {/* Shine effect */}
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                                        </div>
                                        
                                        <div className="absolute bottom-0 left-0 right-0 p-6 text-white transform transition-all duration-300">
                                            <h3 className="text-2xl font-black mb-2 truncate drop-shadow-lg">
                                                {category?.name}
                                            </h3>
                                            <div className="flex items-center justify-between">
                                                <p className="text-white/90 font-bold text-sm">
                                                    {category?.productCount || 0} sản phẩm
                                                </p>
                                                <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                                                    <ArrowRight className="w-5 h-5 text-black" />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Corner decoration */}
                                        <div className="absolute top-0 left-0 w-20 h-20 bg-pink-400/20 rounded-br-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                    </div>
                                </Link>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>
            </div>
        </section>
    )
}

export default ProductCategories
