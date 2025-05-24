import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase"; // Adjust import path

interface SignupFormProps {
  defaultType: string;
  onSignupSuccess: () => void; // New success callback
  isLoading: boolean;
}

const SignupForm: React.FC<SignupFormProps> = ({ 
  defaultType, 
  onSignupSuccess,
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
      // 1. Sign up with Supabase Auth
      const { data: { user }, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { 
            username, 
            role: defaultType // 'seller' or 'customer'
          }
        }
      });

      if (authError) throw authError;

      // 2. Create profile in public.profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([{
          id: user?.id,
          email,
          username,
          role: defaultType,
          onboarded: false
        }]);

      if (profileError) {
        // Rollback: Delete auth user if profile creation fails
        if (user) await supabase.auth.admin.deleteUser(user.id);
        throw new Error("Failed to create profile. Please try again.");
      }

      // 3. Success
      toast({
        title: "Account created!",
        description: "Please check your email to verify your account.",
      });
      onSignupSuccess(); // Trigger parent's success flow

    } catch (error: any) {
      console.error("Signup error:", error);
      
      let errorMessage = "Please check your information and try again.";
      if (error.message.includes("User already registered")) {
        errorMessage = "This email is already registered. Please log in.";
      } else if (error.message.includes("failed to create profile")) {
        errorMessage = "Profile setup failed. Contact support.";
      }

      toast({
        title: "Signup failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* ... (keep your existing JSX for inputs) ... */}
    </form>
  );
};

export default SignupForm;