import ProtectedRoute from "@/components/Protected";
import CampaignDetail from "@/components/campaigns/CampaignDetail";
export default function Page({ params }: { params: { id: string } }) {
  return (
    <ProtectedRoute>
      <CampaignDetail id={params.id} />
    </ProtectedRoute>
  );
}
