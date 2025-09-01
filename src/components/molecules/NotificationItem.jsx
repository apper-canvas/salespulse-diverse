import React from "react";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import { cn } from "@/utils/cn";

const NotificationItem = ({ notification, onMarkAsRead }) => {
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'New Lead Assigned':
        return 'UserPlus';
      case 'Status Changed':
        return 'ArrowUpCircle';
      case 'Follow-up Reminder':
        return 'Calendar';
      case 'Note Added':
        return 'MessageSquare';
      case 'Lead Marked Lost':
        return 'XCircle';
      case 'Lead Tagged':
        return 'Tag';
      default:
        return 'Bell';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'New Lead Assigned':
        return 'text-primary';
      case 'Status Changed':
        return 'text-info';
      case 'Follow-up Reminder':
        return 'text-warning';
      case 'Note Added':
        return 'text-accent';
      case 'Lead Marked Lost':
        return 'text-error';
      case 'Lead Tagged':
        return 'text-success';
      default:
        return 'text-gray-500';
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return date.toLocaleDateString();
  };

  const handleClick = () => {
    if (!notification.read_status_c) {
      onMarkAsRead(notification.Id);
    }
  };

  return (
    <div
      className={cn(
        "flex items-start space-x-3 p-4 hover:bg-gray-50 cursor-pointer transition-colors",
        !notification.read_status_c && "bg-primary/5 border-l-2 border-l-primary"
      )}
      onClick={handleClick}
    >
      <div className={cn(
        "h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0",
        !notification.read_status_c ? "bg-primary/10" : "bg-gray-100"
      )}>
        <ApperIcon 
          name={getNotificationIcon(notification.type_c)} 
          size={16} 
          className={cn(
            !notification.read_status_c 
              ? getNotificationColor(notification.type_c)
              : "text-gray-500"
          )} 
        />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className={cn(
              "text-sm leading-5",
              !notification.read_status_c 
                ? "text-gray-900 font-medium" 
                : "text-gray-600"
            )}>
              {notification.message_c}
            </p>
            
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-xs text-gray-500">
                {formatTimestamp(notification.timestamp_c)}
              </span>
              
              {notification.type_c && (
                <>
                  <span className="text-xs text-gray-400">•</span>
                  <span className={cn(
                    "text-xs px-2 py-0.5 rounded-full",
                    !notification.read_status_c
                      ? "bg-primary/10 text-primary"
                      : "bg-gray-100 text-gray-500"
                  )}>
                    {notification.type_c}
                  </span>
                </>
              )}
            </div>
          </div>
          
          {!notification.read_status_c && (
            <div className="h-2 w-2 bg-primary rounded-full flex-shrink-0 mt-1"></div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationItem;