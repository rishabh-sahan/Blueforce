import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ChevronDown, Globe, LayoutDashboard, LogOut, Menu, User, X } from 'lucide-react';
import { useAuth } from '../../contexts/useAuth';
import { EASE } from '../../lib/motion';

const NAV = [
  { to: '/', labelKey: 'header.home' },
  { to: '/workers', labelKey: 'header.browseWorkers' },
  { to: '/how-it-works', labelKey: 'header.howItWorks' },
  { to: '/services', labelKey: 'header.services' },
  { to: '/about-us', labelKey: 'header.aboutUs' },
];

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिंदी' },
  { code: 'kn', label: 'ಕನ್ನಡ' },
];

const Header = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { session, profile, logout } = useAuth();

  const [menuOpen, setMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const dropdownsRef = useRef<HTMLDivElement>(null);

  // Close the popovers when focus moves elsewhere on the page.
  useEffect(() => {
    if (!langOpen && !userOpen) return;
    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      if (!dropdownsRef.current?.contains(event.target as Node)) {
        setLangOpen(false);
        setUserOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setLangOpen(false);
        setUserOpen(false);
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('touchstart', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('touchstart', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [langOpen, userOpen]);

  const changeLanguage = (code: string) => {
    i18n.changeLanguage(code);
    try {
      localStorage.setItem('preferredLanguage', code);
    } catch {
      // Private browsing - the language still applies for this session.
    }
    setLangOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    setUserOpen(false);
    setMenuOpen(false);
    navigate('/');
  };

  const currentLanguage =
    LANGUAGES.find((l) => l.code === i18n.language)?.label ?? 'English';

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `font-medium transition-colors ${
      isActive ? 'text-white' : 'text-blue-100 hover:text-white'
    }`;

  // Pinned to the top on every page. Solid blue is the fallback; where
  // backdrop-filter is supported the bar frosts whatever scrolls underneath.
  return (
    <header
      className="sticky top-0 z-50 text-white border-b border-white/20
                 shadow-lg shadow-blue-950/10 bg-blue-700
                 supports-[backdrop-filter]:bg-blue-700/85
                 supports-[backdrop-filter]:backdrop-blur-xl
                 supports-[backdrop-filter]:backdrop-saturate-150"
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center gap-4">
          <Link to="/" className="text-2xl font-bold text-white shrink-0">
            BlueForce
          </Link>

          <nav className="hidden lg:flex items-center justify-center flex-1 gap-7">
            {NAV.map(({ to, labelKey }) => (
              <NavLink key={to} to={to} end={to === '/'} className={navLinkClass}>
                {t(labelKey)}
              </NavLink>
            ))}
          </nav>

          <div ref={dropdownsRef} className="hidden lg:flex items-center gap-4 shrink-0">
            {/* Language */}
            <div className="relative">
              <button
                onClick={() => {
                  setLangOpen((v) => !v);
                  setUserOpen(false);
                }}
                aria-haspopup="menu"
                aria-expanded={langOpen}
                className="flex items-center gap-1 text-blue-100 hover:text-white focus:outline-none"
              >
                <Globe size={18} />
                {currentLanguage}
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${langOpen ? 'rotate-180' : ''}`}
                />
              </button>
              <AnimatePresence>
                {langOpen && (
                  <motion.div
                    role="menu"
                    initial={{ opacity: 0, y: -8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.97 }}
                    transition={{ duration: 0.18, ease: EASE }}
                    className="absolute right-0 mt-2 w-40 bg-white shadow-2xl rounded-xl py-1 z-50 origin-top border border-gray-100"
                  >
                    {LANGUAGES.map(({ code, label }) => (
                      <button
                        key={code}
                        onClick={() => changeLanguage(code)}
                        className={`w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors ${
                          i18n.language === code ? 'font-bold' : ''
                        }`}
                      >
                        {label} {i18n.language === code && '✓'}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {session && profile ? (
              <div className="relative">
                <button
                  onClick={() => {
                    setUserOpen((v) => !v);
                    setLangOpen(false);
                  }}
                  aria-haspopup="menu"
                  aria-expanded={userOpen}
                  className="flex items-center gap-2 bg-white/15 hover:bg-white/25 rounded-full pl-2 pr-3 py-1.5 transition-colors"
                >
                  <span className="w-7 h-7 rounded-full bg-white text-blue-700 font-bold text-xs flex items-center justify-center">
                    {(profile.full_name || 'U').slice(0, 2).toUpperCase()}
                  </span>
                  <span className="font-medium max-w-[9rem] truncate">
                    {profile.full_name || t('common.myProfile')}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${userOpen ? 'rotate-180' : ''}`}
                  />
                </button>
                <AnimatePresence>
                  {userOpen && (
                    <motion.div
                      role="menu"
                      initial={{ opacity: 0, y: -8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.97 }}
                      transition={{ duration: 0.18, ease: EASE }}
                      className="absolute right-0 mt-2 w-56 bg-white shadow-2xl rounded-xl py-1 z-50 origin-top border border-gray-100"
                    >
                      <Link
                        to={profile.role === 'admin' ? '/admin/verification' : '/dashboard'}
                        onClick={() => setUserOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        {t('common.dashboard')}
                      </Link>
                      <Link
                        to="/profile"
                        onClick={() => setUserOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                      >
                        <User className="w-4 h-4" />
                        {t('common.myProfile')}
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 w-full text-left text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        {t('common.signOut')}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-5 py-2 rounded-full border-2 border-white/70 hover:bg-white/15 font-medium transition-colors"
                >
                  {t('header.login')}
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2 rounded-full bg-white text-blue-700 hover:bg-blue-50 font-semibold transition-colors"
                >
                  {t('header.register')}
                </Link>
              </div>
            )}
          </div>

          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? t('header.closeMenu') : t('header.openMenu')}
            aria-expanded={menuOpen}
            className="lg:hidden p-2"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: EASE }}
              className="lg:hidden overflow-hidden"
            >
              <div className="pt-4 pb-2 space-y-1">
                {NAV.map(({ to, labelKey }) => (
                  <NavLink
                    key={to}
                    to={to}
                    end={to === '/'}
                    onClick={() => setMenuOpen(false)}
                    className="block py-2.5 text-blue-100 hover:text-white font-medium"
                  >
                    {t(labelKey)}
                  </NavLink>
                ))}

                <div className="flex gap-2 py-3">
                  {LANGUAGES.map(({ code, label }) => (
                    <button
                      key={code}
                      onClick={() => changeLanguage(code)}
                      className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                        i18n.language === code
                          ? 'bg-white text-blue-700 font-semibold'
                          : 'bg-white/15 text-white'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                {session && profile ? (
                  <div className="space-y-1 border-t border-white/20 pt-3">
                    <Link
                      to={profile.role === 'admin' ? '/admin/verification' : '/dashboard'}
                      onClick={() => setMenuOpen(false)}
                      className="block py-2.5 font-medium"
                    >
                      {t('common.dashboard')}
                    </Link>
                    <Link
                      to="/profile"
                      onClick={() => setMenuOpen(false)}
                      className="block py-2.5 font-medium"
                    >
                      {t('common.myProfile')}
                    </Link>
                    <button onClick={handleLogout} className="block py-2.5 font-medium">
                      {t('common.signOut')}
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-3 border-t border-white/20 pt-4">
                    <Link
                      to="/login"
                      onClick={() => setMenuOpen(false)}
                      className="flex-1 text-center px-5 py-2.5 rounded-full border-2 border-white/70 font-medium"
                    >
                      {t('header.login')}
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setMenuOpen(false)}
                      className="flex-1 text-center px-5 py-2.5 rounded-full bg-white text-blue-700 font-semibold"
                    >
                      {t('header.register')}
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};

export default Header;
