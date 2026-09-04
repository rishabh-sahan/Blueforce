import { useTranslation } from 'react-i18next';
import { HardHat, UserRound } from 'lucide-react';

export type SignupRole = 'worker' | 'customer';

const ROLES: { value: SignupRole; icon: typeof HardHat }[] = [
  { value: 'worker', icon: HardHat },
  { value: 'customer', icon: UserRound },
];

/**
 * Worker / customer picker, shared by Register and Login.
 *
 * It decides the role for accounts that do not exist yet - Google never tells
 * us which one someone is. An account that already exists keeps whatever role
 * it holds in the database, which is why the login page shows `note`.
 */
const RoleToggle = ({
  value,
  onChange,
  legend,
  note,
  compact = false,
}: {
  value: SignupRole;
  onChange: (role: SignupRole) => void;
  legend: string;
  note?: string;
  compact?: boolean;
}) => {
  const { t } = useTranslation();

  return (
    <fieldset>
      <legend className="block text-sm font-semibold text-gray-700 mb-3">
        {legend}
      </legend>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {ROLES.map(({ value: role, icon: Icon }) => (
          <button
            key={role}
            type="button"
            onClick={() => onChange(role)}
            aria-pressed={value === role}
            className={`text-left rounded-2xl border-2 transition-colors ${
              compact ? 'p-3' : 'p-4'
            } ${
              value === role
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300'
            }`}
          >
            <Icon
              className={`w-6 h-6 mb-2 ${
                value === role ? 'text-blue-600' : 'text-gray-400'
              }`}
            />
            <span className="block font-semibold text-gray-900">
              {t(`auth.register.${role}Title`)}
            </span>
            {!compact && (
              <span className="block text-sm text-gray-600 mt-1">
                {t(`auth.register.${role}Blurb`)}
              </span>
            )}
          </button>
        ))}
      </div>
      {note && <p className="text-xs text-gray-500 mt-2">{note}</p>}
    </fieldset>
  );
};

export default RoleToggle;
