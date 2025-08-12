import React, { useState, useEffect } from "react";
import CompanyCard from "@/components/molecules/CompanyCard";
import CompanyForm from "@/components/organisms/CompanyForm";
import CompanyDetail from "@/components/organisms/CompanyDetail";
import SearchBar from "@/components/molecules/SearchBar";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import ApperIcon from "@/components/ApperIcon";
import { toast } from "react-toastify";
import { companyService } from "@/services/api/companyService";

const Companies = () => {
  const [companies, setCompanies] = useState([]);
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [planFilter, setPlanFilter] = useState("all");
  const [showCompanyForm, setShowCompanyForm] = useState(false);
  const [showCompanyDetail, setShowCompanyDetail] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);

  const loadCompanies = async () => {
    setLoading(true);
    setError("");
    
    try {
      const companiesData = await companyService.getAll();
      setCompanies(companiesData);
      setFilteredCompanies(companiesData);
    } catch (err) {
      setError("Failed to load companies");
      console.error("Error loading companies:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompanies();
  }, []);

  useEffect(() => {
    let filtered = companies;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(company =>
        company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (company.website && company.website.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by status
if (statusFilter !== "all") {
      filtered = filtered.filter(company => company.status === statusFilter);
    }

    // Filter by plan
    if (planFilter !== "all") {
      filtered = filtered.filter(company => company.subscriptionPlan?.toLowerCase() === planFilter);
    }

    setFilteredCompanies(filtered);
  }, [companies, searchTerm, statusFilter, planFilter]);

  const handleAddCompany = () => {
    setSelectedCompany(null);
    setShowCompanyForm(true);
  };

  const handleEditCompany = (company) => {
    setSelectedCompany(company);
    setShowCompanyForm(true);
    setShowCompanyDetail(false);
  };

  const handleDeleteCompany = async (company) => {
    if (window.confirm(`Are you sure you want to delete ${company.name}?`)) {
      try {
        await companyService.delete(company.Id);
        setCompanies(companies.filter(c => c.Id !== company.Id));
        toast.success("Company deleted successfully");
      } catch (error) {
        toast.error("Error deleting company");
        console.error("Error deleting company:", error);
      }
    }
  };

  const handleViewCompany = (company) => {
    setSelectedCompany(company);
    setShowCompanyDetail(true);
  };

  const handleSaveCompany = (savedCompany) => {
    if (selectedCompany) {
      // Update existing company
      setCompanies(companies.map(c => c.Id === savedCompany.Id ? savedCompany : c));
    } else {
      // Add new company
      setCompanies([savedCompany, ...companies]);
    }
    setShowCompanyForm(false);
    setSelectedCompany(null);
  };

  const handleCloseForm = () => {
    setShowCompanyForm(false);
    setSelectedCompany(null);
  };

  const handleCloseDetail = () => {
    setShowCompanyDetail(false);
    setSelectedCompany(null);
  };

const getStatusCount = (status) => {
    return companies.filter(company => company.status === status).length;
  };

  const getPlanCount = (plan) => {
    return companies.filter(company => company.subscriptionPlan?.toLowerCase() === plan).length;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Companies</h1>
            <p className="text-gray-600">Manage your client companies</p>
          </div>
          <div className="h-10 w-32 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="h-10 bg-gray-200 rounded-lg animate-pulse flex-1"></div>
          <div className="flex gap-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-10 w-20 bg-gray-200 rounded-lg animate-pulse"></div>
            ))}
          </div>
        </div>
        <Loading type="companies" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Companies</h1>
          <p className="text-gray-600">Manage your client companies</p>
        </div>
        <Error message={error} onRetry={loadCompanies} />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Companies</h1>
            <p className="text-gray-600">Manage your client companies</p>
          </div>
          <Button onClick={handleAddCompany} variant="accent">
            <ApperIcon name="Building2" size={16} className="mr-2" />
            Add Company
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search companies by name, industry, or website..."
            />
          </div>
          
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === "all"
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              All ({companies.length})
            </button>
            <button
              onClick={() => setStatusFilter("active")}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === "active"
                  ? "bg-success text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Active ({getStatusCount("active")})
            </button>
            <button
              onClick={() => setStatusFilter("trial")}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === "trial"
                  ? "bg-warning text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Trial ({getStatusCount("trial")})
            </button>
<button
              onClick={() => setStatusFilter("churned")}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === "churned"
                  ? "bg-error text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Churned ({getStatusCount("churned")})
            </button>
            <button
              onClick={() => setStatusFilter("renewal-due")}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === "renewal-due"
                  ? "bg-orange-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Renewal Due ({getStatusCount("renewal-due")})
            </button>
          </div>

          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setPlanFilter("all")}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                planFilter === "all"
                  ? "bg-accent text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              All Plans
            </button>
            <button
              onClick={() => setPlanFilter("starter")}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                planFilter === "starter"
                  ? "bg-warning text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Starter ({getPlanCount("starter")})
            </button>
            <button
              onClick={() => setPlanFilter("professional")}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                planFilter === "professional"
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Pro ({getPlanCount("professional")})
            </button>
            <button
              onClick={() => setPlanFilter("enterprise")}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                planFilter === "enterprise"
                  ? "bg-accent text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Enterprise ({getPlanCount("enterprise")})
            </button>
          </div>
        </div>

        {/* Company List */}
        {filteredCompanies.length === 0 ? (
          <Empty
            title={searchTerm || statusFilter !== "all" || planFilter !== "all" ? "No companies found" : "No companies yet"}
            description={
              searchTerm || statusFilter !== "all" || planFilter !== "all"
                ? "Try adjusting your search or filters to find what you're looking for."
                : "Start building your client database by adding your first company."
            }
            actionLabel="Add First Company"
            onAction={handleAddCompany}
            icon="Building2"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCompanies.map((company) => (
              <CompanyCard
                key={company.Id}
                company={company}
                onEdit={handleEditCompany}
                onDelete={handleDeleteCompany}
                onClick={handleViewCompany}
              />
            ))}
          </div>
        )}
      </div>

      {/* Company Form Modal */}
      <CompanyForm
        company={selectedCompany}
        onSave={handleSaveCompany}
        onCancel={handleCloseForm}
        isOpen={showCompanyForm}
      />

      {/* Company Detail Modal */}
      <CompanyDetail
        company={selectedCompany}
        onEdit={handleEditCompany}
        onClose={handleCloseDetail}
        isOpen={showCompanyDetail}
      />
    </>
  );
};

export default Companies;