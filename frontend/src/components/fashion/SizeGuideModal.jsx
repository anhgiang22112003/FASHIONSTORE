import React from 'react';
import { createPortal } from 'react-dom';
import { X, Ruler } from 'lucide-react';

const SizeGuideModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const sizeData = [
    { size: 'S', weight: '40 - 47 kg', height: '1m50 - 1m55', bust: '80 - 84 cm', waist: '62 - 66 cm', hips: '86 - 90 cm' },
    { size: 'M', weight: '48 - 54 kg', height: '1m56 - 1m60', bust: '85 - 88 cm', waist: '67 - 70 cm', hips: '91 - 94 cm' },
    { size: 'L', weight: '55 - 60 kg', height: '1m61 - 1m65', bust: '89 - 92 cm', waist: '71 - 74 cm', hips: '95 - 98 cm' },
    { size: 'XL', weight: '61 - 68 kg', height: '1m66 - 1m70', bust: '93 - 96 cm', waist: '75 - 78 cm', hips: '99 - 102 cm' },
  ];

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 bg-gradient-to-r from-pink-500 to-purple-600 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <Ruler className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Bảng quy đổi kích cỡ (Size Guide)</h3>
              <p className="text-xs opacity-90">Hướng dẫn chọn size chuẩn cho thời trang PinkFashion</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Table */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          <div className="overflow-x-auto rounded-xl border border-pink-100 shadow-sm">
            <table className="w-full text-sm text-left">
              <thead className="bg-pink-50 text-pink-700 font-bold uppercase text-xs">
                <tr>
                  <th className="p-3.5 text-center">Size</th>
                  <th className="p-3.5">Cân nặng</th>
                  <th className="p-3.5">Chiều cao</th>
                  <th className="p-3.5">Vòng ngực</th>
                  <th className="p-3.5">Vòng eo</th>
                  <th className="p-3.5">Vòng mông</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sizeData.map((row, i) => (
                  <tr key={i} className="hover:bg-pink-50/40 transition-colors">
                    <td className="p-3.5 font-bold text-pink-600 text-center bg-pink-50/20">{row.size}</td>
                    <td className="p-3.5 font-medium">{row.weight}</td>
                    <td className="p-3.5 text-gray-600">{row.height}</td>
                    <td className="p-3.5 text-gray-600">{row.bust}</td>
                    <td className="p-3.5 text-gray-600">{row.waist}</td>
                    <td className="p-3.5 text-gray-600">{row.hips}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-purple-50/60 p-4 rounded-xl border border-purple-100 text-xs text-purple-900 space-y-1">
            <p className="font-bold text-sm">💡 Lời khuyên chọn size:</p>
            <p>• Nếu thông số của bạn nằm ở giữa 2 size, hãy ưu tiên chọn **size lớn hơn** để mặc thoải mái.</p>
            <p>• Bạn có thể liên hệ với đội ngũ CSKH để được tư vấn kích thước theo phom dáng chuẩn nhất.</p>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default SizeGuideModal;
