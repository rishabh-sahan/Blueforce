import { useTranslation } from 'react-i18next';

/**
 * Resolves a worker category to the active language. The database stores the
 * English name, so that is the fallback when a slug has no translation yet.
 */
export const useCategoryName = () => {
  const { t } = useTranslation();
  return (slug: string | null | undefined, fallback?: string | null) =>
    slug ? t(`categories.${slug}`, { defaultValue: fallback ?? slug }) : (fallback ?? '');
};

/** Booking / profile status label in the active language. */
export const useStatusLabel = () => {
  const { t } = useTranslation();
  return (kind: 'booking' | 'profile', status: string) => t(`status.${kind}.${status}`);
};
