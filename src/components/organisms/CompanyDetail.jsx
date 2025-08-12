import React, { useState, useEffect } from "react";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import ApperIcon from "@/components/ApperIcon";
import { contactService } from "@/services/api/contactService";
const CompanyDetail = ({ company, onEdit, onClose, isOpen }) => {
const [companyContacts, setCompanyContacts] = useState([]);
  const [loadingContacts, setLoadingContacts] = useState(false);

  if (!isOpen || !company) return null;

  useEffect(() => {
    const loadCompanyContacts = async () => {
      setLoadingContacts(true);
      try {
        const allContacts = await contactService.getAll();
        const relatedContacts = allContacts.filter(c => c.companyId === company.Id);
        setCompanyContacts(relatedContacts);
      } catch (error) {
        console.error("Error loading company contacts:", error);
      } finally {
        setLoadingContacts(false);
      }
    };

    if (company) {
      loadCompanyContacts();
    }
  }, [company]);
  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "success";
      case "trial":
        return "warning";
      case "churned":
        return "error";
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
      return `${(count / 1000).toFixed(1)}k employees`;
    }
    return `${count} employees`;
  };

  const formatMRR = (mrr) => {
    if (mrr >= 1000) {
      return `$${(mrr / 1000).toFixed(1)}k`;
    }
    return `$${mrr}`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{company.name}</h2>
            <p className="text-gray-600 mt-1">{company.industry}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="primary" onClick={() => onEdit(company)}>
              <ApperIcon name="Edit2" size={16} className="mr-2" />
              Edit
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <ApperIcon name="X" size={20} />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status and Plan */}
          <div className="flex items-center gap-4">
            <div>
              <span className="text-sm font-medium text-gray-700">Status:</span>
              <Badge variant={getStatusColor(company.status)} className="ml-2">
                {company.status}
              </Badge>
            </div>
            
            {company.subscriptionPlan && (
              <div>
                <span className="text-sm font-medium text-gray-700">Plan:</span>
                <Badge variant={getPlanColor(company.subscriptionPlan)} className="ml-2">
                  {company.subscriptionPlan}
                </Badge>
              </div>
            )}
          </div>

          {/* Company Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Company Details</h3>
              
              <div className="space-y-3">
                <div className="flex items-center text-gray-700">
                  <ApperIcon name="Users" size={16} className="mr-3 text-gray-400" />
                  <div>
                    <span className="font-medium">Employees:</span>
                    <span className="ml-2">{formatEmployees(company.employees)}</span>
                  </div>
                </div>

                {company.website && (
                  <div className="flex items-center text-gray-700">
                    <ApperIcon name="Globe" size={16} className="mr-3 text-gray-400" />
                    <div>
                      <span className="font-medium">Website:</span>
                      <a
                        href={company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 text-accent hover:underline"
                      >
                        {company.website.replace(/^https?:\/\//, '')}
                      </a>
                    </div>
                  </div>
                )}

                <div className="flex items-center text-gray-700">
                  <ApperIcon name="Building2" size={16} className="mr-3 text-gray-400" />
                  <div>
                    <span className="font-medium">Industry:</span>
                    <span className="ml-2">{company.industry}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Revenue Information</h3>
              
              <div className="space-y-3">
                <div className="flex items-center text-gray-700">
                  <ApperIcon name="DollarSign" size={16} className="mr-3 text-gray-400" />
                  <div>
                    <span className="font-medium">Monthly Recurring Revenue:</span>
                    <span className="ml-2 text-xl font-bold text-primary">
                      {formatMRR(company.mrr)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center text-gray-700">
                  <ApperIcon name="TrendingUp" size={16} className="mr-3 text-gray-400" />
                  <div>
                    <span className="font-medium">Annual Recurring Revenue:</span>
                    <span className="ml-2 text-lg font-semibold text-gray-900">
                      {formatMRR(company.mrr * 12)}/year
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

{/* Company Contacts */}
          <div className="border-t pt-4">
            <h3 className="text-sm font-medium text-gray-500 mb-3">
              Company Contacts ({companyContacts.length})
            </h3>
            {loadingContacts ? (
              <div className="flex items-center justify-center py-4">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : companyContacts.length > 0 ? (
              <div className="space-y-2">
                {companyContacts.map((contact) => (
                  <div key={contact.Id} className="flex items-center justify-between py-3 px-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white text-sm font-medium">
                        {contact.firstName[0]}{contact.lastName[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {contact.firstName} {contact.lastName}
                        </p>
                        <p className="text-xs text-gray-500">{contact.role}</p>
                        <p className="text-xs text-gray-400">{contact.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={contact.status === 'active' ? 'success' : contact.status === 'trial' ? 'warning' : 'error'}>
                        {contact.status}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        ${contact.mrr.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <ApperIcon name="Users" size={24} className="text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No contacts found for this company</p>
              </div>
            )}
          </div>

          {/* Additional Information */}
          {company.createdAt && (
            <div className="border-t pt-4">
              <div className="flex items-center text-sm text-gray-500">
                <ApperIcon name="Calendar" size={14} className="mr-2" />
                <span>
                  Company added on {new Date(company.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default CompanyDetail;