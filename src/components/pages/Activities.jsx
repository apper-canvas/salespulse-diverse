import React, { useState, useEffect } from "react";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import Card from "@/components/atoms/Card";
import Input from "@/components/atoms/Input";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import ApperIcon from "@/components/ApperIcon";
import ActivityForm from "@/components/organisms/ActivityForm";
import { toast } from "react-toastify";
import { activitiesService } from "@/services/api/activitiesService";
import { contactService } from "@/services/api/contactService";
import { companyService } from "@/services/api/companyService";
import { format, isAfter, isBefore, isToday, parseISO } from "date-fns";

const Activities = () => {
  const [activities, setActivities] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    loadActivities();
  }, []);

  useEffect(() => {
    filterActivities();
  }, [activities, searchTerm, typeFilter, statusFilter, activeTab]);

  const loadActivities = async () => {
    setLoading(true);
    setError("");
    try {
      const [activitiesData, contactsData, companiesData] = await Promise.all([
        activitiesService.getAll(),
        contactService.getAll(),
        companyService.getAll()
      ]);
      
      setActivities(activitiesData);
      setContacts(contactsData);
      setCompanies(companiesData);
    } catch (err) {
      setError("Failed to load activities. Please try again.");
      console.error("Error loading activities:", err);
    } finally {
      setLoading(false);
    }
  };

  const filterActivities = () => {
    let filtered = [...activities];

    // Tab filter
    const today = new Date();
    if (activeTab === "tasks") {
      filtered = filtered.filter(a => a.isTask);
    } else if (activeTab === "overdue") {
      filtered = filtered.filter(a => 
        a.isTask && 
        a.dueDate && 
        isBefore(parseISO(a.dueDate), today) && 
        !a.completed
      );
    } else if (activeTab === "today") {
      filtered = filtered.filter(a => 
        a.dueDate && isToday(parseISO(a.dueDate))
      );
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(activity =>
        activity.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter(activity => activity.type === typeFilter);
    }

    // Status filter
    if (statusFilter === "completed") {
      filtered = filtered.filter(activity => activity.completed);
    } else if (statusFilter === "pending") {
      filtered = filtered.filter(activity => !activity.completed);
    }

    setFilteredActivities(filtered);
  };

  const handleAddActivity = () => {
    setSelectedActivity(null);
    setShowActivityForm(true);
  };

  const handleEditActivity = (activity) => {
    setSelectedActivity(activity);
    setShowActivityForm(true);
  };

  const handleDeleteActivity = async (activity) => {
    if (!window.confirm(`Are you sure you want to delete "${activity.title || activity.description}"?`)) {
      return;
    }

    try {
      await activitiesService.delete(activity.Id);
      await loadActivities();
      toast.success("Activity deleted successfully");
    } catch (error) {
      toast.error("Failed to delete activity");
      console.error("Error deleting activity:", error);
    }
  };

  const handleSaveActivity = async (savedActivity) => {
    await loadActivities();
    setShowActivityForm(false);
    setSelectedActivity(null);
    toast.success(selectedActivity ? "Activity updated successfully" : "Activity created successfully");
  };

  const handleCloseForm = () => {
    setShowActivityForm(false);
    setSelectedActivity(null);
  };

  const handleCompleteTask = async (activity) => {
    try {
      const updatedActivity = {
        ...activity,
        completed: !activity.completed,
        completedAt: !activity.completed ? new Date().toISOString() : null
      };
      await activitiesService.update(activity.Id, updatedActivity);
      await loadActivities();
      toast.success(updatedActivity.completed ? "Task marked as completed" : "Task marked as pending");
    } catch (error) {
      toast.error("Failed to update task status");
      console.error("Error updating task:", error);
    }
  };

  const getContactName = (contactId) => {
    const contact = contacts.find(c => c.Id === parseInt(contactId));
    return contact ? `${contact.firstName} ${contact.lastName}` : "Unknown Contact";
  };

  const getCompanyName = (companyId) => {
    const company = companies.find(c => c.Id === parseInt(companyId));
    return company ? company.name : "Unknown Company";
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case "call": return "Phone";
      case "email": return "Mail";
      case "meeting": return "Calendar";
      case "demo": return "Monitor";
      case "task": return "CheckSquare";
      default: return "Activity";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high": return "error";
      case "medium": return "warning";
      case "low": return "success";
      default: return "default";
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "call": return "info";
      case "email": return "accent";
      case "meeting": return "primary";
      case "demo": return "warning";
      case "task": return "success";
      default: return "default";
    }
  };

  const tabs = [
    { id: "all", name: "All Activities", count: activities.length },
    { id: "tasks", name: "Tasks", count: activities.filter(a => a.isTask).length },
    { id: "overdue", name: "Overdue", count: activities.filter(a => 
      a.isTask && a.dueDate && isBefore(parseISO(a.dueDate), new Date()) && !a.completed
    ).length },
    { id: "today", name: "Due Today", count: activities.filter(a => 
      a.dueDate && isToday(parseISO(a.dueDate))
    ).length }
  ];

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadActivities} />;

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Activities & Tasks</h1>
            <p className="text-gray-600 mt-1">
              Manage your activities, tasks, and communications
            </p>
          </div>
          <Button onClick={handleAddActivity} className="flex items-center gap-2">
            <ApperIcon name="Plus" size={16} />
            Add Activity
          </Button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.name}
                <Badge variant="outline" className="ml-2">
                  {tab.count}
                </Badge>
              </button>
            ))}
          </nav>
        </div>

        {/* Filters */}
        <Card className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <Input
                type="text"
                placeholder="Search activities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type
              </label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="call">Calls</option>
                <option value="email">Emails</option>
                <option value="meeting">Meetings</option>
                <option value="demo">Demos</option>
                <option value="task">Tasks</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
              </select>
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setTypeFilter("all");
                  setStatusFilter("all");
                }}
                className="w-full"
              >
                <ApperIcon name="X" size={16} className="mr-2" />
                Clear Filters
              </Button>
            </div>
          </div>
        </Card>

        {/* Activities List */}
        {filteredActivities.length === 0 ? (
          <Empty
            title="No activities found"
            description="No activities match your current filters. Try adjusting your search criteria or create a new activity."
            action={
              <Button onClick={handleAddActivity}>
                <ApperIcon name="Plus" size={16} className="mr-2" />
                Add Activity
              </Button>
            }
          />
        ) : (
          <div className="space-y-4">
            {filteredActivities.map((activity) => {
              const isOverdue = activity.dueDate && 
                isBefore(parseISO(activity.dueDate), new Date()) && 
                !activity.completed;
              
              return (
                <Card key={activity.Id} className={`p-6 ${isOverdue ? 'border-l-4 border-l-error' : ''}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      {activity.isTask && (
                        <button
                          onClick={() => handleCompleteTask(activity)}
                          className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                            activity.completed
                              ? 'bg-success border-success text-white'
                              : 'border-gray-300 hover:border-success'
                          }`}
                        >
                          {activity.completed && <ApperIcon name="Check" size={12} />}
                        </button>
                      )}
                      
                      <div className="h-10 w-10 bg-gradient-to-br from-primary/20 to-primary-light/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <ApperIcon 
                          name={getActivityIcon(activity.type)} 
                          size={18} 
                          className="text-primary" 
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h3 className={`text-lg font-medium text-gray-900 ${
                              activity.completed ? 'line-through text-gray-500' : ''
                            }`}>
                              {activity.title || activity.description}
                            </h3>
                            {activity.title && activity.description && (
                              <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-2 ml-4">
                            <Badge variant={getTypeColor(activity.type)}>
                              {activity.type}
                            </Badge>
                            {activity.priority && (
                              <Badge variant={getPriorityColor(activity.priority)}>
                                {activity.priority}
                              </Badge>
                            )}
                            {activity.completed && (
                              <Badge variant="success">Completed</Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                          {activity.contactId && (
                            <div className="flex items-center space-x-1">
                              <ApperIcon name="User" size={14} />
                              <span>{getContactName(activity.contactId)}</span>
                            </div>
                          )}
                          {activity.companyId && (
                            <div className="flex items-center space-x-1">
                              <ApperIcon name="Building2" size={14} />
                              <span>{getCompanyName(activity.companyId)}</span>
                            </div>
                          )}
                          <div className="flex items-center space-x-1">
                            <ApperIcon name="Clock" size={14} />
                            <span>
                              {activity.timestamp && format(parseISO(activity.timestamp), "MMM d, yyyy 'at' h:mm a")}
                            </span>
                          </div>
                        </div>

                        {activity.dueDate && (
                          <div className={`flex items-center space-x-1 text-sm ${
                            isOverdue ? 'text-error' : 'text-warning'
                          }`}>
                            <ApperIcon name="Calendar" size={14} />
                            <span>
                              Due: {format(parseISO(activity.dueDate), "MMM d, yyyy 'at' h:mm a")}
                              {isOverdue && " (Overdue)"}
                            </span>
                          </div>
                        )}

                        {activity.outcome && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-md">
                            <p className="text-sm text-gray-700">
                              <strong>Outcome:</strong> {activity.outcome}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditActivity(activity)}
                      >
                        <ApperIcon name="Edit2" size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteActivity(activity)}
                        className="text-error hover:text-error"
                      >
                        <ApperIcon name="Trash2" size={16} />
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Upcoming Tasks Section */}
        {activeTab === "all" && (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Upcoming Tasks</h2>
              <ApperIcon name="Clock" size={20} className="text-primary" />
            </div>
            
            {activities.filter(a => a.isTask && a.dueDate && isAfter(parseISO(a.dueDate), new Date()) && !a.completed).length > 0 ? (
              <div className="space-y-3">
                {activities
                  .filter(a => a.isTask && a.dueDate && isAfter(parseISO(a.dueDate), new Date()) && !a.completed)
                  .slice(0, 5)
                  .map((task) => (
                    <div key={task.Id} className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => handleCompleteTask(task)}
                          className="w-5 h-5 rounded border-2 border-gray-300 hover:border-success transition-colors"
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{task.title || task.description}</p>
                          <p className="text-xs text-gray-500">
                            Due: {format(parseISO(task.dueDate), "MMM d, yyyy 'at' h:mm a")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {task.priority && (
                          <Badge variant={getPriorityColor(task.priority)} size="sm">
                            {task.priority}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <ApperIcon name="CheckSquare" size={48} className="text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500 mb-2">No upcoming tasks</p>
                <p className="text-xs text-gray-400">Your future tasks will appear here</p>
              </div>
            )}
          </Card>
        )}
      </div>

      {/* Activity Form Modal */}
      <ActivityForm
        activity={selectedActivity}
        contacts={contacts}
        companies={companies}
        onSave={handleSaveActivity}
        onCancel={handleCloseForm}
        isOpen={showActivityForm}
      />
    </>
  );
};

export default Activities;