import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { leadService } from "@/services/api/leadService";
import ApperIcon from "@/components/ApperIcon";
import LeadForm from "@/components/organisms/LeadForm";
import LeadDetail from "@/components/organisms/LeadDetail";
import LeadCard from "@/components/molecules/LeadCard";
import SearchBar from "@/components/molecules/SearchBar";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import Card from "@/components/atoms/Card";

const Leads = () => {
  const [leads, setLeads] = useState([]);
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [assigneeFilter, setAssigneeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("score");
  const [showForm, setShowForm] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [sourceAnalytics, setSourceAnalytics] = useState({});
  const [salesTeam, setSalesTeam] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterAndSortLeads();
  }, [leads, searchTerm, statusFilter, sourceFilter, assigneeFilter, sortBy]);

  const loadData = async () => {
    setLoading(true);
    setError("");
    
    try {
      const [leadsData, analyticsData, teamData] = await Promise.all([
        leadService.getAll(),
        leadService.getSourceAnalytics(),
        leadService.getSalesTeam()
      ]);
      
      setLeads(leadsData);
      setSourceAnalytics(analyticsData);
      setSalesTeam(teamData);
    } catch (err) {
      setError("Failed to load leads data");
      console.error("Error loading leads:", err);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortLeads = () => {
    let filtered = [...leads];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(lead =>
        lead.firstName.toLowerCase().includes(term) ||
        lead.lastName.toLowerCase().includes(term) ||
        lead.email.toLowerCase().includes(term) ||
        lead.companyName.toLowerCase().includes(term) ||
        lead.title.toLowerCase().includes(term)
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(lead => lead.status === statusFilter);
    }

    // Source filter
    if (sourceFilter !== "all") {
      filtered = filtered.filter(lead => lead.source === sourceFilter);
    }

    // Assignee filter
    if (assigneeFilter !== "all") {
      filtered = filtered.filter(lead => lead.assignedToId === parseInt(assigneeFilter));
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "score":
          return b.leadScore - a.leadScore;
        case "created":
          return new Date(b.createdAt) - new Date(a.createdAt);
        case "company":
          return a.companyName.localeCompare(b.companyName);
        case "name":
          return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
        default:
          return 0;
      }
    });

    setFilteredLeads(filtered);
  };

  const handleAddLead = () => {
    setSelectedLead(null);
    setShowForm(true);
  };

  const handleEditLead = (lead) => {
    setSelectedLead(lead);
    setShowForm(true);
  };

  const handleViewLead = (lead) => {
    setSelectedLead(lead);
    setShowDetail(true);
  };

  const handleDeleteLead = async (lead) => {
    if (window.confirm(`Are you sure you want to delete ${lead.firstName} ${lead.lastName}?`)) {
      try {
        await leadService.delete(lead.Id);
        toast.success("Lead deleted successfully");
        loadData();
      } catch (error) {
        toast.error("Error deleting lead: " + error.message);
      }
    }
  };

  const handleAssignLead = async (lead) => {
    // Simple round-robin auto-assignment for demo
    try {
      await leadService.autoAssignByRoundRobin(lead.Id);
      toast.success("Lead assigned successfully");
      loadData();
    } catch (error) {
      toast.error("Error assigning lead: " + error.message);
    }
  };

  const handleSaveLead = (savedLead) => {
    setShowForm(false);
    setSelectedLead(null);
    loadData();
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedLead(null);
  };

  const handleCloseDetail = () => {
    setShowDetail(false);
    setSelectedLead(null);
  };

  const handleConvertLead = () => {
    setShowDetail(false);
    setSelectedLead(null);
    loadData();
  };

  const getStatusCount = (status) => {
    return leads.filter(lead => lead.status === status).length;
  };

  const getSourceCount = (source) => {
    return leads.filter(lead => lead.source === source).length;
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadData} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lead Management</h1>
          <p className="mt-1 text-gray-600">
            Manage and qualify your sales leads
          </p>
        </div>
        
        <div className="mt-4 sm:mt-0">
          <Button onClick={handleAddLead} className="flex items-center">
            <ApperIcon name="UserPlus" size={16} className="mr-2" />
            Add New Lead
          </Button>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Leads</p>
              <p className="text-2xl font-bold text-gray-900">{leads.length}</p>
            </div>
            <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
              <ApperIcon name="Users" size={20} className="text-primary" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Qualified Leads</p>
              <p className="text-2xl font-bold text-success">{getStatusCount("Qualified")}</p>
            </div>
            <div className="h-10 w-10 bg-success/10 rounded-full flex items-center justify-center">
              <ApperIcon name="CheckCircle" size={20} className="text-success" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Lead Score</p>
              <p className="text-2xl font-bold text-warning">
                {leads.length ? Math.round(leads.reduce((sum, lead) => sum + lead.leadScore, 0) / leads.length) : 0}
              </p>
            </div>
            <div className="h-10 w-10 bg-warning/10 rounded-full flex items-center justify-center">
              <ApperIcon name="Target" size={20} className="text-warning" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Converted</p>
