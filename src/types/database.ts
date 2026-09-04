/**
 * Shapes that mirror the Supabase schema in `supabase/schema.sql`.
 * Keep these in step with the tables - nothing here is inferred at runtime.
 */

export type UserRole = 'worker' | 'customer' | 'admin';

/** Only workers are ever 'pending'; customers and admins are approved on sight. */
export type ProfileStatus = 'pending' | 'approved' | 'rejected';

export type BookingStatus =
  | 'pending'
  | 'accepted'
  | 'declined'
  | 'completed'
  | 'cancelled';

export interface WorkerCategory {
  slug: string;
  name: string;
  sort_order: number;
}

export interface Profile {
  id: string;
  user_id: string;
  role: UserRole;

  full_name: string;
  email: string | null;
  mobile: string | null;
  location: string | null;
  profile_photo: string | null;

  // Worker-only.
  category: string | null;
  experience_years: number | null;
  hourly_rate: number | null;
  skills: string[];
  bio: string | null;
  rating: number;

  status: ProfileStatus;
  rejection_reason: string | null;
  verified_at: string | null;
  verified_by: string | null;

  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  customer_id: string;
  worker_id: string;
  scheduled_for: string;
  address: string;
  description: string | null;
  status: BookingStatus;
  created_at: string;
  updated_at: string;
}

/** A booking joined with the other party's profile, for dashboard lists. */
export interface BookingWithParties extends Booking {
  worker?: Pick<Profile, 'full_name' | 'category' | 'mobile' | 'profile_photo'> | null;
  customer?: Pick<Profile, 'full_name' | 'mobile' | 'profile_photo'> | null;
}

/** Fields a user may edit on their own profile. */
export type ProfileUpdate = Partial<
  Pick<
    Profile,
    | 'full_name'
    | 'mobile'
    | 'location'
    | 'profile_photo'
    | 'category'
    | 'experience_years'
    | 'hourly_rate'
    | 'skills'
    | 'bio'
  >
>;

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  pending: 'Awaiting worker',
  accepted: 'Confirmed',
  declined: 'Declined',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export const PROFILE_STATUS_LABELS: Record<ProfileStatus, string> = {
  pending: 'Pending verification',
  approved: 'Verified',
  rejected: 'Rejected',
};
