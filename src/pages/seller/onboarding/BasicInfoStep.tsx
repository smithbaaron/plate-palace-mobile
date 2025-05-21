
import React from "react";
import { Package, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface BasicInfoStepProps {
  businessName: string;
  setBusinessName: (name: string) => void;
  bio: string;
  setBio: (bio: string) => void;
  phoneNumber: string;
  setPhoneNumber: (phone: string) => void;
  formErrors: {
    businessName: boolean;
    bio: boolean;
    phoneNumber: boolean;
  };
  setFormErrors: React.Dispatch<React.SetStateAction<{
    businessName: boolean;
    bio: boolean;
    phoneNumber: boolean;
  }>>;
  handleNextStep: () => void;
  isBasicInfoComplete: boolean;
}

const BasicInfoStep: React.FC<BasicInfoStepProps> = ({
  businessName,
  setBusinessName,
  bio,
  setBio,
  phoneNumber,
  setPhoneNumber,
  formErrors,
  setFormErrors,
  handleNextStep,
  isBasicInfoComplete
}) => {
  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-bold mb-6 flex items-center">
        <Package className="mr-2 text-nextplate-orange" />
        Basic Information
      </h2>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-1">
            Store Name <span className="text-red-500">*</span>
          </label>
          <Input
            value={businessName}
            onChange={(e) => {
              setBusinessName(e.target.value);
              setFormErrors({...formErrors, businessName: false});
            }}
            placeholder="Your kitchen or business name"
            className={`bg-black border-nextplate-lightgray text-white ${formErrors.businessName ? 'border-red-500' : ''}`}
            required
          />
          {formErrors.businessName && (
            <p className="text-xs text-red-500 mt-1 flex items-center">
              <AlertCircle size={12} className="mr-1" /> Store name is required
            </p>
          )}
          <p className="text-xs text-gray-400 mt-1">This is how customers will find your store</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">
            Description <span className="text-red-500">*</span>
          </label>
          <Textarea
            value={bio}
            onChange={(e) => {
              setBio(e.target.value);
              setFormErrors({...formErrors, bio: false});
            }}
            placeholder="Tell customers about your food style, specialties, etc."
            className={`bg-black border-nextplate-lightgray text-white min-h-[100px] ${formErrors.bio ? 'border-red-500' : ''}`}
            required
          />
          {formErrors.bio && (
            <p className="text-xs text-red-500 mt-1 flex items-center">
              <AlertCircle size={12} className="mr-1" /> Description is required (minimum 10 characters)
            </p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">
            Contact Phone <span className="text-red-500">*</span>
          </label>
          <Input
            value={phoneNumber}
            onChange={(e) => {
              // Filter non-digit characters for phone input
              const value = e.target.value.replace(/[^\d-+() ]/g, '');
              setPhoneNumber(value);
              setFormErrors({...formErrors, phoneNumber: false});
            }}
            placeholder="Phone number for customers to contact you"
            className={`bg-black border-nextplate-lightgray text-white ${formErrors.phoneNumber ? 'border-red-500' : ''}`}
            required
          />
          {formErrors.phoneNumber && (
            <p className="text-xs text-red-500 mt-1 flex items-center">
              <AlertCircle size={12} className="mr-1" /> Valid phone number is required (min 10 digits)
            </p>
          )}
        </div>
      </div>
      
      <div className="mt-8 flex justify-end">
        <Button
          onClick={handleNextStep}
          className="bg-nextplate-orange hover:bg-orange-600"
          disabled={!isBasicInfoComplete}
        >
          Next: Delivery Options
        </Button>
      </div>
    </div>
  );
};

export default BasicInfoStep;
