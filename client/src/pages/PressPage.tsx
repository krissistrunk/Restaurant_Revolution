import PlaceholderPage from '@/components/PlaceholderPage';
import { FileText } from 'lucide-react';

const PressPage = () => {
  return (
    <PlaceholderPage
      title="Press Kit"
      description="Media resources, press releases, and high-quality images for journalists and bloggers."
      comingSoonMessage="Our press kit is being assembled with high-resolution photos, brand guidelines, and recent press coverage."
      icon={FileText}
    />
  );
};

export default PressPage;