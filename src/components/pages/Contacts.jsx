import React, { useState, useEffect } from "react";
import ContactCard from "@/components/molecules/ContactCard";
import ContactForm from "@/components/organisms/ContactForm";
import ContactDetail from "@/components/organisms/ContactDetail";
import SearchBar from "@/components/molecules/SearchBar";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import ApperIcon from "@/components/ApperIcon";
import { toast } from "react-toastify";
import { contactService } from "@/services/api/contactService";

const Contacts = () => {
  const [contacts, setContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showContactForm, setShowContactForm] = useState(false);
  const [showContactDetail, setShowContactDetail] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);

  const loadContacts = async () => {
    setLoading(true);
    setError("");
    
    try {
      const contactsData = await contactService.getAll();
      setContacts(contactsData);
      setFilteredContacts(contactsData);
    } catch (err) {
      setError("Failed to load contacts");
      console.error("Error loading contacts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContacts();
  }, []);

  useEffect(() => {
    let filtered = contacts;

    // Filter by search term
    if (searchTerm) {
filtered = filtered.filter(contact =>
        `${contact.firstName} ${contact.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (contact.company && contact.company.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(contact => contact.status === statusFilter);
    }

    setFilteredContacts(filtered);
  }, [contacts, searchTerm, statusFilter]);

  const handleAddContact = () => {
    setSelectedContact(null);
    setShowContactForm(true);
  };

  const handleEditContact = (contact) => {
    setSelectedContact(contact);
    setShowContactForm(true);
    setShowContactDetail(false);
  };

  const handleDeleteContact = async (contact) => {
    if (window.confirm(`Are you sure you want to delete ${contact.firstName} ${contact.lastName}?`)) {
      try {
        await contactService.delete(contact.Id);
        setContacts(contacts.filter(c => c.Id !== contact.Id));
        toast.success("Contact deleted successfully");
      } catch (error) {
        toast.error("Error deleting contact");
        console.error("Error deleting contact:", error);
      }
    }
  };

  const handleViewContact = (contact) => {
    setSelectedContact(contact);
    setShowContactDetail(true);
  };

  const handleSaveContact = (savedContact) => {
    if (selectedContact) {
      // Update existing contact
      setContacts(contacts.map(c => c.Id === savedContact.Id ? savedContact : c));
    } else {
      // Add new contact
      setContacts([savedContact, ...contacts]);
    }
    setShowContactForm(false);
    setSelectedContact(null);
  };

  const handleCloseForm = () => {
    setShowContactForm(false);
    setSelectedContact(null);
  };

  const handleCloseDetail = () => {
    setShowContactDetail(false);
    setSelectedContact(null);
  };

  const getStatusCount = (status) => {
    return contacts.filter(contact => contact.status === status).length;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Contacts</h1>
            <p className="text-gray-600">Manage your customer relationships</p>
          </div>
          <div className="h-10 w-32 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="h-10 bg-gray-200 rounded-lg animate-pulse flex-1"></div>
          <div className="flex gap-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-10 w-20 bg-gray-200 rounded-lg animate-pulse"></div>
            ))}
          </div>
        </div>
        <Loading type="contacts" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Contacts</h1>
          <p className="text-gray-600">Manage your customer relationships</p>
        </div>
        <Error message={error} onRetry={loadContacts} />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Contacts</h1>
            <p className="text-gray-600">Manage your customer relationships</p>
          </div>
          <Button onClick={handleAddContact} variant="accent">
            <ApperIcon name="UserPlus" size={16} className="mr-2" />
            Add Contact
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search contacts by name, email, or company..."
            />
          </div>
          
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === "all"
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              All ({contacts.length})
            </button>
            <button
              onClick={() => setStatusFilter("active")}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === "active"
                  ? "bg-success text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Active ({getStatusCount("active")})
            </button>
            <button
              onClick={() => setStatusFilter("trial")}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === "trial"
                  ? "bg-warning text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Trial ({getStatusCount("trial")})
            </button>
            <button
              onClick={() => setStatusFilter("churned")}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === "churned"
                  ? "bg-error text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Churned ({getStatusCount("churned")})
            </button>
          </div>
        </div>

        {/* Contact List */}
        {filteredContacts.length === 0 ? (
          <Empty
            title={searchTerm || statusFilter !== "all" ? "No contacts found" : "No contacts yet"}
            description={
              searchTerm || statusFilter !== "all"
                ? "Try adjusting your search or filters to find what you're looking for."
                : "Start building your customer database by adding your first contact."
            }
            actionLabel="Add First Contact"
            onAction={handleAddContact}
            icon="Users"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContacts.map((contact) => (
              <ContactCard
                key={contact.Id}
                contact={contact}
                onEdit={handleEditContact}
                onDelete={handleDeleteContact}
                onClick={handleViewContact}
              />
            ))}
          </div>
        )}
      </div>

      {/* Contact Form Modal */}
      <ContactForm
        contact={selectedContact}
        onSave={handleSaveContact}
        onCancel={handleCloseForm}
        isOpen={showContactForm}
      />

      {/* Contact Detail Modal */}
      <ContactDetail
        contact={selectedContact}
        onEdit={handleEditContact}
        onClose={handleCloseDetail}
        isOpen={showContactDetail}
      />
    </>
  );
};

export default Contacts;