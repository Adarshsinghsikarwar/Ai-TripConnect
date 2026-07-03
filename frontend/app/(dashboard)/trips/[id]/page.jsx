import TripDetailClient from "./TripDetailClient";

export const dynamicParams = false;

export async function generateStaticParams() {
  return [{ id: "1" }];
}

export default function TripDetailPage() {
  return <TripDetailClient />;
}
