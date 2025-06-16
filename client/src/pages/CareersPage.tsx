import PlaceholderPage from '@/components/PlaceholderPage';
import { Briefcase } from 'lucide-react';

const CareersPage = () => {
  return (
    <PlaceholderPage
      title="Career Opportunities"
      description="Join our team and be part of an exceptional dining experience."
      comingSoonMessage="We're building our careers portal! Soon you'll find current openings, benefits information, and be able to apply online."
      icon={Briefcase}
    />
  );
};

export default CareersPage;