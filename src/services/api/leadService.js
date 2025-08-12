import leadsData from "@/services/mockData/leads.json";

// In-memory storage for runtime modifications
let leads = [...leadsData];

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Sales team members for assignment
const salesTeam = [
  { Id: 1, name: "John Smith", territory: "West Coast" },
  { Id: 2, name: "Emma Wilson", territory: "East Coast" },
  { Id: 3, name: "David Kim", territory: "Central" },
  { Id: 4, name: "Sarah Davis", territory: "West Coast" }
];

export const leadService = {
  async getAll() {
    await delay(300);
    return [...leads];
  },

  async getById(id) {
    await delay(200);
    const lead = leads.find(l => l.Id === parseInt(id));
    if (!lead) {
      throw new Error(`Lead with ID ${id} not found`);
    }
    return { ...lead };
  },

  async getByStatus(status) {
    await delay(200);
    return leads.filter(l => l.status === status).map(l => ({ ...l }));
  },

  async getBySource(source) {
    await delay(200);
    return leads.filter(l => l.source === source).map(l => ({ ...l }));
  },

  async getByAssignee(assigneeId) {
    await delay(200);
    return leads.filter(l => l.assignedToId === parseInt(assigneeId)).map(l => ({ ...l }));
  },

  async create(leadData) {
    await delay(400);
    const newId = Math.max(...leads.map(l => l.Id)) + 1;
    
    // Calculate lead score
    const score = this.calculateLeadScore(leadData);
    
    const newLead = {
      ...leadData,
      Id: newId,
      leadScore: score.totalScore,
      qualificationCriteria: score.breakdown,
      status: score.totalScore >= 80 ? "Qualified" : score.totalScore >= 60 ? "Nurturing" : "New",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    leads.unshift(newLead);
    return { ...newLead };
  },

  async update(id, leadData) {
    await delay(400);
    const index = leads.findIndex(l => l.Id === parseInt(id));
    if (index === -1) {
      throw new Error(`Lead with ID ${id} not found`);
    }
    
    // Recalculate score if qualification data changed
    let updatedData = { ...leadData };
    if (leadData.companySize || leadData.industry || leadData.engagementLevel) {
      const score = this.calculateLeadScore({ ...leads[index], ...leadData });
      updatedData.leadScore = score.totalScore;
      updatedData.qualificationCriteria = score.breakdown;
    }
    
    const updatedLead = {
      ...leads[index],
      ...updatedData,
      Id: parseInt(id),
      updatedAt: new Date().toISOString()
    };
    
    leads[index] = updatedLead;
    return { ...updatedLead };
  },

  async delete(id) {
    await delay(300);
    const index = leads.findIndex(l => l.Id === parseInt(id));
    if (index === -1) {
      throw new Error(`Lead with ID ${id} not found`);
    }
    
    const deletedLead = leads[index];
    leads.splice(index, 1);
    return { ...deletedLead };
  },

  // Lead qualification scoring
  calculateLeadScore(leadData) {
    let companySizeScore = 0;
    let industryFitScore = 0;
    let engagementScore = 0;
    let budgetFitScore = 0;

    // Company size scoring (max 30 points)
    switch (leadData.companySize) {
      case "500+":
        companySizeScore = 30;
        break;
      case "201-500":
        companySizeScore = 28;
        break;
      case "51-200":
        companySizeScore = 25;
        break;
      case "11-50":
        companySizeScore = 20;
        break;
      case "1-10":
        companySizeScore = 15;
        break;
      default:
        companySizeScore = 10;
    }

    // Industry fit scoring (max 25 points)
    const highFitIndustries = ["Technology", "Software", "SaaS"];
    const mediumFitIndustries = ["Manufacturing", "Healthcare", "Finance"];
    const lowFitIndustries = ["Retail", "Hospitality", "Non-profit"];

    if (highFitIndustries.includes(leadData.industry)) {
      industryFitScore = 22;
    } else if (mediumFitIndustries.includes(leadData.industry)) {
      industryFitScore = 18;
    } else if (lowFitIndustries.includes(leadData.industry)) {
      industryFitScore = 14;
    } else {
      industryFitScore = 16;
    }

    // Engagement level scoring (max 25 points)
    switch (leadData.engagementLevel) {
      case "High":
        engagementScore = 20;
        break;
      case "Medium":
        engagementScore = 15;
        break;
      case "Low":
        engagementScore = 10;
        break;
      default:
        engagementScore = 12;
    }

    // Budget fit scoring (max 20 points) - based on company size and title
    const executiveTitles = ["CEO", "CTO", "VP", "Director", "Head of"];
    const hasExecutiveTitle = executiveTitles.some(title => 
      leadData.title?.toLowerCase().includes(title.toLowerCase())
    );

    if (hasExecutiveTitle && (companySizeScore >= 25)) {
      budgetFitScore = 20;
    } else if (hasExecutiveTitle || (companySizeScore >= 20)) {
      budgetFitScore = 18;
    } else {
      budgetFitScore = 15;
    }

    const totalScore = companySizeScore + industryFitScore + engagementScore + budgetFitScore;

    return {
      totalScore,
      breakdown: {
        companySizeScore,
        industryFitScore,
        engagementScore,
        budgetFitScore
      }
    };
  },

  // Lead assignment methods
  async assignLead(leadId, assigneeId) {
    await delay(200);
    const assignee = salesTeam.find(member => member.Id === parseInt(assigneeId));
    if (!assignee) {
      throw new Error("Invalid assignee ID");
    }

    return this.update(leadId, {
      assignedTo: assignee.name,
      assignedToId: assignee.Id,
      territory: assignee.territory
    });
  },

  async assignByTerritory(leadId, territory) {
    await delay(200);
    const territoryMembers = salesTeam.filter(member => member.territory === territory);
    if (territoryMembers.length === 0) {
      throw new Error("No team members found for territory");
    }

    // Round-robin assignment within territory
    const leadsByTerritory = leads.filter(l => l.territory === territory);
    const assignmentCounts = territoryMembers.reduce((acc, member) => {
      acc[member.Id] = leadsByTerritory.filter(l => l.assignedToId === member.Id).length;
      return acc;
    }, {});

    const assignee = territoryMembers.reduce((min, member) => 
      assignmentCounts[member.Id] < assignmentCounts[min.Id] ? member : min
    );

    return this.update(leadId, {
      assignedTo: assignee.name,
      assignedToId: assignee.Id,
      territory: assignee.territory
    });
  },

  async autoAssignByRoundRobin(leadId) {
    await delay(200);
    const assignmentCounts = salesTeam.reduce((acc, member) => {
      acc[member.Id] = leads.filter(l => l.assignedToId === member.Id).length;
      return acc;
    }, {});

    const assignee = salesTeam.reduce((min, member) => 
      assignmentCounts[member.Id] < assignmentCounts[min.Id] ? member : min
    );

    return this.update(leadId, {
      assignedTo: assignee.name,
      assignedToId: assignee.Id,
      territory: assignee.territory
    });
  },

  // Source analytics
  async getSourceAnalytics() {
    await delay(200);
    const sourceStats = leads.reduce((acc, lead) => {
      if (!acc[lead.source]) {
        acc[lead.source] = {
          count: 0,
          qualified: 0,
          avgScore: 0,
          totalScore: 0
        };
      }
      acc[lead.source].count++;
      acc[lead.source].totalScore += lead.leadScore;
      if (lead.status === "Qualified") {
        acc[lead.source].qualified++;
      }
      return acc;
    }, {});

    // Calculate averages and conversion rates
    Object.keys(sourceStats).forEach(source => {
      const stats = sourceStats[source];
      stats.avgScore = Math.round(stats.totalScore / stats.count);
      stats.conversionRate = Math.round((stats.qualified / stats.count) * 100);
      delete stats.totalScore;
    });

    return sourceStats;
  },

  async getSalesTeam() {
    await delay(100);
    return [...salesTeam];
  },

  // Convert lead to deal
  async convertToDeal(leadId, dealData) {
    await delay(300);
    const lead = await this.getById(leadId);
    
    const convertedDeal = {
      title: dealData.title || `${lead.companyName} - ${lead.firstName} ${lead.lastName}`,
      companyId: dealData.companyId,
      contactName: `${lead.firstName} ${lead.lastName}`,
      value: dealData.value,
      stage: "Prospecting",
      probability: 25,
      closeDate: dealData.closeDate,
      leadSource: lead.source,
      leadScore: lead.leadScore,
      assignedTo: lead.assignedTo,
      notes: `Converted from lead ID ${leadId}. Original lead score: ${lead.leadScore}`
    };

    // Update lead status to converted
    await this.update(leadId, { status: "Converted" });
    
    return convertedDeal;
  }
};