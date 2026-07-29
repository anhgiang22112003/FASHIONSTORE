import React, { useState } from 'react';
import { Switch } from '@headlessui/react';
import { PageHeader, AdminButton, AdminInput, AdminCard } from "components/admin/ui";

const Settings = () => {
  const [activeTab, setActiveTab] = useState('general');

  // State for toggles
  const [codEnabled, setCodEnabled] = useState(true);
  const [bankTransferEnabled, setBankTransferEnabled] = useState(true);
  const [momoEnabled, setMomoEnabled] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className="space-y-6">
            {/* Store Information */}
            <AdminCard title="Thông tin cửa hàng" variant="default">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AdminInput
                  label="Tên cửa hàng"
                  defaultValue="PinkFashion"
                  type="text"
                />
                <AdminInput
                  label="Email liên hệ"
                  defaultValue="contact@pinkfashion.com"
                  type="email"
                />
                <AdminInput
                  label="Số điện thoại"
                  defaultValue="0123 456 789"
                  type="tel"
                />
                <AdminInput
                  label="Địa chỉ"
                  defaultValue="123 Đường ABC, Quận 1, TP.HCM"
                  type="text"
                />
              </div>
              <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800 mt-4">
                <AdminButton variant="primary">
                  Lưu thay đổi
                </AdminButton>
              </div>
            </AdminCard>

            {/* Payment and Shipping Settings */}
            <AdminCard title="Cài đặt phương thức thanh toán" variant="default">
              <div className="space-y-6">
                <div className="space-y-4 divide-y divide-slate-100 dark:divide-slate-800">
                  {/* COD */}
                  <div className="flex items-center justify-between pt-4 first:pt-0">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-xl">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                      </div>
                      <div>
                        <span className="font-bold text-sm text-slate-700 dark:text-slate-200 block">Thanh toán khi nhận hàng (COD)</span>
                        <span className="text-[11px] text-slate-400 dark:text-slate-500">Khách hàng trả tiền mặt cho shipper khi giao nhận sản phẩm.</span>
                      </div>
                    </div>
                    <Switch
                      checked={codEnabled}
                      onChange={setCodEnabled}
                      className={`${codEnabled ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'
                        } relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
                    >
                      <span
                        className={`${codEnabled ? 'translate-x-6' : 'translate-x-1'
                          } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                      />
                    </Switch>
                  </div>

                  {/* Bank Transfer */}
                  <div className="flex items-center justify-between pt-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-xl">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
                      </div>
                      <div>
                        <span className="font-bold text-sm text-slate-700 dark:text-slate-200 block">Chuyển khoản ngân hàng</span>
                        <span className="text-[11px] text-slate-400 dark:text-slate-500">Hiển thị mã QR ngân hàng động tự tạo để chuyển tiền nhanh.</span>
                      </div>
                    </div>
                    <Switch
                      checked={bankTransferEnabled}
                      onChange={setBankTransferEnabled}
                      className={`${bankTransferEnabled ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'
                        } relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
                    >
                      <span
                        className={`${bankTransferEnabled ? 'translate-x-6' : 'translate-x-1'
                          } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                      />
                    </Switch>
                  </div>

                  {/* MoMo */}
                  <div className="flex items-center justify-between pt-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-xl">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
                      </div>
                      <div>
                        <span className="font-bold text-sm text-slate-700 dark:text-slate-200 block">Ví điện tử MoMo</span>
                        <span className="text-[11px] text-slate-400 dark:text-slate-500">Liên kết cổng thanh toán trực tiếp qua ví điện tử MoMo.</span>
                      </div>
                    </div>
                    <Switch
                      checked={momoEnabled}
                      onChange={setMomoEnabled}
                      className={`${momoEnabled ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'
                        } relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
                    >
                      <span
                        className={`${momoEnabled ? 'translate-x-6' : 'translate-x-1'
                          } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                      />
                    </Switch>
                  </div>
                </div>

                <div className="border-t border-slate-100 dark:border-slate-800 pt-6">
                  <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-4">Cài đặt vận chuyển</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <AdminInput
                      label="Phí vận chuyển cố định"
                      defaultValue="30000"
                      type="number"
                    />
                    <AdminInput
                      label="Miễn phí vận chuyển từ"
                      defaultValue="500000"
                      type="number"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
                  <AdminButton variant="primary">
                    Lưu cài đặt
                  </AdminButton>
                </div>
              </div>
            </AdminCard>
          </div>
        );
      case 'email':
        return (
          <AdminCard title="Cài đặt cấu hình SMTP Email" variant="default">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AdminInput
                label="Email quản trị gửi tin"
                defaultValue="admin@pinkfashion.com"
                type="email"
              />
              <AdminInput
                label="Mật khẩu ứng dụng Email"
                defaultValue="••••••••"
                type="password"
              />
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800 mt-4">
              <AdminButton variant="secondary">
                Hủy bỏ
              </AdminButton>
              <AdminButton variant="primary">
                Lưu cấu hình
              </AdminButton>
            </div>
          </AdminCard>
        );
      case 'password':
        return (
          <AdminCard title="Đổi mật khẩu tài khoản" variant="default">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AdminInput
                label="Mật khẩu hiện tại"
                type="password"
              />
              <AdminInput
                label="Mật khẩu mới"
                type="password"
              />
              <div className="md:col-span-2">
                <AdminInput
                  label="Nhập lại mật khẩu mới"
                  type="password"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800 mt-4">
              <AdminButton variant="secondary">
                Hủy bỏ
              </AdminButton>
              <AdminButton variant="primary">
                Đổi mật khẩu
              </AdminButton>
            </div>
          </AdminCard>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-6 bg-slate-50 dark:bg-slate-950 min-h-screen">
      <PageHeader
        title="Cài đặt hệ thống"
        description="Quản lý cấu hình cửa hàng, phương thức thanh toán, phí vận chuyển và tài khoản cá nhân."
      />

      {/* Tabs */}
      <div className="flex gap-2 mb-6 bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 w-max">
        <button
          onClick={() => setActiveTab('general')}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all ${
            activeTab === 'general' ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          Thông tin chung
        </button>
        <button
          onClick={() => setActiveTab('email')}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all ${
            activeTab === 'email' ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          Cấu hình Email (SMTP)
        </button>
        <button
          onClick={() => setActiveTab('password')}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all ${
            activeTab === 'password' ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          Đổi mật khẩu
        </button>
      </div>

      {/* Content based on active tab */}
      <div className="animate-in fade-in duration-200">
        {renderContent()}
      </div>
    </div>
  );
};

export default Settings;