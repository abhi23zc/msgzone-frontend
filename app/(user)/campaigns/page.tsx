import ProtectedRoute from "@/components/Protected";
import CampaignList from "@/components/campaigns/CampaignList";
export default function Page() {
  return (
    <ProtectedRoute>
      <CampaignList />
    </ProtectedRoute>
  );
}
