import PlaceholderPage from '@/components/PlaceholderPage';
import { Users } from 'lucide-react';

const CateringPage = () => {
  return (
    <PlaceholderPage
      title="Catering Services"
      description="Bring our exceptional cuisine to your special events and corporate gatherings."
      comingSoonMessage="Our catering services are expanding! We'll soon offer full-service catering for events of all sizes with customizable menus."
      icon={Users}
    />
  );
};

export default CateringPage;