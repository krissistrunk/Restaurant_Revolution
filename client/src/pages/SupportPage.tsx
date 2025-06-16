import PlaceholderPage from '@/components/PlaceholderPage';
import { HelpCircle } from 'lucide-react';

const SupportPage = () => {
  return (
    <PlaceholderPage
      title="Customer Support"
      description="Get help with reservations, orders, and any questions about our services."
      comingSoonMessage="Our comprehensive support center is being developed with FAQs, live chat, and ticket system."
      icon={HelpCircle}
    />
  );
};

export default SupportPage;