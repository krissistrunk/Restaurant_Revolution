import PlaceholderPage from '@/components/PlaceholderPage';
import { Gift } from 'lucide-react';

const GiftCardsPage = () => {
  return (
    <PlaceholderPage
      title="Gift Cards"
      description="Share the gift of exceptional dining with our digital and physical gift cards."
      comingSoonMessage="Our gift card system is being finalized! Soon you'll be able to purchase and redeem gift cards both online and in-store."
      icon={Gift}
    />
  );
};

export default GiftCardsPage;