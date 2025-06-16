import PlaceholderPage from '@/components/PlaceholderPage';
import { FileCheck } from 'lucide-react';

const TermsPage = () => {
  return (
    <PlaceholderPage
      title="Terms of Service"
      description="The terms and conditions for using our services and dining at our restaurant."
      comingSoonMessage="Our terms of service document is being reviewed by our legal team to ensure clarity and completeness."
      icon={FileCheck}
      contactInfo={false}
    />
  );
};

export default TermsPage;