
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Pages
import LandingPage from "./pages/LandingPage";
import NotFound from "./pages/NotFound";
import AuthPage from "./pages/AuthPage";
import SellerDashboard from "./pages/seller/SellerDashboard";
import CustomerDashboard from "./pages/customer/CustomerDashboard";
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

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <UserTypeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
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
          </BrowserRouter>
        </TooltipProvider>
      </UserTypeProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
