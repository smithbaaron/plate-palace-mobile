
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { getUserTypeData } from '@/lib/userTypeUtils';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

type VerificationState = 'loading' | 'success' | 'error';

const VerifyEmail: React.FC = () => {
  const [verificationState, setVerificationState] = useState<VerificationState>('loading');
  const [message, setMessage] = useState('Verifying your email...');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { checkAndResyncAuth } = useAuth();

  useEffect(() => {
    const handleEmailVerification = async () => {
      try {
        // Check if we have verification tokens in the URL
        const accessToken = searchParams.get('access_token');
        const refreshToken = searchParams.get('refresh_token');
        const type = searchParams.get('type');

        if (type === 'email_confirmation' && accessToken && refreshToken) {
          // Set the session with the tokens from the URL
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            console.error('Error setting session:', error);
            setVerificationState('error');
            setMessage('Failed to verify email. Please try again.');
            return;
          }

          if (data.user) {
            setMessage('Email verified successfully! Redirecting...');
            
            // Wait a moment for the auth state to update
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Resync auth state
            await checkAndResyncAuth();
            
            // Check user's onboarding status
            const userData = await getUserTypeData(data.user.id);
            
            if (userData.userType && userData.isOnboarded) {
              // User is fully onboarded, redirect to their dashboard
              navigate(`/${userData.userType}/dashboard`, { replace: true });
            } else if (userData.userType) {
              // User has type but not onboarded
              navigate(`/${userData.userType}/onboarding`, { replace: true });
            } else {
              // User needs to select type
              navigate('/auth', { replace: true });
            }
            
            setVerificationState('success');
          }
        } else {
          // Listen for auth state changes (in case user clicks link while app is open)
          const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' && session?.user) {
              setMessage('Email verified successfully! Redirecting...');
              
              // Check user's onboarding status
              const userData = await getUserTypeData(session.user.id);
              
              if (userData.userType && userData.isOnboarded) {
                navigate(`/${userData.userType}/dashboard`, { replace: true });
              } else if (userData.userType) {
                navigate(`/${userData.userType}/onboarding`, { replace: true });
              } else {
                navigate('/auth', { replace: true });
              }
              
              setVerificationState('success');
            } else if (event === 'SIGNED_OUT') {
              setVerificationState('error');
              setMessage('Verification failed. Please try again.');
            }
          });

          // If no tokens in URL, show waiting message
          setMessage('Please check your email and click the verification link.');

          // Cleanup subscription
          return () => {
            subscription.unsubscribe();
          };
        }
      } catch (error) {
        console.error('Email verification error:', error);
        setVerificationState('error');
        setMessage('Something went wrong during verification. Please try again.');
      }
    };

    handleEmailVerification();
  }, [searchParams, navigate, checkAndResyncAuth]);

  const renderIcon = () => {
    switch (verificationState) {
      case 'loading':
        return <Loader2 className="h-12 w-12 animate-spin text-red-500" />;
      case 'success':
        return <CheckCircle className="h-12 w-12 text-green-500" />;
      case 'error':
        return <XCircle className="h-12 w-12 text-red-500" />;
    }
  };

  const handleBackToAuth = () => {
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-gray-900 rounded-lg p-8 border border-gray-800">
          <div className="flex justify-center mb-6">
            {renderIcon()}
          </div>
          
          <h1 className="text-2xl font-bold text-white mb-4">
            Email Verification
          </h1>
          
          <p className="text-gray-400 mb-6">
            {message}
          </p>
          
          {verificationState === 'error' && (
            <button
              onClick={handleBackToAuth}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
            >
              Back to Sign In
            </button>
          )}
          
          {verificationState === 'loading' && (
            <p className="text-sm text-gray-500">
              This may take a few moments...
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
