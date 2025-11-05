import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { SpendingStats } from '../../../../shared/types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface CategoryBreakdownProps {
  stats: SpendingStats | null;
  loading: boolean;
}

export const CategoryBreakdown: React.FC<CategoryBreakdownProps> = ({ stats, loading }) => {
  const chartData = useMemo(() => {
    if (!stats || !stats.byCategory.length) return null;

    const colors = [
      '#3b82f6', // blue
      '#10b981', // green
      '#f59e0b', // yellow
      '#ef4444', // red
      '#8b5cf6', // purple
      '#ec4899', // pink
      '#14b8a6', // teal
      '#f97316', // orange
      '#6b7280', // gray
      '#84cc16', // lime
    ];

    return {
      labels: stats.byCategory.map(cat => cat.category),
      datasets: [
        {
          data: stats.byCategory.map(cat => cat.amount),
          backgroundColor: colors.slice(0, stats.byCategory.length),
          borderWidth: 2,
          borderColor: '#fff',
          hoverBorderWidth: 3,
          hoverBorderColor: '#fff'
        }
      ]
    };
  }, [stats]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 15,
          usePointStyle: true,
          font: {
            size: 12
          }
        }
      },
      title: {
        display: true,
        text: 'Spending by Category',
        font: {
          size: 16,
          weight: 'bold'
        },
        color: '#1f2937',
        padding: {
          bottom: 20
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        padding: 12,
        displayColors: true,
        callbacks: {
          label: (context: any) => {
            const label = context.label || '';
            const value = `$${context.parsed.toFixed(2)}`;
            const percentage = `${context.dataset.data[context.dataIndex] / context.dataset.data.reduce((a: number, b: number) => a + b, 0) * 100}%`;
            return `${label}: ${value} (${percentage})`;
          }
        }
      }
    },
    cutout: '60%',
    animation: {
      animateScale: true,
      animateRotate: true
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="h-64 flex items-center justify-center">
          <div className="animate-pulse space-y-4 w-full">
            <div className="h-4 bg-gray-200 rounded w-1/3 mx-auto"></div>
            <div className="h-48 bg-gray-200 rounded-full"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!chartData) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="h-64 flex items-center justify-center">
          <p className="text-gray-500">No category data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="h-64">
        <Doughnut data={chartData} options={options} />
      </div>

      {/* Category List */}
      {stats && stats.byCategory.length > 0 && (
        <div className="mt-6 space-y-2">
          <h4 className="font-medium text-gray-900 text-sm uppercase tracking-wide">
            Top Categories
          </h4>
          <div className="space-y-2">
            {stats.byCategory
              .sort((a, b) => b.amount - a.amount)
              .slice(0, 5)
              .map((category, index) => (
                <div key={category.category} className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{
                        backgroundColor: (chartData.datasets[0].backgroundColor as string[])[index]
                      }}
                    />
                    <span className="text-sm text-gray-700">{category.category}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium text-gray-900">
                      {formatCurrency(category.amount)}
                    </span>
                    <span className="text-xs text-gray-500 ml-1">
                      ({category.percentage.toFixed(1)}%)
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};