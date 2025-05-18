
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { UserType } from "@/lib/userTypeUtils";

interface LoginFormProps {
  defaultType: string;
  onLogin: (email: string, password: string) => Promise<void>;
  isLoading: boolean;
}

const LoginForm: React.FC<LoginFormProps> = ({ 
  defaultType, 
  onLogin, 
  isLoading 
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await onLogin(email, password);
      // Parent component handles success redirection
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: error.message || "Please check your credentials and try again.",
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
        disabled={isSubmitting || isLoading}
      >
        {isSubmitting || isLoading ? "Processing..." : "Log In"}
      </Button>
    </form>
  );
};

export default LoginForm;
