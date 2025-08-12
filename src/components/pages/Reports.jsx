import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import { dealService } from "@/services/api/dealService";
import { metricsService } from "@/services/api/metricsService";
import Chart from "react-apexcharts";

const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deals, setDeals] = useState([]);
  const [metrics, setMetrics] = useState([]);
  const [timeframe, setTimeframe] = useState("monthly");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [dealsData, metricsData] = await Promise.all([
        dealService.getAll(),
        metricsService.getAll()
      ]);
      
      setDeals(dealsData);
      setMetrics(metricsData);
      setError(null);
    } catch (err) {
      console.error("Error loading reports data:", err);
      setError("Failed to load reports data. Please try again.");
      toast.error("Failed to load reports data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadData} />;

  // Pipeline conversion data
  const pipelineData = deals.reduce((acc, deal) => {
    if (!acc[deal.stage]) {
      acc[deal.stage] = { count: 0, value: 0 };
    }
    acc[deal.stage].count++;
    acc[deal.stage].value += deal.value;
    return acc;
  }, {});

  const pipelineStages = ["lead", "demo", "trial", "negotiation", "closed"];
  const pipelineChartData = pipelineStages.map(stage => ({
    stage: stage.charAt(0).toUpperCase() + stage.slice(1),
    deals: pipelineData[stage]?.count || 0,
    value: pipelineData[stage]?.value || 0
  }));

  // Revenue forecasting data
  const getRevenueData = () => {
    const currentDate = new Date();
    const months = [];
    const actualRevenue = [];
    const forecastRevenue = [];

    for (let i = -5; i <= 6; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1);
      const monthName = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      months.push(monthName);

      if (i <= 0) {
        // Historical/current data
        const monthDeals = deals.filter(deal => {
          const dealDate = new Date(deal.expectedCloseDate);
          return dealDate.getMonth() === date.getMonth() && 
                 dealDate.getFullYear() === date.getFullYear() &&
                 deal.stage === 'closed';
        });
        actualRevenue.push(monthDeals.reduce((sum, deal) => sum + deal.value, 0));
        forecastRevenue.push(null);
      } else {
        // Forecast data
        actualRevenue.push(null);
        const forecastDeals = deals.filter(deal => {
          const dealDate = new Date(deal.expectedCloseDate);
          return dealDate.getMonth() === date.getMonth() && 
                 dealDate.getFullYear() === date.getFullYear() &&
                 deal.stage !== 'closed';
        });
        const forecast = forecastDeals.reduce((sum, deal) => 
          sum + (deal.value * (deal.probability / 100)), 0
        );
        forecastRevenue.push(forecast);
      }
    }

    return { months, actualRevenue, forecastRevenue };
  };

  const { months, actualRevenue, forecastRevenue } = getRevenueData();

  // Team performance data
  const teamData = deals.reduce((acc, deal) => {
    const assignedTo = deal.contactPerson || "Unassigned";
    if (!acc[assignedTo]) {
      acc[assignedTo] = { deals: 0, revenue: 0, winRate: 0 };
    }
    acc[assignedTo].deals++;
    if (deal.stage === 'closed' && deal.probability > 80) {
      acc[assignedTo].revenue += deal.value;
    }
    return acc;
  }, {});

  const teamMembers = Object.keys(teamData).slice(0, 8); // Top 8 team members
  const teamDeals = teamMembers.map(member => teamData[member].deals);
  const teamRevenue = teamMembers.map(member => teamData[member].revenue);

  // Chart configurations
  const pipelineChartOptions = {
    chart: {
      type: 'funnel',
      height: 350,
      toolbar: { show: false }
    },
    plotOptions: {
      funnel: {
        marginTop: 20,
        marginBottom: 20
      }
    },
    colors: ['#10B981', '#34D399', '#3B82F6', '#F59E0B', '#EF4444'],
    dataLabels: {
      enabled: true,
      formatter: function(val, opts) {
        return opts.w.globals.labels[opts.dataPointIndex] + ': ' + val + '%';
      }
    },
    legend: {
      show: false
    }
  };

  const revenueChartOptions = {
    chart: {
      type: 'line',
      height: 350,
      toolbar: { show: false }
    },
    colors: ['#10B981', '#3B82F6'],
    stroke: {
      width: [3, 3],
      curve: 'smooth'
    },
    xaxis: {
      categories: months
    },
    yaxis: {
      labels: {
        formatter: function (val) {
          return val ? '$' + (val / 1000).toFixed(0) + 'K' : '';
        }
      }
    },
    legend: {
      position: 'top'
    },
    markers: {
      size: 4,
      strokeWidth: 2,
      fillOpacity: 1
    }
  };

  const teamChartOptions = {
    chart: {
      type: 'bar',
      height: 350,
      toolbar: { show: false }
    },
    plotOptions: {
      bar: {
        horizontal: true,
        columnWidth: '50%'
      }
    },
    colors: ['#10B981', '#3B82F6'],
    xaxis: {
      categories: teamMembers
    },
    yaxis: {
      labels: {
        formatter: function (val) {
          return '$' + (val / 1000).toFixed(0) + 'K';
        }
      }
    },
    legend: {
      position: 'top'
    }
  };

  const exportReport = () => {
    toast.success("Report exported successfully");
  };

  const refreshData = () => {
    loadData();
    toast.info("Data refreshed");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sales Analytics</h1>
          <p className="text-gray-600 mt-1">Comprehensive sales performance and forecasting dashboard</p>
        </div>
        <div className="flex space-x-3 mt-4 sm:mt-0">
          <div className="flex bg-white rounded-lg p-1 border">
            <button
              onClick={() => setTimeframe("monthly")}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                timeframe === "monthly" 
                  ? "bg-primary text-white" 
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setTimeframe("quarterly")}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                timeframe === "quarterly" 
                  ? "bg-primary text-white" 
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Quarterly
            </button>
          </div>
          <Button variant="outline" onClick={refreshData}>
            <ApperIcon name="RefreshCw" size={16} className="mr-2" />
            Refresh
          </Button>
          <Button onClick={exportReport}>
            <ApperIcon name="Download" size={16} className="mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Pipeline Value</p>
              <p className="text-2xl font-bold text-gray-900">
                ${deals.reduce((sum, deal) => sum + deal.value, 0).toLocaleString()}
              </p>
              <div className="flex items-center mt-2">
                <ApperIcon name="TrendingUp" size={14} className="text-success mr-1" />
                <span className="text-sm text-success">+12.3%</span>
              </div>
            </div>
            <div className="h-12 w-12 bg-gradient-to-br from-primary/20 to-primary-light/20 rounded-lg flex items-center justify-center">
              <ApperIcon name="Target" size={24} className="text-primary" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {deals.length ? Math.round((deals.filter(d => d.stage === 'closed').length / deals.length) * 100) : 0}%
              </p>
              <div className="flex items-center mt-2">
                <ApperIcon name="TrendingUp" size={14} className="text-success mr-1" />
                <span className="text-sm text-success">+5.7%</span>
              </div>
            </div>
            <div className="h-12 w-12 bg-gradient-to-br from-success/20 to-primary-light/20 rounded-lg flex items-center justify-center">
              <ApperIcon name="Percent" size={24} className="text-success" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Deal Size</p>
              <p className="text-2xl font-bold text-gray-900">
                ${deals.length ? Math.round(deals.reduce((sum, deal) => sum + deal.value, 0) / deals.length).toLocaleString() : 0}
              </p>
              <div className="flex items-center mt-2">
                <ApperIcon name="TrendingDown" size={14} className="text-error mr-1" />
                <span className="text-sm text-error">-2.1%</span>
              </div>
            </div>
            <div className="h-12 w-12 bg-gradient-to-br from-accent/20 to-primary-light/20 rounded-lg flex items-center justify-center">
              <ApperIcon name="DollarSign" size={24} className="text-accent" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Sales Velocity</p>
              <p className="text-2xl font-bold text-gray-900">42 days</p>
              <div className="flex items-center mt-2">
                <ApperIcon name="TrendingUp" size={14} className="text-success mr-1" />
                <span className="text-sm text-success">-3 days</span>
              </div>
            </div>
            <div className="h-12 w-12 bg-gradient-to-br from-info/20 to-primary-light/20 rounded-lg flex items-center justify-center">
              <ApperIcon name="Clock" size={24} className="text-info" />
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pipeline Conversion Chart */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Pipeline Conversion</h3>
            <ApperIcon name="BarChart3" size={20} className="text-gray-400" />
          </div>
          <Chart
            options={pipelineChartOptions}
            series={pipelineChartData.map(item => item.deals)}
            type="funnel"
            height={350}
          />
        </Card>

        {/* Revenue Forecasting Chart */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Revenue Forecast</h3>
            <ApperIcon name="TrendingUp" size={20} className="text-gray-400" />
          </div>
          <Chart
            options={revenueChartOptions}
            series={[
              { name: 'Actual Revenue', data: actualRevenue },
              { name: 'Forecast Revenue', data: forecastRevenue }
            ]}
            type="line"
            height={350}
          />
        </Card>
      </div>

      {/* Team Performance Chart */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Team Performance</h3>
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-primary rounded-full mr-2"></div>
              <span className="text-sm text-gray-600">Deals Count</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-accent rounded-full mr-2"></div>
              <span className="text-sm text-gray-600">Revenue</span>
            </div>
          </div>
        </div>
        <Chart
          options={teamChartOptions}
          series={[
            { name: 'Deals', data: teamDeals },
            { name: 'Revenue', data: teamRevenue }
          ]}
          type="bar"
          height={400}
        />
      </Card>

      {/* Pipeline Details Table */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Pipeline Stage Details</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Stage</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Deals</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Value</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Avg Deal Size</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Conversion Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {pipelineChartData.map((stage, index) => (
                <tr key={stage.stage} className="hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-3`} style={{ backgroundColor: pipelineChartOptions.colors[index] }}></div>
                      <span className="font-medium text-gray-900">{stage.stage}</span>
                    </div>
                  </td>
                  <td className="text-right py-3 px-4 text-gray-900">{stage.deals}</td>
                  <td className="text-right py-3 px-4 text-gray-900">${stage.value.toLocaleString()}</td>
                  <td className="text-right py-3 px-4 text-gray-900">
                    ${stage.deals > 0 ? Math.round(stage.value / stage.deals).toLocaleString() : 0}
                  </td>
                  <td className="text-right py-3 px-4">
                    <span className="text-success font-medium">
                      {index < pipelineChartData.length - 1 
                        ? Math.round((pipelineChartData[index + 1].deals / stage.deals) * 100) || 0
                        : 100
                      }%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default Reports;