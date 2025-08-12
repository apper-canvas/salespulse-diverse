import React, { useState, useEffect } from "react";
import MetricCard from "@/components/molecules/MetricCard";
import Card from "@/components/atoms/Card";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import ApperIcon from "@/components/ApperIcon";
import { metricsService } from "@/services/api/metricsService";
import { activitiesService } from "@/services/api/activitiesService";

const Dashboard = () => {
  const [metrics, setMetrics] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = async () => {
    setLoading(true);
    setError("");
    
    try {
      const [metricsData, activitiesData] = await Promise.all([
        metricsService.getAll(),
        activitiesService.getAll()
      ]);
      
      setMetrics(metricsData);
      setActivities(activitiesData);
    } catch (err) {
      setError("Failed to load dashboard data");
      console.error("Error loading dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's what's happening with your sales.</p>
        </div>
        <Loading type="metrics" />
        <Card className="p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded w-full"></div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's what's happening with your sales.</p>
        </div>
        <Error message={error} onRetry={loadData} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening with your sales.</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <MetricCard key={index} metric={metric} />
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
            <ApperIcon name="Activity" size={20} className="text-primary" />
          </div>
          
          {activities.length > 0 ? (
            <div className="space-y-4">
              {activities.slice(0, 5).map((activity) => (
                <div key={activity.Id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="h-8 w-8 bg-gradient-to-br from-primary/20 to-primary-light/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <ApperIcon name={activity.type === "email" ? "Mail" : "Phone"} size={14} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(activity.timestamp).toLocaleDateString()} at{" "}
                      {new Date(activity.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <ApperIcon name="Activity" size={48} className="text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500 mb-2">No recent activity</p>
              <p className="text-xs text-gray-400">Your latest interactions will appear here</p>
            </div>
          )}
        </Card>

        <Card className="p-6">
<div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
            <ApperIcon name="Zap" size={20} className="text-primary" />
          </div>
          
          <div className="space-y-3">
            <a 
              href="/contacts" 
              className="w-full p-4 text-left rounded-lg border-2 border-gray-200 hover:border-primary hover:bg-primary/5 transition-all duration-200 group block"
            >
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 bg-gradient-to-br from-accent/20 to-emerald-400/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ApperIcon name="UserPlus" size={16} className="text-accent" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Add New Contact</p>
                  <p className="text-xs text-gray-500">Create a new contact record</p>
                </div>
              </div>
            </a>
            
            <a 
              href="/activities"
              className="w-full p-4 text-left rounded-lg border-2 border-gray-200 hover:border-primary hover:bg-primary/5 transition-all duration-200 group block"
            >
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 bg-gradient-to-br from-primary/20 to-primary-light/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ApperIcon name="Activity" size={16} className="text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Log Activity</p>
                  <p className="text-xs text-gray-500">Track calls, emails, and meetings</p>
                </div>
              </div>
            </a>
            
            <a 
              href="/pipeline"
              className="w-full p-4 text-left rounded-lg border-2 border-gray-200 hover:border-primary hover:bg-primary/5 transition-all duration-200 group block"
            >
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 bg-gradient-to-br from-warning/20 to-orange-400/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ApperIcon name="Target" size={16} className="text-warning" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Manage Pipeline</p>
                  <p className="text-xs text-gray-500">Track deals and opportunities</p>
                </div>
              </div>
            </a>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;