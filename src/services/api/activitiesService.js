import React from "react";
import { notificationService } from "@/services/api/notificationService";
import { toast } from "react-toastify";
import Error from "@/components/ui/Error";
import activitiesData from "@/services/mockData/activities.json";

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const activitiesService = {
  async getAll() {
    await delay(200);
    return [...activitiesData];
  },

  async getById(id) {
    await delay(150);
    const activity = activitiesData.find(a => a.Id === parseInt(id));
    if (!activity) {
      throw new Error(`Activity with ID ${id} not found`);
    }
    return { ...activity };
  },

  async getByContact(contactId) {
    await delay(150);
    return activitiesData.filter(a => parseInt(a.contactId) === parseInt(contactId));
  },

  async getByCompany(companyId) {
    await delay(150);
    return activitiesData.filter(a => parseInt(a.companyId) === parseInt(companyId));
  },

  async getTasks() {
    await delay(150);
    return activitiesData.filter(a => a.isTask);
  },

  async getOverdueTasks() {
    await delay(150);
    const now = new Date();
    return activitiesData.filter(a => 
      a.isTask && 
      a.dueDate && 
      new Date(a.dueDate) < now && 
      !a.completed
    );
  },

  async create(activityData) {
    await delay(300);
    const newId = Math.max(...activitiesData.map(a => a.Id), 0) + 1;
    const newActivity = {
      ...activityData,
      Id: newId,
      timestamp: activityData.timestamp || new Date().toISOString(),
      isTask: activityData.isTask || false,
      completed: activityData.completed || false,
      priority: activityData.priority || "medium"
    };
    activitiesData.unshift(newActivity);
    return { ...newActivity };
  },

  async update(id, activityData) {
    await delay(300);
    const index = activitiesData.findIndex(a => a.Id === parseInt(id));
    if (index === -1) {
      throw new Error(`Activity with ID ${id} not found`);
    }
    
    const updatedActivity = {
      ...activitiesData[index],
      ...activityData,
      Id: parseInt(id)
    };
    
    // Handle task completion
    if (updatedActivity.completed && !activitiesData[index].completed) {
      updatedActivity.completedAt = new Date().toISOString();
    } else if (!updatedActivity.completed && activitiesData[index].completed) {
      updatedActivity.completedAt = null;
    }
    
    activitiesData[index] = updatedActivity;
    return { ...updatedActivity };
  },

  async markComplete(id) {
    return this.update(id, { 
      completed: true, 
      completedAt: new Date().toISOString() 
    });
  },

  async markIncomplete(id) {
    return this.update(id, { 
      completed: false, 
      completedAt: null 
    });
  },

async delete(id) {
    await delay(250);
    const index = activitiesData.findIndex(a => a.Id === parseInt(id));
    if (index === -1) {
      throw new Error(`Activity with ID ${id} not found`);
    }
    
    const deletedActivity = activitiesData[index];
    activitiesData.splice(index, 1);
    return { ...deletedActivity };
  },

// Lead activity tracking methods
  async createLeadActivity(leadId, activityData) {
    await delay(300);
    const leadActivity = {
      ...activityData,
      leadId: parseInt(leadId),
      type: "lead_activity",
      title: activityData.title || "Lead Activity",
      description: activityData.description || `Activity for lead ID ${leadId}`
    };
    
    const createdActivity = await this.create(leadActivity);

    // Create notification for note/comment added
    try {
      if (activityData.type === "note" || activityData.description) {
        await notificationService.createNoteAddedNotification(
          leadId,
          activityData.title || "New note",
          activityData.assignedToId || 1
        );
        toast.success("Note added and notification sent");
      }
    } catch (error) {
      console.error("Error creating note notification:", error);
    }

    return createdActivity;
  },

  async getByLead(leadId) {
    await delay(200);
    return activitiesData.filter(a => a.leadId === parseInt(leadId));
  },

  async createLeadConversionActivity(leadId, dealId) {
    await delay(200);
    const conversionActivity = {
      title: "Lead Converted to Deal",
      description: `Lead ID ${leadId} was successfully converted to Deal ID ${dealId}`,
      type: "conversion",
      leadId: parseInt(leadId),
      dealId: parseInt(dealId),
      isTask: false,
      completed: true
    };
return this.create(conversionActivity);
  }
};