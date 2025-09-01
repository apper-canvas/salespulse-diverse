import { toast } from "react-toastify";

// Delay function for simulating API calls
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const commentService = {
  // Get all comments for a specific lead
  async getByLeadId(leadId) {
    await delay(300);
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "comment_text_c"}},
          {"field": {"Name": "lead_id_c"}},
          {"field": {"Name": "user_id_c"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "CreatedBy"}},
          {"field": {"Name": "ModifiedOn"}}
        ],
        where: [
          {
            "FieldName": "lead_id_c",
            "Operator": "EqualTo",
            "Values": [parseInt(leadId)],
            "Include": true
          }
        ],
        orderBy: [{"fieldName": "CreatedOn", "sorttype": "DESC"}]
      };

      const response = await apperClient.fetchRecords("comment_c", params);
      
      if (!response.success) {
        console.error("Error fetching comments:", response.message);
        toast.error(response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      console.error("Error fetching comments:", error?.response?.data?.message || error);
      toast.error("Failed to load comments");
      return [];
    }
  },

  // Create a new comment
  async create(commentData) {
    await delay(300);
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        records: [{
          comment_text_c: commentData.comment_text_c,
          lead_id_c: parseInt(commentData.lead_id_c),
          user_id_c: commentData.user_id_c || 1 // Default to user 1 if not provided
        }]
      };

      const response = await apperClient.createRecord("comment_c", params);

      if (!response.success) {
        console.error("Error creating comment:", response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to create comment:`, failed);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
          return null;
        }

        if (successful.length > 0) {
          return successful[0].data;
        }
      }

      return null;
    } catch (error) {
      console.error("Error creating comment:", error?.response?.data?.message || error);
      toast.error("Failed to create comment");
      return null;
    }
  },

  // Update a comment
  async update(commentId, commentData) {
    await delay(300);
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        records: [{
          Id: parseInt(commentId),
          comment_text_c: commentData.comment_text_c
        }]
      };

      const response = await apperClient.updateRecord("comment_c", params);

      if (!response.success) {
        console.error("Error updating comment:", response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to update comment:`, failed);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
          return null;
        }

        if (successful.length > 0) {
          return successful[0].data;
        }
      }

      return null;
    } catch (error) {
      console.error("Error updating comment:", error?.response?.data?.message || error);
      toast.error("Failed to update comment");
      return null;
    }
  },

  // Delete a comment
  async delete(commentId) {
    await delay(300);
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        RecordIds: [parseInt(commentId)]
      };

      const response = await apperClient.deleteRecord("comment_c", params);

      if (!response.success) {
        console.error("Error deleting comment:", response.message);
        toast.error(response.message);
        return false;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to delete comment:`, failed);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
          return false;
        }

        return successful.length > 0;
      }

      return false;
    } catch (error) {
      console.error("Error deleting comment:", error?.response?.data?.message || error);
      toast.error("Failed to delete comment");
      return false;
    }
  }
};

export { commentService };