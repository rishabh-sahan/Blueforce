import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { ReactNode } from 'react';
import { EASE, VIEWPORT, fadeUp } from '../../lib/motion';
import type { BookingStatus, ProfileStatus } from '../../types/database';

/**
 * Shared building blocks. Every page composes these so the palette, spacing and
 * motion stay identical across the site - the homepage sets the reference and
 * the rest follow it.
 */

// --- Page header ------------------------------------------------------------

export const PageHero = ({
  title,
  subtitle,
  children,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  children?: ReactNode;
}) => (
  <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
    <div className="container mx-auto px-4 py-16 md:py-20 text-center">
      <motion.h1
        className="text-3xl md:text-5xl font-bold mb-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE }}
      >
        {title}
      </motion.h1>
      {subtitle && (
        <motion.p
          className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: EASE }}
        >
          {subtitle}
        </motion.p>
      )}
      {children && <div className="mt-8">{children}</div>}
    </div>
  </section>
);

// --- Layout -----------------------------------------------------------------

export const Section = ({
  children,
  className = '',
  container = true,
}: {
  children: ReactNode;
  className?: string;
  container?: boolean;
}) => (
  <section className={`py-14 md:py-16 ${className}`}>
    {container ? <div className="container mx-auto px-4">{children}</div> : children}
  </section>
);

export const SectionHeading = ({
  title,
  subtitle,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
}) => (
  <motion.div
    className="text-center mb-12"
    variants={fadeUp}
    initial="hidden"
    whileInView="show"
    viewport={VIEWPORT}
  >
    <h2 className="text-3xl md:text-4xl font-bold text-gray-900">{title}</h2>
    {subtitle && (
      <p className="text-lg text-gray-600 mt-3 max-w-2xl mx-auto">{subtitle}</p>
    )}
  </motion.div>
);

export const Card = ({
  children,
  className = '',
  hover = false,
}: {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}) => (
  <motion.div
    className={`bg-white rounded-2xl border-2 border-blue-100 shadow-lg p-6 ${className}`}
    variants={fadeUp}
    whileHover={hover ? { y: -6 } : undefined}
    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
  >
    {children}
  </motion.div>
);

// --- Buttons ----------------------------------------------------------------

const BUTTON_BASE =
  'inline-flex items-center justify-center gap-2 font-semibold rounded-full px-7 py-3 ' +
  'transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:opacity-60 ' +
  'disabled:cursor-not-allowed';

const VARIANTS = {
  primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow',
  secondary: 'bg-white hover:bg-gray-50 text-blue-600 border-2 border-blue-600 shadow',
  ghost: 'text-blue-600 hover:bg-blue-50',
  danger: 'bg-red-600 hover:bg-red-700 text-white shadow',
  success: 'bg-green-600 hover:bg-green-700 text-white shadow',
} as const;

export type ButtonVariant = keyof typeof VARIANTS;

export const Button = ({
  children,
  variant = 'primary',
  className = '',
  type = 'button',
  ...rest
}: {
  children: ReactNode;
  variant?: ButtonVariant;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    type={type}
    className={`${BUTTON_BASE} ${VARIANTS[variant]} ${className}`}
    {...rest}
  >
    {children}
  </button>
);

export const ButtonLink = ({
  to,
  children,
  variant = 'primary',
  className = '',
}: {
  to: string;
  children: ReactNode;
  variant?: ButtonVariant;
  className?: string;
}) => (
  <Link to={to} className={`${BUTTON_BASE} ${VARIANTS[variant]} ${className}`}>
    {children}
  </Link>
);

// --- Forms ------------------------------------------------------------------

const FIELD_CLASS =
  'w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 ' +
  'focus:outline-none focus:ring-2 focus:ring-blue-100 transition-colors';

export const Field = ({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) => (
  <label className="block">
    <span className="block text-sm font-semibold text-gray-700 mb-2">{label}</span>
    {children}
    {hint && <span className="block text-xs text-gray-500 mt-1">{hint}</span>}
  </label>
);

export const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input {...props} className={`${FIELD_CLASS} ${props.className ?? ''}`} />
);

export const Textarea = (
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement>,
) => <textarea {...props} className={`${FIELD_CLASS} ${props.className ?? ''}`} />;

export const Select = (props: React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <select {...props} className={`${FIELD_CLASS} bg-white ${props.className ?? ''}`} />
);

// --- Feedback ---------------------------------------------------------------

const PROFILE_TONES: Record<ProfileStatus, string> = {
  pending: 'bg-amber-100 text-amber-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
};

const BOOKING_TONES: Record<BookingStatus, string> = {
  pending: 'bg-amber-100 text-amber-800',
  accepted: 'bg-blue-100 text-blue-800',
  declined: 'bg-red-100 text-red-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-gray-200 text-gray-700',
};

/** Resolves its own label from `status.<kind>.<status>` in the active language. */
export const StatusBadge = ({
  status,
  kind = 'booking',
}: {
  status: BookingStatus | ProfileStatus;
  kind?: 'booking' | 'profile';
}) => {
  const { t } = useTranslation();
  return (
    <span
      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
        kind === 'profile'
          ? PROFILE_TONES[status as ProfileStatus]
          : BOOKING_TONES[status as BookingStatus]
      }`}
    >
      {t(`status.${kind}.${status}`)}
    </span>
  );
};

export const Alert = ({
  tone = 'error',
  children,
}: {
  tone?: 'error' | 'success' | 'info';
  children: ReactNode;
}) => {
  const tones = {
    error: 'bg-red-50 border-red-200 text-red-700',
    success: 'bg-green-50 border-green-200 text-green-700',
    info: 'bg-blue-50 border-blue-200 text-blue-700',
  };
  return (
    <div className={`border-2 rounded-xl px-4 py-3 text-sm ${tones[tone]}`}>
      {children}
    </div>
  );
};

export const Spinner = ({ label }: { label?: string }) => {
  const { t } = useTranslation();
  return (
    <div className="flex items-center justify-center gap-3 py-16 text-gray-500">
      <span className="w-6 h-6 rounded-full border-2 border-blue-200 border-t-blue-600 animate-spin" />
      {label ?? t('common.loading')}
    </div>
  );
};

export const EmptyState = ({
  title,
  message,
  action,
}: {
  title: string;
  message: string;
  action?: ReactNode;
}) => (
  <div className="text-center py-16 px-6 bg-blue-50 rounded-2xl border-2 border-blue-100">
    <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600 mb-6 max-w-md mx-auto">{message}</p>
    {action}
  </div>
);
