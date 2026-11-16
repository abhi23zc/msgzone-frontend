import ProtectedRoute from "@/components/Protected";
import CampaignEditor from "@/components/campaigns/CampaignEditor";
export default function Page({ params }: { params: { id: string } }) {
  return (
    <ProtectedRoute>
      <CampaignEditor id={params.id} />
    </ProtectedRoute>
  );
}
