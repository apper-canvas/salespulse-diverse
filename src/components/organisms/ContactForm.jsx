import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { contactService } from "@/services/api/contactService";
import { companyService } from "@/services/api/companyService";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import Input from "@/components/atoms/Input";
const ContactForm = ({ contact, onSave, onCancel, isOpen }) => {
const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    companyId: "",
    company: "",
    role: "",
    status: "trial",
    mrr: 0,
    notes: ""
  });
  const [companies, setCompanies] = useState([]);
  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
const [errors, setErrors] = useState({});

  // Load companies on mount
  useEffect(() => {
    const loadCompanies = async () => {
      setLoadingCompanies(true);
      try {
        const companiesData = await companyService.getAll();
        setCompanies(companiesData);
      } catch (error) {
        console.error("Error loading companies:", error);
      } finally {
        setLoadingCompanies(false);
      }
    };

    loadCompanies();
}, []);

  // Load form data when contact changes
  useEffect(() => {
    if (contact) {
      setFormData({
        ...contact,
        companyId: contact.companyId || "",
        company: contact.company || ""
      });
    } else {
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        companyId: "",
        company: "",
        role: "",
        status: "trial",
        mrr: 0,
        notes: ""
      });
    }
    setErrors({});
  }, [contact]);
const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.companyId && !formData.company.trim()) newErrors.companyId = "Company is required";
    if (!formData.role.trim()) newErrors.role = "Role is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    try {
      // Set company name based on selected company if companyId is provided
      const selectedCompany = companies.find(c => c.Id === parseInt(formData.companyId));
      const submitData = {
        ...formData,
        company: selectedCompany ? selectedCompany.name : formData.company,
        companyId: formData.companyId ? parseInt(formData.companyId) : null
      };

      let result;
      if (contact) {
        result = await contactService.update(contact.Id, submitData);
        toast.success("Contact updated successfully");
      } else {
        result = await contactService.create(submitData);
        toast.success("Contact created successfully");
      }
      onSave(result);
    } catch (error) {
      toast.error("Error saving contact");
      console.error("Error saving contact:", error);
    } finally {
      setIsLoading(false);
    }
  };

const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleCompanySelect = (companyId) => {
    const selectedCompany = companies.find(c => c.Id === parseInt(companyId));
    setFormData(prev => ({
      ...prev,
      companyId,
      company: selectedCompany ? selectedCompany.name : ""
    }));
    if (errors.companyId) {
      setErrors(prev => ({ ...prev, companyId: "" }));
    }
  };
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {contact ? "Edit Contact" : "Add New Contact"}
            </h2>
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <ApperIcon name="X" size={18} />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="First Name"
                value={formData.firstName}
                onChange={(e) => handleChange("firstName", e.target.value)}
                error={errors.firstName}
                required
              />
              <Input
                label="Last Name"
                value={formData.lastName}
                onChange={(e) => handleChange("lastName", e.target.value)}
                error={errors.lastName}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                error={errors.email}
                required
              />
              <Input
                label="Phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                error={errors.phone}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
<div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Company <span className="text-red-500">*</span>
                </label>
                {loadingCompanies ? (
                  <div className="h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : (
                  <select
                    value={formData.companyId}
                    onChange={(e) => handleCompanySelect(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors ${
                      errors.companyId ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select a company...</option>
                    {companies.map(company => (
                      <option key={company.Id} value={company.Id}>
                        {company.name} ({company.industry})
                      </option>
                    ))}
                  </select>
                )}
                {!formData.companyId && (
                  <div className="mt-2">
                    <Input
                      placeholder="Or enter company name manually"
                      value={formData.company}
                      onChange={(e) => handleChange("company", e.target.value)}
                      className="text-sm"
                    />
                  </div>
                )}
                {errors.companyId && <p className="text-sm text-red-500 mt-1">{errors.companyId}</p>}
              </div>
              <Input
                label="Role"
                value={formData.role}
                onChange={(e) => handleChange("role", e.target.value)}
                error={errors.role}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleChange("status", e.target.value)}
                  className="flex h-10 w-full rounded-lg border-2 border-gray-200 bg-white px-3 py-2 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                >
                  <option value="trial">Trial</option>
                  <option value="active">Active</option>
                  <option value="churned">Churned</option>
                </select>
              </div>
              <Input
                label="Monthly Recurring Revenue (MRR)"
                type="number"
                min="0"
                value={formData.mrr}
                onChange={(e) => handleChange("mrr", parseInt(e.target.value) || 0)}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
                rows={3}
                className="flex w-full rounded-lg border-2 border-gray-200 bg-white px-3 py-2 text-sm transition-colors placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 resize-none"
                placeholder="Add any additional notes about this contact..."
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
              <Button variant="secondary" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Saving...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <ApperIcon name="Save" size={16} />
                    <span>{contact ? "Update Contact" : "Create Contact"}</span>
                  </div>
                )}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
};

export default ContactForm;