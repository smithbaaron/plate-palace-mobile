import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { User, Mail, Phone } from 'lucide-react';

const customerProfileSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional(),
});

type CustomerProfileForm = z.infer<typeof customerProfileSchema>;

interface CustomerProfileFormProps {
  onComplete?: () => void;
  isOnboarding?: boolean;
}

export const CustomerProfileForm: React.FC<CustomerProfileFormProps> = ({ 
  onComplete, 
  isOnboarding = false 
}) => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CustomerProfileForm>({
    resolver: zodResolver(customerProfileSchema),
  });

  const onSubmit = async (data: CustomerProfileForm) => {
    if (!currentUser) {
      toast({
        title: "Error",
        description: "You must be logged in to update your profile",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Check if customer profile already exists
      const { data: existingProfile } = await supabase
        .from('customer_profiles')
        .select('id')
        .eq('user_id', currentUser.id)
        .single();

      if (existingProfile) {
        // Update existing profile
        const { error } = await supabase
          .from('customer_profiles')
          .update({
            full_name: data.fullName,
            email: data.email,
            phone: data.phone || null,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', currentUser.id);

        if (error) throw error;
      } else {
        // Create new profile
        const { error } = await supabase
          .from('customer_profiles')
          .insert({
            user_id: currentUser.id,
            full_name: data.fullName,
            email: data.email,
            phone: data.phone || null,
            followed_sellers: [],
            dietary_preferences: [],
          });

        if (error) throw error;
      }

      toast({
        title: "Success!",
        description: "Your profile has been updated successfully",
      });

      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error('Error updating customer profile:', error);
      toast({
        title: "Error",
        description: "Failed to update your profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-nextplate-darkgray border-gray-800">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">
          {isOnboarding ? "Complete Your Profile" : "Update Profile"}
        </CardTitle>
        <p className="text-gray-400">
          {isOnboarding 
            ? "Tell us a bit about yourself to get started" 
            : "Keep your information up to date"
          }
        </p>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="fullName" className="flex items-center gap-2">
              <User size={16} />
              Full Name
            </Label>
            <Input
              id="fullName"
              {...register('fullName')}
              placeholder="Enter your full name"
              className="bg-gray-800 border-gray-600"
            />
            {errors.fullName && (
              <p className="text-red-400 text-sm">{errors.fullName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail size={16} />
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              placeholder="Enter your email address"
              className="bg-gray-800 border-gray-600"
            />
            {errors.email && (
              <p className="text-red-400 text-sm">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-2">
              <Phone size={16} />
              Phone Number (Optional)
            </Label>
            <Input
              id="phone"
              type="tel"
              {...register('phone')}
              placeholder="Enter your phone number"
              className="bg-gray-800 border-gray-600"
            />
            {errors.phone && (
              <p className="text-red-400 text-sm">{errors.phone.message}</p>
            )}
          </div>

          <Button 
            type="submit" 
            className="w-full bg-nextplate-red hover:bg-nextplate-red/90"
            disabled={isLoading}
          >
            {isLoading ? "Saving..." : isOnboarding ? "Complete Profile" : "Update Profile"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default CustomerProfileForm;