import React from 'react';
import { cn } from '@/utils/cn';

const Badge = ({ 
  variant = 'default', 
  size = 'md',
  className,
  children,
  ...props 
}) => {
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    primary: 'bg-primary/10 text-primary border border-primary/20',
    success: 'bg-success/10 text-success border border-success/20',
    warning: 'bg-warning/10 text-warning border border-warning/20',
    error: 'bg-error/10 text-error border border-error/20',
    info: 'bg-info/10 text-info border border-info/20',
    active: 'bg-success/10 text-success border border-success/20',
    trial: 'bg-warning/10 text-warning border border-warning/20',
    churned: 'bg-error/10 text-error border border-error/20',
    'renewal-due': 'bg-orange-100 text-orange-700 border border-orange-200'
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base'
  };

  return (
    <span 
      className={cn(
        'inline-flex items-center font-medium rounded-full transition-colors',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;

// Example usage:
// <Badge variant="success">Active</Badge>
// <Badge variant="warning" size="sm">Trial</Badge>
// <Badge variant="error">Churned</Badge>
// <Badge variant="renewal-due">Renewal Due</Badge>
// <Badge variant="primary">Custom</Badge>