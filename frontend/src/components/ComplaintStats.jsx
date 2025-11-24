import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  DollarSign,
  TrendingUp 
} from 'lucide-react';

const ComplaintStats = ({ stats, loading = false }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const statCards = [
    {
      title: 'Tổng khiếu nại',
      value: stats?.total || 0,
      icon: FileText,
      color: 'bg-blue-500',
      textColor: 'text-blue-600'
    },
    {
      title: 'Chờ duyệt',
      value: stats?.pending || 0,
      icon: Clock,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600'
    },
    {
      title: 'Đã duyệt',
      value: stats?.approved || 0,
      icon: CheckCircle,
      color: 'bg-green-500',
      textColor: 'text-green-600'
    },
    {
      title: 'Từ chối',
      value: stats?.rejected || 0,
      icon: XCircle,
      color: 'bg-red-500',
      textColor: 'text-red-600'
    }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-gray-200 rounded w-20"></div>
              <div className="h-4 w-4 bg-gray-200 rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-24"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${stat.textColor}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value.toLocaleString()}</div>
                <p className="text-xs text-gray-500 mt-1">
                  {stat.title === 'Tổng khiếu nại' && stats?.total > 0 && (
                    `${((stats.pending / stats.total) * 100).toFixed(1)}% chờ duyệt`
                  )}
                  {stat.title === 'Chờ duyệt' && stats?.total > 0 && (
                    `${((stats.pending / stats.total) * 100).toFixed(1)}% tổng số`
                  )}
                  {stat.title === 'Đã duyệt' && stats?.total > 0 && (
                    `${((stats.approved / stats.total) * 100).toFixed(1)}% tổng số`
                  )}
                  {stat.title === 'Từ chối' && stats?.total > 0 && (
                    `${((stats.rejected / stats.total) * 100).toFixed(1)}% tổng số`
                  )}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Tổng tiền khiếu nại
            </CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(stats?.totalAmount || 0)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Tổng số tiền được yêu cầu khiếu nại
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Phân loại khiếu nại
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats?.byType?.map((type, index) => (
                <div key={index} className="flex justify-between items-center">
                  <Badge variant="outline" className="text-xs">
                    {type._id === 'QUALITY' && 'Chất lượng'}
                    {type._id === 'SERVICE' && 'Dịch vụ'}
                    {type._id === 'DISCOUNT' && 'Chiết khấu'}
                  </Badge>
                  <span className="text-sm font-medium">{type.count}</span>
                </div>
              )) || (
                <p className="text-xs text-gray-500">Chưa có dữ liệu</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ComplaintStats;