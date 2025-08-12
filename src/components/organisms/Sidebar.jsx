import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import ApperIcon from "@/components/ApperIcon";
import { cn } from "@/utils/cn";

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();

const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
    { name: "Leads", href: "/leads", icon: "UserPlus" },
    { name: "Contacts", href: "/contacts", icon: "Users" },
    { name: "Companies", href: "/companies", icon: "Building2" },
    { name: "Pipeline", href: "/pipeline", icon: "Target" },
    { name: "Activities", href: "/activities", icon: "Activity" },
    { name: "Reports", href: "/reports", icon: "BarChart3" },
  ];

  const NavItem = ({ item }) => {
    const isActive = location.pathname === item.href;
    
    return (
      <NavLink
        to={item.href}
        onClick={onClose}
        className={cn(
          "flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 group",
          isActive
            ? "bg-gradient-to-r from-primary to-primary-light text-white shadow-md"
            : "text-gray-700 hover:bg-gray-100 hover:text-primary"
        )}
      >
        <ApperIcon 
          name={item.icon} 
          size={18} 
          className={cn(
            "mr-3 transition-colors duration-200",
            isActive ? "text-white" : "text-gray-500 group-hover:text-primary"
          )} 
        />
        {item.name}
      </NavLink>
    );
  };

  // Desktop Sidebar
  const DesktopSidebar = () => (
    <div className="hidden lg:flex lg:w-60 lg:flex-col lg:fixed lg:inset-y-0 bg-white border-r border-gray-200">
      <div className="flex flex-col flex-1 min-h-0">
        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          <div className="flex-1 px-3 space-y-2">
            <div className="mb-8 px-3">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-gradient-to-br from-primary to-primary-light rounded-xl flex items-center justify-center shadow-lg">
                  <ApperIcon name="Zap" size={20} className="text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
                    SalesPulse
                  </h2>
                  <p className="text-xs text-gray-500 font-medium">CRM</p>
                </div>
              </div>
            </div>
            
            <nav className="space-y-1">
              {navigation.map((item) => (
                <NavItem key={item.name} item={item} />
              ))}
            </nav>
          </div>
        </div>
        
        <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
          <div className="flex items-center space-x-3 text-sm text-gray-600">
            <div className="h-2 w-2 bg-success rounded-full animate-pulse"></div>
            <span>All systems operational</span>
          </div>
        </div>
      </div>
    </div>
  );

  // Mobile Sidebar
  const MobileSidebar = () => (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 flex z-40 lg:hidden"
          role="dialog"
          aria-modal="true"
        >
          <div 
            className="fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity"
            onClick={onClose}
          />
          
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white transform transition-transform">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                type="button"
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={onClose}
              >
                <span className="sr-only">Close sidebar</span>
                <ApperIcon name="X" size={20} className="text-white" />
              </button>
            </div>
            
            <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
              <div className="flex-shrink-0 flex items-center px-4 mb-8">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-gradient-to-br from-primary to-primary-light rounded-xl flex items-center justify-center shadow-lg">
                    <ApperIcon name="Zap" size={20} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
                      SalesPulse
                    </h2>
                    <p className="text-xs text-gray-500 font-medium">CRM</p>
                  </div>
                </div>
              </div>
              
              <nav className="mt-5 px-2 space-y-1">
                {navigation.map((item) => (
                  <NavItem key={item.name} item={item} />
                ))}
              </nav>
            </div>
            
            <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <div className="h-2 w-2 bg-success rounded-full animate-pulse"></div>
                <span>All systems operational</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );

  return (
    <>
      <DesktopSidebar />
      <MobileSidebar />
    </>
  );
};

export default Sidebar;