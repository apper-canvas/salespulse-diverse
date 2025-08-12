import metricsData from "@/services/mockData/metrics.json";

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const metricsService = {
async getAll() {
    await delay(250);
    // Include lead-related metrics in dashboard
    const baseMetrics = [...metricsData];
    
    // Add lead metrics if leadService is available
    try {
      const { leadService } = await import('./leadService.js');
      const leads = await leadService.getAll();
      const sourceAnalytics = await leadService.getSourceAnalytics();
      
      const leadMetric = {
        label: "Lead Conversion",
        value: leads.length ? Math.round((leads.filter(l => l.status === "Converted").length / leads.length) * 100) : 0,
        unit: "%",
        trend: "up",
        trendValue: 12,
        icon: "UserPlus",
        description: "Leads converted to deals"
      };
      
      return [...baseMetrics, leadMetric];
    } catch (error) {
      // Fallback if leadService not available
      return baseMetrics;
    }
  },

  async getById(index) {
    await delay(200);
    const metric = metricsData[index];
    if (!metric) {
      throw new Error(`Metric at index ${index} not found`);
    }
    return { ...metric };
  },

  async create(metricData) {
    await delay(300);
    const newMetric = { ...metricData };
    metricsData.push(newMetric);
    return { ...newMetric };
  },

  async update(index, metricData) {
    await delay(300);
    if (index < 0 || index >= metricsData.length) {
      throw new Error(`Metric at index ${index} not found`);
    }
    
    const updatedMetric = {
      ...metricsData[index],
      ...metricData
    };
    
    metricsData[index] = updatedMetric;
    return { ...updatedMetric };
  },

  async delete(index) {
    await delay(250);
    if (index < 0 || index >= metricsData.length) {
      throw new Error(`Metric at index ${index} not found`);
    }
    
    const deletedMetric = metricsData[index];
    metricsData.splice(index, 1);
    return { ...deletedMetric };
  }
};