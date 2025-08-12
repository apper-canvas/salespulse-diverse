import React, { useState, useEffect } from 'react';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Card from '@/components/atoms/Card';
import Badge from '@/components/atoms/Badge';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import { format } from 'date-fns';
import { companyService } from '@/services/api/companyService';
import { contactService } from '@/services/api/contactService';
import { toast } from 'react-toastify';

const DealDetail = ({ deal, onClose, onEdit, ...props }) => {
  const [company, setCompany] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDealData();
  }, [deal]);

  const loadDealData = async () => {
    if (!deal) return;

    try {
      setLoading(true);
      setError(null);
      
      // Load company data
      const companyData = await companyService.getById(deal.companyId);
      setCompany(companyData);

      // Load all contacts and filter by company
      const allContacts = await contactService.getAll();
      const companyContacts = allContacts.filter(contact => 
        contact.companyId === deal.companyId
      );
      setContacts(companyContacts);

    } catch (err) {
      console.error('Error loading deal data:', err);
      setError(err.message);
      toast.error('Failed to load deal details');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    try {
      return format(new Date(dateString), 'PPP');
    } catch {
      return 'Invalid date';
    }
  };

  const getProbabilityColor = (probability) => {
    if (probability >= 80) return 'success';
    if (probability >= 60) return 'info';
    if (probability >= 40) return 'warning';
    return 'secondary';
  };

  const getStageColor = (stage) => {
    const colors = {
      lead: 'bg-gray-100 text-gray-800',
      demo: 'bg-blue-100 text-blue-800',
      trial: 'bg-purple-100 text-purple-800',
      negotiation: 'bg-orange-100 text-orange-800',
      closed: 'bg-green-100 text-green-800'
    };
    return colors[stage] || 'bg-gray-100 text-gray-800';
  };

  const getStageLabel = (stage) => {
    const labels = {
      lead: 'Lead',
      demo: 'Demo Scheduled',
      trial: 'Trial',
      negotiation: 'Negotiation',
      closed: 'Closed'
    };
    return labels[stage] || stage;
  };

  const getBadgeVariant = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'secondary';
      case 'lead': return 'info';
      default: return 'secondary';
    }
  };

  const getPlanColor = (plan) => {
    switch (plan) {
      case 'Enterprise': return 'bg-purple-100 text-purple-800';
      case 'Professional': return 'bg-blue-100 text-blue-800';
      case 'Basic': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!deal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Deal Details</h2>
          <div className="flex items-center space-x-2">
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(deal)}
                className="flex items-center space-x-1"
              >
                <ApperIcon name="Edit2" size={16} />
                <span>Edit</span>
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <ApperIcon name="X" size={20} />
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="p-8">
            <Loading message="Loading deal details..." />
          </div>
        ) : error ? (
          <div className="p-8">
            <Error message={error} />
          </div>
        ) : (
          <div className="p-6 space-y-6">
            {/* Deal Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Deal Information</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500">Deal Value</span>
                    <span className="text-lg font-semibold text-gray-900">
                      {formatCurrency(deal.value)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500">Probability</span>
                    <Badge variant={getProbabilityColor(deal.probability)}>
                      {deal.probability}%
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500">Stage</span>
                    <Badge className={getStageColor(deal.stage)}>
                      {getStageLabel(deal.stage)}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500">Contact Person</span>
                    <span className="text-sm text-gray-900">{deal.contactPerson}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500">Expected Close</span>
                    <span className="text-sm text-gray-900">{formatDate(deal.expectedCloseDate)}</span>
                  </div>

                  {deal.createdAt && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-500">Created</span>
                      <span className="text-sm text-gray-900">{formatDate(deal.createdAt)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Company Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Company Information</h3>
                
                {company ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-500">Company Name</span>
                      <span className="text-sm font-semibold text-gray-900">{company.name}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-500">Industry</span>
                      <span className="text-sm text-gray-900">{company.industry}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-500">Employees</span>
                      <span className="text-sm text-gray-900">{company.employees}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-500">Monthly Revenue</span>
                      <span className="text-sm text-gray-900">{formatCurrency(company.mrr)}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-500">Status</span>
                      <Badge variant={getBadgeVariant(company.status)}>
                        {company.status}
                      </Badge>
                    </div>

                    {company.plan && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-500">Plan</span>
                        <Badge className={getPlanColor(company.plan)}>
                          {company.plan}
                        </Badge>
                      </div>
                    )}

                    {company.location && (
                      <div className="flex items-start justify-between">
                        <span className="text-sm font-medium text-gray-500">Location</span>
                        <span className="text-sm text-gray-900 text-right">{company.location}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">Company information not available</div>
                )}
              </div>
            </div>

            {/* Deal Notes */}
            {deal.notes && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900">Notes</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{deal.notes}</p>
                </div>
              </div>
            )}

            {/* Company Contacts */}
            {contacts.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Company Contacts</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {contacts.map((contact) => (
                    <div key={contact.Id} className="bg-gray-50 rounded-lg p-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-gray-900">{contact.name}</h4>
                          <Badge variant={getBadgeVariant(contact.status)}>
                            {contact.status}
                          </Badge>
                        </div>
                        
                        {contact.role && (
                          <p className="text-sm text-gray-600">{contact.role}</p>
                        )}
                        
                        <div className="space-y-1">
                          {contact.email && (
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <ApperIcon name="Mail" size={14} />
                              <span>{contact.email}</span>
                            </div>
                          )}
                          {contact.phone && (
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <ApperIcon name="Phone" size={14} />
                              <span>{contact.phone}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};

export default DealDetail;