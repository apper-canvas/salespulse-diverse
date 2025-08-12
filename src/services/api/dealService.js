import dealsData from "@/services/mockData/deals.json";

let deals = [...dealsData];
let nextId = Math.max(...deals.map(d => d.Id)) + 1;

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export const dealService = {
  async getAll() {
    await delay(300);
    return [...deals];
  },

  async getById(id) {
    await delay(200);
    const dealId = parseInt(id);
    if (isNaN(dealId)) {
      throw new Error('Invalid deal ID');
    }
    
    const deal = deals.find(d => d.Id === dealId);
    if (!deal) {
      throw new Error('Deal not found');
    }
    
    return { ...deal };
  },

  async getByStage(stage) {
    await delay(200);
    return deals.filter(d => d.stage === stage).map(d => ({ ...d }));
  },

  async create(dealData) {
    await delay(400);
    
    const newDeal = {
      ...dealData,
      Id: nextId++,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    deals.push(newDeal);
    return { ...newDeal };
  },

  async update(id, dealData) {
    await delay(300);
    const dealId = parseInt(id);
    if (isNaN(dealId)) {
      throw new Error('Invalid deal ID');
    }
    
    const dealIndex = deals.findIndex(d => d.Id === dealId);
    if (dealIndex === -1) {
      throw new Error('Deal not found');
    }
    
    const updatedDeal = {
      ...deals[dealIndex],
      ...dealData,
      Id: dealId, // Ensure ID cannot be changed
      updatedAt: new Date().toISOString()
    };
    
    deals[dealIndex] = updatedDeal;
    return { ...updatedDeal };
  },

  async updateStage(id, stage) {
    await delay(200);
    return this.update(id, { stage });
  },

  async delete(id) {
    await delay(300);
    const dealId = parseInt(id);
    if (isNaN(dealId)) {
      throw new Error('Invalid deal ID');
    }
    
    const dealIndex = deals.findIndex(d => d.Id === dealId);
    if (dealIndex === -1) {
      throw new Error('Deal not found');
    }
    
    const deletedDeal = deals[dealIndex];
    deals.splice(dealIndex, 1);
    return { ...deletedDeal };
  },

  async getStats() {
    await delay(200);
    const stats = deals.reduce((acc, deal) => {
      if (!acc[deal.stage]) {
        acc[deal.stage] = { count: 0, value: 0 };
      }
      acc[deal.stage].count++;
      acc[deal.stage].value += deal.value;
      return acc;
    }, {});

return {
      total: deals.length,
      totalValue: deals.reduce((sum, deal) => sum + deal.value, 0),
      byStage: stats
    };
  },

  // Lead conversion methods
  async createFromLead(leadData, dealData) {
    await delay(300);
    const leadToDeal = {
      title: dealData.title || `${leadData.companyName} - ${leadData.firstName} ${leadData.lastName}`,
      companyId: dealData.companyId || null,
      contactName: `${leadData.firstName} ${leadData.lastName}`,
      contactEmail: leadData.email,
      value: dealData.value || 0,
      stage: "Prospecting",
      probability: 25,
      closeDate: dealData.closeDate,
      assignedTo: leadData.assignedTo,
      leadSource: leadData.source,
      leadScore: leadData.leadScore,
      notes: `Converted from lead ID ${leadData.Id}. Original lead score: ${leadData.leadScore}`,
      leadId: leadData.Id
    };
    
    return this.create(leadToDeal);
  },

  async getByLeadSource(leadSource) {
    await delay(200);
    return deals.filter(d => d.leadSource === leadSource).map(d => ({ ...d }));
  },

  async getConversionStats() {
    await delay(200);
    const convertedDeals = deals.filter(d => d.leadId);
    const totalRevenue = convertedDeals.reduce((sum, deal) => sum + deal.value, 0);
    
    return {
      totalConverted: convertedDeals.length,
      totalRevenue,
      avgDealSize: convertedDeals.length ? Math.round(totalRevenue / convertedDeals.length) : 0,
      conversionsBySource: convertedDeals.reduce((acc, deal) => {
        if (!acc[deal.leadSource]) {
          acc[deal.leadSource] = { count: 0, revenue: 0 };
        }
        acc[deal.leadSource].count++;
        acc[deal.leadSource].revenue += deal.value;
        return acc;
}, {})
    };
  }
};