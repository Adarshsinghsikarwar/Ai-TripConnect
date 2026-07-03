import ProviderDetailClient from "./ProviderDetailClient";

export const dynamicParams = false;

export async function generateStaticParams() {
  return [{ id: "1" }];
}

export default function ProviderDetailPage() {
  return <ProviderDetailClient />;
}
