import React from 'react';
import { SpendingStats } from '../../../../shared/types';
import { DollarSign, TrendingUp, Receipt, Calendar } from 'lucide-react';

interface MetricsCardsProps {
  stats: SpendingStats | null;
  loading: boolean;
}

export const MetricsCards: React.FC<MetricsCardsProps> = ({ stats, loading }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const cards = [
    {
      title: 'Total Spending',
      value: stats ? formatCurrency(stats.total) : '$0.00',
      subtitle: 'This month',
      icon: DollarSign,
      color: 'blue',
      trend: '+12%',
      trendPositive: true
    },
    {
      title: 'Total Transactions',
      value: stats ? formatNumber(stats.count) : '0',
      subtitle: 'This month',
      icon: Receipt,
      color: 'green',
      trend: '+8%',
      trendPositive: true
    },
    {
      title: 'Average Expense',
      value: stats ? formatCurrency(stats.averageExpense) : '$0.00',
      subtitle: 'Per transaction',
      icon: TrendingUp,
      color: 'purple',
      trend: '-2%',
      trendPositive: false
    },
    {
      title: 'Categories',
      value: stats ? stats.byCategory.length.toString() : '0',
      subtitle: 'Active this month',
      icon: Calendar,
      color: 'orange',
      trend: '+2',
      trendPositive: true
    }
  ];

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: {
        bg: 'bg-blue-50',
        iconBg: 'bg-blue-500',
        text: 'text-blue-900'
      },
      green: {
        bg: 'bg-green-50',
        iconBg: 'bg-green-500',
        text: 'text-green-900'
      },
      purple: {
        bg: 'bg-purple-50',
        iconBg: 'bg-purple-500',
        text: 'text-purple-900'
      },
      orange: {
        bg: 'bg-orange-50',
        iconBg: 'bg-orange-500',
        text: 'text-orange-900'
      }
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow-md animate-pulse">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
              <div className="w-16 h-4 bg-gray-200 rounded"></div>
            </div>
            <div className="w-24 h-8 bg-gray-200 rounded mb-2"></div>
            <div className="w-32 h-4 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => {
        const colors = getColorClasses(card.color);
        const Icon = card.icon;

        return (
          <div
            key={index}
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`${colors.iconBg} p-3 rounded-lg`}>
                <Icon size={24} className="text-white" />
              </div>
              {card.trend && (
                <span
                  className={`text-sm font-medium ${
                    card.trendPositive ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {card.trend}
                </span>
              )}
            </div>
            <h3 className={`text-2xl font-bold ${colors.text} mb-1`}>
              {card.value}
            </h3>
            <p className="text-gray-600 text-sm">{card.subtitle}</p>
          </div>
        );
      })}
    </div>
  );
};