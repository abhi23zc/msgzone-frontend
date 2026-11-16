import ProtectedRoute from "@/components/Protected";
import CampaignEditor from "@/components/campaigns/CampaignEditor";
export default function Page() {
  return (
    <ProtectedRoute>
      <CampaignEditor />
    </ProtectedRoute>
  );
}
