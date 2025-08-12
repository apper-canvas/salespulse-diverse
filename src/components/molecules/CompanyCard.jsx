import React from "react";
import Card from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";

const CompanyCard = ({ company, onEdit, onDelete, onClick }) => {
const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "success";
      case "trial":
        return "warning";
      case "churned":
        return "error";
      case "renewal-due":
        return "renewal-due";
      default:
        return "default";
    }
  };

  const getPlanColor = (plan) => {
    switch (plan?.toLowerCase()) {
      case "enterprise":
        return "accent";
      case "professional":
        return "primary";
      case "starter":
        return "warning";
      default:
        return "default";
    }
  };

  const formatEmployees = (count) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  const formatMRR = (mrr) => {
    if (mrr >= 1000) {
      return `$${(mrr / 1000).toFixed(1)}k`;
    }
    return `$${mrr}`;
  };

  const handleCardClick = (e) => {
    // Don't trigger card click if clicking on action buttons
    if (e.target.closest('button')) return;
    onClick(company);
  };

  return (
    <Card className="hover:shadow-card-hover transition-all duration-200 cursor-pointer group">
      <div onClick={handleCardClick} className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate group-hover:text-primary transition-colors">
              {company.name}
            </h3>
            <p className="text-sm text-gray-600 mt-1">{company.industry}</p>
          </div>
          <div className="flex gap-1 ml-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(company);
              }}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ApperIcon name="Edit2" size={14} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(company);
              }}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-error hover:bg-error/10"
            >
              <ApperIcon name="Trash2" size={14} />
            </Button>
          </div>
        </div>

        {/* Company Details */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <ApperIcon name="Users" size={14} className="mr-2 text-gray-400" />
            <span>{formatEmployees(company.employees)} employees</span>
          </div>
          
          {company.website && (
            <div className="flex items-center text-sm text-gray-600">
              <ApperIcon name="Globe" size={14} className="mr-2 text-gray-400" />
              <span className="truncate">{company.website}</span>
            </div>
          )}

          <div className="flex items-center text-sm text-gray-600">
            <ApperIcon name="DollarSign" size={14} className="mr-2 text-gray-400" />
            <span className="font-medium">{formatMRR(company.mrr)} MRR</span>
          </div>
        </div>

        {/* Status and Plan */}
        <div className="flex items-center justify-between">
<Badge variant={getStatusColor(company.status)}>
            {company.status === "renewal-due" ? "Renewal Due" : company.status.charAt(0).toUpperCase() + company.status.slice(1)}
          </Badge>
          
          {company.subscriptionPlan && (
            <Badge variant={getPlanColor(company.subscriptionPlan)}>
              {company.subscriptionPlan}
            </Badge>
          )}
        </div>
      </div>
    </Card>
  );
};

export default CompanyCard;