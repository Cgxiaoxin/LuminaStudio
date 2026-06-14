export type BookingStatus = "CREATED" | "CONFIRMED" | "CHECKED_IN" | "COMPLETED" | "CANCELED";

export type StudioClass = {
  id: number;
  name: string;
  durationMinutes: number;
  price: string;
};
