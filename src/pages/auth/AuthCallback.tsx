import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/useAuth';
import { Alert, Section, Spinner } from '../../components/ui';
import { useTranslation } from 'react-i18next';

/**
 * Where Google sends people back to. The Supabase client picks the session out
 * of the URL on its own; this page waits for AuthContext to resolve the profile
 * (creating it if this is a first sign-in) and then routes by role.
 */
const AuthCallback = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { session, profile, initialising, error } = useAuth();

  useEffect(() => {
    if (initialising) return;

    if (!session) {
      navigate('/login', { replace: true });
      return;
    }
    if (!profile) return; // Still being created; the next render will route.

    if (profile.role === 'admin') {
      navigate('/admin/verification', { replace: true });
    } else if (profile.role === 'worker' && !profile.category) {
      // A worker who has not picked a trade yet still needs the onboarding form.
      navigate('/onboarding', { replace: true });
    } else {
      navigate('/dashboard', { replace: true });
    }
  }, [session, profile, initialising, navigate]);

  if (error) {
    return (
      <Section>
        <div className="max-w-md mx-auto">
          <Alert>{error}</Alert>
        </div>
      </Section>
    );
  }

  return <Spinner label={t('auth.google.completing')} />;
};

export default AuthCallback;
