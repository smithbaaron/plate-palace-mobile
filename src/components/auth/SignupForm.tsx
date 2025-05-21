
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface SignupFormProps {
  defaultType: string;
  onSignup: (email: string, password: string, username: string) => Promise<void>;
  isLoading: boolean;
}

const SignupForm: React.FC<SignupFormProps> = ({ 
  defaultType, 
  onSignup, 
  isLoading 
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
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
      await onSignup(email, password, username);
      // Parent component handles success redirection
    } catch (error: any) {
      console.error("Signup error:", error);
      let errorMessage = "Please check your information and try again.";
      
      // Extract more specific error message if available
      if (error.message) {
        errorMessage = error.message;
        // Clean up common Supabase error messages
        if (errorMessage.includes("User already registered")) {
          errorMessage = "This email is already registered. Please try logging in instead.";
        }
      }
      
      toast({
        title: "Signup failed",
        description: errorMessage,
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
        disabled={isSubmitting || isLoading}
      >
        {isSubmitting || isLoading ? "Creating account..." : "Create Account"}
      </Button>
    </form>
  );
};

export default SignupForm;
