import React from 'react';
import { mockBrowseCategories } from '../data/mock';

const SearchView = ({ searchQuery }) => {
  const filteredCategories = searchQuery 
    ? mockBrowseCategories.filter(category => 
        category.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : mockBrowseCategories;

  return (
    <div className="bg-gradient-to-b from-gray-900 to-black min-h-full">
      <div className="px-6 py-8">
        {!searchQuery ? (
          <>
            <h1 className="text-white text-2xl font-bold mb-6">Browse all</h1>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {mockBrowseCategories.map((category) => (
                <div
                  key={category.id}
                  className={`relative bg-gradient-to-br ${category.color} rounded-lg p-4 h-32 overflow-hidden cursor-pointer hover:scale-105 transition-transform`}
                >
                  <h3 className="text-white text-xl font-bold mb-2">{category.title}</h3>
                  <div className="absolute -bottom-2 -right-2 w-20 h-20 transform rotate-12">
                    <img
                      src={category.image}
                      alt={category.title}
                      className="w-full h-full object-cover rounded-lg shadow-lg"
                    />
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <h1 className="text-white text-2xl font-bold mb-6">
              Search results for "{searchQuery}"
            </h1>
            {filteredCategories.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredCategories.map((category) => (
                  <div
                    key={category.id}
                    className={`relative bg-gradient-to-br ${category.color} rounded-lg p-4 h-32 overflow-hidden cursor-pointer hover:scale-105 transition-transform`}
                  >
                    <h3 className="text-white text-xl font-bold mb-2">{category.title}</h3>
                    <div className="absolute -bottom-2 -right-2 w-20 h-20 transform rotate-12">
                      <img
                        src={category.image}
                        alt={category.title}
                        className="w-full h-full object-cover rounded-lg shadow-lg"
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-400 text-lg">No results found for "{searchQuery}"</p>
                <p className="text-gray-500 text-sm mt-2">Try searching for something else</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SearchView;