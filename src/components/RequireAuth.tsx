import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/useAuth';
import { Spinner } from './ui';
import type { UserRole } from '../types/database';

/**
 * Gates a route on being signed in, and optionally on holding one of `roles`.
 *
 * This is a convenience layer only. The database enforces the same rules through
 * RLS, so bypassing this component in the browser gains nothing.
 */
const RequireAuth = ({
  children,
  roles,
  redirectTo = '/login',
}: {
  children: ReactNode;
  roles?: UserRole[];
  redirectTo?: string;
}) => {
  const { t } = useTranslation();
  const { session, profile, initialising } = useAuth();
  const location = useLocation();

  if (initialising) return <Spinner label={t('common.checkingSession')} />;

  if (!session) {
    return <Navigate to={redirectTo} replace state={{ from: location.pathname }} />;
  }

  // Signed in but the profile row was never created (e.g. the account was made
  // while email confirmation was on). Send them through onboarding.
  if (!profile) {
    return <Navigate to="/onboarding" replace />;
  }

  if (roles && !roles.includes(profile.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default RequireAuth;
