import React, { useState, useEffect } from "react";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Card from "@/components/atoms/Card";
import ApperIcon from "@/components/ApperIcon";
import { leadService } from "@/services/api/leadService";
import { notificationService } from "@/services/api/notificationService";
import { toast } from "react-toastify";

const LeadForm = ({ lead, onSave, onCancel, onClose }) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    title: "",
    companyName: "",
    companySize: "",
    industry: "",
    website: "",
    source: "",
    sourceDetails: "",
    engagementLevel: "Medium",
    assignedTo: "",
    assignedToId: "",
    territory: "",
    nextFollowUp: "",
    notes: ""
  });

  const [loading, setLoading] = useState(false);
  const [salesTeam, setSalesTeam] = useState([]);
  const [leadScore, setLeadScore] = useState(null);

  useEffect(() => {
    loadSalesTeam();
    if (lead) {
      setFormData({
        firstName: lead.firstName || "",
        lastName: lead.lastName || "",
        email: lead.email || "",
        phone: lead.phone || "",
        title: lead.title || "",
        companyName: lead.companyName || "",
        companySize: lead.companySize || "",
        industry: lead.industry || "",
        website: lead.website || "",
        source: lead.source || "",
        sourceDetails: lead.sourceDetails || "",
        engagementLevel: lead.engagementLevel || "Medium",
        assignedTo: lead.assignedTo || "",
        assignedToId: lead.assignedToId || "",
        territory: lead.territory || "",
        nextFollowUp: lead.nextFollowUp ? lead.nextFollowUp.split('T')[0] : "",
        notes: lead.notes || ""
      });
    }
  }, [lead]);

  useEffect(() => {
    // Calculate lead score when qualification criteria change
    if (formData.companySize && formData.industry && formData.engagementLevel) {
      const score = leadService.calculateLeadScore(formData);
      setLeadScore(score);
    }
  }, [formData.companySize, formData.industry, formData.engagementLevel, formData.title]);

  const loadSalesTeam = async () => {
    try {
      const team = await leadService.getSalesTeam();
      setSalesTeam(team);
    } catch (error) {
      console.error("Error loading sales team:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Auto-assign territory based on selected team member
    if (name === "assignedToId") {
      const selectedMember = salesTeam.find(member => member.Id === parseInt(value));
      if (selectedMember) {
        setFormData(prev => ({
          ...prev,
          assignedTo: selectedMember.name,
          territory: selectedMember.territory
        }));
      }
    }
  };

  const handleSubmit = async (e) => {
e.preventDefault();
    setLoading(true);

    try {
      const submitData = {
        ...formData,
        nextFollowUp: formData.nextFollowUp ? new Date(formData.nextFollowUp).toISOString() : null
      };

      if (lead) {
        const updatedLead = await leadService.update(lead.Id, submitData);
        onSave(updatedLead);

        // Create follow-up reminder notification if date is set
        if (submitData.nextFollowUp) {
          try {
            await notificationService.createFollowupReminderNotification(
              lead.Id,
              submitData.nextFollowUp,
              updatedLead.assignedToId || 1
            );
            toast.success("Lead updated with follow-up reminder set");
          } catch (error) {
            console.error("Error creating follow-up notification:", error);
            toast.success("Lead updated successfully");
          }
        } else {
          toast.success("Lead updated successfully");
        }
      } else {
        const newLead = await leadService.create(submitData);
        onSave(newLead);

        // Create follow-up reminder notification for new lead if date is set
        if (submitData.nextFollowUp) {
          try {
            await notificationService.createFollowupReminderNotification(
              newLead.Id,
              submitData.nextFollowUp,
              newLead.assignedToId || 1
            );
            toast.success("Lead created with follow-up reminder set");
          } catch (error) {
            console.error("Error creating follow-up notification:", error);
            toast.success("Lead created successfully");
          }
        } else {
          toast.success("Lead created successfully");
        }
      }
    } catch (error) {
      toast.error("Error saving lead: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const companySizeOptions = [
    "1-10",
    "11-50", 
    "51-200",
    "201-500",
    "500+"
  ];

  const industryOptions = [
    "Technology",
    "Software",
    "SaaS",
    "Manufacturing",
    "Healthcare",
    "Finance",
    "Marketing",
    "Consulting",
    "Retail",
    "Hospitality",
    "Education",
    "Non-profit",
    "Other"
  ];

  const sourceOptions = [
    "Website",
    "Marketing Campaign",
    "Referral",
    "Cold Outreach"
  ];

  const engagementOptions = [
    "High",
    "Medium",
    "Low"
  ];

  const getScoreColor = (score) => {
    if (score >= 80) return "text-success";
    if (score >= 60) return "text-warning";
    return "text-error";
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-modal w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 bg-gradient-to-br from-accent/20 to-primary/20 rounded-lg flex items-center justify-center">
              <ApperIcon name="UserPlus" size={16} className="text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {lead ? "Edit Lead" : "Add New Lead"}
              </h2>
              <p className="text-sm text-gray-500">
                {lead ? "Update lead information and qualification" : "Create a new lead and calculate qualification score"}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {leadScore && (
              <div className="text-center">
                <div className="text-xs text-gray-500 mb-1">Lead Score</div>
                <div className={`text-lg font-bold ${getScoreColor(leadScore.totalScore)}`}>
                  {leadScore.totalScore}
                </div>
              </div>
            )}
            
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ApperIcon name="X" size={20} />
            </button>
          </div>
        </div>

        {/* Form Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Basic Information */}
            <Card className="p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <ApperIcon name="User" size={18} className="mr-2 text-primary" />
                Basic Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter first name"
                />
                
                <Input
                  label="Last Name"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter last name"
                />
                
                <Input
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter email address"
                />
                
                <Input
                  label="Phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Enter phone number"
                />
                
                <Input
                  label="Job Title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter job title"
                />
              </div>
            </Card>

            {/* Company Information */}
            <Card className="p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <ApperIcon name="Building2" size={18} className="mr-2 text-primary" />
                Company Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Company Name"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter company name"
                />
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Size
                  </label>
                  <select
                    name="companySize"
                    value={formData.companySize}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="">Select company size</option>
                    {companySizeOptions.map(size => (
                      <option key={size} value={size}>{size} employees</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Industry
                  </label>
                  <select
                    name="industry"
                    value={formData.industry}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="">Select industry</option>
                    {industryOptions.map(industry => (
                      <option key={industry} value={industry}>{industry}</option>
                    ))}
                  </select>
                </div>
                
                <Input
                  label="Website"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  placeholder="https://company.com"
                />
              </div>
            </Card>

            {/* Lead Source & Qualification */}
            <Card className="p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <ApperIcon name="Target" size={18} className="mr-2 text-primary" />
                Lead Source & Qualification
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lead Source
                  </label>
                  <select
                    name="source"
                    value={formData.source}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="">Select source</option>
                    {sourceOptions.map(source => (
                      <option key={source} value={source}>{source}</option>
                    ))}
                  </select>
                </div>
                
                <Input
                  label="Source Details"
                  name="sourceDetails"
                  value={formData.sourceDetails}
                  onChange={handleInputChange}
                  placeholder="Additional source information"
                />
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Engagement Level
                  </label>
                  <select
                    name="engagementLevel"
                    value={formData.engagementLevel}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    {engagementOptions.map(level => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Lead Score Breakdown */}
              {leadScore && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Qualification Score Breakdown</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="text-center">
                      <div className="text-gray-500">Company Size</div>
                      <div className="font-medium">{leadScore.breakdown.companySizeScore}/30</div>
                    </div>
                    <div className="text-center">
                      <div className="text-gray-500">Industry Fit</div>
                      <div className="font-medium">{leadScore.breakdown.industryFitScore}/25</div>
                    </div>
                    <div className="text-center">
                      <div className="text-gray-500">Engagement</div>
                      <div className="font-medium">{leadScore.breakdown.engagementScore}/25</div>
                    </div>
                    <div className="text-center">
                      <div className="text-gray-500">Budget Fit</div>
                      <div className="font-medium">{leadScore.breakdown.budgetFitScore}/20</div>
                    </div>
                  </div>
                  <div className="text-center mt-3 pt-3 border-t border-gray-200">
                    <div className="text-gray-500">Total Score</div>
                    <div className={`text-lg font-bold ${getScoreColor(leadScore.totalScore)}`}>
                      {leadScore.totalScore}/100
                    </div>
                  </div>
                </div>
              )}
            </Card>

            {/* Assignment */}
            <Card className="p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <ApperIcon name="Users" size={18} className="mr-2 text-primary" />
                Assignment
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assign to Team Member
                  </label>
                  <select
                    name="assignedToId"
                    value={formData.assignedToId}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="">Select team member</option>
                    {salesTeam.map(member => (
                      <option key={member.Id} value={member.Id}>
                        {member.name} ({member.territory})
                      </option>
                    ))}
                  </select>
                </div>
                
                <Input
                  label="Territory"
                  name="territory"
                  value={formData.territory}
                  onChange={handleInputChange}
                  placeholder="Territory (auto-filled)"
                  readOnly
                />
              </div>
            </Card>

            {/* Follow-up & Notes */}
            <Card className="p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <ApperIcon name="Calendar" size={18} className="mr-2 text-primary" />
                Follow-up & Notes
              </h3>
              
              <div className="space-y-4">
                <Input
                  label="Next Follow-up Date"
                  name="nextFollowUp"
                  type="date"
                  value={formData.nextFollowUp}
                  onChange={handleInputChange}
                />
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                    placeholder="Add notes about this lead..."
                  />
                </div>
              </div>
            </Card>
          </form>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          
          <Button
            type="submit"
            onClick={handleSubmit}
            loading={loading}
            className="min-w-[100px]"
          >
            {lead ? "Update Lead" : "Create Lead"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LeadForm;