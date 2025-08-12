import React, { useEffect, useState } from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import DealCard from "@/components/molecules/DealCard";
import DealDetail from "@/components/organisms/DealDetail";
import { toast } from "react-toastify";
import { dealService } from "@/services/api/dealService";
import { companyService } from "@/services/api/companyService";
import ApperIcon from "@/components/ApperIcon";
import DealForm from "@/components/organisms/DealForm";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import Card from "@/components/atoms/Card";
const Pipeline = () => {
const [deals, setDeals] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [showDealDetail, setShowDealDetail] = useState(false);
  const stages = [
    { id: 'lead', name: 'Lead', color: 'bg-gray-100', borderColor: 'border-gray-300' },
    { id: 'demo', name: 'Demo Scheduled', color: 'bg-blue-50', borderColor: 'border-blue-200' },
    { id: 'trial', name: 'Trial', color: 'bg-yellow-50', borderColor: 'border-yellow-200' },
    { id: 'negotiation', name: 'Negotiation', color: 'bg-orange-50', borderColor: 'border-orange-200' },
    { id: 'closed', name: 'Closed Won/Lost', color: 'bg-green-50', borderColor: 'border-green-200' }
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [dealsData, companiesData] = await Promise.all([
        dealService.getAll(),
        companyService.getAll()
      ]);
      setDeals(dealsData);
      setCompanies(companiesData);
    } catch (err) {
      setError(err.message);
      toast.error('Failed to load pipeline data');
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const dealId = parseInt(result.draggableId);
    const newStage = result.destination.droppableId;

    try {
      await dealService.updateStage(dealId, newStage);
      
      setDeals(prevDeals => 
        prevDeals.map(deal => 
          deal.Id === dealId ? { ...deal, stage: newStage } : deal
        )
      );

      toast.success('Deal moved successfully');
    } catch (err) {
      toast.error('Failed to move deal');
    }
  };
const handleAddDeal = () => {
    setShowForm(true);
  };

  const handleSaveDeal = async (dealData) => {
    try {
      const savedDeal = await dealService.create(dealData);
      setDeals(prevDeals => [...prevDeals, savedDeal]);
      setShowForm(false);
      toast.success('Deal created successfully');
    } catch (err) {
      toast.error('Failed to create deal');
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
  };

  const handleDealClick = (deal) => {
    setSelectedDeal(deal);
    setShowDealDetail(true);
  };

  const handleCloseDealDetail = () => {
    setSelectedDeal(null);
    setShowDealDetail(false);
  };

  const handleEditDeal = (deal) => {
    // Close detail modal and open edit form
    setShowDealDetail(false);
    // Future: implement edit functionality
    toast.info('Edit functionality coming soon');
  };

  const getDealsByStage = (stageId) => {
    return deals.filter(deal => deal.stage === stageId);
  };

  const getStageValue = (stageId) => {
    return getDealsByStage(stageId).reduce((sum, deal) => sum + deal.value, 0);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getProbabilityColor = (probability) => {
    if (probability >= 80) return 'text-green-600 bg-green-100';
    if (probability >= 60) return 'text-yellow-600 bg-yellow-100';
    if (probability >= 40) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getCompanyName = (companyId) => {
    const company = companies.find(c => c.Id === companyId);
    return company ? company.name : 'Unknown Company';
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadData} />;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Sales Pipeline</h1>
          <p className="text-gray-600">Track and manage deals through your sales process</p>
        </div>
        <Button 
          onClick={handleAddDeal}
          className="mt-4 sm:mt-0 flex items-center space-x-2"
        >
          <ApperIcon name="Plus" size={16} />
          <span>Add Deal</span>
        </Button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 min-h-screen">
          {stages.map((stage) => {
            const stageDeals = getDealsByStage(stage.id);
            const stageValue = getStageValue(stage.id);

            return (
              <div key={stage.id} className="flex flex-col">
                <div className={`${stage.color} ${stage.borderColor} border-2 border-dashed rounded-lg p-4 mb-4`}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-800">{stage.name}</h3>
                    <Badge variant="outline" className="text-xs">
                      {stageDeals.length}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600">
                    {formatCurrency(stageValue)}
                  </div>
                </div>

                <Droppable droppableId={stage.id}>
                  {(provided, snapshot) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className={`flex-1 space-y-3 min-h-[200px] p-2 rounded-lg transition-colors ${
                        snapshot.isDraggingOver ? 'bg-blue-50' : 'bg-transparent'
                      }`}
                    >
                      {stageDeals.length === 0 ? (
                        <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
                          No deals in {stage.name.toLowerCase()}
                        </div>
                      ) : (
                        stageDeals.map((deal, index) => (
                          <Draggable 
                            key={deal.Id} 
                            draggableId={deal.Id.toString()} 
                            index={index}
                          >
{(provided, snapshot) => (
                              <Card 
                                {...provided.draggableProps}
                                ref={provided.innerRef}
                                className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                                  snapshot.isDragging ? 'shadow-lg rotate-2' : ''
                                }`}
                                onClick={() => handleDealClick(deal)}
                              >
                                <div {...provided.dragHandleProps}>
                                  <div className="flex items-start justify-between mb-2">
                                    <h4 className="font-medium text-gray-900 text-sm">
                                      {getCompanyName(deal.companyId)}
                                    </h4>
                                    <ApperIcon 
                                      name="GripVertical" 
                                      size={14} 
                                      className="text-gray-400 flex-shrink-0 ml-2" 
                                    />
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <div className="text-lg font-semibold text-primary">
                                      {formatCurrency(deal.value)}
                                    </div>
                                    
                                    <div className="flex items-center justify-between">
                                      <Badge 
                                        className={`text-xs px-2 py-1 ${getProbabilityColor(deal.probability)}`}
                                      >
                                        {deal.probability}%
                                      </Badge>
                                      <div className="text-xs text-gray-500">
                                        {formatDate(deal.expectedCloseDate)}
                                      </div>
                                    </div>
                                    
                                    {deal.contactPerson && (
                                      <div className="text-xs text-gray-600 flex items-center">
                                        <ApperIcon name="User" size={12} className="mr-1" />
                                        {deal.contactPerson}
                                      </div>
                                    )}
                                    
                                    {deal.notes && (
                                      <div className="text-xs text-gray-500 line-clamp-2">
                                        {deal.notes}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </Card>
                            )}
                          </Draggable>
                        ))
                      )}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>

{showForm && (
        <DealForm
          companies={companies}
          onSave={handleSaveDeal}
          onClose={handleCloseForm}
        />
      )}

      {showDealDetail && selectedDeal && (
        <DealDetail
          deal={selectedDeal}
          onClose={handleCloseDealDetail}
          onEdit={handleEditDeal}
        />
      )}
    </div>
  );
};

export default Pipeline;