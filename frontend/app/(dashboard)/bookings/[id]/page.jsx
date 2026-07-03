import BookingDetailClient from "./BookingDetailClient";

export const dynamicParams = false;

export async function generateStaticParams() {
  return [{ id: "1" }];
}

export default function BookingDetailPage() {
  return <BookingDetailClient />;
}
