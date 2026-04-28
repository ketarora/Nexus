import { redirect } from "next/navigation";

// Root page redirects to the guest SOS flow
// Hotel context can be passed via URL params: /?h=hotel_001&f=4&r=412
export default function RootPage({
  searchParams,
}: {
  searchParams: { h?: string; f?: string; r?: string };
}) {
  const params = new URLSearchParams();
  if (searchParams.h) params.set("h", searchParams.h);
  if (searchParams.f) params.set("f", searchParams.f);
  if (searchParams.r) params.set("r", searchParams.r);
  
  const queryString = params.toString();
  redirect(`/guest/sos${queryString ? `?${queryString}` : ""}`);
}
