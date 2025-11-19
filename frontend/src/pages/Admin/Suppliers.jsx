import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Filter, Plus, Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import apiAdmin from '@/service/apiAdmin';
import Switch from '@/components/ui/switch'

const Suppliers = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editSupplier, setEditSupplier] = useState(null);
  const [isNewSupplierActive, setIsNewSupplierActive] = useState(true);
  const [name, setName] = useState('');
  const [contactName, setContactName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedWard, setSelectedWard] = useState('');
  const [suppliers, setSuppliers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [filterName, setFilterName] = useState('');
  const [filterPhone, setFilterPhone] = useState('');
  const [filterEmail, setFilterEmail] = useState('');
  const [filterActive, setFilterActive] = useState('all');
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [debouncedFilterName, setDebouncedFilterName] = useState(filterName);
  const [debouncedFilterPhone, setDebouncedFilterPhone] = useState(filterPhone);
  const [debouncedFilterEmail, setDebouncedFilterEmail] = useState(filterEmail);
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const limit = 10;

  // Load provinces data
  useEffect(() => {
    import('@/data/provinces.json').then((data) => setProvinces(data.default));
  }, []);

  // Update districts when province changes
  useEffect(() => {
    if (selectedProvince && provinces.length > 0) {
      const province = provinces.find((p) => p.name === selectedProvince);
      if (province && province.districts) {
        setDistricts(province.districts);
        // Giữ district và ward nếu đang edit và có dữ liệu
        if (!editSupplier) {
          setSelectedDistrict('');
          setSelectedWard('');
          setWards([]);
        }
      }
    } else if (!selectedProvince) {
      setDistricts([]);
      setSelectedDistrict('');
      setWards([]);
      setSelectedWard('');
    }
  }, [selectedProvince, provinces]);

  // Update wards when district changes
  useEffect(() => {
    if (selectedDistrict && districts.length > 0) {
      const district = districts.find((d) => d.name === selectedDistrict);
      if (district && district.wards) {
        setWards(district.wards);
        // Giữ ward nếu đang edit và có dữ liệu
        if (!editSupplier) {
          setSelectedWard('');
        }
      }
    } else if (!selectedDistrict) {
      setWards([]);
      setSelectedWard('');
    }
  }, [selectedDistrict, districts]);

  // Debounce filterName
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedFilterName(filterName);
    }, 500);
    return () => clearTimeout(handler);
  }, [filterName]);

  // Debounce filterPhone
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedFilterPhone(filterPhone);
    }, 500);
    return () => clearTimeout(handler);
  }, [filterPhone]);

  // Debounce filterEmail
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedFilterEmail(filterEmail);
    }, 500);
    return () => clearTimeout(handler);
  }, [filterEmail]);

  const fetchSuppliers = async (paramsObj = {}) => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();

      if (paramsObj.name) params.append('name', paramsObj.name);
      if (paramsObj.phone) params.append('phone', paramsObj.phone);
      if (paramsObj.email) params.append('email', paramsObj.email);
      if (paramsObj.isActive !== undefined) params.append('isActive', paramsObj.isActive);
      if (paramsObj.page) params.append('page', paramsObj.page);
      if (paramsObj.limit) params.append('limit', paramsObj.limit);

      const response = await apiAdmin.get(`/supplier?${params.toString()}`);
      setTotal(response.data.total || 0);
      setSuppliers(response.data.data || []);
    } catch (error) {
      toast.error('Lỗi khi lấy danh sách nhà cung cấp');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers({
      name: debouncedFilterName || undefined,
      phone: debouncedFilterPhone || undefined,
      email: debouncedFilterEmail || undefined,
      isActive: filterActive !== 'all' ? filterActive : undefined,
      page,
      limit,
    });
  }, [debouncedFilterName, debouncedFilterPhone, debouncedFilterEmail, filterActive, page]);

  const handleResetFilter = () => {
    setFilterName('');
    setFilterPhone('');
    setFilterEmail('');
    setFilterActive('all');
    setPage(1);
  };

  const toggleFilterDropdown = () => {
    setIsFilterVisible(!isFilterVisible);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const supplierData = {
      name: name || editSupplier?.name,
      contactName: contactName || editSupplier?.contactName,
      phone: phone || editSupplier?.phone,
      email: email || editSupplier?.email,
      address: address || editSupplier?.address,
      province: selectedProvince || editSupplier?.province,
      district: selectedDistrict || editSupplier?.district,
      ward: selectedWard || editSupplier?.ward,
      isActive: isNewSupplierActive,
    };

    try {
      if (editSupplier) {
        await apiAdmin.patch(`/supplier/${editSupplier._id}`, supplierData);
        toast.success('Cập nhật nhà cung cấp thành công');
      } else {
        await apiAdmin.post('/supplier', supplierData);
        toast.success('Thêm nhà cung cấp thành công');
      }
      fetchSuppliers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra!');
    } finally {
      setIsLoading(false);
    }

    handleCloseForm();
  };

  const handleDeleteClick = (id, name) => {
    setItemToDelete({ id, name });
    setIsModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (itemToDelete) {
      try {
        setIsLoading(true);
        const res = await apiAdmin.delete(`/supplier/${itemToDelete.id}`);
        if (res.status === 200) {
          toast.success('Xóa nhà cung cấp thành công');
          fetchSuppliers();
        }
      } catch (err) {
        toast.error(err.response?.data?.message || 'Lỗi khi xóa!');
      } finally {
        setIsLoading(false);
      }
    }
    setIsModalOpen(false);
    setItemToDelete(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setItemToDelete(null);
  };

  const modalTitle = 'Xác nhận xóa nhà cung cấp';
  const modalMessage = itemToDelete
    ? `Bạn có chắc chắn muốn xóa "${itemToDelete.name}"? Thao tác này không thể hoàn tác.`
    : '';

  const handleOpenForm = (supplier = null) => {
    setEditSupplier(supplier);
    setIsFormOpen(true);
    if (supplier) {
      setName(supplier.name);
      setContactName(supplier.contactName || '');
      setPhone(supplier.phone || '');
      setEmail(supplier.email || '');
      setAddress(supplier.address || '');
      setIsNewSupplierActive(supplier.isActive);
      
      // Load province first
      setSelectedProvince(supplier.province || '');
      
      // Load districts and district selection
      if (supplier.province && provinces.length > 0) {
        const province = provinces.find((p) => p.name === supplier.province);
        if (province) {
          setDistricts(province.districts || []);
          setSelectedDistrict(supplier.district || '');
          
          // Load wards and ward selection
          if (supplier.district) {
            const district = province.districts?.find((d) => d.name === supplier.district);
            if (district) {
              setWards(district.wards || []);
              setSelectedWard(supplier.ward || '');
            }
          }
        }
      }
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditSupplier(null);
    setName('');
    setContactName('');
    setPhone('');
    setEmail('');
    setAddress('');
    setSelectedProvince('');
    setSelectedDistrict('');
    setSelectedWard('');
    setIsNewSupplierActive(true);
  };

  return (
    <div style={{ backgroundColor: "var(--bg-color)", color: "var(--text-color)" }} className="min-h-screen  from-gray-50 to-blue-50 p-6">
      <div className="max-w-full mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-3xl font-bold ">Quản lý nhà cung cấp</h1>
            <Button
              onClick={toggleFilterDropdown}
              variant={isFilterVisible ? 'default' : 'outline'}
              className={isFilterVisible ? 'bg-pink-600 hover:bg-pink-700' : ''}
            >
              <Filter className="w-4 h-4 mr-2" />
              Bộ lọc
            </Button>
          </div>

          <Button onClick={() => handleOpenForm()} className="bg-pink-600 hover:bg-pink-700">
            <Plus className="w-4 h-4 mr-2" />
            Thêm nhà cung cấp mới
          </Button>
        </div>

        {/* FORM */}  
        {isFormOpen && (
          <div className="bg-white p-8 rounded-2xl shadow-xl">
            <h3 className="text-xl font-bold text-gray-800 mb-6">
              {editSupplier ? 'Chỉnh sửa nhà cung cấp' : 'Thêm nhà cung cấp mới'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 text-black">
                  <Label  htmlFor="name">
                    Tên nhà cung cấp <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nhập tên nhà cung cấp"
                    className="text-black"
                  />
                </div>

                <div className="space-y-2 text-black">
                  <Label htmlFor="contactName">Tên người liên hệ</Label>
                  <Input
                    id="contactName"
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Nhập tên người liên hệ"
                    className="text-black"
                  />
                </div>

                <div className="space-y-2 text-black">
                  <Label htmlFor="phone">Số điện thoại</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Nhập số điện thoại"
                  />
                </div>

                <div className="space-y-2 text-black">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Nhập email"
                  />
                </div>

                <div className="space-y-2 text-black">
                  <Label htmlFor="province">Tỉnh/Thành phố</Label>
                  <Select value={selectedProvince} onValueChange={setSelectedProvince}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn tỉnh/thành phố" />
                    </SelectTrigger>
                    <SelectContent>
                      {provinces.map((province) => (
                        <SelectItem key={province.code} value={province.name}>
                          {province.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 text-black">
                  <Label htmlFor="district">Quận/Huyện</Label>
                  <Select
                    value={selectedDistrict}
                    onValueChange={setSelectedDistrict}
                    disabled={!selectedProvince}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn quận/huyện" />
                    </SelectTrigger>
                    <SelectContent>
                      {districts.map((district) => (
                        <SelectItem key={district.code} value={district.name}>
                          {district.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 text-black">
                  <Label htmlFor="ward">Phường/Xã</Label>
                  <Select
                    value={selectedWard}
                    onValueChange={setSelectedWard}
                    disabled={!selectedDistrict}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn phường/xã" />
                    </SelectTrigger>
                    <SelectContent>
                      {wards.map((ward) => (
                        <SelectItem key={ward.code} value={ward.name}>
                          {ward.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 md:col-span-2 text-black  ">
                  <Label htmlFor="address ">Địa chỉ chi tiết</Label>
                  <Textarea
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Nhập địa chỉ chi tiết"
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-700">
                  Trạng thái: {isNewSupplierActive ? 'Đang hoạt động' : 'Ngừng hoạt động'}
                </span>
                <Switch checked={isNewSupplierActive} onChange={setIsNewSupplierActive} />
              </div>

              <div className="flex text-black justify-end space-x-4">
                <Button type="button" onClick={handleCloseForm} variant="outline">
                  Hủy
                </Button>
                <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
                  {isLoading ? 'Đang xử lý...' : editSupplier ? 'Lưu thay đổi' : 'Thêm nhà cung cấp'}
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* FILTER */}
        {isFilterVisible && (
          <div className=" p-6 rounded-2xl shadow-lg">
            <h4 className="text-lg font-semibold  mb-4 border-b pb-2">
              Bộ lọc nhà cung cấp
            </h4>
            <div className="grid grid-cols-1  md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="filterName">Tên nhà cung cấp</Label>
                <Input
                  id="filterName"
                  type="text"
                  value={filterName}
                  onChange={(e) => setFilterName(e.target.value)}
                  placeholder="Nhập tên..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="filterPhone">Số điện thoại</Label>
                <Input
                  id="filterPhone"
                  type="text"
                  value={filterPhone}
                  onChange={(e) => setFilterPhone(e.target.value)}
                  placeholder="Nhập số điện thoại..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="filterEmail">Email</Label>
                <Input
                  id="filterEmail"
                  type="text"
                  value={filterEmail}
                  onChange={(e) => setFilterEmail(e.target.value)}
                  placeholder="Nhập email..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="filterActive">Trạng thái</Label>
                <Select value={filterActive} onValueChange={setFilterActive}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tất cả" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="true">Hoạt động</SelectItem>
                    <SelectItem value="false">Ngừng hoạt động</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button onClick={handleResetFilter} variant="outline" className="w-full">
                  Xóa bộ lọc
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* TABLE */}
        <div className=" rounded-2xl shadow-xl overflow-hidden">
          {isLoading ? (
            <div className="text-center py-12 text-gray-500">Đang tải dữ liệu...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tên nhà cung cấp
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Người liên hệ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Số điện thoại
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Địa chỉ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hành động
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {suppliers.map((supplier) => (
                    <tr key={supplier._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium ">
                        {supplier.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {supplier.contactName || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {supplier.phone || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {supplier.email || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                        {[supplier.address, supplier.ward, supplier.district, supplier.province]
                          .filter(Boolean)
                          .join(', ') || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            supplier.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {supplier.isActive ? 'Hoạt động' : 'Ngừng hoạt động'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <Button
                          onClick={() => handleOpenForm(supplier)}
                          variant="ghost"
                          size="sm"
                          className="text-blue-600 hover:text-blue-900 hover:bg-blue-50"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={() => handleDeleteClick(supplier._id, supplier.name)}
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-900 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* PAGINATION */}
          {total > limit && (
            <div className="flex justify-center items-center py-6 space-x-2 border-t">
              <Button
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={page === 1}
                variant="outline"
                size="sm"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Trước
              </Button>

              {Array.from({ length: Math.ceil(total / limit) }, (_, i) => (
                <Button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  variant={page === i + 1 ? 'default' : 'outline'}
                  size="sm"
                  className={page === i + 1 ? 'bg-blue-600 hover:bg-blue-700' : ''}
                >
                  {i + 1}
                </Button>
              ))}

              <Button
                onClick={() => setPage((prev) => prev + 1)}
                disabled={page >= Math.ceil(total / limit)}
                variant="outline"
                size="sm"
              >
                Sau
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </div>

        <DeleteConfirmationModal
          title={modalTitle}
          message={modalMessage}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onConfirm={handleConfirmDelete}
          id={itemToDelete?.id}
        />
      </div>
    </div>
  );
};

export default Suppliers;
