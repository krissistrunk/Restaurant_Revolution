import { useContext } from 'react';
import { LoyaltyContext } from '@/context/LoyaltyContext';

export const useLoyalty = () => {
  const context = useContext(LoyaltyContext);
  
  if (context === null) {
    throw new Error('useLoyalty must be used within a LoyaltyProvider');
  }
  
  return context;
};

export default useLoyalty;