import React, { useState, useEffect } from "react";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";
import { format } from "date-fns";
import { companyService } from "@/services/api/companyService";
import { contactService } from "@/services/api/contactService";
const ContactDetail = ({ contact, onEdit, onClose, isOpen }) => {
  const [company, setCompany] = useState(null);
  const [companyContacts, setCompanyContacts] = useState([]);
  const [loadingCompany, setLoadingCompany] = useState(false);

  if (!isOpen || !contact) return null;

  useEffect(() => {
    const loadCompanyData = async () => {
      if (contact.companyId) {
        setLoadingCompany(true);
        try {
          const companyData = await companyService.getById(contact.companyId);
          setCompany(companyData);
          
          // Load all contacts for this company
          const allContacts = await contactService.getAll();
          const relatedContacts = allContacts.filter(c => c.companyId === contact.companyId && c.Id !== contact.Id);
          setCompanyContacts(relatedContacts);
        } catch (error) {
          console.error("Error loading company data:", error);
        } finally {
          setLoadingCompany(false);
        }
      }
    };

    loadCompanyData();
  }, [contact]);

  const getBadgeVariant = (status) => {
    switch (status) {
      case "trial":
        return "trial";
      case "active":
        return "active";
      case "churned":
        return "churned";
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h2 className="text-2xl font-bold text-gray-900">
                  {contact.firstName} {contact.lastName}
                </h2>
                <Badge variant={getBadgeVariant(contact.status)}>
                  {contact.status.charAt(0).toUpperCase() + contact.status.slice(1)}
                </Badge>
              </div>
<p className="text-lg text-gray-600">
                {contact.role} {company ? `at ${company.name}` : contact.company ? `at ${contact.company}` : ''}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="accent" onClick={() => onEdit(contact)}>
                <ApperIcon name="Edit2" size={16} className="mr-2" />
                Edit
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <ApperIcon name="X" size={18} />
              </Button>
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card className="p-4">
              <h3 className="text-sm font-medium text-gray-500 mb-3">Contact Information</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <ApperIcon name="Mail" size={18} className="text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="text-sm font-medium text-gray-900">{contact.email}</p>
                  </div>
                </div>
                {contact.phone && (
                  <div className="flex items-center space-x-3">
                    <ApperIcon name="Phone" size={18} className="text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="text-sm font-medium text-gray-900">{contact.phone}</p>
                    </div>
                  </div>
                )}
              </div>
            </Card>

<Card className="p-4">
              <h3 className="text-sm font-medium text-gray-500 mb-3">Business Information</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <ApperIcon name="Briefcase" size={18} className="text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Role</p>
                    <p className="text-sm font-medium text-gray-900">{contact.role}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <ApperIcon name="DollarSign" size={18} className="text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Monthly Revenue</p>
                    <p className="text-sm font-medium text-gray-900">{formatCurrency(contact.mrr)}</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Company Information */}
            {company ? (
              <Card className="p-4">
                <h3 className="text-sm font-medium text-gray-500 mb-3">Company Information</h3>
                {loadingCompany ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <ApperIcon name="Building2" size={18} className="text-gray-400" />
                      <div className="flex-1">
                        <p className="text-sm text-gray-600">Company</p>
                        <p className="text-sm font-medium text-gray-900">{company.name}</p>
                      </div>
                      <Badge variant={company.status === 'active' ? 'success' : company.status === 'trial' ? 'warning' : 'error'}>
                        {company.status}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-3">
                      <ApperIcon name="Globe" size={18} className="text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Industry</p>
                        <p className="text-sm font-medium text-gray-900">{company.industry}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <ApperIcon name="Users" size={18} className="text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Employees</p>
                        <p className="text-sm font-medium text-gray-900">{company.employees}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <ApperIcon name="TrendingUp" size={18} className="text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Company MRR</p>
                        <p className="text-sm font-medium text-gray-900">{formatCurrency(company.mrr)}</p>
                      </div>
                    </div>
                    {company.website && (
                      <div className="flex items-center space-x-3">
                        <ApperIcon name="ExternalLink" size={18} className="text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Website</p>
                          <a 
                            href={company.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm font-medium text-primary hover:text-primary-light transition-colors"
                          >
                            {company.website.replace(/^https?:\/\//, '')}
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            ) : contact.company && (
              <Card className="p-4">
                <h3 className="text-sm font-medium text-gray-500 mb-3">Company Information</h3>
                <div className="flex items-center space-x-3">
                  <ApperIcon name="Building2" size={18} className="text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Company</p>
                    <p className="text-sm font-medium text-gray-900">{contact.company}</p>
                  </div>
                </div>
              </Card>
            )}
          </div>

{/* Other Company Contacts */}
          {companyContacts.length > 0 && (
            <Card className="p-4 mb-6">
              <h3 className="text-sm font-medium text-gray-500 mb-3">
                Other Contacts at {company?.name || contact.company}
              </h3>
              <div className="space-y-2">
                {companyContacts.map((companyContact) => (
                  <div key={companyContact.Id} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-xs font-medium">
                        {companyContact.firstName[0]}{companyContact.lastName[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {companyContact.firstName} {companyContact.lastName}
                        </p>
                        <p className="text-xs text-gray-500">{companyContact.role}</p>
                      </div>
                    </div>
                    <Badge variant={companyContact.status === 'active' ? 'success' : companyContact.status === 'trial' ? 'warning' : 'error'}>
                      {companyContact.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Notes */}
          {contact.notes && (
            <Card className="p-4 mb-6">
              <h3 className="text-sm font-medium text-gray-500 mb-3">Notes</h3>
              <p className="text-sm text-gray-700">{contact.notes}</p>
            </Card>
          )}

          {/* Activity History */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-500">Activity History</h3>
              <Button variant="ghost" size="sm">
                <ApperIcon name="Plus" size={16} className="mr-2" />
                Add Activity
              </Button>
            </div>
            
            <div className="text-center py-8">
              <ApperIcon name="Activity" size={48} className="text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500 mb-2">No activities yet</p>
              <p className="text-xs text-gray-400">Activities with this contact will appear here</p>
            </div>
          </Card>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 mt-6 border-t border-gray-100 text-xs text-gray-500">
            <span>Contact ID: {contact.Id}</span>
            <span>Created: {format(new Date(contact.createdAt), "MMM dd, yyyy")}</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ContactDetail;