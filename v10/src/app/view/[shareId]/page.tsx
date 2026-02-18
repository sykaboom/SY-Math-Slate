import { ViewerShell } from "@features/viewer/ViewerShell";

type SharedSnapshotPageProps = {
  params: Promise<{
    shareId: string;
  }>;
};

export default async function SharedSnapshotPage({ params }: SharedSnapshotPageProps) {
  const resolvedParams = await params;
  const shareId =
    typeof resolvedParams.shareId === "string" ? resolvedParams.shareId : "";

  return <ViewerShell shareId={shareId} />;
}
