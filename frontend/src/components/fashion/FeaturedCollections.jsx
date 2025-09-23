import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from '../ui/button';
import { featuredCollections } from '../../data/fashionMock';

const FeaturedCollections = () => {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Bộ Sưu Tập Nổi Bật
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Khám phá những bộ sưu tập mới nhất với thiết kế tinh tế và chất lượng cao
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredCollections.map((collection) => (
            <div
              key={collection.id}
              className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
            >
              <div className="aspect-[4/5] overflow-hidden">
                <img
                  src={collection.image}
                  alt={collection.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
              
              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <h3 className="text-2xl font-bold mb-2">{collection.name}</h3>
                <p className="text-gray-200 mb-4">{collection.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-semibold">{collection.price}</span>
                  <Button
                    size="sm"
                    className="bg-white text-gray-900 hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    Xem thêm
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button variant="outline" size="lg" className="border-pink-500 text-pink-500 hover:bg-pink-50">
            Xem tất cả bộ sưu tập
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedCollections;