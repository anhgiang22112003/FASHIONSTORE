import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const Breadcrumb = ({ items = [] }) => {
  return (
    <nav className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 py-3 px-4 sm:px-0 overflow-x-auto whitespace-nowrap scrollbar-none">
      <Link
        to="/"
        className="flex items-center gap-1 hover:text-pink-600 transition-colors font-medium text-gray-600"
      >
        <Home className="w-3.5 h-3.5" />
        <span>Trang chủ</span>
      </Link>

      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <React.Fragment key={index}>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            {isLast || !item.path ? (
              <span className="font-semibold text-pink-600 truncate max-w-[200px] sm:max-w-xs">
                {item.label}
              </span>
            ) : (
              <Link
                to={item.path}
                className="hover:text-pink-600 transition-colors font-medium text-gray-600"
              >
                {item.label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default Breadcrumb;
