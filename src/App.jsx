import React from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import Reports from "@/components/pages/Reports";
import Layout from "@/components/organisms/Layout";
import Contacts from "@/components/pages/Contacts";
import Companies from "@/components/pages/Companies";
import Leads from "@/components/pages/Leads";
import Dashboard from "@/components/pages/Dashboard";
import Pipeline from "@/components/pages/Pipeline";
import Activities from "@/components/pages/Activities";

function App() {
  return (
    <Router>
      <div className="App">
        <Layout>
<Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/leads" element={<Leads />} />
            <Route path="/contacts" element={<Contacts />} />
            <Route path="/companies" element={<Companies />} />
            <Route path="/pipeline" element={<Pipeline />} />
            <Route path="/activities" element={<Activities />} />
            <Route path="/reports" element={<Reports />} />
          </Routes>
        </Layout>
<ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          style={{ zIndex: 9999 }}
        />
      </div>
    </Router>
  );
}

export default App;