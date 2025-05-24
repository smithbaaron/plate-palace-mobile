
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";

interface AuthContainerProps {
  defaultType: string;
  onLogin: (email: string, password: string) => Promise<void>;
  onSignup: (email: string, password: string, username: string) => Promise<void>;
  isLoading: boolean;
}

const AuthContainer: React.FC<AuthContainerProps> = ({
  defaultType,
  onLogin,
  onSignup,
  isLoading
}) => {
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");

  const handleSignupSuccess = () => {
    // Switch to login tab after successful signup
    setActiveTab("login");
  };

  return (
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
          <LoginForm 
            defaultType={defaultType} 
            onLogin={onLogin} 
            isLoading={isLoading}
          />
        </TabsContent>
        
        <TabsContent value="signup">
          <SignupForm 
            defaultType={defaultType} 
            onSignupSuccess={handleSignupSuccess}
            isLoading={isLoading}
          />
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
  );
};

export default AuthContainer;
