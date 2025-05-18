
import React from "react";
import { Input } from "@/components/ui/input";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { AlertCircle } from "lucide-react";

interface FormZipCodeInputProps {
  form: UseFormReturn<any>;
  name: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  description?: string;
  className?: string;
}

export function FormZipCodeInput({
  form,
  name,
  label,
  placeholder = "Enter ZIP code",
  required = false,
  description,
  className,
}: FormZipCodeInputProps) {
  // ZIP code validation: Check if it's a valid 5-digit US ZIP code
  const validateZipCode = (value: string) => {
    if (!value && required) {
      return "ZIP code is required";
    }
    if (value && !/^\d{5}(-\d{4})?$/.test(value)) {
      return "Please enter a valid 5-digit ZIP code";
    }
    return true;
  };

  return (
    <FormField
      control={form.control}
      name={name}
      rules={{
        validate: validateZipCode
      }}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel>
            {label} {required && <span className="text-red-500">*</span>}
          </FormLabel>
          <FormControl>
            <Input
              {...field}
              placeholder={placeholder}
              className="bg-black border-nextplate-lightgray text-white"
              onChange={(e) => {
                // Only allow digits and hyphen
                const value = e.target.value.replace(/[^\d-]/g, '');
                field.onChange(value);
              }}
              maxLength={10} // Allow for ZIP+4 format (XXXXX-XXXX)
            />
          </FormControl>
          {description && (
            <p className="text-xs text-gray-400 mt-1">{description}</p>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
