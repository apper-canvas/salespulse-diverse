import React from "react";
import Card from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";
import Avatar from "@/components/atoms/Avatar";
import ApperIcon from "@/components/ApperIcon";
import { cn } from "@/utils/cn";

const LeadCard = ({ lead, onView, onEdit, onDelete, onAssign }) => {
  const getScoreColor = (score) => {
    if (score >= 80) return "text-success";
    if (score >= 60) return "text-warning";
    return "text-error";
  };

  const getScoreBgColor = (score) => {
    if (score >= 80) return "bg-success/10 border-success/20";
    if (score >= 60) return "bg-warning/10 border-warning/20";
    return "bg-error/10 border-error/20";
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

  const getEngagementColor = (level) => {
    switch (level) {
      case "High": return "text-success";
      case "Medium": return "text-warning";
      case "Low": return "text-error";
      default: return "text-gray-500";
    }
  };

  return (
    <Card className="hover:shadow-card-hover transition-all duration-200 group">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Avatar name={`${lead.firstName} ${lead.lastName}`} size="md" />
            <div>
              <h3 className="font-semibold text-gray-900 group-hover:text-primary transition-colors">
                {lead.firstName} {lead.lastName}
              </h3>
              <p className="text-sm text-gray-600">{lead.title}</p>
              <p className="text-sm text-gray-500">{lead.companyName}</p>
            </div>
          </div>
          
          {/* Lead Score */}
          <div className={cn(
            "px-3 py-1 rounded-full border text-sm font-medium",
            getScoreBgColor(lead.leadScore)
          )}>
            <span className={getScoreColor(lead.leadScore)}>
              {lead.leadScore}
            </span>
          </div>
        </div>

        {/* Status and Source */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Badge variant={getStatusVariant(lead.status)}>
              {lead.status}
            </Badge>
            <div className="flex items-center space-x-1 text-sm text-gray-500">
              <ApperIcon name={getSourceIcon(lead.source)} size={14} />
              <span>{lead.source}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-1 text-sm">
            <ApperIcon 
              name="TrendingUp" 
              size={14} 
              className={getEngagementColor(lead.engagementLevel)} 
            />
            <span className={getEngagementColor(lead.engagementLevel)}>
              {lead.engagementLevel}
            </span>
          </div>
        </div>

        {/* Company Details */}
        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
          <div className="flex items-center space-x-2">
            <ApperIcon name="Building2" size={14} className="text-gray-400" />
            <span className="text-gray-600">{lead.companySize} employees</span>
          </div>
          <div className="flex items-center space-x-2">
            <ApperIcon name="Tag" size={14} className="text-gray-400" />
            <span className="text-gray-600">{lead.industry}</span>
          </div>
        </div>

        {/* Assignment */}
        {lead.assignedTo && (
          <div className="flex items-center space-x-2 mb-4 p-2 bg-gray-50 rounded-lg">
            <ApperIcon name="User" size={14} className="text-gray-500" />
            <span className="text-sm text-gray-700">{lead.assignedTo}</span>
            <span className="text-xs text-gray-500">({lead.territory})</span>
          </div>
        )}

        {/* Next Follow-up */}
        {lead.nextFollowUp && (
          <div className="flex items-center space-x-2 mb-4 text-sm">
            <ApperIcon name="Calendar" size={14} className="text-gray-400" />
            <span className="text-gray-600">
              Follow up: {formatDate(lead.nextFollowUp)}
            </span>
          </div>
        )}

        {/* Contact Info */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <ApperIcon name="Mail" size={14} className="text-gray-400" />
            <span className="truncate">{lead.email}</span>
          </div>
          {lead.phone && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <ApperIcon name="Phone" size={14} className="text-gray-400" />
              <span>{lead.phone}</span>
            </div>
          )}
        </div>

        {/* Notes Preview */}
        {lead.notes && (
          <div className="mb-4">
            <p className="text-sm text-gray-600 line-clamp-2">
              {lead.notes}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onView(lead)}
              className="text-gray-600 hover:text-primary"
            >
              <ApperIcon name="Eye" size={14} className="mr-1" />
              View
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(lead)}
              className="text-gray-600 hover:text-primary"
            >
              <ApperIcon name="Edit3" size={14} className="mr-1" />
              Edit
            </Button>
          </div>

          <div className="flex space-x-2">
            {onAssign && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onAssign(lead)}
                className="text-gray-600 hover:text-accent"
              >
                <ApperIcon name="UserPlus" size={14} className="mr-1" />
                Assign
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(lead)}
              className="text-gray-600 hover:text-error"
            >
              <ApperIcon name="Trash2" size={14} />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default LeadCard;