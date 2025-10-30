import React from 'react'

const UserSelectionTable = ({ users, selected, onChange }) => {
  const allSelected = selected.length === users.length && users.length > 0

  const toggleAll = () => {
    if (allSelected) {
      onChange([])
    } else {
      onChange(users.map((u) => u._id))
    }
  }

  const toggleUser = (userId, checked) => {
    if (checked) {
      onChange([...selected, userId])
    } else {
      onChange(selected.filter((id) => id !== userId))
    }
  }

  return (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-2">
        <label className="block text-sm font-medium text-gray-700">
          Chọn người dùng được áp dụng
        </label>
        <button
          onClick={toggleAll}
          className="text-sm text-[#ff69b4] font-medium hover:underline"
        >
          {allSelected ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
        </button>
      </div>

      <div className="overflow-y-auto max-h-[300px] border rounded-lg">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-100 sticky top-0 z-10">
            <tr>
              <th className="px-3 py-2 text-left">
                <input type="checkbox" checked={allSelected} onChange={toggleAll} />
              </th>
              <th className="px-3 py-2 text-left font-medium text-gray-700">Tên</th>
              <th className="px-3 py-2 text-left font-medium text-gray-700">Email</th>
              <th className="px-3 py-2 text-left font-medium text-gray-700">Ngày tạo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((user) => (
              <tr key={user._id} className="hover:bg-gray-50">
                <td className="px-3 py-2">
                  <input
                    type="checkbox"
                    checked={selected.includes(user._id)}
                    onChange={(e) => toggleUser(user._id, e.target.checked)}
                  />
                </td>
                <td className="px-3 py-2">{user.name}</td>
                <td className="px-3 py-2 text-gray-600">{user.email}</td>
                <td className="px-3 py-2 text-gray-500 text-xs">
                  {user.createdAt
                    ? new Date(user.createdAt).toLocaleDateString('vi-VN')
                    : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default UserSelectionTable
