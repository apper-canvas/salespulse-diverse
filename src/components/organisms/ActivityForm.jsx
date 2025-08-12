import React, { useState, useEffect } from "react";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import Input from "@/components/atoms/Input";
import ApperIcon from "@/components/ApperIcon";
import { activitiesService } from "@/services/api/activitiesService";
import { format } from "date-fns";

const ActivityForm = ({ activity, contacts = [], companies = [], onSave, onCancel, isOpen }) => {
  const [formData, setFormData] = useState({
    type: "call",
    title: "",
    description: "",
    contactId: "",
    companyId: "",
    timestamp: "",
    dueDate: "",
    priority: "medium",
    outcome: "",
    isTask: false,
    completed: false
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activity) {
      setFormData({
        type: activity.type || "call",
        title: activity.title || "",
        description: activity.description || "",
        contactId: activity.contactId || "",
        companyId: activity.companyId || "",
        timestamp: activity.timestamp ? new Date(activity.timestamp).toISOString().slice(0, 16) : "",
        dueDate: activity.dueDate ? new Date(activity.dueDate).toISOString().slice(0, 16) : "",
        priority: activity.priority || "medium",
        outcome: activity.outcome || "",
        isTask: activity.isTask || false,
        completed: activity.completed || false
      });
    } else {
      // Reset form for new activity
      const now = new Date().toISOString().slice(0, 16);
      setFormData({
        type: "call",
        title: "",
        description: "",
        contactId: "",
        companyId: "",
        timestamp: now,
        dueDate: "",
        priority: "medium",
        outcome: "",
        isTask: false,
        completed: false
      });
    }
  }, [activity, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const activityData = {
        ...formData,
        timestamp: formData.timestamp ? new Date(formData.timestamp).toISOString() : new Date().toISOString(),
        dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
        contactId: formData.contactId ? parseInt(formData.contactId) : null,
        companyId: formData.companyId ? parseInt(formData.companyId) : null
      };

      if (activity) {
        await activitiesService.update(activity.Id, activityData);
      } else {
        await activitiesService.create(activityData);
      }

      onSave();
    } catch (error) {
      console.error("Error saving activity:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {activity ? "Edit Activity" : "Create New Activity"}
            </h2>
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <ApperIcon name="X" size={18} />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Activity Type and Task Toggle */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Activity Type *
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="call">Call</option>
                  <option value="email">Email</option>
                  <option value="meeting">Meeting</option>
                  <option value="demo">Demo</option>
                  <option value="task">Task</option>
                </select>
              </div>

              <div className="flex items-center space-x-4 pt-6">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="isTask"
                    checked={formData.isTask}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="text-sm font-medium text-gray-700">Is Task</span>
                </label>

                {activity && formData.isTask && (
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="completed"
                      checked={formData.completed}
                      onChange={handleInputChange}
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span className="text-sm font-medium text-gray-700">Completed</span>
                  </label>
                )}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <Input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter activity title"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                placeholder="Enter activity description"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              />
            </div>

            {/* Contact and Company */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Associated Contact
                </label>
                <select
                  name="contactId"
                  value={formData.contactId}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">Select Contact</option>
                  {contacts.map((contact) => (
                    <option key={contact.Id} value={contact.Id}>
                      {contact.firstName} {contact.lastName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Associated Company
                </label>
                <select
                  name="companyId"
                  value={formData.companyId}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">Select Company</option>
                  {companies.map((company) => (
                    <option key={company.Id} value={company.Id}>
                      {company.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* DateTime and Due Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {formData.isTask ? "Created At" : "Date & Time"} *
                </label>
                <Input
                  type="datetime-local"
                  name="timestamp"
                  value={formData.timestamp}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {formData.isTask && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Due Date
                  </label>
                  <Input
                    type="datetime-local"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleInputChange}
                  />
                </div>
              )}
            </div>

            {/* Priority (for tasks) */}
            {formData.isTask && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            )}

            {/* Outcome Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Outcome Notes
              </label>
              <textarea
                name="outcome"
                value={formData.outcome}
                onChange={handleInputChange}
                rows={3}
                placeholder="Enter outcome or notes from this activity"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              />
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <ApperIcon name="Loader" size={16} className="mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <ApperIcon name="Save" size={16} className="mr-2" />
                    {activity ? "Update Activity" : "Create Activity"}
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
};

export default ActivityForm;