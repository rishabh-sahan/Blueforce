import { supabase } from '../lib/supabase';
import type {
  Profile,
  ProfileStatus,
  ProfileUpdate,
  WorkerCategory,
} from '../types/database';

/** Categories are a public lookup table, readable signed in or not. */
export const listCategories = async (): Promise<WorkerCategory[]> => {
  const { data, error } = await supabase
    .from('worker_categories')
    .select('*')
    .order('sort_order');
  if (error) throw error;
  return data ?? [];
};

export const getProfile = async (userId: string): Promise<Profile | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  return data;
};

export const updateProfile = async (
  userId: string,
  changes: ProfileUpdate,
): Promise<Profile> => {
  const { data, error } = await supabase
    .from('profiles')
    .update(changes)
    .eq('user_id', userId)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export interface WorkerFilters {
  category?: string;
  location?: string;
  search?: string;
}

/**
 * Public worker directory. RLS only exposes workers whose status is 'approved',
 * so an unverified worker can never appear here even if the filter is dropped.
 */
export const listApprovedWorkers = async (
  filters: WorkerFilters = {},
): Promise<Profile[]> => {
  let query = supabase
    .from('profiles')
    .select('*')
    .eq('role', 'worker')
    .eq('status', 'approved');

  if (filters.category) query = query.eq('category', filters.category);
  if (filters.location) query = query.ilike('location', `%${filters.location}%`);
  if (filters.search) query = query.ilike('full_name', `%${filters.search}%`);

  const { data, error } = await query.order('rating', { ascending: false });
  if (error) throw error;
  return data ?? [];
};

export const getWorkerById = async (id: string): Promise<Profile | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .eq('role', 'worker')
    .maybeSingle();
  if (error) throw error;
  return data;
};

// --- Admin ------------------------------------------------------------------
// Every call below depends on the caller's profile having role 'admin'. RLS
// enforces that server-side; the UI guard is only there to avoid dead ends.

export const listProfilesByStatus = async (
  status: ProfileStatus,
): Promise<Profile[]> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'worker')
    .eq('status', status)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
};

export const listAllProfiles = async (): Promise<Profile[]> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
};

export const setWorkerStatus = async (
  profileId: string,
  status: Extract<ProfileStatus, 'approved' | 'rejected'>,
  adminUserId: string,
  rejectionReason?: string,
): Promise<void> => {
  const { error } = await supabase
    .from('profiles')
    .update({
      status,
      verified_at: new Date().toISOString(),
      verified_by: adminUserId,
      rejection_reason: status === 'rejected' ? rejectionReason ?? null : null,
    })
    .eq('id', profileId);
  if (error) throw error;
};
