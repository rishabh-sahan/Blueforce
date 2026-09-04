import { supabase } from '../lib/supabase';
import type { Booking, BookingStatus, BookingWithParties } from '../types/database';

export interface NewBooking {
  worker_id: string;
  scheduled_for: string;
  address: string;
  description?: string;
}

/**
 * Customers create bookings against approved workers only - the RLS insert
 * policy re-checks the worker's status, so a tampered client cannot book an
 * unverified worker.
 */
export const createBooking = async (
  customerId: string,
  values: NewBooking,
): Promise<Booking> => {
  const { data, error } = await supabase
    .from('bookings')
    .insert({ customer_id: customerId, ...values })
    .select()
    .single();
  if (error) throw error;
  return data;
};

// Embeds go through the explicit bookings -> profiles foreign keys; the
// auth.users keys cannot be followed by the REST layer.
const WITH_PARTIES = `
  *,
  worker:profiles!bookings_worker_profile_fkey (full_name, category, mobile, profile_photo),
  customer:profiles!bookings_customer_profile_fkey (full_name, mobile, profile_photo)
`;

export const listBookingsForCustomer = async (
  customerId: string,
): Promise<BookingWithParties[]> => {
  const { data, error } = await supabase
    .from('bookings')
    .select(WITH_PARTIES)
    .eq('customer_id', customerId)
    .order('scheduled_for', { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as BookingWithParties[];
};

export const listBookingsForWorker = async (
  workerId: string,
): Promise<BookingWithParties[]> => {
  const { data, error } = await supabase
    .from('bookings')
    .select(WITH_PARTIES)
    .eq('worker_id', workerId)
    .order('scheduled_for', { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as BookingWithParties[];
};

export const listAllBookings = async (): Promise<BookingWithParties[]> => {
  const { data, error } = await supabase
    .from('bookings')
    .select(WITH_PARTIES)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as BookingWithParties[];
};

export const setBookingStatus = async (
  bookingId: string,
  status: BookingStatus,
): Promise<void> => {
  const { error } = await supabase
    .from('bookings')
    .update({ status })
    .eq('id', bookingId);
  if (error) throw error;
};
