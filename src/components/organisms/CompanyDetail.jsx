import React, { useEffect, useState } from "react";
import { contactService } from "@/services/api/contactService";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import Card from "@/components/atoms/Card";
import Contacts from "@/components/pages/Contacts";
const CompanyDetail = ({ company, onEdit, onClose, isOpen }) => {
const [companyContacts, setCompanyContacts] = useState([]);
  const [loadingContacts, setLoadingContacts] = useState(false);

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
      case "renewal-due":
        return "warning";
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
    if (!count || count === 0) return '0 employees';
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k employees`;
    }
    return `${count} employees`;
  };

  const formatMRR = (mrr) => {
    if (!mrr || mrr === 0) return '$0';
    if (mrr >= 1000) {
      return `$${(mrr / 1000).toFixed(1)}k`;
    }
    return `$${mrr}`;
  };
// Early return if company is null/undefined
  if (!company) {
    return null;
  }

  return (
    <div
    className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
    <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                    {company?.name || "Unknown Company"}
                </h2>
                <div className="flex gap-2">
                    <Button onClick={onEdit} className="bg-blue-600 hover:bg-blue-700 text-white">Edit Company
                                      </Button>
                    <Button
                        onClick={onClose}
                        variant="outline"
                        className="border-gray-300 text-gray-700 hover:bg-gray-50">Close
                                      </Button>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Company Information</h3>
                    <div className="space-y-3">
                        <div>
                            <span className="text-sm font-medium text-gray-500">Industry</span>
                            <p className="text-gray-900">{company?.industry || "Not specified"}</p>
                        </div>
                        <div>
                            <span className="text-sm font-medium text-gray-500">Website</span>
                            <p className="text-gray-900">
                                {company?.website ? <a
                                    href={company.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline">
                                    {company.website}
                                </a> : "Not provided"}
                            </p>
                        </div>
                        <div>
                            <span className="text-sm font-medium text-gray-500">Employees</span>
                            <p className="text-gray-900">{formatEmployees(company?.employees || 0)}</p>
                        </div>
                    </div>
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Subscription Details</h3>
                    <div className="space-y-3">
                        <div>
                            <span className="text-sm font-medium text-gray-500">Plan</span>
                            <div className="flex items-center gap-2">
                                <Badge className={getPlanColor(company?.subscriptionPlan)}>
                                    {company?.subscriptionPlan || "Unknown"}
                                </Badge>
                            </div>
                        </div>
                        <div>
                            <span className="text-sm font-medium text-gray-500">Status</span>
                            <div className="flex items-center gap-2">
                                <Badge className={getStatusColor(company?.status)}>
                                    {company?.status || "Unknown"}
                                </Badge>
                            </div>
</div>
                        <div>
                            <span className="text-sm font-medium text-gray-500">Monthly Revenue</span>
                            <p className="text-gray-900 font-semibold">{formatMRR(company?.mrr || 0)}</p>
                        </div>
                        {company?.renewalDate && (
                        <div>
                            <span className="text-sm font-medium text-gray-500">Renewal Date</span>
                            <p className="text-gray-900">
                                {new Date(company.renewalDate).toLocaleDateString()}
                            </p>
                        </div>
                        )}
                        <div>
                            <span className="text-sm font-medium text-gray-500">Created</span>
                            <p className="text-gray-900">
                                {company?.createdAt ? new Date(company.createdAt).toLocaleDateString() : "Unknown"}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            {/* Company Contacts Section */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Company Contacts</h3>
                    {loadingContacts && <div className="flex items-center text-sm text-gray-500">
                        <ApperIcon name="Loader" className="w-4 h-4 mr-2 animate-spin" />Loading contacts...
                                        </div>}
                </div>
                {loadingContacts ? <div className="flex items-center justify-center py-4">
                    <div
                        className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div> : companyContacts.length > 0 ? <div className="space-y-2">
                    {companyContacts.map(contact => <div
                        key={contact.Id}
                        className="flex items-center justify-between py-3 px-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                            <div
                                className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white text-sm font-medium">
                                {contact.firstName?.[0]}{contact.lastName?.[0]}
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
                            <Badge
                                variant={contact.status === "active" ? "success" : contact.status === "trial" ? "warning" : "error"}>
                                {contact.status}
                            </Badge>
                            <span className="text-xs text-gray-500">${contact.mrr?.toLocaleString() || "0"}
                            </span>
                        </div>
                    </div>)}
                </div> : <div className="text-center py-4">
                    <ApperIcon name="Users" size={24} className="text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No contacts found for this company</p>
                </div>}
            </div>
        </div>
        {/* Activity History Section */}
        <Card className="p-4 mt-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Activity History</h3>
                <Button variant="ghost" size="sm">
                    <ApperIcon name="Plus" size={16} className="mr-2" />Add Activity
                                  </Button>
            </div>
            <div className="text-center py-8">
                <ApperIcon name="Activity" size={48} className="text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500 mb-2">No activities yet</p>
                <p className="text-xs text-gray-400">Company activities will appear here</p>
            </div>
        </Card>
    </Card></div>
  );
};

export default CompanyDetail;