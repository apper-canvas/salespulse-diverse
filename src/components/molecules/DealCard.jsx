import React from 'react';
import Card from '@/components/atoms/Card';
import Badge from '@/components/atoms/Badge';
import ApperIcon from '@/components/ApperIcon';

const DealCard = ({ deal, company, onDealClick, isDragging, provided, dragHandleProps }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getProbabilityColor = (probability) => {
    if (probability >= 80) return 'bg-green-100 text-green-800';
    if (probability >= 60) return 'bg-blue-100 text-blue-800';
    if (probability >= 40) return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  const companyName = company?.name || 'Unknown Company';
  
  return (
    <Card
      ref={provided?.innerRef}
      {...(provided?.draggableProps || {})}
      {...(dragHandleProps || {})}
      className={`p-4 cursor-pointer transition-all hover:shadow-md ${
        isDragging ? 'shadow-lg rotate-2 bg-white' : ''
      }`}
      onClick={() => onDealClick?.(deal)}
    >
      <div className="space-y-3">
        {/* Header - Company Name */}
        <div className="flex items-start justify-between">
          <h4 className="font-semibold text-gray-900 text-sm leading-tight">
            {companyName}
          </h4>
          <div className="flex items-center space-x-1 text-gray-400">
            <ApperIcon name="GripVertical" size={14} />
          </div>
        </div>

        {/* Contact Person */}
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <ApperIcon name="User" size={14} />
          <span>{deal.contactPerson || 'No contact'}</span>
        </div>

        {/* Deal Value */}
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold text-gray-900">
            {formatCurrency(deal.value)}
          </span>
          <Badge
            variant="secondary"
            className={getProbabilityColor(deal.probability)}
          >
            {deal.probability}%
          </Badge>
        </div>

        {/* Expected Close Date */}
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <ApperIcon name="Calendar" size={14} />
          <span>{formatDate(deal.expectedCloseDate)}</span>
        </div>

        {/* Footer - Additional Info */}
        {deal.notes && (
          <div className="text-xs text-gray-500 border-t pt-2 mt-2">
            <div className="flex items-start space-x-1">
              <ApperIcon name="FileText" size={12} className="mt-0.5 flex-shrink-0" />
              <span className="line-clamp-2">{deal.notes}</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default DealCard;