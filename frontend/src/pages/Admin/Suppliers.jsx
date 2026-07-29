import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Pencil, Trash2 } from 'lucide-react';
import apiAdmin from '@/service/apiAdmin';
import { Switch } from '@headlessui/react'
import AdminSpinner from '@/components/AdminSpinner';
import {
  PageHeader, Toolbar, FilterPanel, DataTable, Pagination,
  StatusBadge, AdminButton, ConfirmDialog,
  AdminModal, AdminInput, AdminSelect, AdminTextarea
} from "@/components/admin/ui"

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
  }, [selectedProvince, provinces, editSupplier]);

  // Update wards when district changes
  useEffect(() => {
    if (selectedDistrict && districts.length > 0) {
      const district = districts.find((d) => d.name === selectedDistrict);
      if (district && district.wards) {
        setWards(district.wards);
        if (!editSupplier) {
          setSelectedWard('');
        }
      }
    } else if (!selectedDistrict) {
      setWards([]);
      setSelectedWard('');
    }
  }, [selectedDistrict, districts, editSupplier]);

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
    setDebouncedFilterName('');
    setDebouncedFilterPhone('');
    setDebouncedFilterEmail('');
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

    if (!supplierData.name) {
      toast.error("Tên nhà cung cấp không được để trống!");
      setIsLoading(false);
      return;
    }

    try {
      if (editSupplier) {
        await apiAdmin.patch(`/supplier/${editSupplier._id}`, supplierData);
        toast.success('Cập nhật nhà cung cấp thành công');
      } else {
        await apiAdmin.post('/supplier', supplierData);
        toast.success('Thêm nhà cung cấp thành công');
      }
      fetchSuppliers({ page, limit });
      handleCloseForm();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra!');
    } finally {
      setIsLoading(false);
    }
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
          fetchSuppliers({ page, limit });
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
      
      setSelectedProvince(supplier.province || '');
      
      if (supplier.province && provinces.length > 0) {
        const province = provinces.find((p) => p.name === supplier.province);
        if (province) {
          setDistricts(province.districts || []);
          setSelectedDistrict(supplier.district || '');
          
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

  const columns = [
    {
      header: "Tên nhà cung cấp",
      render: (row) => <span className="font-bold text-slate-800">{row.name}</span>
    },
    {
      header: "Người liên hệ",
      render: (row) => <span className="text-slate-600 font-medium text-xs">{row.contactName || '-'}</span>
    },
    {
      header: "Số điện thoại",
      render: (row) => <span className="text-slate-600 text-xs">{row.phone || '-'}</span>
    },
    {
      header: "Email",
      render: (row) => <span className="text-slate-600 text-xs">{row.email || '-'}</span>
    },
    {
      header: "Địa chỉ",
      render: (row) => (
        <p className="text-xs text-slate-500 max-w-xs truncate">
          {[row.address, row.ward, row.district, row.province]
            .filter(Boolean)
            .join(', ') || '-'}
        </p>
      )
    },
    {
      header: "Trạng thái",
      render: (row) => (
        <StatusBadge status={row.isActive ? 'active' : 'inactive'} />
      )
    },
    {
      header: "Hành động",
      sticky: true,
      width: "100px",
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => handleOpenForm(row)}
            className="p-1.5 bg-slate-50 hover:bg-slate-100 text-blue-600 hover:text-blue-700 rounded-lg transition-colors border border-slate-200 shadow-sm"
            title="Chỉnh sửa"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDeleteClick(row._id, row.name)}
            className="p-1.5 bg-slate-50 hover:bg-slate-100 text-red-600 hover:text-red-700 rounded-lg transition-colors border border-slate-200 shadow-sm"
            title="Xóa"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ]

  return (
    <div className="p-6 bg-slate-50 dark:bg-slate-950 min-h-screen">
      <PageHeader
        title="Quản lý nhà cung cấp"
        description="Quản lý thông tin đối tác, nhà sản xuất cung cấp hàng hóa cho doanh nghiệp."
        badge={`${total} nhà cung cấp`}
      />

      <Toolbar
        onFilterToggle={() => setIsFilterVisible(!isFilterVisible)}
        filterActive={isFilterVisible}
        filterCount={Object.values({ filterName, filterPhone, filterEmail }).filter(Boolean).length + (filterActive !== 'all' ? 1 : 0)}
        actions={
          <AdminButton
            variant="primary"
            size="sm"
            onClick={() => handleOpenForm()}
          >
            + Thêm nhà cung cấp mới
          </AdminButton>
        }
      />

      <AdminModal
        open={isFormOpen}
        onClose={handleCloseForm}
        title={editSupplier ? 'Chỉnh sửa nhà cung cấp' : 'Thêm nhà cung cấp mới'}
        description={editSupplier ? `Cập nhật thông tin: ${editSupplier.name}` : 'Nhập thông tin nhà cung cấp mới'}
        size="xl"
        footer={
          <>
            <AdminButton variant="ghost" size="sm" onClick={handleCloseForm} disabled={isLoading}>Hủy</AdminButton>
            <AdminButton variant="primary" size="sm" onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? 'Đang lưu…' : 'Lưu lại'}
            </AdminButton>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AdminInput
              label="Tên nhà cung cấp"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nhập tên nhà cung cấp"
              required
            />
            <AdminInput
              label="Tên người liên hệ"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              placeholder="Nhập tên người liên hệ"
            />
            <AdminInput
              label="Số điện thoại"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Nhập số điện thoại"
            />
            <AdminInput
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Nhập email"
            />
            <AdminSelect
              label="Tỉnh/Thành phố"
              value={selectedProvince}
              onChange={(e) => setSelectedProvince(e.target.value)}
            >
              <option value="">Chọn tỉnh/thành phố</option>
              {provinces.map((province) => (
                <option key={province.code} value={province.name}>{province.name}</option>
              ))}
            </AdminSelect>
            <AdminSelect
              label="Quận/Huyện"
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              disabled={!selectedProvince}
            >
              <option value="">Chọn quận/huyện</option>
              {districts.map((district) => (
                <option key={district.code} value={district.name}>{district.name}</option>
              ))}
            </AdminSelect>
            <AdminSelect
              label="Phường/Xã"
              value={selectedWard}
              onChange={(e) => setSelectedWard(e.target.value)}
              disabled={!selectedDistrict}
            >
              <option value="">Chọn phường/xã</option>
              {wards.map((ward) => (
                <option key={ward.code} value={ward.name}>{ward.name}</option>
              ))}
            </AdminSelect>
            <div className="md:col-span-2">
              <AdminTextarea
                label="Địa chỉ chi tiết"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Nhập địa chỉ chi tiết"
                rows={2}
              />
            </div>
          </div>

          <div className="flex items-center justify-between py-3 border-y border-slate-100 dark:border-slate-800">
            <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">Trạng thái hoạt động</span>
            <Switch
              checked={isNewSupplierActive}
              onChange={setIsNewSupplierActive}
              className={`${isNewSupplierActive ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'} relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
            >
              <span className={`${isNewSupplierActive ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`} />
            </Switch>
          </div>
        </form>
      </AdminModal>

      <FilterPanel isOpen={isFilterVisible} onReset={handleResetFilter}>
        <FilterPanel.Field label="Tên nhà cung cấp">
          <input
            type="text"
            value={filterName}
            onChange={(e) => setFilterName(e.target.value)}
            placeholder="Nhập tên..."
          />
        </FilterPanel.Field>

        <FilterPanel.Field label="Số điện thoại">
          <input
            type="text"
            value={filterPhone}
            onChange={(e) => setFilterPhone(e.target.value)}
            placeholder="Nhập số điện thoại..."
          />
        </FilterPanel.Field>

        <FilterPanel.Field label="Email">
          <input
            type="text"
            value={filterEmail}
            onChange={(e) => setFilterEmail(e.target.value)}
            placeholder="Nhập email..."
          />
        </FilterPanel.Field>

        <FilterPanel.Field label="Trạng thái">
          <select value={filterActive} onChange={(e) => setFilterActive(e.target.value)}>
            <option value="all">Tất cả</option>
            <option value="true">Hoạt động</option>
            <option value="false">Ngừng hoạt động</option>
          </select>
        </FilterPanel.Field>
      </FilterPanel>

      <DataTable
        columns={columns}
        data={suppliers}
        loading={isLoading}
        keyExtractor={(row) => row._id}
      />

      <Pagination
        page={page}
        total={total}
        limit={limit}
        onPageChange={setPage}
      />

      <ConfirmDialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Xác nhận xóa nhà cung cấp"
        description={`Bạn có chắc chắn muốn xóa "${itemToDelete?.name}"? Thao tác này không thể hoàn tác.`}
      />
    </div>
  );
};

export default Suppliers;
