import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { BadgeCheck, CalendarRange, LogOut, ShieldCheck, Users } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const LINKS = [
  { to: '/admin/verification', label: 'Verification', icon: BadgeCheck },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/bookings', label: 'Bookings', icon: CalendarRange },
];

const AdminLayout = () => {
  const { profile, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-10">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-64 shrink-0">
            <div className="bg-white rounded-2xl border-2 border-blue-100 shadow-lg p-6 lg:sticky lg:top-24">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-gray-900 leading-tight">Admin</p>
                  <p className="text-xs text-gray-500 truncate">{profile?.email}</p>
                </div>
              </div>

              <nav className="space-y-1">
                {LINKS.map(({ to, label, icon: Icon }) => (
                  <NavLink
                    key={to}
                    to={to}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
                        isActive
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                      }`
                    }
                  >
                    <Icon className="w-5 h-5" />
                    {label}
                  </NavLink>
                ))}
              </nav>

              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors w-full mt-6"
              >
                <LogOut className="w-5 h-5" />
                Sign out
              </button>
            </div>
          </aside>

          <main className="flex-1 min-w-0">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
