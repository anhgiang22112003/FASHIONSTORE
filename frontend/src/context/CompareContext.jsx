import React, { createContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';

export const CompareContext = createContext();

export const CompareProvider = ({ children }) => {
  const [compareList, setCompareList] = useState(() => {
    try {
      const saved = localStorage.getItem('compare_products');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [isCompareOpen, setIsCompareOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('compare_products', JSON.stringify(compareList));
    } catch (e) {}
  }, [compareList]);

  const addToCompare = (product) => {
    if (!product) return;
    const pId = product._id || product.id;
    if (compareList.some((p) => (p._id || p.id) === pId)) {
      toast.info('Sản phẩm đã có trong danh sách so sánh');
      return;
    }
    if (compareList.length >= 3) {
      toast.warning('Bạn chỉ có thể so sánh tối đa 3 sản phẩm cùng lúc');
      return;
    }
    setCompareList((prev) => [...prev, product]);
    toast.success('Đã thêm sản phẩm vào bộ so sánh ⚖️');
  };

  const removeFromCompare = (productId) => {
    setCompareList((prev) => prev.filter((p) => (p._id || p.id) !== productId));
    toast.info('Đã xóa khỏi danh sách so sánh');
  };

  const clearCompare = () => {
    setCompareList([]);
  };

  return (
    <CompareContext.Provider
      value={{
        compareList,
        addToCompare,
        removeFromCompare,
        clearCompare,
        isCompareOpen,
        setIsCompareOpen,
      }}
    >
      {children}
    </CompareContext.Provider>
  );
};
