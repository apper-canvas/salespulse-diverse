import React, { useState, useEffect } from "react";
import MetricCard from "@/components/molecules/MetricCard";
import Card from "@/components/atoms/Card";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import ApperIcon from "@/components/ApperIcon";
import { metricsService } from "@/services/api/metricsService";
import { activitiesService } from "@/services/api/activitiesService";
import { leadService } from "@/services/api/leadService";
const Dashboard = () => {
const [metrics, setMetrics] = useState([]);
  const [activities, setActivities] = useState([]);
  const [leadMetrics, setLeadMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

const loadData = async () => {
    setLoading(true);
    setError("");
    
    try {
      const [metricsData, activitiesData, leadsData, sourceAnalytics] = await Promise.all([
        metricsService.getAll(),
        activitiesService.getAll(),
        leadService.getAll(),
        leadService.getSourceAnalytics()
      ]);
      
      // Calculate lead metrics
      const qualifiedLeads = leadsData.filter(lead => lead.status === "Qualified").length;
      const avgLeadScore = leadsData.length ? 
        Math.round(leadsData.reduce((sum, lead) => sum + lead.leadScore, 0) / leadsData.length) : 0;
      const conversionRate = leadsData.length ? 
        Math.round((leadsData.filter(lead => lead.status === "Converted").length / leadsData.length) * 100) : 0;
      
      const leadMetrics = {
        totalLeads: leadsData.length,
        qualifiedLeads,
        avgLeadScore,
        conversionRate,
        sourceAnalytics
      };
      
      setMetrics(metricsData);
      setActivities(activitiesData);
      setLeadMetrics(leadMetrics);
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

      {/* Lead Metrics */}
      {leadMetrics && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Lead Performance</h2>
              <p className="text-sm text-gray-600">Track your lead generation and qualification progress</p>
            </div>
            <ApperIcon name="Target" size={20} className="text-primary" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="p-4 bg-gradient-to-br from-primary/5 to-primary-light/5 rounded-lg border border-primary/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Leads</p>
                  <p className="text-2xl font-bold text-primary">{leadMetrics.totalLeads}</p>
                </div>
                <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <ApperIcon name="Users" size={20} className="text-primary" />
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-gradient-to-br from-success/5 to-success/10 rounded-lg border border-success/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Qualified</p>
                  <p className="text-2xl font-bold text-success">{leadMetrics.qualifiedLeads}</p>
                </div>
                <div className="h-10 w-10 bg-success/10 rounded-full flex items-center justify-center">
                  <ApperIcon name="CheckCircle" size={20} className="text-success" />
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-gradient-to-br from-warning/5 to-warning/10 rounded-lg border border-warning/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg Score</p>
                  <p className="text-2xl font-bold text-warning">{leadMetrics.avgLeadScore}</p>
                </div>
                <div className="h-10 w-10 bg-warning/10 rounded-full flex items-center justify-center">
                  <ApperIcon name="Award" size={20} className="text-warning" />
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-gradient-to-br from-accent/5 to-accent/10 rounded-lg border border-accent/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Conv. Rate</p>
                  <p className="text-2xl font-bold text-accent">{leadMetrics.conversionRate}%</p>
                </div>
                <div className="h-10 w-10 bg-accent/10 rounded-full flex items-center justify-center">
                  <ApperIcon name="TrendingUp" size={20} className="text-accent" />
                </div>
              </div>
            </div>
          </div>

          {/* Top Lead Sources */}
          {Object.keys(leadMetrics.sourceAnalytics).length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">Top Lead Sources</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {Object.entries(leadMetrics.sourceAnalytics)
                  .sort(([,a], [,b]) => b.count - a.count)
                  .slice(0, 4)
                  .map(([source, stats]) => (
                    <div key={source} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900">{source}</span>
                        <span className="text-xs text-success font-medium">{stats.conversionRate}%</span>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>{stats.count} leads</span>
                        <span>Score: {stats.avgScore}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </Card>
      )}
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
              href="/leads" 
              className="w-full p-4 text-left rounded-lg border-2 border-gray-200 hover:border-primary hover:bg-primary/5 transition-all duration-200 group block"
            >
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 bg-gradient-to-br from-primary/20 to-primary-light/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ApperIcon name="UserPlus" size={16} className="text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Add New Lead</p>
                  <p className="text-xs text-gray-500">Capture and qualify prospects</p>
                </div>
              </div>
            </a>
            
            <a 
              href="/contacts" 
              className="w-full p-4 text-left rounded-lg border-2 border-gray-200 hover:border-primary hover:bg-primary/5 transition-all duration-200 group block"
            >
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 bg-gradient-to-br from-accent/20 to-emerald-400/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ApperIcon name="Users" size={16} className="text-accent" />
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
                <div className="h-8 w-8 bg-gradient-to-br from-warning/20 to-orange-400/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ApperIcon name="Activity" size={16} className="text-warning" />
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
                <div className="h-8 w-8 bg-gradient-to-br from-success/20 to-success/30 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ApperIcon name="Target" size={16} className="text-success" />
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