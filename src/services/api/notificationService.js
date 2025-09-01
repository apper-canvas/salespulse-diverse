const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const notificationService = {
  // Initialize ApperClient
  getApperClient() {
    if (typeof window !== 'undefined' && window.ApperSDK) {
      const { ApperClient } = window.ApperSDK;
      return new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
    }
    throw new Error('ApperSDK not available');
  },

  async getAll() {
    try {
      const apperClient = this.getApperClient();
      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "notification_id_c"}},
          {"field": {"Name": "user_id_c"}},
          {"field": {"Name": "lead_id_c"}},
          {"field": {"Name": "type_c"}},
          {"field": {"Name": "message_c"}},
          {"field": {"Name": "timestamp_c"}},
          {"field": {"Name": "read_status_c"}}
        ],
        orderBy: [{"fieldName": "timestamp_c", "sorttype": "DESC"}],
        pagingInfo: {"limit": 100, "offset": 0}
      };
      
      const response = await apperClient.fetchRecords('notification_c', params);
      
      if (!response.success) {
        console.error(response.message);
        return [];
      }
      
      return response.data || [];
    } catch (error) {
      console.error("Error fetching notifications:", error?.response?.data?.message || error);
      return [];
    }
  },

  async getById(id) {
    try {
      const apperClient = this.getApperClient();
      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "notification_id_c"}},
          {"field": {"Name": "user_id_c"}},
          {"field": {"Name": "lead_id_c"}},
          {"field": {"Name": "type_c"}},
          {"field": {"Name": "message_c"}},
          {"field": {"Name": "timestamp_c"}},
          {"field": {"Name": "read_status_c"}}
        ]
      };
      
      const response = await apperClient.getRecordById('notification_c', parseInt(id), params);
      
      if (!response.success) {
        console.error(response.message);
        return null;
      }
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching notification ${id}:`, error?.response?.data?.message || error);
      return null;
    }
  },

  async create(notificationData) {
    try {
      const apperClient = this.getApperClient();
      const params = {
        records: [{
          Name: notificationData.Name || notificationData.message_c || 'Lead Notification',
          notification_id_c: notificationData.notification_id_c || Date.now(),
          user_id_c: notificationData.user_id_c,
          lead_id_c: notificationData.lead_id_c,
          type_c: notificationData.type_c,
          message_c: notificationData.message_c,
          timestamp_c: new Date().toISOString(),
          read_status_c: false
        }]
      };
      
      const response = await apperClient.createRecord('notification_c', params);
      
      if (!response.success) {
        console.error(response.message);
        return null;
      }
      
      if (response.results && response.results.length > 0) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to create ${failed.length} notifications:`, failed);
        }
        
        return successful.length > 0 ? successful[0].data : null;
      }
      
      return null;
    } catch (error) {
      console.error("Error creating notification:", error?.response?.data?.message || error);
      return null;
    }
  },

  async markAsRead(id) {
    try {
      const apperClient = this.getApperClient();
      const params = {
        records: [{
          Id: parseInt(id),
          read_status_c: true
        }]
      };
      
      const response = await apperClient.updateRecord('notification_c', params);
      
      if (!response.success) {
        console.error(response.message);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error(`Error marking notification ${id} as read:`, error?.response?.data?.message || error);
      return false;
    }
  },

  async getUnreadCount() {
    try {
      const apperClient = this.getApperClient();
      const params = {
        fields: [{"field": {"Name": "Id"}}],
        where: [{"FieldName": "read_status_c", "Operator": "EqualTo", "Values": [false]}],
        pagingInfo: {"limit": 100, "offset": 0}
      };
      
      const response = await apperClient.fetchRecords('notification_c', params);
      
      if (!response.success) {
        console.error(response.message);
        return 0;
      }
      
      return response.data?.length || 0;
    } catch (error) {
      console.error("Error getting unread count:", error?.response?.data?.message || error);
      return 0;
    }
  },

  async getByUser(userId) {
    try {
      const apperClient = this.getApperClient();
      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "notification_id_c"}},
          {"field": {"Name": "user_id_c"}},
          {"field": {"Name": "lead_id_c"}},
          {"field": {"Name": "type_c"}},
          {"field": {"Name": "message_c"}},
          {"field": {"Name": "timestamp_c"}},
          {"field": {"Name": "read_status_c"}}
        ],
        where: [{"FieldName": "user_id_c", "Operator": "EqualTo", "Values": [parseInt(userId)]}],
        orderBy: [{"fieldName": "timestamp_c", "sorttype": "DESC"}],
        pagingInfo: {"limit": 50, "offset": 0}
      };
      
      const response = await apperClient.fetchRecords('notification_c', params);
      
      if (!response.success) {
        console.error(response.message);
        return [];
      }
      
      return response.data || [];
    } catch (error) {
      console.error("Error fetching user notifications:", error?.response?.data?.message || error);
      return [];
    }
  },

  // Helper methods for creating specific notification types
  async createLeadAssignedNotification(leadId, assigneeName, assigneeId) {
    return this.create({
      user_id_c: assigneeId,
      lead_id_c: leadId,
      type_c: 'New Lead Assigned',
      message_c: `A new lead has been assigned to ${assigneeName}`
    });
  },

  async createStatusChangedNotification(leadId, oldStatus, newStatus, userId) {
    return this.create({
      user_id_c: userId,
      lead_id_c: leadId,
      type_c: 'Status Changed',
      message_c: `Lead status changed from ${oldStatus} to ${newStatus}`
    });
  },

  async createFollowupReminderNotification(leadId, followupDate, userId) {
    return this.create({
      user_id_c: userId,
      lead_id_c: leadId,
      type_c: 'Follow-up Reminder',
      message_c: `Follow-up reminder: Lead requires follow-up on ${new Date(followupDate).toLocaleDateString()}`
    });
  },

  async createNoteAddedNotification(leadId, noteTitle, userId) {
    return this.create({
      user_id_c: userId,
      lead_id_c: leadId,
      type_c: 'Note Added',
      message_c: `New note added to lead: ${noteTitle}`
    });
  },

  async createLeadMarkedLostNotification(leadId, reason, userId) {
    return this.create({
      user_id_c: userId,
      lead_id_c: leadId,
      type_c: 'Lead Marked Lost',
      message_c: `Lead marked as lost${reason ? ': ' + reason : ''}`
    });
  },

  async createLeadTaggedNotification(leadId, tags, userId) {
    return this.create({
      user_id_c: userId,
      lead_id_c: leadId,
      type_c: 'Lead Tagged',
      message_c: `Lead has been tagged: ${tags}`
    });
  }
};