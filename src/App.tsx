
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { NotificationProvider } from "@/context/NotificationContext";

// Pages
import LandingPage from "./pages/LandingPage";
import NotFound from "./pages/NotFound";
import AuthPage from "./pages/AuthPage";
import VerifyEmail from "./pages/VerifyEmail";
import SellerDashboard from "./pages/seller/SellerDashboard";
import CustomerDashboard from "./pages/customer/CustomerDashboard";
import CustomerOrders from "./pages/customer/CustomerOrders";
import SellerOnboarding from "./pages/seller/SellerOnboarding";
import CustomerOnboarding from "./pages/customer/CustomerOnboarding";
import PlateDetails from "./pages/plate/PlateDetails";
import MealPrepDetails from "./pages/mealprep/MealPrepDetails";
import Profile from "./pages/profile/Profile";
import DeliverySettings from "./pages/seller/DeliverySettings";

// Components
import ProtectedRoute from "./components/ProtectedRoute";

// Context
import { AuthProvider } from "./context/AuthContext";
import { UserTypeProvider } from "./context/UserTypeContext";

const queryClient = new QueryClient();

// Create a wrapper component that has access to the router context
const AppWithProviders = () => {
  const navigate = useNavigate();
  
  const navigateToAuth = () => {
    navigate('/auth');
  };

  return (
    <AuthProvider>
      <UserTypeProvider navigateToAuth={navigateToAuth}>
        <NotificationProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/auth" element={<AuthPage />} />
              
              {/* Seller Routes */}
              <Route path="/seller/onboarding" element={
                <ProtectedRoute requiredUserType="seller" requireOnboarded={false}>
                  <SellerOnboarding />
                </ProtectedRoute>
              } />
              <Route path="/seller/dashboard" element={
                <ProtectedRoute requiredUserType="seller" requireOnboarded={true}>
                  <SellerDashboard />
                </ProtectedRoute>
              } />
              <Route path="/seller/delivery-settings" element={
                <ProtectedRoute requiredUserType="seller" requireOnboarded={true}>
                  <DeliverySettings />
                </ProtectedRoute>
              } />
              
              {/* Customer Routes */}
              <Route path="/customer/onboarding" element={
                <ProtectedRoute requiredUserType="customer" requireOnboarded={false}>
                  <CustomerOnboarding />
                </ProtectedRoute>
              } />
              <Route path="/customer/dashboard" element={
                <ProtectedRoute requiredUserType="customer" requireOnboarded={true}>
                  <CustomerDashboard />
                </ProtectedRoute>
              } />
              <Route path="/customer/orders" element={
                <ProtectedRoute requiredUserType="customer" requireOnboarded={true}>
                  <CustomerOrders />
                </ProtectedRoute>
              } />
              
              {/* Shared Routes */}
              <Route path="/plate/:id" element={
                <ProtectedRoute>
                  <PlateDetails />
                </ProtectedRoute>
              } />
              <Route path="/mealprep/:id" element={
                <ProtectedRoute>
                  <MealPrepDetails />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              
              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </TooltipProvider>
        </NotificationProvider>
      </UserTypeProvider>
    </AuthProvider>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AppWithProviders />
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
