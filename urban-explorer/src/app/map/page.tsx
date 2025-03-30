import { requireUserSessionPage } from "@/lib/session-helpers";
import MapPageWrapper from "./MapPageWrapper";

export default async function MapPage() {
  await requireUserSessionPage(); // 🔐 Protect on server

  return <MapPageWrapper />;
}
