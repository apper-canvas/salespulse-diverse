import React, { useState, useEffect } from "react";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import Card from "@/components/atoms/Card";
import Avatar from "@/components/atoms/Avatar";
import ApperIcon from "@/components/ApperIcon";
import { leadService } from "@/services/api/leadService";
import { dealService } from "@/services/api/dealService";
import { activitiesService } from "@/services/api/activitiesService";
import { toast } from "react-toastify";
import { cn } from "@/utils/cn";

const LeadDetail = ({ lead, onClose, onEdit, onConvert, onDelete }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [convertLoading, setConvertLoading] = useState(false);
  const [showConvertForm, setShowConvertForm] = useState(false);
  const [dealData, setDealData] = useState({
    title: "",
    value: "",
    closeDate: "",
    companyId: ""
  });

  useEffect(() => {
    if (lead) {
      loadActivities();
      setDealData(prev => ({
        ...prev,
        title: `${lead.companyName} - ${lead.firstName} ${lead.lastName}`
      }));
    }
  }, [lead]);

  const loadActivities = async () => {
    try {
      // In a real app, you'd have lead-specific activities
      const allActivities = await activitiesService.getAll();
      // Filter activities that mention this lead (simplified)
      const leadActivities = allActivities.filter(activity => 
        activity.description?.toLowerCase().includes(lead.firstName.toLowerCase()) ||
        activity.description?.toLowerCase().includes(lead.lastName.toLowerCase()) ||
        activity.description?.toLowerCase().includes(lead.companyName.toLowerCase())
      ).slice(0, 5);
      setActivities(leadActivities);
    } catch (error) {
      console.error("Error loading activities:", error);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "text-success";
    if (score >= 60) return "text-warning";
    return "text-error";
  };

  const getScoreBgColor = (score) => {
    if (score >= 80) return "bg-success";
    if (score >= 60) return "bg-warning";
    return "bg-error";
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case "Qualified": return "success";
      case "Nurturing": return "warning";
      case "New": return "info";
      case "Converted": return "primary";
      default: return "secondary";
    }
  };

  const getSourceIcon = (source) => {
    switch (source) {
      case "Website": return "Globe";
      case "Marketing Campaign": return "Megaphone";
      case "Referral": return "Users";
      case "Cold Outreach": return "Mail";
      default: return "HelpCircle";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const handleConvertToDeal = async (e) => {
    e.preventDefault();
    setConvertLoading(true);
    
    try {
      const convertedDeal = await leadService.convertToDeal(lead.Id, dealData);
      const newDeal = await dealService.create(convertedDeal);
      
      toast.success("Lead successfully converted to deal");
      onConvert && onConvert(newDeal);
      onClose();
    } catch (error) {
      toast.error("Error converting lead: " + error.message);
    } finally {
      setConvertLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this lead?")) {
      setLoading(true);
      try {
        await leadService.delete(lead.Id);
        toast.success("Lead deleted successfully");
        onDelete && onDelete(lead);
        onClose();
      } catch (error) {
        toast.error("Error deleting lead: " + error.message);
      } finally {
        setLoading(false);
      }
    }
  };

  if (!lead) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-modal w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <Avatar name={`${lead.firstName} ${lead.lastName}`} size="lg" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {lead.firstName} {lead.lastName}
              </h2>
              <p className="text-gray-600">{lead.title}</p>
              <p className="text-gray-500">{lead.companyName}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Badge variant={getStatusVariant(lead.status)}>
              {lead.status}
            </Badge>
            
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ApperIcon name="X" size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)] p-6 space-y-6">
          {/* Lead Score & Qualification */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <ApperIcon name="Target" size={18} className="mr-2 text-primary" />
                Lead Qualification Score
              </h3>
              <div className={cn(
                "px-4 py-2 rounded-full text-white font-bold text-lg",
                getScoreBgColor(lead.leadScore)
              )}>
                {lead.leadScore}/100
              </div>
            </div>
            
            {lead.qualificationCriteria && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-gray-500 text-sm mb-1">Company Size</div>
                  <div className="font-semibold text-gray-900">
                    {lead.qualificationCriteria.companySizeScore}/30
                  </div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-gray-500 text-sm mb-1">Industry Fit</div>
                  <div className="font-semibold text-gray-900">
                    {lead.qualificationCriteria.industryFitScore}/25
                  </div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-gray-500 text-sm mb-1">Engagement</div>
                  <div className="font-semibold text-gray-900">
                    {lead.qualificationCriteria.engagementScore}/25
                  </div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-gray-500 text-sm mb-1">Budget Fit</div>
                  <div className="font-semibold text-gray-900">
                    {lead.qualificationCriteria.budgetFitScore}/20
                  </div>
                </div>
              </div>
            )}
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Contact Information */}
            <Card className="p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <ApperIcon name="User" size={18} className="mr-2 text-primary" />
                Contact Information
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <ApperIcon name="Mail" size={16} className="text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-500">Email</div>
                    <div className="font-medium">{lead.email}</div>
                  </div>
                </div>
                
                {lead.phone && (
                  <div className="flex items-center space-x-3">
                    <ApperIcon name="Phone" size={16} className="text-gray-400" />
                    <div>
                      <div className="text-sm text-gray-500">Phone</div>
                      <div className="font-medium">{lead.phone}</div>
                    </div>
                  </div>
                )}
                
                {lead.website && (
                  <div className="flex items-center space-x-3">
                    <ApperIcon name="Globe" size={16} className="text-gray-400" />
                    <div>
                      <div className="text-sm text-gray-500">Website</div>
                      <a href={lead.website} target="_blank" rel="noopener noreferrer" 
                         className="font-medium text-primary hover:underline">
                        {lead.website}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Company Information */}
            <Card className="p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <ApperIcon name="Building2" size={18} className="mr-2 text-primary" />
                Company Details
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <ApperIcon name="Users" size={16} className="text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-500">Company Size</div>
                    <div className="font-medium">{lead.companySize} employees</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <ApperIcon name="Tag" size={16} className="text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-500">Industry</div>
                    <div className="font-medium">{lead.industry}</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <ApperIcon name="TrendingUp" size={16} className="text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-500">Engagement Level</div>
                    <div className="font-medium">{lead.engagementLevel}</div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Lead Source & Assignment */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <ApperIcon name={getSourceIcon(lead.source)} size={18} className="mr-2 text-primary" />
                Lead Source
              </h3>
              
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-gray-500">Source</div>
                  <div className="font-medium">{lead.source}</div>
                </div>
                
                {lead.sourceDetails && (
                  <div>
                    <div className="text-sm text-gray-500">Source Details</div>
                    <div className="font-medium">{lead.sourceDetails}</div>
                  </div>
                )}
              </div>
            </Card>

            {lead.assignedTo && (
              <Card className="p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <ApperIcon name="UserCheck" size={18} className="mr-2 text-primary" />
                  Assignment
                </h3>
                
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-gray-500">Assigned To</div>
                    <div className="font-medium">{lead.assignedTo}</div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-gray-500">Territory</div>
                    <div className="font-medium">{lead.territory}</div>
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Timeline & Follow-up */}
          <Card className="p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <ApperIcon name="Calendar" size={18} className="mr-2 text-primary" />
              Timeline & Follow-up
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-gray-500">Created</div>
                <div className="font-medium">{formatDate(lead.createdAt)}</div>
              </div>
              
              <div>
                <div className="text-sm text-gray-500">Last Contact</div>
                <div className="font-medium">{formatDate(lead.lastContact)}</div>
              </div>
              
              {lead.nextFollowUp && (
                <div>
                  <div className="text-sm text-gray-500">Next Follow-up</div>
                  <div className="font-medium text-warning">{formatDate(lead.nextFollowUp)}</div>
                </div>
              )}
            </div>
          </Card>

          {/* Notes */}
          {lead.notes && (
            <Card className="p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <ApperIcon name="FileText" size={18} className="mr-2 text-primary" />
                Notes
              </h3>
              
              <p className="text-gray-700 whitespace-pre-wrap">{lead.notes}</p>
            </Card>
          )}

          {/* Recent Activities */}
          {activities.length > 0 && (
            <Card className="p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <ApperIcon name="Activity" size={18} className="mr-2 text-primary" />
                Recent Activities
              </h3>
              
              <div className="space-y-3">
                {activities.map((activity) => (
                  <div key={activity.Id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <ApperIcon name="MessageCircle" size={16} className="text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{activity.title}</div>
                      <div className="text-sm text-gray-600">{activity.description}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {formatDateTime(activity.timestamp)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Convert to Deal Form */}
          {showConvertForm && lead.status !== "Converted" && (
            <Card className="p-4 border-primary">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <ApperIcon name="ArrowRight" size={18} className="mr-2 text-primary" />
                Convert to Deal
              </h3>
              
              <form onSubmit={handleConvertToDeal} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Deal Title
                    </label>
                    <input
                      type="text"
                      value={dealData.title}
                      onChange={(e) => setDealData({...dealData, title: e.target.value})}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Deal Value ($)
                    </label>
                    <input
                      type="number"
                      value={dealData.value}
                      onChange={(e) => setDealData({...dealData, value: parseInt(e.target.value)})}
                      required
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expected Close Date
                    </label>
                    <input
                      type="date"
                      value={dealData.closeDate}
                      onChange={(e) => setDealData({...dealData, closeDate: e.target.value})}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Button
                    type="submit"
                    loading={convertLoading}
                    className="flex items-center"
                  >
                    <ApperIcon name="ArrowRight" size={16} className="mr-2" />
                    Convert to Deal
                  </Button>
                  
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShowConvertForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Card>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex space-x-3">
            <Button
              variant="ghost"
              onClick={() => onEdit(lead)}
              className="flex items-center"
            >
              <ApperIcon name="Edit3" size={16} className="mr-2" />
              Edit Lead
            </Button>
            
            <Button
              variant="ghost"
              onClick={handleDelete}
              loading={loading}
              className="flex items-center text-error hover:text-error"
            >
              <ApperIcon name="Trash2" size={16} className="mr-2" />
              Delete Lead
            </Button>
          </div>
          
          <div className="flex space-x-3">
            {lead.status !== "Converted" && (
              <Button
                onClick={() => setShowConvertForm(!showConvertForm)}
                className="flex items-center"
              >
                <ApperIcon name="ArrowRight" size={16} className="mr-2" />
                {showConvertForm ? "Hide Convert Form" : "Convert to Deal"}
              </Button>
            )}
            
            <Button variant="ghost" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadDetail;