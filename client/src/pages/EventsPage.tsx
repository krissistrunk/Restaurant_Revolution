import PlaceholderPage from '@/components/PlaceholderPage';
import { Calendar } from 'lucide-react';

const EventsPage = () => {
  return (
    <PlaceholderPage
      title="Private Events"
      description="Host your special occasions in our elegant private dining spaces."
      comingSoonMessage="Our events booking system is being perfected! Soon you'll be able to book private dining rooms and plan custom events online."
      icon={Calendar}
    />
  );
};

export default EventsPage;