import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useUserType } from "@/context/UserTypeContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import { UserType } from "@/lib/userTypeUtils";

const AuthPage = () => {
  const [searchParams] = useSearchParams();
  const defaultType = searchParams.get("type") || "seller";
  
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login, signup, isAuthenticated, currentUser, loading } = useAuth();
  const { userType, setUserType, isOnboarded, navigateToAuth } = useUserType();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  
  // More reliable navigation logic after authentication
  useEffect(() => {
    if (loading) return; // Don't do anything while still loading auth state
    
    if (isAuthenticated && currentUser) {
      console.log("Auth state:", { isAuthenticated, userType, isOnboarded });
      
      if (userType) {
        if (!isOnboarded) {
          navigate(`/${userType}/onboarding`, { replace: true });
        } else if (userType === "seller") {
          navigate('/seller/dashboard', { replace: true });
        } else if (userType === "customer") {
          navigate('/customer/dashboard', { replace: true });
        }
      } else {
        // If authenticated but no user type, go to the default type's onboarding
        const selectedType = defaultType as UserType;
        setUserType(selectedType).then(() => {
          navigate(`/${selectedType}/onboarding`, { replace: true });
        });
      }
    }
  }, [isAuthenticated, userType, isOnboarded, loading, navigate, defaultType]);
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await login(email, password);
      
      // We'll let the useEffect handle the redirection once auth state is updated
      toast({
        title: "Login successful!",
        description: `Welcome back to NextPlate!`,
      });
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "Please check your credentials and try again.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };
  
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    if (!username) {
      toast({
        title: "Username required",
        description: "Please enter a username to continue.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }
    
    try {
      await signup(email, password, username);
      const selectedType = defaultType as "seller" | "customer";
      await setUserType(selectedType);
      
      toast({
        title: "Account created!",
        description: `Welcome to NextPlate as a ${defaultType}!`,
      });
    } catch (error: any) {
      toast({
        title: "Signup failed",
        description: error.message || "Please check your information and try again.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />
      
      <div className="pt-24 pb-20 px-4">
        <div className="max-w-md mx-auto bg-nextplate-darkgray rounded-xl p-6 md:p-8 shadow-2xl">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold mb-1">Welcome to NextPlate</h2>
            <p className="text-gray-400">
              Sign in or create an account as a{" "}
              <span className={defaultType === "seller" ? "text-nextplate-orange" : "text-nextplate-red"}>
                {defaultType}
              </span>
            </p>
          </div>
          
          <Tabs defaultValue="login" value={activeTab} onValueChange={(v) => setActiveTab(v as "login" | "signup")}>
            <TabsList className="grid grid-cols-2 mb-6 bg-nextplate-lightgray">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-black border-nextplate-lightgray text-white"
                  />
                </div>
                <div>
                  <Input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-black border-nextplate-lightgray text-white"
                  />
                </div>
                <Button
                  type="submit"
                  className={`w-full ${
                    defaultType === "seller" ? "bg-nextplate-orange hover:bg-orange-600" : "bg-nextplate-red hover:bg-red-600"
                  }`}
                  disabled={isSubmitting || loading}
                >
                  {isSubmitting || loading ? "Processing..." : "Log In"}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div>
                  <Input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-black border-nextplate-lightgray text-white"
                  />
                </div>
                <div>
                  <Input
                    type="text"
                    placeholder={defaultType === "seller" ? "Username (Store Name)" : "Username"}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="bg-black border-nextplate-lightgray text-white"
                  />
                  {defaultType === "seller" && (
                    <p className="text-xs text-gray-400 mt-1">
                      This will also be your store name and URL
                    </p>
                  )}
                </div>
                <div>
                  <Input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-black border-nextplate-lightgray text-white"
                    minLength={6}
                  />
                </div>
                <Button
                  type="submit"
                  className={`w-full ${
                    defaultType === "seller" ? "bg-nextplate-orange hover:bg-orange-600" : "bg-nextplate-red hover:bg-red-600"
                  }`}
                  disabled={isSubmitting || loading}
                >
                  {isSubmitting || loading ? "Creating account..." : "Create Account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400">
              {activeTab === "login" ? "Don't have an account? " : "Already have an account? "}
              <button 
                onClick={() => setActiveTab(activeTab === "login" ? "signup" : "login")}
                className="text-nextplate-orange hover:underline"
              >
                {activeTab === "login" ? "Sign up" : "Log in"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
