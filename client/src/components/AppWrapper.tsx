import { useAuth } from '@/hooks/useAuth';
import WelcomeAnimation from './WelcomeAnimation';
import { ReactNode } from 'react';

interface AppWrapperProps {
  children: ReactNode;
}

const AppWrapper = ({ children }: AppWrapperProps) => {
  const { user, showWelcomeAnimation, hideWelcomeAnimation } = useAuth();

  return (
    <>
      {children}
      
      {/* Show welcome animation when user logs in */}
      {user && showWelcomeAnimation && (
        <WelcomeAnimation 
          user={user} 
          onComplete={hideWelcomeAnimation} 
        />
      )}
    </>
  );
};

export default AppWrapper;