import React from "react";
import ApperIcon from "@/components/ApperIcon";
import Card from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";

const ContactCard = ({ contact, onEdit, onDelete, onClick, onNewActivity }) => {
const getBadgeVariant = (status) => {
    switch (status) {
      case "trial":
        return "trial";
      case "active":
        return "active";
      case "churned":
        return "churned";
      case "renewal-due":
        return "renewal-due";
      default:
        return "default";
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card 
      hover={true} 
      className="p-6 cursor-pointer group"
      onClick={() => onClick(contact)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary transition-colors">
              {contact.firstName} {contact.lastName}
            </h3>
<Badge variant={getBadgeVariant(contact.status)}>
              {contact.status === "renewal-due" ? "Renewal Due" : contact.status.charAt(0).toUpperCase() + contact.status.slice(1)}
            </Badge>
          </div>
          <div className="space-y-1">
            <div className="flex items-center text-sm text-gray-600">
              <ApperIcon name="Building2" size={14} className="mr-2" />
              <span>{contact.company} • {contact.role}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <ApperIcon name="Mail" size={14} className="mr-2" />
              <span>{contact.email}</span>
            </div>
            {contact.phone && (
              <div className="flex items-center text-sm text-gray-600">
                <ApperIcon name="Phone" size={14} className="mr-2" />
                <span>{contact.phone}</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end">
          <div className="text-lg font-bold text-gray-900 mb-2">
            {formatCurrency(contact.mrr)}
            <span className="text-xs font-normal text-gray-500 ml-1">/mo</span>
          </div>
<div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                onNewActivity?.(contact);
              }}
              title="New Activity"
            >
              <ApperIcon name="Plus" size={14} />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(contact);
              }}
            >
              <ApperIcon name="Edit2" size={14} />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(contact);
              }}
            >
              <ApperIcon name="Trash2" size={14} />
            </Button>
          </div>
        </div>
      </div>
      
      {contact.notes && (
        <div className="pt-3 border-t border-gray-100">
          <p className="text-sm text-gray-600 line-clamp-2">{contact.notes}</p>
        </div>
      )}
    </Card>
  );
};

export default ContactCard;