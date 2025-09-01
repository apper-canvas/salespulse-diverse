import { createContext, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ToastContainer } from "react-toastify";
import { setUser, clearUser } from './store/userSlice';
import Reports from "@/components/pages/Reports";
import Layout from "@/components/organisms/Layout";
import Contacts from "@/components/pages/Contacts";
import Companies from "@/components/pages/Companies";
import Leads from "@/components/pages/Leads";
import Dashboard from "@/components/pages/Dashboard";
import Pipeline from "@/components/pages/Pipeline";
import Activities from "@/components/pages/Activities";

// Create auth context
export const AuthContext = createContext(null);

function AppContent() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Get authentication status with proper error handling
  const userState = useSelector((state) => state.user);
  const isAuthenticated = userState?.isAuthenticated || false;
  
  // Initialize ApperUI once when the app loads
  useEffect(() => {
    const initializeSDK = () => {
      if (typeof window !== 'undefined' && window.ApperSDK) {
        const { ApperClient, ApperUI } = window.ApperSDK;
        
        const client = new ApperClient({
          apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
          apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
        });
        
        // Initialize but don't show login yet
        ApperUI.setup(client, {
          target: '#authentication',
          clientId: import.meta.env.VITE_APPER_PROJECT_ID,
          view: 'both',
          onSuccess: function (user) {
            setIsInitialized(true);
            // CRITICAL: This exact currentPath logic must be preserved in all implementations
            // DO NOT simplify or modify this pattern as it ensures proper redirection flow
            let currentPath = window.location.pathname + window.location.search;
            let redirectPath = new URLSearchParams(window.location.search).get('redirect');
            const isAuthPage = currentPath.includes('/login') || currentPath.includes('/signup') || 
                               currentPath.includes('/callback') || currentPath.includes('/error');
            
            if (user) {
              // User is authenticated
              if (redirectPath) {
                navigate(redirectPath);
              } else if (!isAuthPage) {
                if (!currentPath.includes('/login') && !currentPath.includes('/signup')) {
                  navigate(currentPath);
                } else {
                  navigate('/');
                }
              } else {
                navigate('/');
              }
              // Store user information in Redux
              dispatch(setUser(JSON.parse(JSON.stringify(user))));
            } else {
              // User is not authenticated - allow access to CRM without auth for now
              setIsInitialized(true);
              dispatch(clearUser());
            }
          },
          onError: function(error) {
            console.error("Authentication failed:", error);
            setIsInitialized(true);
          }
        });
      } else {
        // SDK not available, continue without authentication
        console.warn("ApperSDK not available, continuing without authentication");
        setIsInitialized(true);
      }
    };

    // Wait a moment for SDK to load
    const timeoutId = setTimeout(initializeSDK, 100);
    
    return () => clearTimeout(timeoutId);
  }, [navigate, dispatch]);
  
  // Authentication methods to share via context
  const authMethods = {
    isInitialized,
    logout: async () => {
      try {
        if (typeof window !== 'undefined' && window.ApperSDK) {
          const { ApperUI } = window.ApperSDK;
          await ApperUI.logout();
        }
        dispatch(clearUser());
        navigate('/');
      } catch (error) {
        console.error("Logout failed:", error);
      }
    }
  };
  
  // Don't render routes until initialization is complete
  if (!isInitialized) {
    return (
      <div className="loading flex items-center justify-center p-6 h-screen w-full bg-background">
        <svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2v4"></path>
          <path d="m16.2 7.8 2.9-2.9"></path>
          <path d="M18 12h4"></path>
          <path d="m16.2 16.2 2.9 2.9"></path>
          <path d="M12 18v4"></path>
          <path d="m4.9 19.1 2.9-2.9"></path>
          <path d="M2 12h4"></path>
          <path d="m4.9 4.9 2.9 2.9"></path>
        </svg>
      </div>
    );
  }
  
  return (
    <AuthContext.Provider value={authMethods}>
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
    </AuthContext.Provider>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;