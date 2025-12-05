import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import Card, { CardContent } from './Card';

const MetricCard = ({ title, value, trend, icon: Icon, format = 'number' }) => {
  const getTrendIcon = () => {
    if (!trend || trend === 0) return <Minus className="w-4 h-4 text-gray-400" />;
    return trend > 0 ? (
      <TrendingUp className="w-4 h-4 text-green-500" />
    ) : (
      <TrendingDown className="w-4 h-4 text-red-500" />
    );
  };

  const getTrendColor = () => {
    if (!trend || trend === 0) return 'text-gray-500';
    return trend > 0 ? 'text-green-600' : 'text-red-600';
  };

  const formatValue = () => {
    if (format === 'currency') {
      return `$${value?.toLocaleString() || '0'}`;
    }
    return value?.toLocaleString() || '0';
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <p className="text-3xl font-bold text-gray-900 mb-2">
              {formatValue()}
            </p>
            {trend !== undefined && trend !== null && (
              <div className="flex items-center gap-1">
                {getTrendIcon()}
                <span className={`text-sm font-medium ${getTrendColor()}`}>
                  {Math.abs(trend).toFixed(1)}%
                </span>
                <span className="text-xs text-gray-500 ml-1">vs last period</span>
              </div>
            )}
          </div>
          {Icon && (
            <div className="p-3 bg-primary-50 rounded-lg">
              <Icon className="w-6 h-6 text-primary-600" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MetricCard;
