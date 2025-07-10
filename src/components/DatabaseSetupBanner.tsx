import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Database, ExternalLink } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const DatabaseSetupBanner = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    checkDatabaseSetup();
  }, []);

  const checkDatabaseSetup = async () => {
    try {
      // Try to access seller_profiles table
      const { error } = await supabase
        .from('seller_profiles')
        .select('count')
        .limit(0);

      // If we get a 406 or relation error, database isn't set up
      if (error?.message?.includes('relation') || error?.code === '42P01') {
        setShowBanner(true);
      }
    } catch (err: any) {
      // Any error likely means database isn't properly set up
      setShowBanner(true);
    } finally {
      setIsChecking(false);
    }
  };

  if (isChecking || !showBanner) return null;

  return (
    <Alert className="border-amber-500/50 bg-amber-500/10 text-amber-200 mb-6">
      <Database className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between w-full">
        <span>
          Database setup required. Click the Supabase button to connect your database and apply migrations.
        </span>
        <Button
          variant="outline"
          size="sm"
          className="ml-4 border-amber-500/50 text-amber-200 hover:bg-amber-500/20"
          onClick={() => window.open('https://docs.lovable.dev/integrations/supabase/', '_blank')}
        >
          Setup Guide
          <ExternalLink className="ml-2 h-3 w-3" />
        </Button>
      </AlertDescription>
    </Alert>
  );
};

export default DatabaseSetupBanner;