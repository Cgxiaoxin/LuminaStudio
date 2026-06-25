export type BookingStatus = 'CREATED' | 'PENDING_PAYMENT' | 'CONFIRMED' | 'CHECKED_IN' | 'COMPLETED' | 'CANCELED';

export type StudioClass = {
  id: number;
  name: string;
  type: string;
  description?: string;
  price: string;
  durationMinutes: number;
};

export type Schedule = {
  id: number;
  storeId: number;
  serviceId: number;
  coachId: number;
  startAt: string;
  endAt: string;
  capacity: number;
  bookedCount: number;
  status: string;
  service?: StudioClass;
  coach?: { id: number; displayName: string; avatarUrl?: string };
};

export type Booking = {
  id: number;
  bookingNo: string;
  status: BookingStatus;
  paidAmount: number;
  createdAt: string;
  client?: { id: number; nickname?: string; phone?: string; avatarUrl?: string };
  service?: StudioClass;
  schedule?: { startAt: string; endAt: string };
  orders?: { id: number; status: string; orderNo?: string }[];
};

export type Membership = {
  id: number;
  name: string;
  type: string;
  totalTimes: number | null;
  remainingTimes: number | null;
  balanceAmount?: number | string | null;
  status: string;
  startedAt: string | null;
  expiredAt: string | null;
};
