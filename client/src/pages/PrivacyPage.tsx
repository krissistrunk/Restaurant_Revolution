import PlaceholderPage from '@/components/PlaceholderPage';
import { Shield } from 'lucide-react';

const PrivacyPage = () => {
  return (
    <PlaceholderPage
      title="Privacy Policy"
      description="How we collect, use, and protect your personal information."
      comingSoonMessage="Our privacy policy is being finalized to ensure full compliance with current data protection regulations."
      icon={Shield}
      contactInfo={false}
    />
  );
};

export default PrivacyPage;