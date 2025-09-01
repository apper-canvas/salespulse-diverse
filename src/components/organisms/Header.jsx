import React, { useState, useEffect } from "react";
import ApperIcon from "@/components/ApperIcon";
import UserDropdown from "@/components/molecules/UserDropdown";
import NotificationCenter from "@/components/molecules/NotificationCenter";
import { notificationService } from "@/services/api/notificationService";
import Button from "@/components/atoms/Button";

const Header = ({ onMobileMenuToggle }) => {
  return (
    <header className="bg-white border-b border-gray-200 px-4 lg:px-6 h-16 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onMobileMenuToggle}
          className="lg:hidden"
        >
          <ApperIcon name="Menu" size={20} />
        </Button>
        
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 bg-gradient-to-br from-primary to-primary-light rounded-lg flex items-center justify-center">
            <ApperIcon name="Zap" size={18} className="text-white" />
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
            SalesPulse CRM
          </h1>
        </div>
      </div>

<div className="flex items-center space-x-4">
        <NotificationButton />
        <UserDropdown />
      </div>
    </header>
  );
};

const NotificationButton = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadUnreadCount();
    // Poll for updates every 30 seconds
    const interval = setInterval(loadUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadUnreadCount = async () => {
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error("Error loading unread count:", error);
    }
  };

  const handleToggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  const handleCloseNotifications = () => {
    setShowNotifications(false);
    // Refresh count after closing
    loadUnreadCount();
  };

  return (
    <div className="relative">
      <Button 
        variant="ghost" 
        size="sm"
        onClick={handleToggleNotifications}
        className="relative"
      >
        <ApperIcon name="Bell" size={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 bg-error text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>
      
      <NotificationCenter
        isOpen={showNotifications}
        onClose={handleCloseNotifications}
      />
    </div>
  );
};

export default Header;