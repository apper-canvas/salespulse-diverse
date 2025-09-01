import React, { useState, useEffect } from "react";
import ApperIcon from "@/components/ApperIcon";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import NotificationItem from "@/components/molecules/NotificationItem";
import Loading from "@/components/ui/Loading";
import { notificationService } from "@/services/api/notificationService";

const NotificationCenter = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen]);

  const loadNotifications = async () => {
    setLoading(true);
    setError("");
    
    try {
      const notificationsData = await notificationService.getAll();
      setNotifications(notificationsData);
    } catch (err) {
      setError("Failed to load notifications");
      console.error("Error loading notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications(prev => 
        prev.map(notification => 
          notification.Id === notificationId 
            ? { ...notification, read_status_c: true }
            : notification
        )
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const unreadCount = notifications.filter(n => !n.read_status_c).length;

  if (!isOpen) return null;

  return (
    <div className="absolute right-0 top-full mt-2 w-96 z-50">
      <Card className="shadow-modal max-h-96 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
              {unreadCount > 0 && (
                <p className="text-sm text-gray-600">{unreadCount} unread</p>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <ApperIcon name="X" size={16} />
            </Button>
          </div>
        </div>

        <div className="max-h-80 overflow-y-auto">
          {loading ? (
            <div className="p-4">
              <div className="animate-pulse space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-start space-x-3">
                    <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : error ? (
            <div className="p-4 text-center">
              <ApperIcon name="AlertCircle" size={32} className="text-error mx-auto mb-2" />
              <p className="text-sm text-error">{error}</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={loadNotifications}
                className="mt-2"
              >
                Try Again
              </Button>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center">
              <ApperIcon name="Bell" size={48} className="text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500 mb-2">No notifications</p>
              <p className="text-xs text-gray-400">Your notifications will appear here</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.Id}
                  notification={notification}
                  onMarkAsRead={handleMarkAsRead}
                />
              ))}
            </div>
          )}
        </div>

        {notifications.length > 0 && (
          <div className="p-3 border-t border-gray-200 bg-gray-50">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-primary hover:text-primary-dark"
              onClick={() => {
                // Future: Navigate to full notifications page
                console.log("View all notifications");
              }}
            >
              View All Notifications
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};

export default NotificationCenter;