<p className="text-2xl font-bold text-accent">{getStatusCount("Converted")}</p>
            </div>
            <div className="h-10 w-10 bg-accent/10 rounded-full flex items-center justify-center">
              <ApperIcon name="ArrowRight" size={20} className="text-accent" />
            </div>
</div>
        </Card>
      </div>

      {/* Source Analytics */}
      {Object.keys(sourceAnalytics).length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <ApperIcon name="BarChart3" size={18} className="mr-2 text-primary" />
            Lead Source Performance
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(sourceAnalytics).map(([source, stats]) => (
              <div key={source} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{source}</h4>
                  <ApperIcon 
                    name={source === "Website" ? "Globe" : source === "Referral" ? "Users" : source === "Marketing Campaign" ? "Megaphone" : "Mail"} 
                    size={16} 
                    className="text-gray-500" 
                  />
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total:</span>
                    <span className="font-medium">{stats.count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Qualified:</span>
                    <span className="font-medium text-success">{stats.qualified}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Avg Score:</span>
                    <span className="font-medium">{stats.avgScore}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Conv. Rate:</span>
                    <span className="font-medium text-primary">{stats.conversionRate}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Filters and Search */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-4">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search leads by name, email, or company..."
          />
        </div>
        
        <div className="lg:col-span-8">
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Status:</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="New">New</option>
                <option value="Nurturing">Nurturing</option>
                <option value="Qualified">Qualified</option>
                <option value="Converted">Converted</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Source:</label>
              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="all">All Sources</option>
                <option value="Website">Website</option>
                <option value="Marketing Campaign">Marketing Campaign</option>
                <option value="Referral">Referral</option>
                <option value="Cold Outreach">Cold Outreach</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Assignee:</label>
              <select
                value={assigneeFilter}
                onChange={(e) => setAssigneeFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="all">All Assignees</option>
                {salesTeam.map(member => (
                  <option key={member.Id} value={member.Id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="score">Lead Score</option>
                <option value="created">Created Date</option>
                <option value="company">Company Name</option>
                <option value="name">Lead Name</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Status Filters */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setStatusFilter("all")}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
            statusFilter === "all"
              ? "bg-primary text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          All ({leads.length})
        </button>
        
        <button
          onClick={() => setStatusFilter("New")}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
            statusFilter === "New"
              ? "bg-info text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          New ({getStatusCount("New")})
        </button>
        
        <button
          onClick={() => setStatusFilter("Nurturing")}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
            statusFilter === "Nurturing"
              ? "bg-warning text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Nurturing ({getStatusCount("Nurturing")})
        </button>
        
        <button
          onClick={() => setStatusFilter("Qualified")}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
            statusFilter === "Qualified"
              ? "bg-success text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Qualified ({getStatusCount("Qualified")})
        </button>
        
        <button
          onClick={() => setStatusFilter("Converted")}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
            statusFilter === "Converted"
              ? "bg-accent text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Converted ({getStatusCount("Converted")})
        </button>
      </div>

      {/* Leads Grid */}
      {filteredLeads.length === 0 ? (
        <Empty
          title="No leads found"
          description={searchTerm || statusFilter !== "all" || sourceFilter !== "all" || assigneeFilter !== "all"
            ? "Try adjusting your search criteria or filters"
            : "Get started by adding your first lead"
          }
          action={
            <Button onClick={handleAddLead} className="mt-4">
              <ApperIcon name="UserPlus" size={16} className="mr-2" />
              Add New Lead
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLeads.map((lead) => (
            <LeadCard
              key={lead.Id}
              lead={lead}
              onView={handleViewLead}
              onEdit={handleEditLead}
              onDelete={handleDeleteLead}
              onAssign={handleAssignLead}
            />
          ))}
        </div>
      )}

      {/* Lead Form Modal */}
      {showForm && (
        <LeadForm
          lead={selectedLead}
          onSave={handleSaveLead}
          onCancel={handleCloseForm}
          onClose={handleCloseForm}
        />
      )}

      {/* Lead Detail Modal */}
      {showDetail && selectedLead && (
        <LeadDetail
          lead={selectedLead}
          onClose={handleCloseDetail}
          onEdit={handleEditLead}
          onConvert={handleConvertLead}
          onDelete={handleDeleteLead}
        />
      )}
    </div>
  );
};

export default Leads;