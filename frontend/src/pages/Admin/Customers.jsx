import React from 'react';

const CustomerCard = ({ name, email, totalOrders, totalSpent, joinedYear, setEditingCustomer, setActivePage }) => {
  const handleEditClick = () => {
    setEditingCustomer({ name, email }); // Truyền dữ liệu khách hàng
    setActivePage('customerEdit');
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg flex flex-col items-center text-center">
      <div className="w-16 h-16 rounded-full bg-pink-100 flex items-center justify-center mb-4 text-pink-600">
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"></path></svg>
      </div>
      <h3 className="text-xl font-semibold text-gray-800">{name}</h3>
      <p className="text-sm text-gray-500 mb-4">{email}</p>
      <div className="flex justify-between w-full text-sm text-gray-600 mb-4">
        <div className="text-left">
          <p>Tổng đơn hàng:</p>
          <p className="font-bold text-lg text-pink-600">{totalOrders}</p>
        </div>
        <div className="text-right">
          <p>Tổng chi tiêu:</p>
          <p className="font-bold text-lg text-pink-600">{totalSpent}</p>
        </div>
      </div>
      <p className="text-xs text-gray-400">Tham gia: {joinedYear}</p>
      <div className="flex space-x-2 mt-4">
        {/* <button className="flex items-center space-x-2 px-4 py-2 bg-pink-50 text-pink-600 rounded-lg font-semibold hover:bg-pink-100 transition-colors">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"></path></svg>
          <span>Xem</span>
        </button> */}
        <button onClick={handleEditClick} className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"></path></svg>
          <span>Sửa</span>
        </button>
      </div>
    </div>
  );
};

const Customers = ({ setEditingCustomer, setActivePage }) => {
  const customersData = [
    { name: 'Nguyễn Thị Lan', email: 'lan@email.com', totalOrders: 12, totalSpent: '15.2M₫', joinedYear: 2023 },
    { name: 'Trần Thị Hoa', email: 'hoa@email.com', totalOrders: 9, totalSpent: '8.9M₫', joinedYear: 2023 },
    { name: 'Lê Thị Mai', email: 'mai@email.com', totalOrders: 8, totalSpent: '12.1M₫', joinedYear: 2024 },
    { name: 'Phạm Thị Linh', email: 'linh@email.com', totalOrders: 8, totalSpent: '6.5M₫', joinedYear: 2024 },
    { name: 'Hoàng Thị Nga', email: 'nga@email.com', totalOrders: 5, totalSpent: '4.2M₫', joinedYear: 2024 },
    { name: 'Vũ Thị Hương', email: 'huong@email.com', totalOrders: 5, totalSpent: '3.8M₫', joinedYear: 2024 },
    { name: 'Đỗ Thị Thảo', email: 'thao@email.com', totalOrders: 3, totalSpent: '2.1M₫', joinedYear: 2024 },
    { name: 'Bùi Thị Loan', email: 'loan@email.com', totalOrders: 3, totalSpent: '1.5M₫', joinedYear: 2024 },
  ];

  return (
    <div>
      <div className="flex justify-end mb-6">
        <button onClick={()=>setActivePage("add-customer")} className="flex items-center space-x-2 px-4 py-2 bg-pink-600 text-white rounded-lg font-semibold hover:bg-pink-700 transition-colors">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"></path></svg>
          <span>Thêm khách hàng</span>
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {customersData.map((customer, index) => (
          <CustomerCard 
            key={index} 
            {...customer} 
            setEditingCustomer={setEditingCustomer}
            setActivePage={setActivePage}
          />
        ))}
      </div>
    </div>
  );
};

export default Customers;